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
 * Fetch school settings from Supabase database `school_settings` table.
 * If not found or not configured, returns cached or default settings with Supabase Storage logo URL.
 */
export const fetchSchoolSettings = async (): Promise<SchoolSettings> => {
  const cached = getCachedSchoolSettings();

  if (!isSupabaseConfigured || !supabase) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Supabase school_settings query error, using storage default:', error.message);
      return cached;
    }

    if (data) {
      const merged: SchoolSettings = {
        id: data.id,
        school_name: data.school_name || DEFAULT_SCHOOL_SETTINGS.school_name,
        established_year: data.established_year || DEFAULT_SCHOOL_SETTINGS.established_year,
        school_motto: data.school_motto || DEFAULT_SCHOOL_SETTINGS.school_motto,
        logo_url: data.logo_url && data.logo_url.trim().length > 0 ? data.logo_url : BUNDLED_OFFICIAL_LOGO,
        address: data.address || DEFAULT_SCHOOL_SETTINGS.address,
        phone: data.phone || DEFAULT_SCHOOL_SETTINGS.phone,
        email: data.email || DEFAULT_SCHOOL_SETTINGS.email,
        ministry_code: data.ministry_code || DEFAULT_SCHOOL_SETTINGS.ministry_code,
        updated_at: data.updated_at,
      };
      saveCachedSchoolSettings(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Failed to fetch school_settings from Supabase', err);
  }

  return cached;
};

/**
 * Upload a new official school logo to Supabase Storage bucket `school-assets`
 * and update `school_settings.logo_url` in Supabase.
 */
export const uploadSchoolLogoToSupabase = async (
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    // Offline / Mock fallback when Supabase keys are not yet entered in .env
    const objectUrl = URL.createObjectURL(file);
    const updated: SchoolSettings = {
      ...getCachedSchoolSettings(),
      logo_url: objectUrl,
    };
    saveCachedSchoolSettings(updated);
    return {
      success: true,
      url: objectUrl,
    };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `vipulanantha-college-logo-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Upload to Supabase Storage bucket 'school-assets'
    const { error: uploadError } = await supabase.storage
      .from('school-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 2. Obtain the public URL
    const { data: publicUrlData } = supabase.storage
      .from('school-assets')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Update or Insert into `school_settings` table
    const current = getCachedSchoolSettings();
    const payload = {
      school_name: current.school_name,
      established_year: current.established_year,
      school_motto: current.school_motto,
      logo_url: publicUrl,
      updated_at: new Date().toISOString(),
    };

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

    // 4. Update local cache and notify listeners
    const updatedSettings: SchoolSettings = {
      ...current,
      logo_url: publicUrl,
    };
    saveCachedSchoolSettings(updatedSettings);

    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error('Failed to upload logo to Supabase Storage:', err);
    return { success: false, error: err.message || 'Failed to upload logo to Supabase Storage' };
  }
};

/**
 * Remove custom logo and restore the official bundled logo
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
    } catch (err: any) {
      console.warn('Failed to update Supabase school_settings on reset', err);
    }
  }

  return { success: true };
};
