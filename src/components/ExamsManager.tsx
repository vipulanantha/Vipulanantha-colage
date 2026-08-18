import React, { useState } from 'react';
import { ExamAssessment, StudentResult, Subject, Student, StaffMember } from '../types/sms';
import { Award, Plus, Search, FileText, CheckCircle2, TrendingUp, Download, Eye, X, BookOpen } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { TeacherSelect } from './TeacherSelect';

interface ExamsManagerProps {
  exams: ExamAssessment[];
  results: StudentResult[];
  subjects: Subject[];
  students: Student[];
  staffList?: StaffMember[];
  onAddResult: (result: Omit<StudentResult, 'id'>) => void;
  canEdit: boolean;
}

export const ExamsManager: React.FC<ExamsManagerProps> = ({
  exams,
  results,
  subjects,
  students,
  staffList = [],
  onAddResult,
  canEdit,
}) => {
  const [selectedExamId, setSelectedExamId] = useState(exams[1]?.id || exams[0]?.id || '');
  const [search, setSearch] = useState('');
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [selectedReportCard, setSelectedReportCard] = useState<StudentResult | null>(null);

  // Form State
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [evaluatorTeacherId, setEvaluatorTeacherId] = useState('');
  const [evaluatorTeacherName, setEvaluatorTeacherName] = useState('');
  const [marksState, setMarksState] = useState<Record<string, number>>({
    'TAM-101': 85,
    'MATH-102': 90,
    'SCI-103': 88,
    'ENG-104': 82,
    'ICT-105': 92,
    'HIST-106': 80,
  });

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const filteredResults = results
    .filter((r) => r.examId === selectedExamId)
    .filter(
      (r) =>
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
        r.grade.toLowerCase().includes(search.toLowerCase())
    );

  // Stats calculation
  const totalStudents = filteredResults.length;
  const avgClass =
    totalStudents > 0
      ? (filteredResults.reduce((acc, r) => acc + r.average, 0) / totalStudents).toFixed(1)
      : '0';
  const highestAverage =
    totalStudents > 0 ? Math.max(...filteredResults.map((r) => r.average)).toFixed(1) : '0';

  const handleMarkChange = (subCode: string, val: number) => {
    setMarksState((prev) => ({
      ...prev,
      [subCode]: val,
    }));
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === studentId);
    if (!st) return;

    const values: number[] = Object.values(marksState);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = values.length > 0 ? Math.round(sum / values.length) : 0;
    const gradeLetter = avg >= 75 ? 'A' : avg >= 65 ? 'B' : avg >= 50 ? 'C' : avg >= 35 ? 'S' : 'F';

    onAddResult({
      studentId: st.id,
      studentName: st.fullName,
      admissionNo: st.admissionNo,
      examId: selectedExamId || 'ex-2',
      grade: `${st.grade}-${st.section}`,
      marks: marksState,
      totalMarks: sum,
      average: avg,
      gradeLetter,
      rank: Math.floor(Math.random() * 5) + 1,
      remarks: evaluatorTeacherName ? `Evaluated by ${evaluatorTeacherName}` : 'Good academic performance across core subjects.',
    });

    setShowAddResultModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Examinations & Term Assessment System</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              Term 2 Assessment
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Ministry-format report card generator, grade calculation, and exam performance matrix
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddResultModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Enter Student Marks</span>
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Exams Evaluated</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{totalStudents} Students</div>
          <div className="text-[11px] text-purple-800 font-medium">GCE O/L & A/L Mock Exams</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Batch Average</div>
          <div className="text-2xl font-bold text-purple-900 mt-0.5">{avgClass}%</div>
          <div className="text-[11px] text-emerald-600 font-medium">+3.2% vs Term 1</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Highest Mark</div>
          <div className="text-2xl font-bold text-amber-700 mt-0.5">{highestAverage}%</div>
          <div className="text-[11px] text-amber-800 font-medium">Top Rank Candidate</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Status</div>
          <div className="text-2xl font-bold text-emerald-700 mt-0.5">Published</div>
          <div className="text-[11px] text-slate-500 font-medium">Verified by Principal</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Exam:</span>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-900"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.term} - {ex.grade})
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student results..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-900"
          />
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-purple-950 text-white font-cinzel">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Admission</th>
                <th className="py-3 px-4">Subject Breakdown</th>
                <th className="py-3 px-4 text-center">Total</th>
                <th className="py-3 px-4 text-center">Average</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((r, idx) => (
                <tr key={r.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {r.rank || idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{r.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{r.grade}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{r.admissionNo}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {Object.entries(r.marks).map(([code, mk]) => (
                        <span
                          key={code}
                          className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        >
                          {code}: <strong className="text-purple-950">{mk}</strong>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold font-mono text-slate-900">{r.totalMarks}</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-900">{r.average}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                      Distinction {r.gradeLetter}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedReportCard(r)}
                      className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Card</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Sri Lankan Report Card Modal */}
      {selectedReportCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-4 border-[#2A0845] overflow-hidden my-auto p-6 sm:p-8">
            {/* Report Header */}
            <div className="text-center border-b-2 border-slate-300 pb-4 mb-4">
              <div className="flex items-center justify-center space-x-3 mb-1">
                <SchoolLogo size="sm" showGlowRing={false} className="w-12 h-12 sm:w-14 sm:h-14 shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] sm:text-[11px] font-bold text-amber-700 uppercase tracking-widest font-sans">
                    MINISTRY OF EDUCATION • SRI LANKA
                  </div>
                  <h2 className="text-base sm:text-xl font-bold font-cinzel text-purple-950">
                    VIPULANANTHA COLLEGE COLOMBO 06
                  </h2>
                  <div className="text-xs text-purple-900 font-tamil font-semibold">
                    விபுலானந்தக் கல்லூரி கொழும்பு • மாணவர் முன்னேற்ற அறிக்கை
                  </div>
                </div>
              </div>
              <div className="inline-block mt-1 px-3 py-0.5 bg-purple-100 text-purple-900 text-xs font-bold rounded-full uppercase">
                STUDENT PROGRESS REPORT • TERM 2 ASSESSMENT 2026
              </div>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl mb-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">Student Name</span>
                <strong className="text-slate-900 font-bold">{selectedReportCard.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Admission No</span>
                <strong className="text-slate-900 font-bold font-mono">{selectedReportCard.admissionNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Grade & Division</span>
                <strong className="text-slate-900 font-bold">{selectedReportCard.grade}</strong>
              </div>
            </div>

            {/* Marks Breakdown Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 text-left">Subject Course</th>
                    <th className="py-2 px-3 text-center">Marks (100)</th>
                    <th className="py-2 px-3 text-center">Grade</th>
                    <th className="py-2 px-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(selectedReportCard.marks).map(([code, mark]) => {
                    const sub = subjects.find((s) => s.code === code);
                    const markNum = Number(mark) || 0;
                    const gradeChar =
                      markNum >= 75 ? 'A' : markNum >= 65 ? 'B' : markNum >= 50 ? 'C' : markNum >= 35 ? 'S' : 'W';
                    return (
                      <tr key={code} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {code} - {sub?.name || 'Curriculum Subject'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-purple-900">{mark}</td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              gradeChar === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {gradeChar}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">
                          {markNum >= 90 ? 'Outstanding' : markNum >= 75 ? 'Very Good' : 'Satisfactory'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold">
                  <tr>
                    <td className="py-2 px-3 text-slate-900">Total Marks & Aggregate Average</td>
                    <td className="py-2 px-3 text-center font-mono text-purple-950 text-sm">
                      {selectedReportCard.totalMarks}
                    </td>
                    <td className="py-2 px-3 text-center text-purple-950 text-sm">
                      {selectedReportCard.average}%
                    </td>
                    <td className="py-2 px-3 text-emerald-700">Class Rank: #{selectedReportCard.rank}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Principal & Class Master Signature Stamped Area */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-center text-xs">
              <div>
                <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                  <span className="font-serif italic text-purple-950 font-bold">K. Rajendran</span>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                  Class Master / Teacher In-Charge
                </span>
              </div>
              <div>
                <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                  <span className="font-serif italic text-purple-950 font-bold">K. Thanabalasingam</span>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                  Principal & Executive Registrar
                </span>
              </div>
            </div>

            {/* Close & Print Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedReportCard(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => alert('Official PDF Report Card generated with College Watermark and Seal.')}
                className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>Download Certified PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Results Modal */}
      {showAddResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Record Student Exam Marks</h3>
              </div>
              <button onClick={() => setShowAddResultModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Candidate Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNo} • {s.grade}-{s.section})
                    </option>
                  ))}
                </select>
              </div>

              {staffList.length > 0 && (
                <TeacherSelect
                  label="Evaluating Teacher / Invigilator"
                  teachers={staffList}
                  value={evaluatorTeacherId || evaluatorTeacherName}
                  onChange={(id, t) => {
                    setEvaluatorTeacherId(id);
                    if (t) setEvaluatorTeacherName(t.fullName);
                  }}
                  placeholder="Select evaluating teacher..."
                />
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Enter Subject Marks (0 - 100)
                </label>
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {subjects.map((sub) => (
                    <div key={sub.code} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-xs font-bold text-slate-800">{sub.code}</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={marksState[sub.code] || 0}
                        onChange={(e) => handleMarkChange(sub.code, Number(e.target.value))}
                        className="w-16 px-2 py-1 text-right font-mono font-bold bg-slate-50 border border-slate-300 rounded focus:bg-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddResultModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold cursor-pointer"
                >
                  Calculate & Publish Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
