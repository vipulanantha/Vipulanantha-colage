import React, { useState, useRef } from 'react';
import { SchoolBranding } from '../../types/schoolProfile';
import { SchoolLogo } from '../SchoolLogo';
import {
  Palette,
  UploadCloud,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Save,
  Image as ImageIcon,
  Layout,
  ExternalLink,
  Eye,
  Loader2,
} from 'lucide-react';
import {
  uploadSchoolLogoToSupabase,
  resetSchoolLogoToOfficialDefault,
  BUNDLED_OFFICIAL_LOGO,
} from '../../lib/schoolSettings';

interface BrandingTabProps {
  initialBranding: SchoolBranding;
  onSave: (updated: SchoolBranding) => Promise<void>;
  canEdit: boolean;
}

export const BrandingTab: React.FC<BrandingTabProps> = ({
  initialBranding,
  onSave,
  canEdit,
}) => {
  const [formData, setFormData] = useState<SchoolBranding>(initialBranding);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setNotification({ type: 'error', message: 'Please upload a valid image file (.png, .jpg, .webp).' });
      return;
    }

    setIsUploading(true);
    setNotification(null);

    const result = await uploadSchoolLogoToSupabase(file);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (result.success && result.url) {
      const updated = {
        ...formData,
        logoUrl: result.url,
        loginPageLogoUrl: result.url,
      };
      setFormData(updated);
      await onSave(updated);
      setNotification({
        type: 'success',
        message: 'Official School Logo uploaded to stable storage and applied across the entire system!',
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setNotification({
        type: 'error',
        message: result.error || 'Failed to upload logo asset.',
      });
    }
  };

  const handleResetToDefault = async () => {
    setShowConfirmReset(false);
    setIsResetting(true);
    setNotification(null);

    const res = await resetSchoolLogoToOfficialDefault();
    setIsResetting(false);

    if (res.success) {
      const updated = {
        ...formData,
        logoUrl: BUNDLED_OFFICIAL_LOGO,
        loginPageLogoUrl: BUNDLED_OFFICIAL_LOGO,
      };
      setFormData(updated);
      await onSave(updated);
      setNotification({
        type: 'success',
        message: 'Restored official default stable bundled logo (/assets/vipulanantha-college-logo.png).',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsSaving(true);
    setNotification(null);

    try {
      await onSave(formData);
      setNotification({
        type: 'success',
        message: 'School Branding & Design Configuration saved successfully!',
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to save branding changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4 text-purple-700" />
            <span>Design System • Stable Asset Repository</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-slate-900">
            School Branding, Theme & Asset Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure official emblem, theme colors, login portal appearance, headers and footers
          </p>
        </div>

        {canEdit && (
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{isSaving ? 'Saving Theme...' : 'Save Branding'}</span>
          </button>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm shadow-xs ${
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
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs underline font-bold ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Emblem Manager & Theme Color Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Official Emblem & Storage Verification */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center text-center">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Official School Emblem
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 my-2">
            <SchoolLogo size="lg" showGlowRing={true} id="branding-tab-preview" />
          </div>

          <h3 className="font-cinzel font-bold text-slate-900 text-base mt-2">
            {formData.schoolName}
          </h3>
          <div className="text-xs font-tamil text-purple-900 font-semibold mt-0.5">
            {formData.schoolMotto}
          </div>

          <div className="w-full my-4 border-t border-slate-100" />

          {/* Asset path inspection */}
          <div className="w-full bg-slate-50 rounded-xl border border-slate-200 p-3 text-left space-y-1.5 mb-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Stable Storage Location
            </div>
            <div className="text-xs font-mono text-purple-950 bg-white p-2 rounded border border-slate-200 truncate select-all">
              {formData.logoUrl || BUNDLED_OFFICIAL_LOGO}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Preserved permanently for production deployments</span>
            </div>
          </div>

          {/* Action buttons */}
          {canEdit && (
            <div className="w-full space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-2.5 px-4 bg-purple-900 hover:bg-purple-950 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Uploading Emblem...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-amber-300" />
                    <span>Upload New Original Logo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                disabled={isResetting || isUploading}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Official Default Logo</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Theme Colors, Login Page & Header/Footer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Colors Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-cinzel font-bold text-sm text-purple-950 flex items-center space-x-2">
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Theme Color Palette</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Color */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Primary Theme Color (Royal Purple)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.primaryThemeColor}
                    onChange={(e) => setFormData({ ...formData, primaryThemeColor: e.target.value })}
                    disabled={!canEdit}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={formData.primaryThemeColor}
                    onChange={(e) => setFormData({ ...formData, primaryThemeColor: e.target.value })}
                    disabled={!canEdit}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-xs font-bold uppercase text-slate-900"
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  Applied to navigation bars, primary buttons, and institutional headers.
                </div>
              </div>

              {/* Secondary Color */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Secondary Accent Color (Imperial Gold)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.secondaryThemeColor}
                    onChange={(e) => setFormData({ ...formData, secondaryThemeColor: e.target.value })}
                    disabled={!canEdit}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={formData.secondaryThemeColor}
                    onChange={(e) => setFormData({ ...formData, secondaryThemeColor: e.target.value })}
                    disabled={!canEdit}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-xs font-bold uppercase text-slate-900"
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  Applied to highlight badges, stars, honors, and active indicators.
                </div>
              </div>
            </div>
          </div>

          {/* Header & Footer Customization */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-cinzel font-bold text-sm text-purple-950 flex items-center space-x-2">
              <Layout className="w-4 h-4 text-purple-800" />
              <span>Portal Header & Footer Text</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Global Portal Header Title
                </label>
                <input
                  type="text"
                  value={formData.schoolHeaderTitle}
                  onChange={(e) => setFormData({ ...formData, schoolHeaderTitle: e.target.value })}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Global Portal Footer & Legal Copyright
                </label>
                <input
                  type="text"
                  value={formData.schoolFooterText}
                  onChange={(e) => setFormData({ ...formData, schoolFooterText: e.target.value })}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-gradient-to-r from-purple-950 to-indigo-950 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SchoolLogo size="sm" showGlowRing={true} />
              <div>
                <div className="text-xs font-bold font-cinzel text-amber-300 tracking-wide">
                  {formData.schoolHeaderTitle}
                </div>
                <div className="text-[10px] text-slate-300">{formData.schoolMotto}</div>
              </div>
            </div>
            <div className="text-[10px] font-mono bg-white/10 px-2.5 py-1 rounded-lg text-emerald-300">
              Live Theme Applied
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Reset School Logo?</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              This will restore the official bundled emblem asset from{' '}
              <span className="font-mono font-bold text-purple-950">
                /assets/vipulanantha-college-logo.png
              </span>
              .
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
