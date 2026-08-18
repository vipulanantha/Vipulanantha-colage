import React, { useState } from 'react';
import { SchoolBasicInfo, SchoolType, SchoolCategory } from '../../types/schoolProfile';
import {
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface BasicInformationTabProps {
  initialInfo: SchoolBasicInfo;
  onSave: (updated: SchoolBasicInfo) => Promise<void>;
  canEdit: boolean;
}

export const BasicInformationTab: React.FC<BasicInformationTabProps> = ({
  initialInfo,
  onSave,
  canEdit,
}) => {
  const [formData, setFormData] = useState<SchoolBasicInfo>(initialInfo);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleChange = (field: keyof SchoolBasicInfo, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!formData.schoolName.trim()) {
      setErrorMessage('School Name is required.');
      return;
    }
    if (!formData.officialEmail.trim()) {
      setErrorMessage('Official Email is required.');
      return;
    }

    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await onSave(formData);
      setSuccessMessage('Basic School Information updated successfully and logged in the Audit Trail!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save school information.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(initialInfo);
    setShowConfirmReset(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-purple-700" />
            <span>Institutional Identity • Ministry Code: {formData.schoolCode}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-slate-900">
            Basic School Information & Ministry Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage official school identity, geographical classification, contacts, and institutional profile
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{isSaving ? 'Saving Updates...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs sm:text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Section A: Core Identity */}
        <div className="md:col-span-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-cinzel font-bold text-sm text-purple-950 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>1. Core Institutional Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* School Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official School Name *
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                required
              />
            </div>

            {/* School Short Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Short Name / Acronym
              </label>
              <input
                type="text"
                value={formData.schoolShortName}
                onChange={(e) => handleChange('schoolShortName', e.target.value)}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>

            {/* School Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ministry Census / School Code
              </label>
              <input
                type="text"
                value={formData.schoolCode}
                onChange={(e) => handleChange('schoolCode', e.target.value)}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-purple-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>

            {/* Established Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Established Year (ESTD)
              </label>
              <input
                type="number"
                value={formData.establishedYear}
                onChange={(e) => handleChange('establishedYear', parseInt(e.target.value) || 1920)}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>

            {/* School Type (Boys, Girls, Mixed School) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                School Type *
              </label>
              <select
                value={formData.schoolType}
                onChange={(e) => handleChange('schoolType', e.target.value as SchoolType)}
                disabled={!canEdit}
                className="w-full bg-purple-50 border border-purple-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-purple-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
              >
                <option value="Mixed School">Mixed School (Boys & Girls)</option>
                <option value="Boys">Boys Only</option>
                <option value="Girls">Girls Only</option>
              </select>
            </div>

            {/* School Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                School Classification / Category
              </label>
              <select
                value={formData.schoolCategory}
                onChange={(e) => handleChange('schoolCategory', e.target.value as SchoolCategory)}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
              >
                <option value="National School 1AB">National School 1AB (GCE A/L Science)</option>
                <option value="Provincial School 1AB">Provincial School 1AB</option>
                <option value="Special Secondary">Special Secondary</option>
                <option value="Semi-Government">Semi-Government Institution</option>
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Academic Year
              </label>
              <input
                type="text"
                value={formData.currentAcademicYear}
                onChange={(e) => handleChange('currentAcademicYear', e.target.value)}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>

            {/* School Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
              >
                <option value="Active • Fully Operational">Active • Fully Operational</option>
                <option value="Academic Break">Academic Break / Holidays</option>
                <option value="Examination Session">Examination Session</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section B: Location & Ministry Division */}
        <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-cinzel font-bold text-sm text-purple-950 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>2. Location & Ministry Hierarchy</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Physical Campus Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Province
                </label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Education Zone
                </label>
                <input
                  type="text"
                  value={formData.educationZone}
                  onChange={(e) => handleChange('educationZone', e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Education Division
                </label>
                <input
                  type="text"
                  value={formData.educationDivision}
                  onChange={(e) => handleChange('educationDivision', e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Official Contacts & Digital Presence */}
        <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-cinzel font-bold text-sm text-purple-950 flex items-center space-x-2">
            <Phone className="w-4 h-4 text-sky-600" />
            <span>3. Official Communications & Web</span>
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Main Telephone *
                </label>
                <input
                  type="text"
                  value={formData.mainTelephone}
                  onChange={(e) => handleChange('mainTelephone', e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alternative Phone
                </label>
                <input
                  type="text"
                  value={formData.alternativePhone || ''}
                  onChange={(e) => handleChange('alternativePhone', e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Institutional Email *
              </label>
              <input
                type="email"
                value={formData.officialEmail}
                onChange={(e) => handleChange('officialEmail', e.target.value)}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                College Motto (Tamil / English)
              </label>
              <input
                type="text"
                value={formData.schoolMottoTamil}
                onChange={(e) => handleChange('schoolMottoTamil', e.target.value)}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-tamil text-purple-950 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>
          </div>
        </div>

        {/* Section D: School Description */}
        <div className="md:col-span-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Official Institutional Narrative & Overview
          </label>
          <textarea
            rows={3}
            value={formData.schoolDescription}
            onChange={(e) => handleChange('schoolDescription', e.target.value)}
            disabled={!canEdit}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
          />
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Reset Changes?</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to discard unsaved edits and restore the currently saved basic information?
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
                onClick={handleReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Discard Edits
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
