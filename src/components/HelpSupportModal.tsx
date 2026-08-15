import React from 'react';
import { X, Phone, Mail, MapPin, Clock, Shield, BookOpen, ExternalLink } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="help-support-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-support-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden max-h-[90vh] flex flex-col my-auto">
        {/* Header bar */}
        <div className="h-2 bg-gradient-to-r from-purple-900 via-amber-500 to-blue-900 shrink-0" />

        <div className="p-5 sm:p-7 overflow-y-auto">
          {/* Close button */}
          <button
            id="close-help-support-btn"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-4 sm:mb-5 pr-8">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-300 shrink-0">
              <BookOpen className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 id="help-support-title" className="text-lg sm:text-xl font-bold text-slate-900 font-cinzel leading-tight">
                Help & Support
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Vipulanantha College Colombo • SMS Helpdesk</p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 text-sm text-slate-600">
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100">
              <h3 className="font-bold text-purple-950 mb-1 flex items-center space-x-2 text-xs sm:text-sm">
                <Shield className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Portal Login Guidelines</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                Ensure you select the appropriate portal tab matching your institution credentials (Staff, Student, Parent, or Admin). Use your official institutional admission identifier.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2 text-purple-900 font-semibold mb-1 text-xs">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>IT Administration Desk</span>
                </div>
                <a href="tel:+94112581920" className="text-xs text-purple-900 font-bold hover:underline block min-h-[30px] flex items-center">
                  +94 11 258 1920
                </a>
                <p className="text-[10px] sm:text-[11px] text-slate-500">Ext: 102 / 104 (7:30 AM - 4:00 PM)</p>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2 text-blue-900 font-semibold mb-1 text-xs">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>Support Email</span>
                </div>
                <a href="mailto:support@vipulanantha.sch.lk" className="text-xs text-blue-900 font-bold hover:underline block truncate min-h-[30px] flex items-center">
                  support@vipulanantha.sch.lk
                </a>
                <p className="text-[10px] sm:text-[11px] text-slate-500">Response within 24 hours</p>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5 sm:space-x-3">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] sm:text-xs">
                <p className="font-semibold text-slate-800">Campus Address</p>
                <p className="text-slate-600">Vipulanantha College, College Avenue, Colombo 06, Sri Lanka</p>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5 sm:space-x-3">
              <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-[11px] sm:text-xs">
                <p className="font-semibold text-slate-800">Office Hours</p>
                <p className="text-slate-600">Academic Days: 07:30 - 15:30 IST | General Office: 08:00 - 16:30 IST</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] py-2.5 px-6 bg-purple-900 hover:bg-purple-950 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer touch-manipulation flex items-center justify-center active:scale-[0.98]"
            >
              Got it, thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
