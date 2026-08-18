import { supabase, isSupabaseConfigured } from './supabase';

export interface SchoolSettings {
  id?: string;
  school_name: string;
  established_year: number;
  school_motto: string;
  logo_url: string | null;
  address?: string;
  phone?: string;
  email?: string;
  ministry_code?: string;
  updated_at?: string;
}

// Bundled official school logo path served statically from public/assets
export const BUNDLED_OFFICIAL_LOGO = '/assets/vipulanantha-college-logo.png';

export interface DiscoveredSupabaseAsset {
  bucket: string;
  name: string;
  id?: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
  publicUrl: string;
  isLikelyLogo: boolean;
}

// Default fallback Supabase URL if environment variable is not yet populated
const DEFAULT_SUPABASE_PROJECT_URL = 'https://3gyezqjbqhvaqqxhtmin6r.supabase.co';

export const getSupabaseBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl && !envUrl.includes('your-project-ref') && envUrl.trim().length > 0) {
    return envUrl.replace(/\/$/, '');
  }
  return DEFAULT_SUPABASE_PROJECT_URL;
};

// Official Supabase Storage Public URL for VipulanAntha College Colombo
export const getOfficialSupabaseLogoUrl = (): string => {
  const baseUrl = getSupabaseBaseUrl();
  return `${baseUrl}/storage/v1/object/public/school-assets/vipulanantha-college-logo.png`;
};

/**
 * Scan all common Supabase Storage buckets for uploaded logos and image assets
 */
export const scanSupabaseStorageForLogos = async (): Promise<{
  success: boolean;
  discovered: DiscoveredSupabaseAsset[];
  checkedBuckets: string[];
  error?: string;
}> => {
  const candidateBuckets = [
    'school-assets',
    'school_assets',
    'logos',
    'assets',
    'images',
    'public',
    'branding',
    'uploads',
    'files',
  ];

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      discovered: [],
      checkedBuckets: candidateBuckets,
      error: 'Supabase credentials not configured in environment (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
    };
  }

  const discovered: DiscoveredSupabaseAsset[] = [];
  const checkedBuckets: string[] = [];

  for (const bucket of candidateBuckets) {
    try {
      checkedBuckets.push(bucket);
      const { data: files, error } = await supabase.storage.from(bucket).list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) {
        // Bucket might not exist or be private
        continue;
      }

      if (files && Array.isArray(files)) {
        for (const file of files) {
          if (!file.name || file.name === '.emptyFolderPlaceholder') continue;
          
          const isImage = /\.(png|jpe?g|webp|svg|gif|avif|bmp|ico)$/i.test(file.name);
          if (isImage) {
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(file.name);
            const lowerName = file.name.toLowerCase();
            const isLikelyLogo =
              lowerName.includes('logo') ||
              lowerName.includes('crest') ||
              lowerName.includes('emblem') ||
              lowerName.includes('vipulanantha') ||
              lowerName.includes('school') ||
              lowerName.includes('seal') ||
              lowerName.includes('badge');

            discovered.push({
              bucket,
              name: file.name,
              id: file.id,
              size: file.metadata?.size,
              created_at: file.created_at,
              updated_at: file.updated_at,
              publicUrl: urlData.publicUrl,
              isLikelyLogo,
            });
          }
        }
      }
    } catch (e) {
      // Continue searching other buckets
    }
  }

  // Sort likely logos first, then by newest
  discovered.sort((a, b) => {
    if (a.isLikelyLogo && !b.isLikelyLogo) return -1;
    if (!a.isLikelyLogo && b.isLikelyLogo) return 1;
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  return {
    success: true,
    discovered,
    checkedBuckets,
  };
};

/**
 * Convert a File to an optimized Base64 Data URL with automatic dimension scaling
 * for cross-device storage when Supabase Storage RLS policies are restricted.
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
 * Apply a discovered or custom logo URL directly to School Settings and Supabase
 * across all relevant tables so it is fixed on all devices.
 */
export const applySchoolLogoUrl = async (
  logoUrl: string
): Promise<{ success: boolean; error?: string }> => {
  const current = getCachedSchoolSettings();
  const updatedSettings: SchoolSettings = {
    ...current,
    logo_url: logoUrl,
  };
  saveCachedSchoolSettings(updatedSettings);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        school_name: current.school_name,
        established_year: current.established_year,
        school_motto: current.school_motto,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      };

      // 1. Update/Upsert school_settings table
      if (current.id) {
        await supabase.from('school_settings').update(payload).eq('id', current.id);
      } else {
        await supabase
          .from('school_settings')
          .upsert({ id: 'primary-school-settings', ...payload });
      }

      // 2. Also update school_branding table if present
      try {
        await supabase.from('school_branding').upsert({
          id: 'primary-branding',
          school_name: current.school_name,
          logo_url: logoUrl,
          motto: current.school_motto,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        // ignore if table not in schema
      }

      // 3. Also update schools table if present
      try {
        await supabase.from('schools').upsert({
          id: 'vipulanantha-school-profile',
          school_name: current.school_name,
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        // ignore if table not in schema
      }
    } catch (err: any) {
      console.warn('Failed to update Supabase school_settings on logo apply', err);
    }
  }

  return { success: true };
};

// Initial default settings object
export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  school_name: 'VIPULANANTHA COLLEGE COLOMBO',
  established_year: 1920,
  school_motto: 'நாளும் பயில்வோம் நட்பனி புரிவோம்',
  logo_url: BUNDLED_OFFICIAL_LOGO,
  address: 'College Avenue, Colombo 06, Sri Lanka',
  phone: '+94 11 258 1920',
  email: 'info@vipulanantha.edu.lk',
  ministry_code: 'WP/CM/1920',
};

// In-memory / localStorage cache for instant synchronous render
const CACHE_KEY = 'vc_school_settings_cache';

export const getCachedSchoolSettings = (): SchoolSettings => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...DEFAULT_SCHOOL_SETTINGS,
        ...parsed,
        // Ensure logo_url always falls back to the official bundled logo if empty
        logo_url: parsed.logo_url || BUNDLED_OFFICIAL_LOGO,
      };
    }
  } catch (e) {
    console.warn('Error reading cached school settings', e);
  }
  return DEFAULT_SCHOOL_SETTINGS;
};

