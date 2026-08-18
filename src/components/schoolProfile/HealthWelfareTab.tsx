import React, { useState } from 'react';
import { HealthWelfareInfo } from '../../types/schoolProfile';
import {
  HeartPulse,
  Save,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  HeartHandshake,
  Brain,
  ShieldCheck,
  Phone,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface HealthWelfareTabProps {
  initialInfo: HealthWelfareInfo;
  onSave: (updated: HealthWelfareInfo) => Promise<void>;
  canEdit: boolean;
}

export const HealthWelfareTab: React.FC<HealthWelfareTabProps> = ({
  initialInfo,
  onSave,
  canEdit,
}) => {
  const [formData, setFormData] = useState<HealthWelfareInfo>(initialInfo);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsSaving(true);
    setNotification(null);

    try {
      await onSave(formData);
      setNotification({
        type: 'success',
        message: 'Health & Student Welfare Configuration updated successfully!',
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to save health settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <HeartPulse className="w-4 h-4" />
            <span>Campus Health, Mental Well-Being & Medical Care</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-slate-900">
            Health, Medical Facilities & Student Welfare Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage school infirmary, qualified nursing, counseling, and female welfare support structures
          </p>
        </div>

        {canEdit && (
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer transition-all self-start md:self-auto disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Updates...' : 'Save Health Settings'}</span>
          </button>
        )}
      </div>

      {/* Notifications */}
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

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: First Aid & School Infirmary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
              <Stethoscope className="w-4 h-4" />
              <span>1. First Aid Room & Medical Officer</span>
            </div>
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.firstAidRoomAvailable}
                onChange={(e) => setFormData({ ...formData, firstAidRoomAvailable: e.target.checked })}
                disabled={!canEdit}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-700">Infirmary Active</span>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Medical Officer / School Nurse Name
              </label>
              <input
                type="text"
                value={formData.schoolNurseName}
                onChange={(e) => setFormData({ ...formData, schoolNurseName: e.target.value })}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location / Room No
                </label>
                <input
                  type="text"
                  value={formData.firstAidLocation}
                  onChange={(e) => setFormData({ ...formData, firstAidLocation: e.target.value })}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duty Hours
                </label>
                <input
                  type="text"
                  value={formData.medicalHours}
                  onChange={(e) => setFormData({ ...formData, medicalHours: e.target.value })}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Medical Helpline
              </label>
              <input
                type="text"
                value={formData.firstAidContact}
                onChange={(e) => setFormData({ ...formData, firstAidContact: e.target.value })}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-emerald-800"
              />
            </div>
          </div>
        </div>

        {/* Pillar 2: Female Student Welfare Support */}
        <div className="bg-purple-50/50 rounded-2xl border border-purple-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-purple-950 font-bold text-sm">
              <HeartHandshake className="w-4 h-4 text-purple-700" />
              <span>2. Female Student Support Desk (Mixed School)</span>
            </div>
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.femaleStudentSupportAvailable}
                onChange={(e) => setFormData({ ...formData, femaleStudentSupportAvailable: e.target.checked })}
                disabled={!canEdit}
                className="rounded text-purple-900 focus:ring-purple-700 w-4 h-4"
              />
              <span className="text-xs font-bold text-purple-950">Active Desk</span>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1">
                Designated Female Welfare Lead
              </label>
              <input
                type="text"
                value={formData.femaleWelfareOfficerName}
                onChange={(e) => setFormData({ ...formData, femaleWelfareOfficerName: e.target.value })}
                disabled={!canEdit}
                className="w-full bg-white border border-purple-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-purple-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1">
                Direct Confidential Helpline
              </label>
              <input
                type="text"
                value={formData.femaleWelfareContact}
                onChange={(e) => setFormData({ ...formData, femaleWelfareContact: e.target.value })}
                disabled={!canEdit}
                className="w-full bg-white border border-purple-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-purple-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider mb-1">
                Female Student Welfare Initiatives
              </label>
              <input
                type="text"
                value={formData.femaleWelfareServices}
                onChange={(e) => setFormData({ ...formData, femaleWelfareServices: e.target.value })}
                disabled={!canEdit}
                className="w-full bg-white border border-purple-300 rounded-xl px-3.5 py-2 text-xs text-purple-950"
              />
            </div>
          </div>
        </div>

        {/* Pillar 3: Student Counseling & Mental Health */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm">
              <Brain className="w-4 h-4" />
              <span>3. Counseling & Psychological Well-being</span>
            </div>
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.counselingServiceAvailable}
                onChange={(e) => setFormData({ ...formData, counselingServiceAvailable: e.target.checked })}
                disabled={!canEdit}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-700">Counseling Active</span>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lead Counselor Name
              </label>
              <input
                type="text"
                value={formData.leadCounselorName}
                onChange={(e) => setFormData({ ...formData, leadCounselorName: e.target.value })}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confidential Appointment Contact
              </label>
              <input
                type="text"
                value={formData.counselingContact}
                onChange={(e) => setFormData({ ...formData, counselingContact: e.target.value })}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mental Health Programs & Scope
              </label>
              <input
                type="text"
                value={formData.mentalHealthSupportDetails}
                onChange={(e) => setFormData({ ...formData, mentalHealthSupportDetails: e.target.value })}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Pillar 4: Health Records Policy & Confidentiality */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-purple-900" />
            <span>4. Student Health Records & Special Needs Policy</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Health Records Privacy Statement
              </label>
              <textarea
                rows={2}
                value={formData.healthRecordPolicy}
                onChange={(e) => setFormData({ ...formData, healthRecordPolicy: e.target.value })}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Allergy & Dietary Care Protocol
              </label>
              <textarea
                rows={2}
                value={formData.specialDietaryCareProtocol}
                onChange={(e) => setFormData({ ...formData, specialDietaryCareProtocol: e.target.value })}
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
