import React, { useState } from 'react';
import { UserSession } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { StudentsManager } from './StudentsManager';
import { SubjectsManager } from './SubjectsManager';
import { AttendanceManager } from './AttendanceManager';
import { TeachersManager } from './TeachersManager';
import { AcademicManager } from './AcademicManager';
import { ExamsManager } from './ExamsManager';
import { FinanceManager } from './FinanceManager';
import { LibraryManager } from './LibraryManager';
import { TransportManager } from './TransportManager';
import { ActivitiesManager } from './ActivitiesManager';
import { HealthManager } from './HealthManager';
import { TimetableManager } from './TimetableManager';
import {
  Student,
  StaffMember,
  Subject,
  SchoolClass,
  AttendanceRecord,
  CircularItem,
  TimetablePeriod,
  ExamAssessment,
  StudentResult,
  FeeInvoice,
  LibraryBook,
  BookBorrowing,
  TransportRoute,
  ExtracurricularActivity,
  HealthVisitLog,
} from '../types/sms';
import {
  INITIAL_STUDENTS,
  INITIAL_STAFF,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_ATTENDANCE,
  INITIAL_CIRCULARS,
  INITIAL_TIMETABLE,
  INITIAL_EXAMS,
  INITIAL_RESULTS,
  INITIAL_FEES,
  INITIAL_BOOKS,
  INITIAL_BORROWINGS,
  INITIAL_TRANSPORT,
  INITIAL_ACTIVITIES,
  INITIAL_HEALTH_LOGS,
} from '../data/mockSmsData';
import {
  LogOut,
  Bell,
  Calendar,
  BookOpen,
  Users,
  Award,
  Clock,
  GraduationCap,
  FileText,
  Search,
  CheckCircle2,
  TrendingUp,
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Plus,
  X,
  Briefcase,
  Layers,
  DollarSign,
  BookMarked,
  Bus,
  Trophy,
  HeartPulse,
  Phone,
  ShieldCheck,
  Building,
  Activity,
} from 'lucide-react';

