import React, { useState } from 'react';
import { AttendanceRecord, Student } from '../types/sms';
import { CheckCircle2, XCircle, Clock, AlertCircle, Calendar, Plus, Check, Filter } from 'lucide-react';

interface AttendanceManagerProps {
  attendanceList: AttendanceRecord[];
  students: Student[];
  onMarkAttendance: (studentId: string, status: AttendanceRecord['status'], remarks?: string) => void;
  canEdit: boolean;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  attendanceList,
  students,
  onMarkAttendance,
  canEdit,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-08-15');
  const [filterGrade, setFilterGrade] = useState('All');

  // Stats calculation
  const total = attendanceList.length;
  const presentCount = attendanceList.filter((a) => a.status === 'Present').length;
  const absentCount = attendanceList.filter((a) => a.status === 'Absent').length;
  const lateCount = attendanceList.filter((a) => a.status === 'Late').length;
  const rate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '100';

  const filteredAttendance = attendanceList.filter((item) => {
    return filterGrade === 'All' || item.grade.includes(filterGrade);
  });

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
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-purple-900 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-slate-800">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-900"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="All">All Grades</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          {canEdit && (
            <span className="text-[11px] font-medium text-purple-900 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
              Interactive Attendance Live
            </span>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider font-semibold">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Teacher Remark</th>
                {canEdit && <th className="py-3 px-4 text-center">Toggle Attendance Status</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.map((item) => (
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
                          onClick={() => onMarkAttendance(item.studentId, 'Present', 'On time')}
                          className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                            item.status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => onMarkAttendance(item.studentId, 'Late', 'Late arrival')}
                          className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                            item.status === 'Late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => onMarkAttendance(item.studentId, 'Absent', 'Absent today')}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
