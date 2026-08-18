import { supabase, isSupabaseConfigured } from './supabase';

export interface SchoolSettings {
  id?: string;
  school_name: string;
  established_year: number;
  school_motto: string;
  logo_bucket: string;
  logo_path: string;
  logo_public_url: string | null;
  logo_url: string | null; // alias for compatibility
  primary_color: string;
  secondary_color: string;
  address?: string;
  phone?: string;
  email?: string;
  ministry_code?: string;
  updated_at?: string;
}

// Bundled official school logo path served statically from public/assets
export const BUNDLED_OFFICIAL_LOGO = '/assets/vipulanantha-college-logo.png';

// Default fallback Supabase URL if environment variable is not yet populated
const DEFAULT_SUPABASE_PROJECT_URL = 'https://3gyezqjbqhvaqqxhtmin6r.supabase.co';

export const getSupabaseBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl && !envUrl.includes('your-project-ref') && envUrl.trim().length > 0) {
    return envUrl.replace(/\/$/, '');
  }
  return DEFAULT_SUPABASE_PROJECT_URL;
};

// Official Supabase Storage Public URL for VipulanAntha College Colombo using exact bucket 'school-assets'
export const getOfficialSupabaseLogoUrl = (logoPath = 'vipulanantha-college-logo.png'): string => {
  const baseUrl = getSupabaseBaseUrl();
  return `${baseUrl}/storage/v1/object/public/school-assets/${logoPath}`;
};

/**
 * Convert a File to an optimized Base64 Data URL with automatic dimension scaling
 */
export const fileToOptimizedDataUrl = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxDim = 512;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/png', 0.92));
            return;
          }
        }
        resolve(result);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Apply a school logo URL or path directly to School Settings and Supabase tables
 */
export const applySchoolLogoUrl = async (
  logoUrl: string,
  logoPath = 'vipulanantha-college-logo.png'
): Promise<{ success: boolean; error?: string }> => {
  const current = getCachedSchoolSettings();
  const updatedSettings: SchoolSettings = {
    ...current,
    logo_bucket: 'school-assets',
    logo_path: logoPath,
    logo_public_url: logoUrl,
    logo_url: logoUrl,
  };
  saveCachedSchoolSettings(updatedSettings);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        school_name: current.school_name,
        established_year: current.established_year,
        school_motto: current.school_motto,
        logo_bucket: 'school-assets',
        logo_path: logoPath,
        logo_public_url: logoUrl,
        logo_url: logoUrl,
        primary_color: current.primary_color,
        secondary_color: current.secondary_color,
        updated_at: new Date().toISOString(),
      };

      // 1. Update school_settings table
      if (current.id) {
        await supabase.from('school_settings').update(payload).eq('id', current.id);
      } else {
        await supabase
          .from('school_settings')
          .upsert({ id: 'primary-school-settings', ...payload });
      }

      // 2. Update school_branding table
      try {
        await supabase.from('school_branding').upsert({
          id: 'primary-branding',
          school_name: current.school_name,
          logo_bucket: 'school-assets',
          logo_path: logoPath,
          logo_public_url: logoUrl,
          primary_color: current.primary_color,
          secondary_color: current.secondary_color,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        // ignore if table not present
      }

      // 3. Update schools table
      try {
        await supabase.from('schools').upsert({
          id: 'vipulanantha-school-profile',
          school_name: current.school_name,
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      console.warn('Failed to update Supabase tables on logo apply', err);
    }
  }

  return { success: true };
};

// Initial default settings object
export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  school_name: 'VipulanAntha College Colombo',
  established_year: 1920,
  school_motto: 'நாளும் பயில்வோம் நட்பனி புரிவோம்',
  logo_bucket: 'school-assets',
  logo_path: 'vipulanantha-college-logo.png',
  logo_public_url: getOfficialSupabaseLogoUrl('vipulanantha-college-logo.png'),
  logo_url: getOfficialSupabaseLogoUrl('vipulanantha-college-logo.png'),
  primary_color: '#2A0845',
  secondary_color: '#F59E0B',
  address: 'College Avenue, Colombo 06, Sri Lanka',
  phone: '+94 11 258 1920',
  email: 'info@vipulanantha.edu.lk',
  ministry_code: 'WP/CM/1920',
};

// In-memory / localStorage cache
const CACHE_KEY = 'vc_school_settings_cache';

export const getCachedSchoolSettings = (): SchoolSettings => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const publicUrl = parsed.logo_public_url || parsed.logo_url || getOfficialSupabaseLogoUrl(parsed.logo_path || 'vipulanantha-college-logo.png');
      return {
        ...DEFAULT_SCHOOL_SETTINGS,
        ...parsed,
        logo_bucket: 'school-assets',
        logo_path: parsed.logo_path || 'vipulanantha-college-logo.png',
        logo_public_url: publicUrl,
        logo_url: publicUrl,
      };
    }
  } catch (e) {
    console.warn('Error reading cached school settings', e);
  }
  return DEFAULT_SCHOOL_SETTINGS;
};