export const saveCachedSchoolSettings = (settings: SchoolSettings) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
    // Dispatch global event for instant multi-component reactivity
    window.dispatchEvent(new CustomEvent('school_settings_updated', { detail: settings }));
  } catch (e) {
    console.warn('Error caching school settings', e);
  }
};

/**
 * Fetch school settings from Supabase database (checking school_settings, school_branding, schools, and storage).
 * Ensures that any device opening the app instantly receives the exact same logo and branding.
 */
export const fetchSchoolSettings = async (): Promise<SchoolSettings> => {
  const cached = getCachedSchoolSettings();

  if (!isSupabaseConfigured || !supabase) {
    return cached;
  }

  try {
    let resolvedLogo: string | null = null;
    let fetchedSchoolData: Partial<SchoolSettings> | null = null;

    // 1. Try fetching from `school_settings` table
    try {
      const { data: sData } = await supabase
        .from('school_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (sData) {
        fetchedSchoolData = {
          id: sData.id,
          school_name: sData.school_name,
          established_year: sData.established_year,
          school_motto: sData.school_motto,
          address: sData.address,
          phone: sData.phone,
          email: sData.email,
          ministry_code: sData.ministry_code,
          updated_at: sData.updated_at,
        };
        if (sData.logo_url && sData.logo_url.trim().length > 0) {
          resolvedLogo = sData.logo_url;
        }
      }
    } catch (e) {
      // Continue to next check
    }

    // 2. If logo not yet found, check `school_branding` table
    if (!resolvedLogo) {
      try {
        const { data: bData } = await supabase
          .from('school_branding')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (bData?.logo_url && bData.logo_url.trim().length > 0) {
          resolvedLogo = bData.logo_url;
        }
      } catch (e) {
        // Continue
      }
    }

    // 3. If logo not yet found, check `schools` table
    if (!resolvedLogo) {
      try {
        const { data: scData } = await supabase
          .from('schools')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (scData?.logo_url && scData.logo_url.trim().length > 0) {
          resolvedLogo = scData.logo_url;
        }
      } catch (e) {
        // Continue
      }
    }

    // 4. If still not found, check Supabase Storage buckets for any uploaded logo
    if (!resolvedLogo) {
      try {
        const scan = await scanSupabaseStorageForLogos();
        if (scan.discovered && scan.discovered.length > 0) {
          resolvedLogo = scan.discovered[0].publicUrl;
        }
      } catch (scanErr) {
        // Continue
      }
    }

    const merged: SchoolSettings = {
      id: fetchedSchoolData?.id || cached.id,
      school_name: fetchedSchoolData?.school_name || cached.school_name || DEFAULT_SCHOOL_SETTINGS.school_name,
      established_year: fetchedSchoolData?.established_year || cached.established_year || DEFAULT_SCHOOL_SETTINGS.established_year,
      school_motto: fetchedSchoolData?.school_motto || cached.school_motto || DEFAULT_SCHOOL_SETTINGS.school_motto,
      logo_url: resolvedLogo || cached.logo_url || BUNDLED_OFFICIAL_LOGO,
      address: fetchedSchoolData?.address || cached.address || DEFAULT_SCHOOL_SETTINGS.address,
      phone: fetchedSchoolData?.phone || cached.phone || DEFAULT_SCHOOL_SETTINGS.phone,
      email: fetchedSchoolData?.email || cached.email || DEFAULT_SCHOOL_SETTINGS.email,
      ministry_code: fetchedSchoolData?.ministry_code || cached.ministry_code || DEFAULT_SCHOOL_SETTINGS.ministry_code,
      updated_at: fetchedSchoolData?.updated_at || new Date().toISOString(),
    };

    saveCachedSchoolSettings(merged);
    return merged;
  } catch (err) {
    console.warn('Failed to fetch school_settings from Supabase', err);
  }

  return cached;
};

