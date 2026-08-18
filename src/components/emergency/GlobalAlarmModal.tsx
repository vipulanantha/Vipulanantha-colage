import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  X,
  MapPin,
  ShieldAlert,
  Volume2,
  Lock,
  CheckCircle2,
  Users,
  Building,
} from 'lucide-react';
import { LocationPreset, EmergencyPriority } from '../../types/emergency';
import { VoiceRecorder } from './VoiceRecorder';

interface GlobalAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: (data: {
    title: string;
    message: string;
    priority: EmergencyPriority;
    locationPreset: LocationPreset;
    locationCustom?: string;
    reason: string;
    voiceBlob?: Blob;
    voiceDuration?: number;
  }) => void;
  authorName: string;
  authorRole: string;
}

const LOCATION_PRESETS: LocationPreset[] = [
  'School Ground',
  'Main Gate & Security Post',
  'Classroom Block A (Primary)',
  'Classroom Block B (Secondary & A/L)',
  'Science & Computer Laboratories',
  'Library & Reading Hall',
  'Playground & Sports Pavilion',
  'College Canteen & Dining Area',
  'School Bus & Transport Terminal',
  'Medical Bay & Infirmary',
  'Saraswathi Block (Girls Lounge)',
  'Auditorium & Cultural Hall',
  'Other (Custom)',
];

const GLOBAL_REASONS = [
  'Severe Weather Threat & Monsoon Safety',
  'Fire Hazard & Immediate Building Evacuation',
  'Campus Security Threat / Unauthorized Intrusion',
  'Major Medical Incident & Multi-Casualty Support',
  'School Transport & Campus Access Lockdown',
  'Institutional Safety Drill (Scheduled / Unannounced)',
  'Other Critical College Emergency',
];

export const GlobalAlarmModal: React.FC<GlobalAlarmModalProps> = ({
  isOpen,
  onClose,
  onActivate,
  authorName,
  authorRole,
}) => {
  const [reason, setReason] = useState(GLOBAL_REASONS[0]);
  const [title, setTitle] = useState('CRITICAL: Campus-Wide Emergency Notification');
  const [message, setMessage] = useState(
    'All faculty, security staff, and students please follow standard college safety protocol immediately. Remain at designated assembly points.'
  );
  const [locationPreset, setLocationPreset] = useState<LocationPreset>('Main Gate & Security Post');
  const [locationCustom, setLocationCustom] = useState('');
  const [priority, setPriority] = useState<EmergencyPriority>('CRITICAL');
  const [voiceBlob, setVoiceBlob] = useState<Blob | undefined>(undefined);
  const [voiceDuration, setVoiceDuration] = useState<number | undefined>(undefined);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setIsSubmitting(true);
    onActivate({
      title: title.trim(),
      message: message.trim(),
      priority,
      locationPreset,
      locationCustom: locationPreset === 'Other (Custom)' ? locationCustom.trim() : undefined,
      reason,
      voiceBlob,
      voiceDuration,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-rose-500 overflow-hidden my-auto">
        {/* Urgent Warning Header Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white text-rose-700 rounded-2xl shadow-md animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-black/25 rounded-full text-[11px] font-black tracking-wider uppercase text-amber-300 mb-1">
                <Radio className="w-3.5 h-3.5 animate-ping" />
                <span>Executive Alarm Authority</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-cinzel tracking-wide text-white">
                🚨 GLOBAL EMERGENCY ALARM
              </h2>
              <p className="text-xs text-rose-100 mt-0.5">
                You are about to notify the entire Vipulananda College emergency network.
              </p>
            </div>
          </div>
        </div>

        {/* Recipients Scope Notification */}
        <div className="bg-rose-50 border-b border-rose-200 px-5 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-900 text-xs font-bold">
            <Users className="w-4 h-4 text-rose-600" />
            <span>Recipients: <strong>ALL AUTHORIZED SCHOOL MEMBERS</strong></span>
          </div>
          <span className="text-[11px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-mono font-bold">
            All Staff + Parents + Students
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Emergency Reason <span className="text-rose-600">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setTitle(`CRITICAL: ${e.target.value}`);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              {GLOBAL_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Alert Headline / Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Location Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Primary Location / Incident Area <span className="text-rose-600">*</span></span>
              </label>
              <select
                value={locationPreset}
                onChange={(e) => setLocationPreset(e.target.value as LocationPreset)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                {LOCATION_PRESETS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Priority Level
              </label>
              <div className="flex items-center space-x-2">
                {(['CRITICAL', 'HIGH'] as EmergencyPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      priority === p
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p === 'CRITICAL' ? '🚨 CRITICAL (Siren)' : '⚠️ HIGH'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {locationPreset === 'Other (Custom)' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Specify Custom Location Details
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Science Laboratory Block 3rd Floor"
                value={locationCustom}
                onChange={(e) => setLocationCustom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          {/* Message Text */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Emergency Action Instructions <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              placeholder="State clear directives for teachers, security marshals, and parents..."
            />
          </div>

          {/* Voice Dispatch Audio Recorder */}
          <VoiceRecorder
            onRecordingComplete={(blob, duration) => {
              setVoiceBlob(blob);
              setVoiceDuration(duration);
            }}
            onRecordingRemoved={() => {
              setVoiceBlob(undefined);
              setVoiceDuration(undefined);
            }}
          />

          {/* Mandatory Confirmation Gate */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="confirm-global-alarm"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-rose-600 rounded border-amber-400 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="confirm-global-alarm" className="text-xs text-amber-950 font-bold leading-relaxed cursor-pointer">
                I hereby confirm that I am authorized as <u>{authorName} ({authorRole})</u> to broadcast a Global Emergency Alarm across Vipulananda College. I verify that this emergency alarm requires instant school-wide deployment.
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              [ CANCEL ]
            </button>

            <button
              type="submit"
              disabled={!isConfirmed || isSubmitting}
              className={`w-full sm:w-auto px-7 py-3 rounded-xl text-xs sm:text-sm font-black tracking-wide shadow-lg flex items-center justify-center space-x-2 transition-all ${
                isConfirmed && !isSubmitting
                  ? 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white cursor-pointer hover:shadow-rose-500/30'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>[ ACTIVATE EMERGENCY ALARM ]</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