export const saveCachedSchoolSettings = (settings: SchoolSettings) => {
  try {
    const publicUrl = settings.logo_public_url || settings.logo_url || getOfficialSupabaseLogoUrl(settings.logo_path || 'vipulanantha-college-logo.png');
    const normalized = {
      ...settings,
      logo_bucket: 'school-assets',
      logo_public_url: publicUrl,
      logo_url: publicUrl,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('school_settings_updated', { detail: normalized }));
  } catch (e) {
    console.warn('Error caching school settings', e);
  }
};

/**
 * Fetch school settings from Supabase database (school_settings, school_branding, schools) using exact 'school-assets' bucket URL
 */
export const fetchSchoolSettings = async (): Promise<SchoolSettings> => {
  const cached = getCachedSchoolSettings();

  if (!isSupabaseConfigured || !supabase) {
    return cached;
  }

  try {
    let fetchedLogoUrl: string | null = null;
    let fetchedLogoPath = 'vipulanantha-college-logo.png';
    let fetchedSchoolData: Partial<SchoolSettings> | null = null;

    // 1. Check `school_branding` table first (as requested)
    try {
      const { data: bData } = await supabase
        .from('school_branding')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (bData) {
        if (bData.logo_path) fetchedLogoPath = bData.logo_path;
        if (bData.logo_public_url && bData.logo_public_url.trim().length > 0) {
          fetchedLogoUrl = bData.logo_public_url;
        } else if (bData.logo_url && bData.logo_url.trim().length > 0) {
          fetchedLogoUrl = bData.logo_url;
        }
        fetchedSchoolData = {
          school_name: bData.school_name || bData.name,
          primary_color: bData.primary_color,
          secondary_color: bData.secondary_color,
          updated_at: bData.updated_at,
        };
      }
    } catch (e) {
      // Continue
    }

    // 2. Check `school_settings` table
    if (!fetchedLogoUrl) {
      try {
        const { data: sData } = await supabase
          .from('school_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (sData) {
          if (sData.logo_path) fetchedLogoPath = sData.logo_path;
          if (sData.logo_public_url && sData.logo_public_url.trim().length > 0) {
            fetchedLogoUrl = sData.logo_public_url;
          } else if (sData.logo_url && sData.logo_url.trim().length > 0) {
            fetchedLogoUrl = sData.logo_url;
          }
          fetchedSchoolData = {
            id: sData.id,
            school_name: sData.school_name,
            established_year: sData.established_year,
            school_motto: sData.school_motto,
            address: sData.address,
            phone: sData.phone,
            email: sData.email,
            ministry_code: sData.ministry_code,
            primary_color: sData.primary_color || fetchedSchoolData?.primary_color,
            secondary_color: sData.secondary_color || fetchedSchoolData?.secondary_color,
            updated_at: sData.updated_at,
          };
        }
      } catch (e) {
        // Continue
      }
    }

    // 3. Check `schools` table
    if (!fetchedLogoUrl) {
      try {
        const { data: scData } = await supabase
          .from('schools')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (scData?.logo_url && scData.logo_url.trim().length > 0) {
          fetchedLogoUrl = scData.logo_url;
        }
      } catch (e) {
        // Continue
      }
    }

    // If still no logo URL found in database tables, construct official public URL using exact school-assets bucket
    const finalLogoUrl = fetchedLogoUrl && fetchedLogoUrl.trim().length > 0
      ? fetchedLogoUrl
      : getOfficialSupabaseLogoUrl(fetchedLogoPath);

    const merged: SchoolSettings = {
      id: fetchedSchoolData?.id || cached.id,
      school_name: fetchedSchoolData?.school_name || cached.school_name || DEFAULT_SCHOOL_SETTINGS.school_name,
      established_year: fetchedSchoolData?.established_year || cached.established_year || DEFAULT_SCHOOL_SETTINGS.established_year,
      school_motto: fetchedSchoolData?.school_motto || cached.school_motto || DEFAULT_SCHOOL_SETTINGS.school_motto,
      logo_bucket: 'school-assets',
      logo_path: fetchedLogoPath,
      logo_public_url: finalLogoUrl,
      logo_url: finalLogoUrl,
      primary_color: fetchedSchoolData?.primary_color || cached.primary_color || DEFAULT_SCHOOL_SETTINGS.primary_color,
      secondary_color: fetchedSchoolData?.secondary_color || cached.secondary_color || DEFAULT_SCHOOL_SETTINGS.secondary_color,
      address: fetchedSchoolData?.address || cached.address || DEFAULT_SCHOOL_SETTINGS.address,
      phone: fetchedSchoolData?.phone || cached.phone || DEFAULT_SCHOOL_SETTINGS.phone,
      email: fetchedSchoolData?.email || cached.email || DEFAULT_SCHOOL_SETTINGS.email,
      ministry_code: fetchedSchoolData?.ministry_code || cached.ministry_code || DEFAULT_SCHOOL_SETTINGS.ministry_code,
      updated_at: fetchedSchoolData?.updated_at || new Date().toISOString(),
    };

    saveCachedSchoolSettings(merged);
    return merged;
  } catch (err) {
    console.warn('Failed to fetch school settings from Supabase', err);
  }

  return cached;
};