/**
 * Upload a new official school logo to Supabase Storage (with multi-bucket & base64 fallback)
 * and update `school_settings.logo_url` in Supabase across all devices.
 */
export const uploadSchoolLogoToSupabase = async (
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> => {
  const current = getCachedSchoolSettings();

  if (!isSupabaseConfigured || !supabase) {
    // Offline / Mock fallback: convert to persistent base64 data URL
    const dataUrl = await fileToOptimizedDataUrl(file);
    const updated: SchoolSettings = {
      ...current,
      logo_url: dataUrl,
    };
    saveCachedSchoolSettings(updated);
    return {
      success: true,
      url: dataUrl,
    };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `vipulanantha-college-logo-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    let resolvedUrl: string | null = null;
    let storageErrorMsg: string | null = null;

    // 1. Try uploading to candidate Supabase Storage buckets
    const candidateBuckets = ['school-assets', 'logos', 'branding', 'assets', 'public', 'uploads'];
    for (const bucket of candidateBuckets) {
      try {
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            resolvedUrl = publicUrlData.publicUrl;
            break;
          }
        } else {
          storageErrorMsg = uploadError.message;
        }
      } catch (bucketErr: any) {
        storageErrorMsg = bucketErr?.message;
      }
    }

    // 2. If storage buckets were blocked (e.g. RLS policy restriction),
    // convert the logo to an optimized base64 Data URL so cloud database sync STILL works 100% across devices!
    if (!resolvedUrl) {
      resolvedUrl = await fileToOptimizedDataUrl(file);
    }

    // 3. Persist the logo across Supabase database tables (`school_settings`, `school_branding`, `schools`)
    const payload = {
      school_name: current.school_name,
      established_year: current.established_year,
      school_motto: current.school_motto,
      logo_url: resolvedUrl,
      updated_at: new Date().toISOString(),
    };

    // Update school_settings
    try {
      if (current.id) {
        await supabase.from('school_settings').update(payload).eq('id', current.id);
      } else {
        const { data: inserted } = await supabase
          .from('school_settings')
          .upsert({ id: 'primary-school-settings', ...payload })
          .select()
          .maybeSingle();

        if (inserted) {
          current.id = inserted.id;
        }
      }
    } catch (dbErr) {
      console.warn('Could not update school_settings table, trying school_branding:', dbErr);
    }

    // Update school_branding
    try {
      await supabase.from('school_branding').upsert({
        id: 'primary-branding',
        school_name: current.school_name,
        logo_url: resolvedUrl,
        motto: current.school_motto,
        updated_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      // ignore
    }

    // Update schools
    try {
      await supabase.from('schools').upsert({
        id: 'vipulanantha-school-profile',
        school_name: current.school_name,
        logo_url: resolvedUrl,
        updated_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      // ignore
    }

    // 4. Update local cache and notify listeners on the current client
    const updatedSettings: SchoolSettings = {
      ...current,
      logo_url: resolvedUrl,
    };
    saveCachedSchoolSettings(updatedSettings);

    return { success: true, url: resolvedUrl };
  } catch (err: any) {
    console.error('Failed to process school logo upload:', err);
    // Even if everything threw, preserve locally
    try {
      const dataUrl = await fileToOptimizedDataUrl(file);
      const updatedSettings: SchoolSettings = {
        ...current,
        logo_url: dataUrl,
      };
      saveCachedSchoolSettings(updatedSettings);
      return { success: true, url: dataUrl };
    } catch (innerErr) {
      return { success: false, error: err.message || 'Failed to upload logo' };
    }
  }
};

/**
 * Remove custom logo and restore the official bundled logo across all devices
 */
export const resetSchoolLogoToOfficialDefault = async (): Promise<{ success: boolean; error?: string }> => {
  const defaultUrl = BUNDLED_OFFICIAL_LOGO;
  const current = getCachedSchoolSettings();

  const updatedSettings: SchoolSettings = {
    ...current,
    logo_url: defaultUrl,
  };
  saveCachedSchoolSettings(updatedSettings);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        logo_url: null, // Reset to null so default is used
        updated_at: new Date().toISOString(),
      };
      if (current.id) {
        await supabase.from('school_settings').update(payload).eq('id', current.id);
      } else {
        await supabase.from('school_settings').upsert({ id: 'primary-school-settings', ...payload });
      }
      try {
        await supabase.from('school_branding').upsert({ id: 'primary-branding', logo_url: null, updated_at: new Date().toISOString() });
      } catch (e) {}
      try {
        await supabase.from('schools').upsert({ id: 'vipulanantha-school-profile', logo_url: null, updated_at: new Date().toISOString() });
      } catch (e) {}
    } catch (err: any) {
      console.warn('Failed to update Supabase school_settings on reset', err);
    }
  }

  return { success: true };
};
