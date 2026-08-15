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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-support-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header bar */}
        <div className="h-2 bg-gradient-to-r from-purple-900 via-amber-500 to-blue-900 shrink-0" />

        <div className="p-6 sm:p-7 overflow-y-auto">
          {/* Close button */}
          <button
            id="close-help-support-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-300">
              <BookOpen className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 id="help-support-title" className="text-xl font-bold text-slate-900 font-cinzel">
                Help & Student Support
              </h2>
              <p className="text-xs text-slate-500">Vipulanantha College Colombo • SMS Helpdesk</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600">
            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
              <h3 className="font-bold text-purple-950 mb-1 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-700" />
                <span>Portal Login Guidelines</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ensure you select the appropriate portal tab matching your institution credentials (Staff, Student, Parent, or Admin). Use your official institutional admission identifier.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2 text-purple-900 font-semibold mb-1 text-xs">
                  <Phone className="w-3.5 h-3.5" />
                  <span>IT Administration Desk</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">+94 11 258 1920</p>
                <p className="text-[11px] text-slate-500">Ext: 102 / 104 (Mon-Fri 7:30 AM - 4:00 PM)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2 text-blue-900 font-semibold mb-1 text-xs">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Support Email</span>
                </div>
                <p className="text-xs text-slate-700 font-medium truncate">support@vipulanantha.sch.lk</p>
                <p className="text-[11px] text-slate-500">Response within 24 business hours</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-slate-800">Campus Address</p>
                <p className="text-slate-600">Vipulanantha College, College Avenue, Colombo 06, Sri Lanka</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-slate-800">Office Hours</p>
                <p className="text-slate-600">Academic Days: 07:30 - 15:30 IST | General Office: 08:00 - 16:30 IST</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="py-2 px-5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Got it, thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