/**
 * Upload official school logo to exact Supabase Storage bucket 'school-assets'
 */
export const uploadSchoolLogoToSupabase = async (
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> => {
  const current = getCachedSchoolSettings();

  if (!isSupabaseConfigured || !supabase) {
    const dataUrl = await fileToOptimizedDataUrl(file);
    await applySchoolLogoUrl(dataUrl, file.name);
    return { success: true, url: dataUrl };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `vipulanantha-college-logo-${Date.now()}.${fileExt}`;

    let resolvedUrl: string | null = null;

    // Upload strictly to exact bucket 'school-assets'
    const { error: uploadError } = await supabase.storage
      .from('school-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('school-assets')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        resolvedUrl = publicUrlData.publicUrl;
      }
    } else {
      console.warn('Storage upload error to school-assets, using optimized base64 fallback:', uploadError.message);
    }

    if (!resolvedUrl) {
      resolvedUrl = await fileToOptimizedDataUrl(file);
    }

    await applySchoolLogoUrl(resolvedUrl, filePath);
    return { success: true, url: resolvedUrl };
  } catch (err: any) {
    console.error('Failed to upload logo to school-assets:', err);
    const dataUrl = await fileToOptimizedDataUrl(file);
    await applySchoolLogoUrl(dataUrl, file.name);
    return { success: true, url: dataUrl };
  }
};

/**
 * Reset logo to official default
 */
export const resetSchoolLogoToOfficialDefault = async (): Promise<{ success: boolean; error?: string }> => {
  const defaultUrl = getOfficialSupabaseLogoUrl('vipulanantha-college-logo.png');
  await applySchoolLogoUrl(defaultUrl, 'vipulanantha-college-logo.png');
  return { success: true };
};

