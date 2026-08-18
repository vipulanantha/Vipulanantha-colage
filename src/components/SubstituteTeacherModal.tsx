import React, { useState } from 'react';
import { StaffMember, SchoolClass, SubstituteAssignment, ClassTeacherAssignment } from '../types/sms';
import { X, UserPlus, Calendar, Clock, Check, AlertCircle } from 'lucide-react';

interface SubstituteTeacherModalProps {
  isOpen?: boolean;
  onClose: () => void;
  classesList?: SchoolClass[];
  classes?: SchoolClass[];
  teachersList?: StaffMember[];
  teachers?: StaffMember[];
  currentAssignments?: ClassTeacherAssignment[];
  substituteAssignments?: SubstituteAssignment[];
  onSaveSubstitute?: (sub: Omit<SubstituteAssignment, 'id' | 'createdAt'>) => Promise<void> | void;
  onSave?: (sub: Omit<SubstituteAssignment, 'id' | 'createdAt'>) => Promise<void> | void;
}

export const SubstituteTeacherModal: React.FC<SubstituteTeacherModalProps> = ({
  isOpen = true,
  onClose,
  classesList,
  classes,
  teachersList,
  teachers,
  onSaveSubstitute,
  onSave,
}) => {
  const effectiveClasses = classesList || classes || [];
  const effectiveTeachers = teachersList || teachers || [];
  const saveHandler = onSaveSubstitute || onSave;

  const [selectedClassId, setSelectedClassId] = useState('');
  const [substituteTeacherId, setSubstituteTeacherId] = useState('');
  const [date, setDate] = useState('2026-08-15');
  const [reason, setReason] = useState('Class Teacher on Official Leave');
  const [periodId, setPeriodId] = useState('Full Day');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !substituteTeacherId || !date) {
      setMessage({ type: 'error', text: 'Please fill in Class, Substitute Teacher, and Date.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      if (saveHandler) {
        await saveHandler({
          classId: selectedClassId,
          teacherId: substituteTeacherId,
          date,
          reason,
          periodId,
          assignedBy: 'Admin',
        });
      }

      setMessage({ type: 'success', text: 'Substitute assignment saved successfully!' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving substitute assignment.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#2A0845] to-[#3B185F] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-base text-white">
                Assign Substitute Attendance Teacher
              </h3>
              <p className="text-xs text-purple-200">
                Grant temporary date-based attendance authority
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-sans text-xs sm:text-sm text-slate-800">
          {message && (
            <div
              className={`p-3 rounded-xl border flex items-center space-x-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Target Class Division:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
            >
              <option value="">-- Choose Class --</option>
              {effectiveClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade} - Section {c.section} (Regular: {c.classTeacher})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Substitute Teacher:
            </label>
            <select
              value={substituteTeacherId}
              onChange={(e) => setSubstituteTeacherId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
            >
              <option value="">-- Choose Substitute Teacher --</option>
              {effectiveTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.employeeId}) - {t.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Effective Date:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Period Coverage:
              </label>
              <select
                value={periodId}
                onChange={(e) => setPeriodId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
              >
                <option value="Full Day">Full Day (Morning Assembly)</option>
                <option value="Period 1-2">Period 1 - 2</option>
                <option value="Period 3-4">Period 3 - 4</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Reason / Remark:
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Official Duty, Sick Leave, Medical Cover"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
            />
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900">
            <strong>Substitute Authority Note:</strong> This assignment authorizes the selected substitute teacher to take attendance for this specific date and class only.
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Assigning...' : 'Assign Substitute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
