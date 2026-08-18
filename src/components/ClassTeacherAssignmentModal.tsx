import React, { useState, useEffect } from 'react';
import { StaffMember, SchoolClass, ClassTeacherAssignment } from '../types/sms';
import { X, Check, ShieldCheck, AlertCircle, Calendar, UserCheck } from 'lucide-react';

interface ClassTeacherAssignmentModalProps {
  isOpen?: boolean;
  onClose: () => void;
  teacher?: StaffMember | null;
  teachersList?: StaffMember[];
  teachers?: StaffMember[];
  classesList?: SchoolClass[];
  classes?: SchoolClass[];
  assignmentsList?: ClassTeacherAssignment[];
  currentAssignments?: ClassTeacherAssignment[];
  onSaveAssignments?: (teacherId: string, classIds: string[], academicYear: string) => Promise<void> | void;
  onSave?: (teacherId: string, classIds: string[], academicYear: string) => Promise<void> | void;
}

export const ClassTeacherAssignmentModal: React.FC<ClassTeacherAssignmentModalProps> = ({
  isOpen = true,
  onClose,
  teacher = null,
  teachersList,
  teachers,
  classesList,
  classes,
  assignmentsList,
  currentAssignments,
  onSaveAssignments,
  onSave,
}) => {
  const effectiveTeachers = teachersList || teachers || [];
  const effectiveClasses = classesList || classes || [];
  const effectiveAssignments = assignmentsList || currentAssignments || [];
  const saveHandler = onSaveAssignments || onSave;

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('2026');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (teacher) {
      setSelectedTeacherId(teacher.id);
    } else if (effectiveTeachers.length > 0 && !selectedTeacherId) {
      setSelectedTeacherId(effectiveTeachers[0].id);
    }
  }, [teacher, effectiveTeachers]);

  // Update checked classes whenever selectedTeacherId or academicYear changes
  useEffect(() => {
    if (!selectedTeacherId) {
      setSelectedClassIds([]);
      return;
    }

    const activeAssignments = (effectiveAssignments || []).filter(
      (a) =>
        a &&
        a.teacherId === selectedTeacherId &&
        (a.academicYearId === academicYear || a.academicYear === academicYear) &&
        a.isActive
    );

    const assignedIds = activeAssignments.map((a) => a.classId);
    
    // Also include classes from classesList where classTeacherId matches
    const classMatches = (effectiveClasses || [])
      .filter((c) => c && c.classTeacherId === selectedTeacherId)
      .map((c) => c.id);

    const merged = Array.from(new Set([...assignedIds, ...classMatches]));
    setSelectedClassIds(merged);
    setSuccessMessage('');
    setErrorMessage('');
  }, [selectedTeacherId, academicYear, effectiveAssignments, effectiveClasses]);

  if (!isOpen) return null;

  const currentTeacher = effectiveTeachers.find((t) => t.id === selectedTeacherId) || teacher;

  const handleToggleClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSave = async () => {
    if (!selectedTeacherId) {
      setErrorMessage('Please select a valid teacher.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (saveHandler) {
        await saveHandler(selectedTeacherId, selectedClassIds, academicYear);
      }
      setSuccessMessage('Class teacher assignments saved successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving assignments.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2A0845] to-[#3B185F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-base sm:text-lg tracking-wide text-white">
                Assign Class Teacher
              </h3>
              <p className="text-xs text-purple-200">
                Grant attendance and class master permissions to a teacher
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

        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto font-sans text-xs sm:text-sm text-slate-800">
          {/* Messages */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Teacher Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Teacher:
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
              >
                <option value="">-- Choose Teacher --</option>
                {effectiveTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.employeeId}) - {t.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Academic Year:
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-900"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          {/* Teacher Summary Banner */}
          {currentTeacher && (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-3.5 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">{currentTeacher.fullName}</div>
                <div className="text-xs text-slate-600 font-mono">
                  Employee ID: <span className="font-bold text-purple-900">{currentTeacher.employeeId}</span> | {currentTeacher.department}
                </div>
              </div>
              <span className="text-[11px] font-bold text-purple-900 bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200">
                {selectedClassIds.length} Class{selectedClassIds.length !== 1 ? 'es' : ''} Assigned
              </span>
            </div>
          )}

          {/* Class Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Assigned Classes for {academicYear}:
              </label>
              <span className="text-[11px] text-slate-500">
                Check boxes to grant class teacher authority
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2 max-h-56 overflow-y-auto">
              {effectiveClasses.map((cls) => {
                const isChecked = selectedClassIds.includes(cls.id);
                // Check if another teacher is currently assigned to this class
                const existingAssignedTeacher = effectiveTeachers.find(
                  (t) =>
                    (t.id === cls.classTeacherId || t.fullName === cls.classTeacher) &&
                    t.id !== selectedTeacherId
                );

                return (
                  <label
                    key={cls.id}
                    onClick={() => handleToggleClass(cls.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-purple-900/10 border-purple-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent label click
                        className="w-4 h-4 text-purple-900 rounded focus:ring-purple-900 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {cls.grade} - Section {cls.section}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {cls.stream} | Room: {cls.room}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {isChecked ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Assigned to {currentTeacher?.fullName.split(' ')[0] || 'Teacher'}</span>
                        </span>
                      ) : existingAssignedTeacher ? (
                        <span className="text-[11px] font-medium text-slate-500">
                          Current: {existingAssignedTeacher.fullName}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium">Unassigned</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 text-[11px] text-amber-900 space-y-1">
            <strong className="block font-bold">Rule Enforcement & Security:</strong>
            <p>
              Assigning a teacher to a class updates Supabase relational records and grants attendance permissions for that class. Only one active Class Teacher is allowed per class. Replacing a teacher deactivates the previous assignment and retains full audit history.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>{isSaving ? 'Saving...' : 'Save Assignments'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
