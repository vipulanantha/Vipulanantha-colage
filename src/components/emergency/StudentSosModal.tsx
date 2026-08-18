import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  X,
  MapPin,
  HeartHandshake,
  Users,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Lock,
} from 'lucide-react';
import { LocationPreset, EmergencyLocationCoordinates } from '../../types/emergency';
import { VoiceRecorder } from './VoiceRecorder';

interface StudentSosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSos: (data: {
    message: string;
    locationPreset: LocationPreset;
    locationCustom?: string;
    coordinates?: EmergencyLocationCoordinates;
    voiceBlob?: Blob;
    voiceDuration?: number;
  }) => void;
  studentName: string;
  studentGrade: string;
}

const SOS_LOCATION_PRESETS: LocationPreset[] = [
  'Playground & Sports Pavilion',
  'Classroom Block A (Primary)',
  'Classroom Block B (Secondary & A/L)',
  'Saraswathi Block (Girls Lounge)',
  'College Canteen & Dining Area',
  'School Bus & Transport Terminal',
  'Science & Computer Laboratories',
  'Medical Bay & Infirmary',
  'Main Gate & Security Post',
  'Other (Custom)',
];

export const StudentSosModal: React.FC<StudentSosModalProps> = ({
  isOpen,
  onClose,
  onSendSos,
  studentName,
  studentGrade,
}) => {
  const [locationPreset, setLocationPreset] = useState<LocationPreset>('Playground & Sports Pavilion');
  const [locationCustom, setLocationCustom] = useState('');
  const [message, setMessage] = useState('Immediate safety assistance required on campus.');
  const [voiceBlob, setVoiceBlob] = useState<Blob | undefined>(undefined);
  const [voiceDuration, setVoiceDuration] = useState<number | undefined>(undefined);
  const [coordinates, setCoordinates] = useState<EmergencyLocationCoordinates | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attempt silent GPS geolocation acquisition if allowed
  useEffect(() => {
    if (isOpen && typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy,
            capturedAt: new Date().toISOString(),
          });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSendSos({
      message: message.trim(),
      locationPreset,
      locationCustom: locationPreset === 'Other (Custom)' ? locationCustom.trim() : undefined,
      coordinates,
      voiceBlob,
      voiceDuration,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-rose-600 overflow-hidden my-auto">
        {/* Red SOS Header */}
        <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white p-5 sm:p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-white text-rose-700 rounded-full mx-auto flex items-center justify-center shadow-lg animate-bounce mb-3">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="text-xs font-black tracking-widest uppercase bg-black/30 px-3 py-0.5 rounded-full inline-block mb-1 text-amber-300">
            CONFIDENTIAL EMERGENCY SOS
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-white">
            🚨 EMERGENCY SOS
          </h2>
          <p className="text-sm font-semibold text-rose-100 mt-1 max-w-sm mx-auto">
            Are you in immediate danger or do you need urgent help?
          </p>
        </div>

        {/* Automatic Routing Flow Display */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 p-4">
          <div className="text-[11px] font-extrabold uppercase text-purple-950 tracking-wider mb-2 flex items-center justify-between">
            <span>Automatic Emergency Routing</span>
            <span className="text-emerald-700 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>4 Contacts Notified</span>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-white p-2 rounded-xl border border-purple-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500">Student</div>
              <div className="text-xs font-black text-purple-950 truncate">{studentName.split(' ')[0]}</div>
            </div>
            <div className="bg-purple-100 p-2 rounded-xl border border-purple-300 shadow-2xs">
              <div className="text-[10px] font-bold text-purple-700">1st Route</div>
              <div className="text-xs font-black text-purple-950 truncate">CPO Lead</div>
            </div>
            <div className="bg-indigo-100 p-2 rounded-xl border border-indigo-300 shadow-2xs">
              <div className="text-[10px] font-bold text-indigo-700">2nd Route</div>
              <div className="text-xs font-black text-indigo-950 truncate">Class Teacher</div>
            </div>
            <div className="bg-amber-100 p-2 rounded-xl border border-amber-300 shadow-2xs">
              <div className="text-[10px] font-bold text-amber-700">3rd Route</div>
              <div className="text-xs font-black text-amber-950 truncate">Parent & Head</div>
            </div>
          </div>
        </div>

        {/* SOS Form Details */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs sm:text-sm">
          {/* Location Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Your Location on Campus <span className="text-rose-600">*</span></span>
              </span>
              {coordinates && (
                <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center space-x-1">
                  <Navigation className="w-3 h-3" />
                  <span>GPS Attached (±{Math.round(coordinates.accuracyMeters || 10)}m)</span>
                </span>
              )}
            </label>
            <select
              value={locationPreset}
              onChange={(e) => setLocationPreset(e.target.value as LocationPreset)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              {SOS_LOCATION_PRESETS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {locationPreset === 'Other (Custom)' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Where are you?
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Near 2nd floor library stairs"
                value={locationCustom}
                onChange={(e) => setLocationCustom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          {/* Quick Situation Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Quick Situation Description
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                'Medical / Injury Assistance',
                'Feeling Unsafe / Threatened',
                'Need Child Protection Officer',
                'Harassment / Bullying Incident',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setMessage(opt)}
                  className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all border ${
                    message === opt
                      ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-rose-500"
              placeholder="Add details if safe to do so..."
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
            maxDurationSeconds={60}
          />

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
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 hover:from-rose-700 hover:to-red-900 text-white rounded-2xl font-black text-sm tracking-wider shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
            >
              <AlertTriangle className="w-5 h-5 fill-current animate-pulse" />
              <span>[ SEND EMERGENCY SOS NOW ]</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
