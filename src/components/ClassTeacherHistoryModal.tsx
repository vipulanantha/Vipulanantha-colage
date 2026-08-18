import React, { useState } from 'react';
import { SchoolClass, StaffMember, ClassTeacherAssignment, AssignmentAuditLog } from '../types/sms';
import { X, History, UserCheck, Calendar, RefreshCw, ShieldAlert } from 'lucide-react';

interface ClassTeacherHistoryModalProps {
  isOpen?: boolean;
  onClose: () => void;
  schoolClass?: SchoolClass | null;
  teachersList?: StaffMember[];
  teachers?: StaffMember[];
  assignmentsList?: ClassTeacherAssignment[];
  assignments?: ClassTeacherAssignment[];
  auditLogs?: AssignmentAuditLog[];
  onChangeTeacherClick?: (schoolClass: SchoolClass) => void;
}

export const ClassTeacherHistoryModal: React.FC<ClassTeacherHistoryModalProps> = ({
  isOpen = true,
  onClose,
  schoolClass = null,
  teachersList,
  teachers,
  assignmentsList,
  assignments,
  auditLogs = [],
  onChangeTeacherClick,
}) => {
  if (!isOpen || !schoolClass) return null;

  const effectiveTeachers = teachersList || teachers || [];
  const effectiveAssignments = assignmentsList || assignments || [];

  // Find active assignment
  const activeAssignment = effectiveAssignments.find(
    (a) => a && a.classId === schoolClass.id && a.isActive
  );

  const activeTeacher = effectiveTeachers.find(
    (t) =>
      t &&
      (t.id === activeAssignment?.teacherId ||
        t.id === schoolClass.classTeacherId ||
        t.fullName === schoolClass.classTeacher)
  );

  // Historic assignments for this class
  const classAssignments = effectiveAssignments.filter(
    (a) => a && a.classId === schoolClass.id
  );

  // Relevant audit logs
  const classLogs = (auditLogs || []).filter(
    (l) => l && (l.classId === schoolClass.id || (l.details && l.details.includes(schoolClass.id)))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2A0845] to-[#3B185F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-base sm:text-lg tracking-wide text-white">
                Class Teacher Profile & History
              </h3>
              <p className="text-xs text-purple-200">
                {schoolClass.grade} - Section {schoolClass.section} ({schoolClass.academicYear})
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
          {/* Active Class Master Profile Card */}
          <div className="bg-gradient-to-br from-purple-900 to-[#1E0533] text-white rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-amber-300 uppercase tracking-wider font-bold">
                Designated Class Master (Active)
              </div>
              <div className="text-lg font-bold text-white mt-0.5">
                {activeTeacher ? activeTeacher.fullName : schoolClass.classTeacher || 'Unassigned'}
              </div>
              {activeTeacher && (
                <div className="text-xs text-purple-200 font-mono mt-0.5">
                  Employee ID: {activeTeacher.employeeId} | Dept: {activeTeacher.department}
                </div>
              )}
            </div>

          {onChangeTeacherClick && (
            <button
              onClick={() => {
                onClose();
                onChangeTeacherClick(schoolClass);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>[Change Class Teacher]</span>
            </button>
          )}
          </div>

          {/* Historic Class Teacher Assignments */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-purple-900" />
              <span>Assignment Records ({classAssignments.length})</span>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Teacher</th>
                    <th className="py-2.5 px-3">Academic Year</th>
                    <th className="py-2.5 px-3">Assigned Date</th>
                    <th className="py-2.5 px-3">End Date</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classAssignments.length > 0 ? (
                    classAssignments.map((a) => {
                      const teacherObj = effectiveTeachers.find((t) => t && t.id === a.teacherId);
                      return (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {teacherObj ? teacherObj.fullName : a.teacherId}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-700">{a.academicYearId || a.academicYear || '2026'}</td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {a.assignedDate || a.assignedAt ? new Date(a.assignedDate || a.assignedAt!).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {a.endDate ? new Date(a.endDate).toLocaleDateString() : 'Present'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {a.isActive ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                                Ended
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-500">
                        No historical assignment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-purple-900" />
              <span>Audit Trail Logs ({classLogs.length})</span>
            </h4>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 max-h-40 overflow-y-auto space-y-2 text-xs">
              {classLogs.length > 0 ? (
                classLogs.map((log) => (
                  <div key={log.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mr-2 ${
                        log.action === 'ASSIGN' ? 'bg-emerald-100 text-emerald-800' :
                        log.action === 'REPLACE' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-slate-800 font-medium">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-center py-2">No audit logs recorded for this class.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
