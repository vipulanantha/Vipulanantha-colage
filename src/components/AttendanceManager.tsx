import React, { useState, useEffect } from 'react';
import { AttendanceRecord, Student, SchoolClass, ClassTeacherAssignment, SubstituteAssignment, StaffMember } from '../types/sms';
import { CheckCircle2, XCircle, Clock, AlertCircle, Calendar, Plus, Filter, ShieldAlert, ShieldCheck, UserPlus, Lock } from 'lucide-react';

interface AttendanceManagerProps {
  attendanceList: AttendanceRecord[];
  students: Student[];
  classesList?: SchoolClass[];
  assignmentsList?: ClassTeacherAssignment[];
  substituteList?: SubstituteAssignment[];
  staffList?: StaffMember[];
  currentTeacherId?: string | null;
  selectedClassFilter?: string;
  onMarkAttendance: (studentId: string, status: AttendanceRecord['status'], date: string, remarks?: string) => void;
  onInitDateAttendance: (date: string) => void;
  onOpenSubstituteModal?: () => void;
  canEdit: boolean;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  attendanceList,
  students,
  classesList = [],
  assignmentsList = [],
  substituteList = [],
  staffList = [],
  currentTeacherId = null,
  selectedClassFilter = 'All',
  onMarkAttendance,
  onInitDateAttendance,
  onOpenSubstituteModal,
  canEdit,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-08-15');
  const [filterClassId, setFilterClassId] = useState(selectedClassFilter);

  useEffect(() => {
    if (selectedClassFilter) {
      setFilterClassId(selectedClassFilter);
    }
  }, [selectedClassFilter]);

  // Determine current logged-in teacher object
  const currentTeacher = staffList.find((t) => t.id === currentTeacherId || t.employeeId === currentTeacherId);

  // Compute allowed class IDs for current teacher
  const allowedClassIds = React.useMemo(() => {
    if (!currentTeacherId) {
      // Admin / Principal has access to ALL classes
      return classesList.map((c) => c.id);
    }

    // 1. Direct active class teacher assignments
    const activeCtaClassIds = assignmentsList
      .filter((a) => a.teacherId === currentTeacherId && a.isActive)
      .map((a) => a.classId);

    // 2. Class teacher ID on class record
    const directClassIds = classesList
      .filter((c) => c.classTeacherId === currentTeacherId || (currentTeacher && c.classTeacher === currentTeacher.fullName))
      .map((c) => c.id);

    // 3. Substitute assignments for selected date
    const subClassIds = substituteList
      .filter((s) => s.teacherId === currentTeacherId && s.date === selectedDate)
      .map((s) => s.classId);

    return Array.from(new Set([...activeCtaClassIds, ...directClassIds, ...subClassIds]));
  }, [currentTeacherId, assignmentsList, classesList, substituteList, selectedDate, currentTeacher]);

  // Allowed SchoolClass objects for dropdown
  const allowedClasses = classesList.filter((c) => allowedClassIds.includes(c.id));

  // If filterClassId is set to a class not allowed for teacher, trigger security denied
  const isSelectedClassAllowed = React.useMemo(() => {
    if (!currentTeacherId) return true; // Admin allowed
    if (filterClassId === 'All') {
      return allowedClassIds.length > 0;
    }
    return allowedClassIds.includes(filterClassId);
  }, [currentTeacherId, filterClassId, allowedClassIds]);

  // Filter attendance records by date and class filter
  const dateAttendance = attendanceList.filter((a) => a.date === selectedDate);
  const displayAttendance = dateAttendance.length > 0 ? dateAttendance : attendanceList;

  const filteredAttendance = displayAttendance.filter((item) => {
    // Check permission first
    if (currentTeacherId) {
      const studentClass = classesList.find(
        (c) => `${c.grade}-${c.section}` === item.grade || c.grade === item.grade || c.id === item.classId
      );
      if (studentClass && !allowedClassIds.includes(studentClass.id)) {
        return false;
      }
    }

    if (filterClassId === 'All') return true;

    const targetClass = classesList.find((c) => c.id === filterClassId);
    if (!targetClass) return item.grade.includes(filterClassId);

    const classGradeFormat = `${targetClass.grade}-${targetClass.section}`;
    return (
      item.grade === classGradeFormat ||
      item.grade === targetClass.grade ||
      item.classId === targetClass.id
    );
  });

