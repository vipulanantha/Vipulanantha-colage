import React, { useState, useRef, useEffect } from 'react';
import { SchoolLogo } from './SchoolLogo';
import {
  SchoolSettings,
  getCachedSchoolSettings,
  fetchSchoolSettings,
  uploadSchoolLogoToSupabase,
  resetSchoolLogoToOfficialDefault,
  getOfficialSupabaseLogoUrl,
} from '../lib/schoolSettings';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  Building2,
  UploadCloud,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Award,
  Globe,
  Loader2,
} from 'lucide-react';

interface InstitutionalProfileProps {
  canEdit?: boolean;
}

export const InstitutionalProfile: React.FC<InstitutionalProfileProps> = ({ canEdit = true }) => {
  const [settings, setSettings] = useState<SchoolSettings>(getCachedSchoolSettings());
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSchoolSettings().then((s) => setSettings(s));

    const handleUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<SchoolSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };

    window.addEventListener('school_settings_updated', handleUpdated);
    return () => {
      window.removeEventListener('school_settings_updated', handleUpdated);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setNotification({ type: 'error', message: 'Please select a valid image file (.png, .jpg, .webp).' });
      return;
    }

    setIsUploading(true);
    setNotification(null);

    const result = await uploadSchoolLogoToSupabase(file);

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (result.success) {
      setNotification({
        type: 'success',
        message: 'Official School Logo uploaded to Supabase Storage bucket (school-assets) and updated across all modules!',
      });
      // Auto dismiss success after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to upload logo to Supabase Storage. Check bucket permissions or connectivity.',
      });
    }
  };

  const handleConfirmReset = async () => {
    setShowConfirmReset(false);
    setIsResetting(true);
    setNotification(null);

    const res = await resetSchoolLogoToOfficialDefault();
    setIsResetting(false);

    if (res.success) {
      setNotification({
        type: 'success',
        message: 'Custom logo removed. Restored official default Supabase Storage logo (school-assets/vipulanantha-college-logo.png).',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const isCustomLogo =
    settings.logo_url &&
    settings.logo_url !== getOfficialSupabaseLogoUrl() &&
    !settings.logo_url.endsWith('vipulanantha-college-logo.png');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>Ministry of Education Registered • Colombo 06</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-cinzel">
            Institutional Profile & Official Branding
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centralized school metadata, motto, and Supabase Storage asset management
          </p>
        </div>

        {/* Supabase Status Pill */}
        <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 text-purple-950 px-3.5 py-2 rounded-xl text-xs font-semibold self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-purple-700" />
          <div>
            <div className="text-[11px] text-purple-700 font-medium">Storage Source</div>
            <div className="font-bold">
              {isSupabaseConfigured ? 'Supabase Storage (school-assets)' : 'Supabase Client Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm shadow-sm transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs underline font-bold ml-3 cursor-pointer opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Logo Control & School Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Official Logo Asset Control */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col items-center text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Official College Emblem
          </div>

          <div className="relative my-4">
            <SchoolLogo size="lg" showGlowRing={true} id="institutional-profile-logo" />
          </div>

          <h3 className="font-cinzel font-bold text-base sm:text-lg text-purple-950 mt-2">
            {settings.school_name}
          </h3>
          <div className="text-xs text-amber-700 font-semibold mt-0.5">
            ESTD {settings.established_year} • 100+ YEARS OF EXCELLENCE
          </div>
          <div className="text-xs font-tamil text-purple-900 mt-1 font-medium">
            {settings.school_motto}
          </div>

          <div className="w-full my-5 border-t border-slate-100" />

          {/* Current URL Path Info */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-left mb-5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Active Logo Asset URL
            </div>
            <div className="text-xs font-mono text-purple-950 truncate select-all bg-white p-2 rounded border border-slate-200">
              {settings.logo_url || '/assets/vipulanantha-college-logo.png'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Status: {isCustomLogo ? 'Custom Uploaded' : 'Default Official Bundled Asset'}</span>
              <span className="text-purple-700 font-semibold">Path: /assets/vipulanantha-college-logo.png</span>
            </div>
          </div>

          {/* Action Buttons */}
          {canEdit && (
            <div className="w-full space-y-2.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-950 hover:to-indigo-950 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Uploading to Supabase Storage...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-amber-300" />
                    <span>Replace Official Logo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                disabled={isResetting || isUploading}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    <span>Resetting to Default...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Restore Default Official Logo</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Institutional Details & Credentials */}
        <div className="lg:col-span-7 space-y-6">
          {/* Institutional Metadata Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-cinzel mb-4 flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Campus Credentials & Academic Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 mb-1 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-700" />
                  <span>Official College Name</span>
                </div>
                <div className="font-bold text-slate-900 font-cinzel text-sm">{settings.school_name}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 mb-1 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-700" />
                  <span>Established Year</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{settings.established_year} (Centenary Institution)</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                <div className="text-[11px] text-slate-500 mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Official Tamil Motto</span>
                </div>
                <div className="font-bold text-purple-950 font-tamil text-sm">{settings.school_motto}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 italic">"Let us learn daily and do noble deeds"</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 mb-1 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-700" />
                  <span>Campus Address</span>
                </div>
                <div className="font-semibold text-slate-800">{settings.address}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 mb-1 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-700" />
                  <span>Telephone / Hotlines</span>
                </div>
                <div className="font-semibold text-slate-800">{settings.phone}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 mb-1 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-700" />
                  <span>Official Email</span>
                </div>
                <div className="font-semibold text-slate-800">{settings.email}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 mb-1 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-700" />
                  <span>Ministry Registration Code</span>
                </div>
                <div className="font-semibold text-slate-800">{settings.ministry_code}</div>
              </div>
            </div>
          </div>

          {/* Storage Information & Guidelines */}
          <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-purple-800">
            <h4 className="font-bold text-sm text-amber-300 mb-2 flex items-center space-x-2 font-cinzel">
              <ShieldCheck className="w-4 h-4" />
              <span>Production Supabase Storage Architecture</span>
            </h4>
            <p className="text-xs text-purple-200 leading-relaxed mb-3">
              All official branding assets are hosted under the public Supabase Storage bucket <code>school-assets</code>. This guarantees that your logo renders reliably across production environments like Netlify without depending on ephemeral local container files.
            </p>
            <div className="text-[11px] text-purple-300/90 space-y-1">
              <div>• <strong>Bucket Name:</strong> <code>school-assets</code></div>
              <div>• <strong>Default File Key:</strong> <code>vipulanantha-college-logo.png</code></div>
              <div>• <strong>Dynamic Database Override:</strong> <code>public.school_settings.logo_url</code></div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1 font-cinzel">
              Reset Official Logo?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              This will remove any custom uploaded logo and restore the official default Supabase Storage asset (<code>school-assets/vipulanantha-college-logo.png</code>).
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 bg-purple-900 hover:bg-purple-950 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