interface DashboardPreviewProps {
  session: UserSession;
  onLogout: () => void;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ session, onLogout }) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'students'
    | 'teachers'
    | 'academic'
    | 'subjects'
    | 'attendance'
    | 'timetable'
    | 'exams'
    | 'fees'
    | 'library'
    | 'transport'
    | 'activities'
    | 'health'
    | 'circulars'
  >('overview');

  // State stores for all 16 Modules
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [classes, setClasses] = useState<SchoolClass[]>(INITIAL_CLASSES);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [circulars, setCirculars] = useState<CircularItem[]>(INITIAL_CIRCULARS);
  const [timetable, setTimetable] = useState<TimetablePeriod[]>(INITIAL_TIMETABLE);
  const [exams, setExams] = useState<ExamAssessment[]>(INITIAL_EXAMS);
  const [results, setResults] = useState<StudentResult[]>(INITIAL_RESULTS);
  const [fees, setFees] = useState<FeeInvoice[]>(INITIAL_FEES);
  const [books, setBooks] = useState<LibraryBook[]>(INITIAL_BOOKS);
  const [borrowings, setBorrowings] = useState<BookBorrowing[]>(INITIAL_BORROWINGS);
  const [routes, setRoutes] = useState<TransportRoute[]>(INITIAL_TRANSPORT);
  const [activities, setActivities] = useState<ExtracurricularActivity[]>(INITIAL_ACTIVITIES);
  const [healthLogs, setHealthLogs] = useState<HealthVisitLog[]>(INITIAL_HEALTH_LOGS);

  // New circular state
  const [showAddCircularModal, setShowAddCircularModal] = useState(false);
  const [newCircTitle, setNewCircTitle] = useState('');
  const [newCircCategory, setNewCircCategory] = useState<CircularItem['category']>('Academic Notice');
  const [newCircSummary, setNewCircSummary] = useState('');

  // Permission flags based on role
  const canEdit =
    session.role === 'admin' ||
    session.role === 'principal' ||
    session.role === 'staff' ||
    session.role === 'accountant' ||
    session.role === 'librarian';

  // --- Handlers for Students ---
  const handleAddStudent = (newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `s-${Date.now()}`,
    };
    setStudents((prev) => [newStudent, ...prev]);

    // Also auto-add to attendance list for today
    const newAtt: AttendanceRecord = {
      id: `att-${Date.now()}`,
      studentId: newStudent.id,
      studentName: newStudent.fullName,
      admissionNo: newStudent.admissionNo,
      grade: `${newStudent.grade}-${newStudent.section}`,
      date: '2026-08-15',
      status: 'Present',
      remarks: 'Newly Enrolled',
    };
    setAttendance((prev) => [newAtt, ...prev]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setAttendance((prev) => prev.filter((a) => a.studentId !== id));
  };

  // --- Handlers for Staff ---
  const handleAddStaff = (newStaffData: Omit<StaffMember, 'id'>) => {
    const newMember: StaffMember = {
      ...newStaffData,
      id: `st-${Date.now()}`,
    };
    setStaff((prev) => [newMember, ...prev]);
  };

  const handleDeleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  // --- Handlers for Classes ---
  const handleAddClass = (newClassData: Omit<SchoolClass, 'id'>) => {
    const newCls: SchoolClass = {
      ...newClassData,
      id: `cls-${Date.now()}`,
    };
    setClasses((prev) => [newCls, ...prev]);
  };

  const handleDeleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  // --- Handlers for Subjects ---
  const handleAddSubject = (newSubjectData: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...newSubjectData,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => [newSub, ...prev]);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // --- Handlers for Attendance ---
  const handleMarkAttendance = (studentId: string, status: AttendanceRecord['status'], remarks?: string) => {
    setAttendance((prev) =>
      prev.map((item) =>
        item.studentId === studentId
          ? { ...item, status, remarks: remarks || item.remarks }
          : item
      )
    );
  };

  // --- Handlers for Timetable ---
  const handleAddPeriod = (newPeriodData: Omit<TimetablePeriod, 'id'>) => {
    const newP: TimetablePeriod = {
      ...newPeriodData,
      id: `tt-${Date.now()}`,
    };
    setTimetable((prev) => [...prev, newP]);
  };

  // --- Handlers for Exams & Results ---
  const handleAddResult = (newResultData: Omit<StudentResult, 'id'>) => {
    const newRes: StudentResult = {
      ...newResultData,
      id: `res-${Date.now()}`,
    };
    setResults((prev) => [newRes, ...prev]);
  };

  // --- Handlers for Fees ---
  const handleRecordPayment = (invoiceId: string, amount: number) => {
    setFees((prev) =>
      prev.map((f) => {
        if (f.id === invoiceId) {
          const newPaid = f.paidAmount + amount;
          const newBal = Math.max(f.amount - newPaid, 0);
          return {
            ...f,
            paidAmount: newPaid,
            balanceAmount: newBal,
            status: newBal === 0 ? 'Paid' : 'Partial',
            paymentDate: '2026-08-15',
            receiptNo: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
          };
        }
        return f;
      })
    );
  };

  const handleAddInvoice = (newInvoiceData: Omit<FeeInvoice, 'id'>) => {
    const newInv: FeeInvoice = {
      ...newInvoiceData,
      id: `fee-${Date.now()}`,
    };
    setFees((prev) => [newInv, ...prev]);
  };

  // --- Handlers for Library ---
  const handleAddBook = (newBookData: Omit<LibraryBook, 'id'>) => {
    const newBk: LibraryBook = {
      ...newBookData,
      id: `bk-${Date.now()}`,
    };
    setBooks((prev) => [newBk, ...prev]);
  };

  const handleIssueBook = (borrowData: Omit<BookBorrowing, 'id'>) => {
    const newBor: BookBorrowing = {
      ...borrowData,
      id: `bor-${Date.now()}`,
    };
    setBorrowings((prev) => [newBor, ...prev]);
    setBooks((prev) =>
      prev.map((b) => (b.id === borrowData.bookId ? { ...b, copiesAvailable: Math.max(b.copiesAvailable - 1, 0) } : b))
    );
  };

  const handleReturnBook = (borrowingId: string) => {
    const target = borrowings.find((b) => b.id === borrowingId);
    if (target) {
      setBorrowings((prev) =>
        prev.map((b) => (b.id === borrowingId ? { ...b, status: 'Returned' } : b))
      );
      setBooks((prev) =>
        prev.map((b) => (b.id === target.bookId ? { ...b, copiesAvailable: b.copiesAvailable + 1 } : b))
      );
    }
  };

  // --- Handlers for Transport ---
  const handleAddRoute = (newRouteData: Omit<TransportRoute, 'id'>) => {
    const newR: TransportRoute = {
      ...newRouteData,
      id: `tr-${Date.now()}`,
    };
    setRoutes((prev) => [newR, ...prev]);
  };

  // --- Handlers for Activities ---
  const handleAddActivity = (newActData: Omit<ExtracurricularActivity, 'id'>) => {
    const newAct: ExtracurricularActivity = {
      ...newActData,
      id: `act-${Date.now()}`,
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // --- Handlers for Health Logs ---
  const handleAddHealthLog = (newHealthData: Omit<HealthVisitLog, 'id'>) => {
    const newLog: HealthVisitLog = {
      ...newHealthData,
      id: `hl-${Date.now()}`,
    };
    setHealthLogs((prev) => [newLog, ...prev]);
  };

  // --- Handlers for Circulars ---
  const handleAddCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircTitle.trim() || !newCircSummary.trim()) return;

    const newCirc: CircularItem = {
      id: `circ-${Date.now()}`,
      title: newCircTitle.trim(),
      category: newCircCategory,
      date: 'Today',
      summary: newCircSummary.trim(),
      targetRole: 'All Campus',
    };

    setCirculars((prev) => [newCirc, ...prev]);
    setNewCircTitle('');
    setNewCircSummary('');
    setShowAddCircularModal(false);
  };

  // Metric aggregates
  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const attendanceRate = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : '100';
  const totalBilled = fees.reduce((acc, f) => acc + f.amount, 0);
  const totalCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-gradient-to-r from-[#2A0845] via-[#3B185F] to-[#1E3A8A] text-white shadow-lg sticky top-0 z-30 border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <SchoolLogo size="sm" showGlowRing={false} className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
            <div>
              <div className="font-cinzel font-bold text-xs sm:text-base tracking-wide flex items-center space-x-1.5 sm:space-x-2">
                <span className="truncate">VIPULANANTHA</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-sans border border-amber-400/30 shrink-0">
                  16-Module SMS
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-purple-200 font-tamil truncate">
                நாளும் பயில்வோம் நற்பணி புரிவோம்
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden lg:flex items-center bg-white/10 rounded-full px-3 py-1 text-xs text-purple-100 border border-white/10">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              <span>Term 2 • Academic Year 2026</span>
            </div>

            <button
              className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-full transition-colors relative touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Notifications"
              onClick={() => setActiveTab('circulars')}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-purple-900" />
            </button>

            <div className="h-5 w-px bg-purple-700/50" />

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-purple-950 font-bold flex items-center justify-center text-xs shadow shrink-0">
                {session.avatarInitials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold leading-tight">{session.name}</div>
                <div className="text-[10px] text-amber-300/90 capitalize">{session.roleTitle}</div>
              </div>
            </div>

            <button
              id="logout-btn"
              onClick={onLogout}
              className="flex items-center space-x-1 sm:space-x-1.5 text-xs bg-rose-600/90 hover:bg-rose-600 active:bg-rose-700 text-white px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all shadow-sm cursor-pointer min-h-[36px] touch-manipulation"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* 16 Comprehensive SMS Module Tabs */}
        <div className="bg-[#1E0533]/90 border-t border-purple-800/40">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 flex overflow-x-auto no-scrollbar space-x-1 py-1.5">
            {[
              { id: 'overview', label: '1. Dashboard', icon: LayoutDashboard },
              { id: 'students', label: '2. Students', count: students.length, icon: Users },
              { id: 'teachers', label: '3. Faculty & Staff', count: staff.length, icon: Briefcase },
              { id: 'academic', label: '4. Classes & Streams', count: classes.length, icon: Layers },
              { id: 'attendance', label: '5. Attendance', icon: CheckSquare },
              { id: 'timetable', label: '6. Timetable', icon: CalendarDays },
              { id: 'exams', label: '7. Exams & Cards', count: results.length, icon: Award },
              { id: 'fees', label: '8. Fees & Bursary', count: fees.length, icon: DollarSign },
              { id: 'subjects', label: '9. Subjects', count: subjects.length, icon: BookOpen },
              { id: 'library', label: '10. Library', count: books.length, icon: BookMarked },
              { id: 'transport', label: '11. Bus Fleet', count: routes.length, icon: Bus },
              { id: 'activities', label: '12. Sports & Clubs', count: activities.length, icon: Trophy },
              { id: 'health', label: '13. Medical Bay', count: healthLogs.length, icon: HeartPulse },
              { id: 'circulars', label: '14. Circulars', count: circulars.length, icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[36px] touch-manipulation shrink-0 ${
                    isActive
                      ? 'bg-amber-400 text-purple-950 shadow-sm font-bold'
                      : 'text-purple-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-950' : 'text-amber-300'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-purple-950 text-amber-300' : 'bg-white/20 text-purple-100'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Module 1: Comprehensive Dashboard Overview */}
        {activeTab === 'overview' && (
          <>
            {/* Welcome Hero Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-5 sm:p-8 relative overflow-hidden shadow-xl border border-amber-500/20">
              <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
                <SchoolLogo size="intro" showGlowRing={false} />
              </div>

              <div className="relative z-10 max-w-3xl">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2 sm:mb-3">
                  16-MODULE INSTITUTIONAL MANAGEMENT SUITE • COLOMBO 06
                </span>
                <h1 className="text-xl sm:text-3xl font-extrabold font-cinzel text-white mb-1.5 sm:mb-2">
                  Welcome, {session.name}
                </h1>
                <p className="text-purple-200 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                  Operating in <strong>{session.roleTitle}</strong> portal ({session.departmentOrGrade}). Full real-time academic workflows for Faculty, Students, Examination Council, Bursary, Library, Bus Transit, Extracurriculars, and Clinic.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-purple-100 flex items-center space-x-1.5 text-[11px] sm:text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Last session: Today at {session.lastLogin}</span>
                  </span>
                  <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-purple-100 flex items-center space-x-1.5 text-[11px] sm:text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>All 16 Modules Connected: Online</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 16-Module Core Stat Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
              <div
                onClick={() => setActiveTab('students')}
                className="bg-white p-3 sm:p-3.5 rounded-xl shadow-xs border border-slate-200 hover:border-purple-400 transition-all cursor-pointer"
              >
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Students</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{students.length} Enrolled</div>
                <div className="text-[10px] text-purple-800 font-medium">Grades 10 - 12 →</div>
              </div>

              <div
                onClick={() => setActiveTab('teachers')}
                className="bg-white p-3 sm:p-3.5 rounded-xl shadow-xs border border-slate-200 hover:border-purple-400 transition-all cursor-pointer"
              >
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Teachers & Staff</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{staff.length} Faculty</div>
                <div className="text-[10px] text-purple-800 font-medium">100% Present →</div>
              </div>

              <div
                onClick={() => setActiveTab('attendance')}
                className="bg-white p-3 sm:p-3.5 rounded-xl shadow-xs border border-slate-200 hover:border-purple-400 transition-all cursor-pointer"
              >
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Attendance</div>
                <div className="text-xl font-bold text-emerald-700 mt-0.5">{attendanceRate}%</div>
                <div className="text-[10px] text-emerald-600 font-medium">{presentCount} Present Today →</div>
              </div>

              <div
                onClick={() => setActiveTab('fees')}
                className="bg-white p-3 sm:p-3.5 rounded-xl shadow-xs border border-slate-200 hover:border-purple-400 transition-all cursor-pointer"
              >
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Fee Revenue</div>
                <div className="text-xl font-bold text-purple-950 mt-0.5">
                  LKR {(totalCollected / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Term 2 Bursary →</div>
              </div>

              <div
                onClick={() => setActiveTab('exams')}
                className="bg-white p-3 sm:p-3.5 rounded-xl shadow-xs border border-slate-200 hover:border-purple-400 transition-all cursor-pointer"
              >
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Exams & GPA</div>
                <div className="text-xl font-bold text-amber-700 mt-0.5">Top: 91.0%</div>
                <div className="text-[10px] text-amber-800 font-medium">Report Cards Ready →</div>
              </div>

              <div
                onClick={() => setActiveTab('health')}
                className="bg-white p-3 sm:p-3.5 rounded-xl shadow-xs border border-slate-200 hover:border-purple-400 transition-all cursor-pointer"
              >
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Medical Bay</div>
                <div className="text-xl font-bold text-rose-700 mt-0.5">{healthLogs.length} Visits</div>
                <div className="text-[10px] text-rose-600 font-medium">Watchlist Active →</div>
              </div>
            </div>

            {/* Quick Action Matrix for 16 Modules */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5">
              <h2 className="text-sm font-bold text-slate-900 font-cinzel mb-3">16-Module Quick Action Grid</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                <button
                  onClick={() => setActiveTab('students')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <Users className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Student Directory</div>
                  <div className="text-[10px] text-slate-500">Admissions & Bio</div>
                </button>

                <button
                  onClick={() => setActiveTab('teachers')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <Briefcase className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Faculty & Staff</div>
                  <div className="text-[10px] text-slate-500">Profiles & Leaves</div>
                </button>

                <button
                  onClick={() => setActiveTab('academic')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <Layers className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Classes & Sections</div>
                  <div className="text-[10px] text-slate-500">Streams & Masters</div>
                </button>

                <button
                  onClick={() => setActiveTab('exams')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <Award className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Report Cards</div>
                  <div className="text-[10px] text-slate-500">Sri Lankan Formats</div>
                </button>

                <button
                  onClick={() => setActiveTab('fees')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <DollarSign className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Fee Accounting</div>
                  <div className="text-[10px] text-slate-500">Invoices & Receipts</div>
                </button>

                <button
                  onClick={() => setActiveTab('library')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <BookMarked className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">College Library</div>
                  <div className="text-[10px] text-slate-500">Yazh Archives & Loans</div>
                </button>

                <button
                  onClick={() => setActiveTab('transport')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <Bus className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Bus Fleet</div>
                  <div className="text-[10px] text-slate-500">Routes & Commuters</div>
                </button>

                <button
                  onClick={() => setActiveTab('activities')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <Trophy className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Sports & Clubs</div>
                  <div className="text-[10px] text-slate-500">Cricket & Societies</div>
                </button>

                <button
                  onClick={() => setActiveTab('health')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <HeartPulse className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Clinic & Health</div>
                  <div className="text-[10px] text-slate-500">Emergency & Allergy</div>
                </button>

                <button
                  onClick={() => setActiveTab('timetable')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <CalendarDays className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Master Schedule</div>
                  <div className="text-[10px] text-slate-500">Bell Periods & Rooms</div>
                </button>

                <button
                  onClick={() => setActiveTab('attendance')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <CheckSquare className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Daily Attendance</div>
                  <div className="text-[10px] text-slate-500">QR & Roll Call</div>
                </button>

                <button
                  onClick={() => setActiveTab('circulars')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-left transition-all"
                >
                  <FileText className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-slate-900">Circulars</div>
                  <div className="text-[10px] text-slate-500">Principal Directives</div>
                </button>
              </div>
            </div>

            {/* Content Panels: Schedule & Circulars */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Main Academic Schedule */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 font-cinzel">Today's Academic Schedule</h2>
                    <p className="text-[11px] sm:text-xs text-slate-500">Colombo Campus • Grade 11-A Active Periods</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-md border border-purple-100 transition-colors"
                  >
                    View Timetable Manager →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {timetable.slice(0, 5).map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs sm:text-sm gap-2">
                      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate">{item.subject}</div>
                          <div className="text-[11px] sm:text-xs text-slate-500 truncate">{item.teacher} • Room {item.room}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-[11px] sm:text-xs text-slate-600">{item.time}</div>
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                          item.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                          item.status === 'In Progress' ? 'bg-amber-100 text-amber-800 font-bold animate-pulse' :
                          'bg-purple-50 text-purple-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* School Circulars / Announcements */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 font-cinzel">College Circulars</h2>
                    <p className="text-[11px] sm:text-xs text-slate-500">Official notices from Principal's Desk</p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => setShowAddCircularModal(true)}
                      className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  {circulars.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-purple-900 uppercase">{c.category}</span>
                        <span className="text-[10px] text-slate-400">{c.date}</span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-800">{c.title}</h3>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{c.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Module 2: Students Manager */}
        {activeTab === 'students' && (
          <StudentsManager
            students={students}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            canEdit={canEdit}
          />
        )}

        {/* Module 3: Faculty & Staff Manager */}
        {activeTab === 'teachers' && (
          <TeachersManager
            staffList={staff}
            onAddStaff={handleAddStaff}
            onDeleteStaff={handleDeleteStaff}
            canEdit={canEdit}
          />
        )}

        {/* Module 4: Academic Classes & Streams */}
        {activeTab === 'academic' && (
          <AcademicManager
            classes={classes}
            subjects={subjects}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            canEdit={canEdit}
          />
        )}

        {/* Module 5: Attendance Manager */}
        {activeTab === 'attendance' && (
          <AttendanceManager
            attendanceList={attendance}
            students={students}
            onMarkAttendance={handleMarkAttendance}
            canEdit={canEdit}
          />
        )}

        {/* Module 6: Master Timetable Manager */}
        {activeTab === 'timetable' && (
          <TimetableManager
            periods={timetable}
            classes={classes}
            staff={staff}
            onAddPeriod={handleAddPeriod}
            canEdit={canEdit}
          />
        )}

        {/* Module 7: Examinations & Report Cards */}
        {activeTab === 'exams' && (
          <ExamsManager
            exams={exams}
            results={results}
            subjects={subjects}
            students={students}
            onAddResult={handleAddResult}
            canEdit={canEdit}
          />
        )}

        {/* Module 8: Fees & Financial Accounting */}
        {activeTab === 'fees' && (
          <FinanceManager
            fees={fees}
            students={students}
            onRecordPayment={handleRecordPayment}
            onAddInvoice={handleAddInvoice}
            canEdit={canEdit}
          />
        )}

        {/* Module 9: Subjects Manager */}
        {activeTab === 'subjects' && (
          <SubjectsManager
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            canEdit={canEdit}
          />
        )}

        {/* Module 10: Library Management */}
        {activeTab === 'library' && (
          <LibraryManager
            books={books}
            borrowings={borrowings}
            onAddBook={handleAddBook}
            onIssueBook={handleIssueBook}
            onReturnBook={handleReturnBook}
            canEdit={canEdit}
          />
        )}

        {/* Module 11: Transport & Bus Fleet */}
        {activeTab === 'transport' && (
          <TransportManager
            routes={routes}
            onAddRoute={handleAddRoute}
            canEdit={canEdit}
          />
        )}

        {/* Module 12: Sports, Societies & Clubs */}
        {activeTab === 'activities' && (
          <ActivitiesManager
            activities={activities}
            students={students}
            onAddActivity={handleAddActivity}
            canEdit={canEdit}
          />
        )}

        {/* Module 13: Student Health & Medical Bay */}
        {activeTab === 'health' && (
          <HealthManager
            logs={healthLogs}
            students={students}
            onAddLog={handleAddHealthLog}
            canEdit={canEdit}
          />
        )}

        {/* Module 14: Circulars & Notices */}
        {activeTab === 'circulars' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-cinzel">College Circulars & Administrative Directives</h2>
                <p className="text-xs text-slate-500">Official directives and announcements for Colombo Campus</p>
              </div>
              {canEdit && (
                <button
                  onClick={() => setShowAddCircularModal(true)}
                  className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Post New Circular</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {circulars.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {c.category}
                    </span>
                    <span className="text-xs text-slate-400">{c.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2">{c.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{c.summary}</p>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Target: <strong>{c.targetRole}</strong></span>
                    <span className="text-purple-700 font-semibold">Principal's Office</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Post Circular Modal */}
      {showAddCircularModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto">
            <div className="h-2 bg-gradient-to-r from-[#2A0845] via-[#D4AF37] to-[#1E3A8A]" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Publish College Circular</h3>
                <button
                  onClick={() => setShowAddCircularModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCircular} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Circular Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navarathri Pooja Assembly"
                    value={newCircTitle}
                    onChange={(e) => setNewCircTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCircCategory}
                    onChange={(e) => setNewCircCategory(e.target.value as CircularItem['category'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-900 focus:outline-none"
                  >
                    <option value="Academic Notice">Academic Notice</option>
                    <option value="Cultural & Heritage">Cultural & Heritage</option>
                    <option value="Sports">Sports</option>
                    <option value="Administrative">Administrative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Summary / Directive Details</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter details of the circular..."
                    value={newCircSummary}
                    onChange={(e) => setNewCircSummary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-900 focus:outline-none"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCircularModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold"
                  >
                    Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <p className="font-cinzel text-slate-700 font-semibold">VIPULANANTHA COLLEGE COLOMBO • ESTD 1920</p>
        <p className="text-[11px] text-slate-400 mt-0.5">16-Module School Management System • Sri Lankan National Curriculum Compliant</p>
      </footer>
    </div>
  );
};