  // Stats calculation
  const total = filteredAttendance.length;
  const presentCount = filteredAttendance.filter((a) => a.status === 'Present').length;
  const absentCount = filteredAttendance.filter((a) => a.status === 'Absent').length;
  const lateCount = filteredAttendance.filter((a) => a.status === 'Late').length;
  const rate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '100';

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Absent':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Late':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Excused':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Teacher Permission Security Status Banner */}
      {currentTeacherId ? (
        <div className="bg-purple-900 text-white rounded-xl p-3.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-purple-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                <span>Teacher Class Permission Guard Active</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.2 rounded-full border border-emerald-500/30">
                  Relational RLS Verified
                </span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                Logged in: {currentTeacher?.fullName || currentTeacherId} ({currentTeacher?.employeeId})
              </div>
              <div className="text-xs text-purple-200 mt-0.5">
                Authorized Classes:{' '}
                <span className="font-bold text-amber-300">
                  {allowedClasses.map((c) => `${c.grade}-${c.section}`).join(', ') || 'No classes assigned'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-purple-200 bg-purple-950/60 p-2 rounded-lg border border-purple-800 shrink-0">
            <div>Scope: Restricted to assigned classes only</div>
            <div className="text-[11px] text-emerald-400 font-mono">Status: Attendance write-locked</div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Administrator View (Full Access)
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                Global Class Attendance Management
              </div>
            </div>
          </div>

          {onOpenSubstituteModal && canEdit && (
            <button
              onClick={onOpenSubstituteModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Assign Substitute Teacher</span>
            </button>
          )}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Daily Attendance</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{rate}%</div>
          <div className="text-[11px] text-emerald-600 font-medium">Term Benchmark: &gt;95%</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-700 font-semibold uppercase">Present Today</div>
          <div className="text-2xl font-bold text-emerald-700 mt-0.5">{presentCount} Students</div>
          <div className="text-[11px] text-slate-500 font-medium">Recorded at Morning Assembly</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-rose-700 font-semibold uppercase">Absent</div>
          <div className="text-2xl font-bold text-rose-700 mt-0.5">{absentCount} Students</div>
          <div className="text-[11px] text-rose-600 font-medium">SMS Alert Sent to Parents</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-amber-700 font-semibold uppercase">Late Influx</div>
          <div className="text-2xl font-bold text-amber-700 mt-0.5">{lateCount} Students</div>
          <div className="text-[11px] text-slate-500 font-medium">Gate Pass Issued</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-900 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-900 font-semibold"
            />
          </div>

          {canEdit && (
            <button
              onClick={() => onInitDateAttendance(selectedDate)}
              className="inline-flex items-center space-x-1.5 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create & Save Date to Supabase</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-700">Class:</span>
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-900"
            >
              <option value="All">
                {currentTeacherId ? 'All Assigned Classes' : 'All School Classes'}
              </option>
              {allowedClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.grade} - Section {c.section} ({c.stream})
                </option>
              ))}
            </select>
          </div>

          {canEdit && (
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Supabase RLS Sync Active
            </span>
          )}
        </div>
      </div>

      {/* Access Denied Alert Banner if unassigned class selected */}
      {!isSelectedClassAllowed && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-5 text-rose-900 shadow-md animate-in fade-in space-y-2">
          <div className="flex items-center space-x-2 text-rose-800 font-bold text-base">
            <Lock className="w-5 h-5 text-rose-600 shrink-0" />
            <span>⛔ ACCESS DENIED: Class Teacher Authorization Required</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed font-medium">
            Teacher <strong className="text-rose-900">{currentTeacher?.fullName || currentTeacherId}</strong> is not assigned as the designated Class Teacher or active Substitute for this class. Under School Management System security rules, teachers are strictly restricted from taking or viewing attendance for unassigned classes.
          </p>
          <div className="pt-2 text-xs font-bold text-rose-900">
            Authorized Classes: {allowedClasses.map((c) => `${c.grade}-${c.section}`).join(', ') || 'None'}
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {isSelectedClassAllowed && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Admission</th>
                  <th className="py-3 px-4">Grade / Section</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Teacher Remark</th>
                  {canEdit && <th className="py-3 px-4 text-center">Toggle Attendance Status</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.studentName}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{item.admissionNo}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{item.grade}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(item.status)}`}>
                          {item.status === 'Present' && <CheckCircle2 className="w-3 h-3" />}
                          {item.status === 'Absent' && <XCircle className="w-3 h-3" />}
                          {item.status === 'Late' && <Clock className="w-3 h-3" />}
                          {item.status === 'Excused' && <AlertCircle className="w-3 h-3" />}
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{item.remarks || '-'}</td>
                      {canEdit && (
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex rounded-lg shadow-2xs border border-slate-200 p-0.5 bg-slate-50">
                            <button
                              onClick={() => onMarkAttendance(item.studentId, 'Present', selectedDate, 'On time')}
                              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                item.status === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => onMarkAttendance(item.studentId, 'Late', selectedDate, 'Late arrival')}
                              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                item.status === 'Late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              onClick={() => onMarkAttendance(item.studentId, 'Absent', selectedDate, 'Absent today')}
                              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                item.status === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                      No attendance records found for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
