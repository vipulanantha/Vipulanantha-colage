import React from 'react';
import { Megaphone, Calendar, ShieldCheck } from 'lucide-react';

export const AnnouncementTicker: React.FC = () => {
  return (
    <div
      id="announcement-ticker"
      className="w-full bg-gradient-to-r from-[#2A0845]/95 via-[#1E3A8A]/95 to-[#2A0845]/95 text-amber-200 text-xs py-1.5 sm:py-2 px-3 sm:px-4 border-b border-amber-500/30 backdrop-blur-md z-20 flex items-center justify-between shadow-sm"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold text-[10px] sm:text-[11px] border border-amber-400/30">
            <Megaphone className="w-3 h-3 animate-bounce shrink-0" />
            <span className="truncate">NOTICE</span>
          </span>
        </div>

        <div className="overflow-hidden whitespace-nowrap flex-1 mx-1 sm:mx-2 text-[11px] sm:text-xs text-purple-100">
          <span className="inline-block font-medium text-amber-200 truncate">
            ★ Academic Term 2 Portal Active
          </span>
          <span className="mx-2 sm:mx-3 text-amber-400/60">•</span>
          <span className="hidden xs:inline text-purple-100">
            Grade 1 & A/L Admissions Open.
          </span>
          <span className="mx-3 text-amber-400/60 hidden md:inline">•</span>
          <span className="hidden md:inline text-purple-200">
            Swami Vipulananda Memorial Day commemorations scheduled for Aug 28.
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-3 text-[11px] text-purple-200 shrink-0">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-amber-300" />
            <span>Academic Year 2026-2027</span>
          </div>
          <span className="text-amber-500">•</span>
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>SSL Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
};
