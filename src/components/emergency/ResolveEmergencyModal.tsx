import React, { useState } from 'react';
import { CheckCircle2, X, AlertTriangle, ShieldCheck, FileText, ClipboardList } from 'lucide-react';
import { EmergencyAlert } from '../../types/emergency';

interface ResolveEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: EmergencyAlert | null;
  onResolve: (data: {
    emergencyId: string;
    resolutionNote: string;
    actionTaken: string;
  }) => void;
  resolverName: string;
  resolverRole: string;
}

export const ResolveEmergencyModal: React.FC<ResolveEmergencyModalProps> = ({
  isOpen,
  onClose,
  emergency,
  onResolve,
  resolverName,
  resolverRole,
}) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !emergency) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNote.trim() || !actionTaken.trim()) return;

    setIsSubmitting(true);
    onResolve({
      emergencyId: emergency.id,
      resolutionNote: resolutionNote.trim(),
      actionTaken: actionTaken.trim(),
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-300 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white text-emerald-700 rounded-2xl shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-emerald-200">
                Official Incident Closure
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-cinzel text-white">
                Resolve Emergency Incident
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Ref ID: <span className="font-mono font-bold">{emergency.id}</span> • {emergency.title}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <div className="text-xs font-bold text-slate-900">Incident Details:</div>
            <div className="text-xs text-slate-700"><strong>Location:</strong> {emergency.locationPreset} {emergency.locationCustom ? `(${emergency.locationCustom})` : ''}</div>
            <div className="text-xs text-slate-700"><strong>Triggered By:</strong> {emergency.createdByName} ({emergency.createdByRole})</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-emerald-700" />
              <span>Action Taken & Response Measures Deployed <span className="text-rose-600">*</span></span>
            </label>
            <textarea
              rows={2}
              required
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="e.g. First Aid administered by College Nurse Sister Kamala; student cleared and resting."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Final Resolution Note & Safety Confirmation <span className="text-rose-600">*</span></span>
            </label>
            <textarea
              rows={3}
              required
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Provide complete summary of why this incident is safe to be resolved and archived..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="text-[11px] text-slate-500 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Resolving as <strong>{resolverName} ({resolverRole})</strong> will append an immutable record to the audit ledger.</span>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!resolutionNote.trim() || !actionTaken.trim() || isSubmitting}
              className={`px-7 py-3 rounded-xl font-bold text-white transition-all shadow-md flex items-center space-x-2 ${
                resolutionNote.trim() && actionTaken.trim() && !isSubmitting
                  ? 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer shadow-emerald-700/30'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>[ CONFIRM INCIDENT RESOLUTION ]</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
