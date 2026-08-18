import React, { useState, useRef, useEffect } from 'react';
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
  Search,
  Database,
  FolderSearch,
  Check,
  Globe,
} from 'lucide-react';
import {
  uploadSchoolLogoToSupabase,
  resetSchoolLogoToOfficialDefault,
  scanSupabaseStorageForLogos,
  applySchoolLogoUrl,
  DiscoveredSupabaseAsset,
  BUNDLED_OFFICIAL_LOGO,
} from '../../lib/schoolSettings';
import { isSupabaseConfigured } from '../../lib/supabase';

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

  // Supabase Storage Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredLogos, setDiscoveredLogos] = useState<DiscoveredSupabaseAsset[]>([]);
  const [scanResult, setScanResult] = useState<{ searched: boolean; count: number; error?: string } | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isApplyingFoundLogo, setIsApplyingFoundLogo] = useState(false);

  // Auto-scan on modal open or when user clicks search
  const handleScanSupabaseStorage = async () => {
    setIsScanning(true);
    setNotification(null);
    try {
      const res = await scanSupabaseStorageForLogos();
      setDiscoveredLogos(res.discovered);
      setScanResult({
        searched: true,
        count: res.discovered.length,
        error: res.error,
      });
      if (res.discovered.length > 0) {
        setNotification({
          type: 'success',
          message: `Found ${res.discovered.length} image asset(s) in Supabase Storage buckets!`,
        });
      } else if (res.error) {
        setNotification({
          type: 'error',
          message: res.error,
        });
      } else {
        setNotification({
          type: 'error',
          message: `Checked buckets (${res.checkedBuckets.join(', ')}). No image files found yet. You can paste the direct Supabase public URL below or upload your file.`,
        });
      }
    } catch (e: any) {
      setScanResult({
        searched: true,
        count: 0,
        error: e.message || 'Failed to scan Supabase storage.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyDiscoveredLogo = async (assetUrl: string) => {
    setIsApplyingFoundLogo(true);
    try {
      await applySchoolLogoUrl(assetUrl);
      const updated = {
        ...formData,
        logoUrl: assetUrl,
        loginPageLogoUrl: assetUrl,
      };
      setFormData(updated);
      await onSave(updated);
      setShowScannerModal(false);
      setNotification({
        type: 'success',
        message: 'Successfully applied Supabase Storage logo across the entire school system!',
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to apply selected logo.',
      });
    } finally {
      setIsApplyingFoundLogo(false);
    }
  };

  const handleApplyCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    let urlToApply = customUrlInput.trim();
    // If user provided a storage path like 'school-assets/my-logo.png'
    if (!urlToApply.startsWith('http://') && !urlToApply.startsWith('https://')) {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://3gyezqjbqhvaqqxhtmin6r.supabase.co';
      urlToApply = `${baseUrl.replace(/\/$/, '')}/storage/v1/object/public/${urlToApply.replace(/^\//, '')}`;
    }

    await handleApplyDiscoveredLogo(urlToApply);
  };

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
                onClick={() => {
                  setShowScannerModal(true);
                  handleScanSupabaseStorage();
                }}
                disabled={isScanning}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs cursor-pointer transition-all disabled:opacity-50 border border-blue-400/30"
              >
                <FolderSearch className="w-4 h-4 text-cyan-300" />
                <span>Find / Scan Uploaded Logo in Supabase</span>
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

      {/* Supabase Storage Logo Discovery / Finder Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-purple-800/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-800/60 border border-purple-400/30 flex items-center justify-center">
                  <FolderSearch className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-base text-white flex items-center space-x-2">
                    <span>Supabase Storage Logo Finder</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-sans font-bold border border-emerald-500/30">
                      Cloud Asset Scanner
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Locate, inspect, and apply logos uploaded to your Supabase project buckets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Scan Control Header */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-purple-700" />
                    <span>Supabase Storage Buckets</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Scans <code className="font-mono text-purple-900 bg-purple-50 px-1 py-0.5 rounded">school-assets</code>, <code className="font-mono text-purple-900 bg-purple-50 px-1 py-0.5 rounded">logos</code>, <code className="font-mono text-purple-900 bg-purple-50 px-1 py-0.5 rounded">assets</code>, <code className="font-mono text-purple-900 bg-purple-50 px-1 py-0.5 rounded">public</code>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleScanSupabaseStorage}
                  disabled={isScanning}
                  className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span>Scanning Buckets...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5 text-amber-300" />
                      <span>Re-Scan Storage</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct URL / Storage Path Applicator */}
              <div className="bg-blue-50/60 rounded-2xl border border-blue-200 p-4 space-y-2.5">
                <div className="text-xs font-bold text-blue-950 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-700" />
                  <span>Direct Supabase Image URL or Storage Object Path</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  If you know the specific file name or public URL from your Supabase Storage dashboard, enter it here:
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="e.g. school-assets/vipulanantha-logo.png or https://...supabase.co/storage/v1/object/public/..."
                    className="flex-1 bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    disabled={!customUrlInput.trim() || isApplyingFoundLogo}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center space-x-1.5"
                  >
                    {isApplyingFoundLogo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Apply URL</span>
                  </button>
                </div>
              </div>

              {/* Discovered Images Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Discovered Cloud Assets ({discoveredLogos.length})</span>
                  {discoveredLogos.length > 0 && (
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Click any asset to apply as School Emblem
                    </span>
                  )}
                </div>

                {isScanning ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-900 mx-auto" />
                    <div className="text-xs font-bold text-slate-700">Searching your Supabase buckets...</div>
                    <div className="text-[11px] text-slate-500">Checking public permissions and object listings</div>
                  </div>
                ) : discoveredLogos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {discoveredLogos.map((asset, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                          formData.logoUrl === asset.publicUrl
                            ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-600/30'
                            : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-14 h-14 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                            <img
                              src={asset.publicUrl}
                              alt={asset.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1">
                              {asset.isLikelyLogo && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold uppercase">
                                  ★ Logo Match
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 font-mono truncate">
                                [{asset.bucket}]
                              </span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 truncate" title={asset.name}>
                              {asset.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {asset.size ? `${(asset.size / 1024).toFixed(1)} KB` : 'Cloud Asset'}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <a
                            href={asset.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-purple-700 hover:text-purple-900 font-semibold flex items-center space-x-1 truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span>Preview</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleApplyDiscoveredLogo(asset.publicUrl)}
                            disabled={isApplyingFoundLogo || formData.logoUrl === asset.publicUrl}
                            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                              formData.logoUrl === asset.publicUrl
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-purple-900 hover:bg-purple-950 text-white'
                            }`}
                          >
                            {formData.logoUrl === asset.publicUrl ? 'Active Logo' : 'Select Logo'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-700">No images found in checked buckets yet</div>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      If you recently uploaded your logo in Supabase Storage, make sure the bucket is marked as <strong>Public</strong> or paste the image URL in the direct input box above.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Current active logo: <span className="font-mono text-slate-800 font-bold">{formData.logoUrl || 'Bundled Default'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
