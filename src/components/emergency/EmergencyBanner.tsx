import React, { useState } from 'react';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { EmergencyAlert } from '../../types/emergency';
import { stopEmergencySiren, startEmergencySiren, getIsSirenPlaying } from '../../lib/emergencyAudio';

interface EmergencyBannerProps {
  activeEmergencies?: EmergencyAlert[];
  alerts?: EmergencyAlert[];
  onOpenEmergencyCenter?: (emergencyId?: string) => void;
  onViewEmergency?: (emergencyId?: string) => void;
  onQuickAcknowledge?: (emergencyId: string) => void;
  onAcknowledge?: (emergencyId: string) => void;
  currentUserId?: string;
  currentUserName?: string;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  activeEmergencies,
  alerts,
  onOpenEmergencyCenter,
  onViewEmergency,
  onQuickAcknowledge,
  onAcknowledge,
  currentUserId = '',
  currentUserName = '',
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const rawList = activeEmergencies || alerts || [];
  const activeList = rawList.filter(
    (a) => a && (a.status === 'ACTIVE' || a.status === 'RESPONDING' || a.status === 'ASSISTANCE_DISPATCHED')
  );

  if (activeList.length === 0) return null;

  const topEmergency = activeList[0];
  const isCritical = topEmergency.priority === 'CRITICAL';

  const handleOpen = onOpenEmergencyCenter || onViewEmergency || (() => {});
  const handleAcknowledge = onQuickAcknowledge || onAcknowledge || (() => {});

  const toggleSound = () => {
    if (getIsSirenPlaying() || !isMuted) {
      stopEmergencySiren();
      setIsMuted(true);
    } else {
      startEmergencySiren(0.85);
      setIsMuted(false);
    }
  };

  const isUserAcknowledged = (topEmergency.recipients || []).some(
    (r) =>
      (r.recipientId === currentUserId || r.recipientName === currentUserName) &&
      r.deliveryStatus === 'ACKNOWLEDGED'
  );

  return (
    <div
      className={`w-full z-40 border-b shadow-md transition-all animate-fade-in ${
        isCritical
          ? 'bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 border-rose-900 text-white'
          : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 border-amber-800 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left Info */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="p-2 bg-white/20 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/30 text-amber-300">
                <Radio className="w-3 h-3 animate-ping" />
                <span>{activeList.length} ACTIVE INCIDENT{activeList.length > 1 ? 'S' : ''}</span>
              </span>
              <span className="text-[11px] font-mono opacity-80 hidden md:inline">
                [{topEmergency.id}]
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black truncate text-white mt-0.5">
              {topEmergency.title} • <span className="font-semibold text-rose-100">{topEmergency.locationPreset}</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
          {/* Siren Mute Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 bg-black/25 hover:bg-black/40 rounded-xl text-white transition-all cursor-pointer text-xs flex items-center space-x-1"
            title={isMuted ? 'Unmute Siren Sound' : 'Mute Siren Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-rose-200 animate-pulse" />}
            <span className="text-[11px] hidden sm:inline">{isMuted ? 'Muted' : 'Siren'}</span>
          </button>

          {/* Quick Acknowledge Button */}
          {!isUserAcknowledged && (
            <button
              onClick={() => handleAcknowledge(topEmergency.id)}
              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-800 font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Acknowledge</span>
            </button>
          )}

          {/* View in Emergency Center Button */}
          <button
            onClick={() => handleOpen(topEmergency.id)}
            className="px-3.5 py-1.5 bg-black/40 hover:bg-black/60 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Emergency Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
