import React, { useState } from 'react';
import {
  HeartHandshake,
  X,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Phone,
  Send,
} from 'lucide-react';
import { LocationPreset, EmergencyPriority } from '../../types/emergency';
import { VoiceRecorder } from './VoiceRecorder';

interface ParentEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendParentAlert: (data: {
    title: string;
    message: string;
    priority: EmergencyPriority;
    locationPreset: LocationPreset;
    locationCustom?: string;
    childName: string;
    childGrade: string;
    voiceBlob?: Blob;
    voiceDuration?: number;
  }) => void;
  parentName: string;
  childName: string;
  childGrade: string;
}

const LOCATION_PRESETS: LocationPreset[] = [
  'Main Gate & Security Post',
  'School Bus & Transport Terminal',
  'Classroom Block A (Primary)',
  'Classroom Block B (Secondary & A/L)',
  'Medical Bay & Infirmary',
  'College Canteen & Dining Area',
  'Playground & Sports Pavilion',
  'Other (Custom)',
];

export const ParentEmergencyModal: React.FC<ParentEmergencyModalProps> = ({
  isOpen,
  onClose,
  onSendParentAlert,
  parentName,
  childName,
  childGrade,
}) => {
  const [reason, setReason] = useState('Medical Emergency / Immediate Health Care Needed');
  const [title, setTitle] = useState(`Urgent Parent Alert: Regarding ${childName} (${childGrade})`);
  const [message, setMessage] = useState(
    `Guardian urgent alert regarding student ${childName}. Please coordinate immediately with Class Teacher and CPO.`
  );
  const [locationPreset, setLocationPreset] = useState<LocationPreset>('Main Gate & Security Post');
  const [locationCustom, setLocationCustom] = useState('');
  const [priority, setPriority] = useState<EmergencyPriority>('HIGH');
  const [voiceBlob, setVoiceBlob] = useState<Blob | undefined>(undefined);
  const [voiceDuration, setVoiceDuration] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSendParentAlert({
      title: title.trim(),
      message: message.trim(),
      priority,
      locationPreset,
      locationCustom: locationPreset === 'Other (Custom)' ? locationCustom.trim() : undefined,
      childName,
      childGrade,
      voiceBlob,
      voiceDuration,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-amber-400 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white text-orange-600 rounded-2xl shadow-md">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-amber-200">
                Guardian Emergency Portal
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-cinzel text-white">
                👨‍👩‍👧 PARENT EMERGENCY ALERT
              </h2>
              <p className="text-xs text-amber-100 mt-0.5">
                Notifying Vipulananda College Safeguarding & Administration regarding <strong>{childName}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Automatic Routing Flow */}
        <div className="bg-amber-50/80 border-b border-amber-200 p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-amber-950 font-bold">
            <Users className="w-4 h-4 text-orange-600" />
            <span>Auto-routed to: <strong>Class Teacher + CPO Officer + Principal</strong></span>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
            Direct Line
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs sm:text-sm">
          {/* Situation Category */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Emergency Reason <span className="text-rose-600">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setTitle(`${e.target.value} - ${childName} (${childGrade})`);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="Medical Emergency / Urgent Healthcare Support">Medical Emergency / Urgent Healthcare Support</option>
              <option value="Severe Family Crisis / Immediate Collection Request">Severe Family Crisis / Immediate Collection Request</option>
              <option value="Transport Breakdown / Safety Delay on Route">Transport Breakdown / Safety Delay on Route</option>
              <option value="Emergency Authorized Guardian Collection Proxy">Emergency Authorized Guardian Collection Proxy</option>
              <option value="Child Safeguarding & Protection Report">Child Safeguarding & Protection Report</option>
              <option value="Other Urgent Student Safety Issue">Other Urgent Student Safety Issue</option>
            </select>
          </div>

          {/* Location Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Student Current / Expected Area <span className="text-rose-600">*</span></span>
              </label>
              <select
                value={locationPreset}
                onChange={(e) => setLocationPreset(e.target.value as LocationPreset)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
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
                Urgency Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EmergencyPriority)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
              >
                <option value="CRITICAL">🚨 CRITICAL (Immediate Attention)</option>
                <option value="HIGH">⚠️ HIGH (Urgent Dispatch)</option>
                <option value="MEDIUM">ℹ️ MEDIUM (Important)</option>
              </select>
            </div>
          </div>

          {locationPreset === 'Other (Custom)' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Custom Location or Pickup Point
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Waiting outside South Gate Security Post"
                value={locationCustom}
                onChange={(e) => setLocationCustom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Details */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Urgent Message & Specific Instructions <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Describe what assistance is needed from the school..."
            />
          </div>

          {/* Voice Dispatch */}
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

          {/* Action Footer */}
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
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-orange-600 to-rose-700 hover:from-orange-700 hover:to-rose-800 text-white font-black rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>[ TRANSMIT EMERGENCY ALERT TO SCHOOL ]</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
