import React, { useState, useEffect } from 'react';
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
import { ActivitiesManager } from './ActivitiesManager';
import { HealthManager } from './HealthManager';
import { TimetableManager } from './TimetableManager';
import { InstitutionalProfile } from './InstitutionalProfile';
import { SchoolProfileDashboard } from './SchoolProfileDashboard';
import { ParentsManager } from './ParentsManager';
import { ClassTeacherAssignmentModal } from './ClassTeacherAssignmentModal';
import { ClassTeacherHistoryModal } from './ClassTeacherHistoryModal';
import { SubstituteTeacherModal } from './SubstituteTeacherModal';
import { EmergencyCenter } from './emergency/EmergencyCenter';
import { EmergencyBanner } from './emergency/EmergencyBanner';
import { fetchEmergencyAlerts, acknowledgeEmergencyAlert } from '../lib/emergencyService';
import { EmergencyAlert } from '../types/emergency';
import {
  checkSupabaseConnection,
  fetchAllSmsData,
  saveAttendanceRecordToSupabase,
  saveAttendanceBatchToSupabase,
  saveStudentToSupabase,
  deleteStudentFromSupabase,
  saveStaffToSupabase,
  deleteStaffFromSupabase,
  saveFeeInvoiceToSupabase,
  saveExamResultToSupabase,
  saveCircularToSupabase,
  saveGenericRecordToSupabase,
  SupabaseConnectionStatus,
  SUPABASE_SETUP_SQL_SCRIPT,
} from '../lib/supabaseDb';
import {
  fetchClassTeacherAssignmentsFromSupabase,
  saveClassTeacherAssignmentsToSupabase,
  fetchSubstituteAssignmentsFromSupabase,
  saveSubstituteAssignmentToSupabase,
  fetchAssignmentAuditLogsFromSupabase,
} from '../lib/teacherService';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  Student,
  StaffMember,
  Subject,
  SchoolClass,
  ClassTeacherAssignment,
  SubstituteAssignment,
  AssignmentAuditLog,
  AttendanceRecord,
  CircularItem,
  TimetablePeriod,
  ExamAssessment,
  StudentResult,
  FeeInvoice,
  LibraryBook,
  BookBorrowing,
  ExtracurricularActivity,
  HealthVisitLog,
  ParentProfile,
  ParentAccount,
} from '../types/sms';
import {
  INITIAL_STUDENTS,
  INITIAL_STAFF,
  INITIAL_CLASSES,
  INITIAL_CLASS_TEACHER_ASSIGNMENTS,
  INITIAL_SUBSTITUTE_ASSIGNMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SUBJECTS,
  INITIAL_ATTENDANCE,
  INITIAL_CIRCULARS,
  INITIAL_TIMETABLE,
  INITIAL_EXAMS,
  INITIAL_RESULTS,
  INITIAL_FEES,
  INITIAL_BOOKS,
  INITIAL_BORROWINGS,
  INITIAL_ACTIVITIES,
  INITIAL_HEALTH_LOGS,
  INITIAL_PARENTS,
  INITIAL_PARENT_ACCOUNTS,
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
  ShieldAlert,
  Building,
  Building2,
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
    | 'activities'
    | 'health'
    | 'circulars'
    | 'profile'
    | 'parents'
    | 'emergency'
  >('overview');

  // Emergency Alerts state for live banner & tab badge
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);

  // State stores for all 16 Modules + Parent Directory
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [parents, setParents] = useState<ParentProfile[]>(INITIAL_PARENTS);
  const [parentAccounts, setParentAccounts] = useState<ParentAccount[]>(INITIAL_PARENT_ACCOUNTS);
  const [selectedChildId, setSelectedChildId] = useState<string>('s-101'); // Kavindu Kumar default
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
  const [activities, setActivities] = useState<ExtracurricularActivity[]>(INITIAL_ACTIVITIES);
  const [healthLogs, setHealthLogs] = useState<HealthVisitLog[]>(INITIAL_HEALTH_LOGS);

  // Class Teacher Assignment & Permission States
  const [classTeacherAssignments, setClassTeacherAssignments] = useState<ClassTeacherAssignment[]>(INITIAL_CLASS_TEACHER_ASSIGNMENTS);
  const [substituteAssignments, setSubstituteAssignments] = useState<SubstituteAssignment[]>(INITIAL_SUBSTITUTE_ASSIGNMENTS);
  const [assignmentAuditLogs, setAssignmentAuditLogs] = useState<AssignmentAuditLog[]>(INITIAL_AUDIT_LOGS);

  // Role simulator state for testing teacher class permissions
  const [simulatedRoleMode, setSimulatedRoleMode] = useState<'admin' | 'st-7' | 'st-8'>('admin');
  const currentTeacherId = simulatedRoleMode === 'admin' ? null : simulatedRoleMode;

  // Assignment Modal States
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedTeacherForAssignment, setSelectedTeacherForAssignment] = useState<StaffMember | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClassForHistory, setSelectedClassForHistory] = useState<SchoolClass | null>(null);
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false);
  const [selectedAttendanceClassFilter, setSelectedAttendanceClassFilter] = useState<string>('All');

  // Supabase Connection & Toast State
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConnectionStatus | null>(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isCopiedSql, setIsCopiedSql] = useState(false);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Sync Supabase Data on Load
  useEffect(() => {
    let isMounted = true;

    async function initSupabaseData() {
      const status = await checkSupabaseConnection();
      if (isMounted) {
        setSupabaseStatus(status);
      }

      if (status.isConfigured) {
        const fullData = await fetchAllSmsData();
        if (isMounted && fullData) {
          if (fullData.students?.length) setStudents(fullData.students);
          if (fullData.staff?.length) setStaff(fullData.staff);
          if (fullData.classes?.length) setClasses(fullData.classes);
          if (fullData.subjects?.length) setSubjects(fullData.subjects);
          if (fullData.attendance?.length) setAttendance(fullData.attendance);
          if (fullData.circulars?.length) setCirculars(fullData.circulars);
          if (fullData.timetable?.length) setTimetable(fullData.timetable);
          if (fullData.exams?.length) setExams(fullData.exams);
          if (fullData.results?.length) setResults(fullData.results);
          if (fullData.fees?.length) setFees(fullData.fees);
          if (fullData.books?.length) setBooks(fullData.books);
          if (fullData.borrowings?.length) setBorrowings(fullData.borrowings);
          if (fullData.activities?.length) setActivities(fullData.activities);
          if (fullData.healthLogs?.length) setHealthLogs(fullData.healthLogs);

          if (fullData.fromSupabase) {
            showToast('Live database sync active: Connected to Supabase', 'success');
          }

          // Also fetch class teacher assignments and audit logs
          const dbAssignments = await fetchClassTeacherAssignmentsFromSupabase();
          if (isMounted && dbAssignments.length) setClassTeacherAssignments(dbAssignments);

          const dbSubs = await fetchSubstituteAssignmentsFromSupabase();
          if (isMounted && dbSubs.length) setSubstituteAssignments(dbSubs);

          const dbLogs = await fetchAssignmentAuditLogsFromSupabase();
          if (isMounted && dbLogs.length) setAssignmentAuditLogs(dbLogs);
        }
      }

      // Fetch emergency alerts (Supabase or Resilient Cache)
      try {
        const emg = await fetchEmergencyAlerts();
        if (isMounted && emg) {
          setEmergencyAlerts(emg);
        }
      } catch (err) {
        console.error('Error loading initial emergency alerts:', err);
      }
    }

    initSupabaseData();

    // Emergency polling interval (every 10 seconds)
    const emgInterval = setInterval(() => {
      fetchEmergencyAlerts()
        .then((emg) => {
          if (isMounted && emg) setEmergencyAlerts(emg);
        })
        .catch(() => {});
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(emgInterval);
    };
  }, []);

  // --- Handlers for Class Teacher Assignments ---
  const handleSaveClassTeacherAssignments = async (
    teacherId: string,
    newClassIds: string[],
    academicYear: string
  ) => {
    const success = await saveClassTeacherAssignmentsToSupabase(teacherId, newClassIds, academicYear, session.name);
    
    if (success) {
      showToast('Class teacher assignments saved to Supabase successfully!', 'success');
    } else {
      showToast('Assignments updated locally (Supabase table offline)', 'info');
    }

    const teacher = staff.find((t) => t.id === teacherId);
    const teacherName = teacher ? teacher.fullName : 'Assigned Teacher';

    // 1. Update classTeacherAssignments state locally
    const nowIso = new Date().toISOString();

    setClassTeacherAssignments((prev) => {
      // Deactivate old active assignments for this teacher
      const updated = prev.map((a) => (a.teacherId === teacherId ? { ...a, isActive: false } : a));
      // Deactivate old active assignments for these classIds (only one class teacher per class)
      const cleared = updated.map((a) => (newClassIds.includes(a.classId) ? { ...a, isActive: false } : a));

      // Append new active assignments
      const newItems: ClassTeacherAssignment[] = newClassIds.map((cId) => ({
        id: `cta-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        teacherId,
        classId: cId,
        academicYear,
        assignedAt: nowIso,
        assignedBy: session.name,
        isActive: true,
      }));

      return [...newItems, ...cleared];
    });

    // 2. Update SchoolClass list teacher reference
    setClasses((prevClasses) =>
      prevClasses.map((c) => {
        if (newClassIds.includes(c.id)) {
          return { ...c, classTeacherId: teacherId, classTeacher: teacherName };
        }
        if (c.classTeacherId === teacherId && !newClassIds.includes(c.id)) {
          return { ...c, classTeacherId: undefined, classTeacher: 'Unassigned' };
        }
        return c;
      })
    );

    // 3. Update staff member's assignedClasses string for display
    setStaff((prevStaff) =>
      prevStaff.map((s) => {
        if (s.id === teacherId) {
          const assignedNames = classes
            .filter((c) => newClassIds.includes(c.id))
            .map((c) => `${c.grade}-${c.section}`)
            .join(', ');
          return { ...s, assignedClasses: assignedNames || 'None' };
        }
        return s;
      })
    );

    // 4. Record Audit Log locally
    const auditLog: AssignmentAuditLog = {
      id: `log-${Date.now()}`,
      teacherId,
      teacherName,
      action: 'ASSIGNED',
      details: `Assigned as Class Teacher for ${newClassIds.length} classes (${academicYear})`,
      performedBy: session.name,
      createdAt: nowIso,
    };
    setAssignmentAuditLogs((prev) => [auditLog, ...prev]);
  };

  const handleSaveSubstituteAssignment = async (sub: Omit<SubstituteAssignment, 'id'>) => {
    const newSub: SubstituteAssignment = {
      ...sub,
      id: `sub-${Date.now()}`,
    };

    const success = await saveSubstituteAssignmentToSupabase(newSub);
    if (success) {
      showToast(`Substitute teacher ${newSub.teacherName} assigned for ${newSub.date}!`, 'success');
    } else {
      showToast(`Substitute teacher ${newSub.teacherName} assigned locally`, 'info');
    }

    setSubstituteAssignments((prev) => [newSub, ...prev]);

    // Audit Log
    const auditLog: AssignmentAuditLog = {
      id: `log-${Date.now()}`,
      classId: sub.classId,
      teacherId: sub.teacherId,
      teacherName: sub.teacherName,
      action: 'SUBSTITUTE_ASSIGNED',
      details: `Assigned as Substitute Teacher for Date: ${sub.date} (Reason: ${sub.reason})`,
      performedBy: session.name,
      createdAt: new Date().toISOString(),
    };
    setAssignmentAuditLogs((prev) => [auditLog, ...prev]);
  };

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
  const handleAddStudent = async (newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `s-${Date.now()}`,
    };
    setStudents((prev) => [newStudent, ...prev]);

    // Auto-add attendance for today
    const newAtt: AttendanceRecord = {
      id: `att-${newStudent.id}-2026-08-15`,
      studentId: newStudent.id,
      studentName: newStudent.fullName,
      admissionNo: newStudent.admissionNo,
      grade: `${newStudent.grade}-${newStudent.section}`,
      date: '2026-08-15',
      status: 'Present',
      remarks: 'Newly Enrolled',
    };
    setAttendance((prev) => [newAtt, ...prev]);

    // Save to Supabase
    const ok = await saveStudentToSupabase(newStudent);
    await saveAttendanceRecordToSupabase(newAtt);
    if (ok) {
      showToast(`Student ${newStudent.fullName} saved to Supabase!`, 'success');
    } else {
      showToast(`Student ${newStudent.fullName} added locally.`, 'info');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setAttendance((prev) => prev.filter((a) => a.studentId !== id));
    await deleteStudentFromSupabase(id);
    showToast('Student record deleted.', 'info');
  };

  // --- Handlers for Staff ---
  const handleAddStaff = async (newStaffData: Omit<StaffMember, 'id'>) => {
    const newMember: StaffMember = {
      ...newStaffData,
      id: `st-${Date.now()}`,
    };
    setStaff((prev) => [newMember, ...prev]);
    const ok = await saveStaffToSupabase(newMember);
    if (ok) {
      showToast(`Staff member ${newMember.fullName} saved to Supabase!`, 'success');
    }
  };

  const handleUpdateStaff = async (updatedMember: StaffMember) => {
    setStaff((prev) => prev.map((s) => (s.id === updatedMember.id ? updatedMember : s)));
    const ok = await saveStaffToSupabase(updatedMember);
    if (ok) {
      showToast(`Teacher ${updatedMember.fullName} record updated!`, 'success');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    await deleteStaffFromSupabase(id);
  };

  // --- Handlers for Classes ---
  const handleAddClass = async (newClassData: Omit<SchoolClass, 'id'>) => {
    const newCls: SchoolClass = {
      ...newClassData,
      id: `cls-${Date.now()}`,
    };
    setClasses((prev) => [newCls, ...prev]);
    await saveGenericRecordToSupabase('classes', newCls);
  };

  const handleDeleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  // --- Handlers for Subjects ---
  const handleAddSubject = async (newSubjectData: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...newSubjectData,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => [newSub, ...prev]);
    await saveGenericRecordToSupabase('subjects', newSub);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // --- Handlers for Attendance & Date Creation ---
  const handleInitDateAttendance = async (date: string) => {
    // Generate complete attendance records for all active students for this date
    const existingForDate = attendance.filter((a) => a.date === date);

    const newRecords: AttendanceRecord[] = students.map((std) => {
      const existing = existingForDate.find((e) => e.studentId === std.id);
      if (existing) return existing;
      return {
        id: `att-${std.id}-${date}`,
        studentId: std.id,
        studentName: std.fullName,
        admissionNo: std.admissionNo,
        grade: `${std.grade}-${std.section}`,
        date: date,
        status: 'Present',
        remarks: `Date Initialized (${date})`,
      };
    });

    setAttendance((prev) => {
      const otherDates = prev.filter((a) => a.date !== date);
      return [...newRecords, ...otherDates];
    });

    const saved = await saveAttendanceBatchToSupabase(newRecords, students);
    if (saved) {
      showToast(`Attendance date ${date} created and saved to Supabase! (${newRecords.length} records)`, 'success');
    } else {
      showToast(`Attendance date ${date} created locally.`, 'info');
    }
  };

  const handleMarkAttendance = async (studentId: string, status: AttendanceRecord['status'], date?: string, remarks?: string) => {
    const targetDate = date || '2026-08-15';
    let targetRecord: AttendanceRecord | undefined;

    setAttendance((prev) => {
      let found = false;
      const updated = prev.map((item) => {
        if (item.studentId === studentId && item.date === targetDate) {
          found = true;
          targetRecord = { ...item, status, remarks: remarks || item.remarks };
          return targetRecord;
        }
        return item;
      });

      if (!found) {
        const student = students.find((s) => s.id === studentId);
        if (student) {
          targetRecord = {
            id: `att-${studentId}-${targetDate}`,
            studentId,
            studentName: student.fullName,
            admissionNo: student.admissionNo,
            grade: `${student.grade}-${student.section}`,
            date: targetDate,
            status,
            remarks: remarks || 'Marked',
          };
          return [targetRecord, ...prev];
        }
      }
      return updated;
    });

    if (targetRecord) {
      const saved = await saveAttendanceRecordToSupabase(targetRecord, students);
      if (saved) {
        showToast(`Saved ${targetRecord.studentName} (${targetDate}) to Supabase!`, 'success');
      }
    }
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
      {/* Realtime Emergency Alert Floating Banner */}
      <EmergencyBanner
        activeEmergencies={emergencyAlerts}
        alerts={emergencyAlerts}
        currentUserId={session.username}
        currentUserName={session.name}
        onQuickAcknowledge={async (id) => {
          const res = await acknowledgeEmergencyAlert(
            id,
            session.username,
            session.name,
            session.roleTitle || session.role.toUpperCase(),
            'Quick acknowledged via Emergency Banner'
          );
          if (res.success && res.alert) {
            setEmergencyAlerts((prev) => prev.map((a) => (a.id === id ? res.alert! : a)));
          }
        }}
        onOpenEmergencyCenter={(id) => {
          setActiveTab('emergency');
        }}
      />

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
            {/* Quick Emergency Center Trigger Button */}
            <button
              onClick={() => setActiveTab('emergency')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/40 animate-pulse transition-all cursor-pointer shrink-0"
              title="🚨 Emergency Alarm & SOS Center"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>🚨 Emergency SOS</span>
            </button>

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
              { id: 'activities', label: '11. Sports & Clubs', count: activities.length, icon: Trophy },
              { id: 'health', label: '12. Medical Bay', count: healthLogs.length, icon: HeartPulse },
              { id: 'circulars', label: '13. Circulars', count: circulars.length, icon: FileText },
              { id: 'parents', label: '14. Parent Profiles', count: parents.length, icon: ShieldCheck },
              { id: 'profile', label: '15. School Profile & Control Center', icon: Building2 },
              {
                id: 'emergency',
                label: '16. 🚨 EMERGENCY CENTER',
                count: emergencyAlerts.filter((a) => a.status === 'ACTIVE' || a.status === 'RESPONDING').length || undefined,
                icon: ShieldAlert,
              },
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
        {/* Role Simulator Switcher for Class Teacher Permissions */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-3 sm:p-4 shadow-lg border border-purple-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-400 text-purple-950 rounded-xl font-bold shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                <span>Class Teacher Permission Simulator</span>
                <span className="bg-purple-800/80 text-purple-200 px-2 py-0.2 rounded-full font-mono text-[10px]">
                  Supabase RLS Enforced
                </span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                Test Role-Based Attendance Access Control:
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setSimulatedRoleMode('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                simulatedRoleMode === 'admin'
                  ? 'bg-amber-400 text-purple-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-purple-100'
              }`}
            >
              <span>🛡️ Admin / Principal</span>
              <span className="text-[10px] opacity-80">(All Classes)</span>
            </button>

            <button
              onClick={() => {
                setSimulatedRoleMode('st-7');
                setSelectedAttendanceClassFilter('c-10a');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                simulatedRoleMode === 'st-7'
                  ? 'bg-amber-400 text-purple-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-purple-100'
              }`}
            >
              <span>👨‍🏫 Mr. Kumar (TCH-001)</span>
              <span className="text-[10px] opacity-80">(10-A, 10-B, 11-A)</span>
            </button>

            <button
              onClick={() => {
                setSimulatedRoleMode('st-8');
                setSelectedAttendanceClassFilter('c-11b');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                simulatedRoleMode === 'st-8'
                  ? 'bg-amber-400 text-purple-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-purple-100'
              }`}
            >
              <span>👩‍🏫 Mrs. Sivanayaki (TCH-002)</span>
              <span className="text-[10px] opacity-80">(11-B)</span>
            </button>
          </div>
        </div>

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

            {/* Quick Action Matrix for 15 Modules */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5">
              <h2 className="text-sm font-bold text-slate-900 font-cinzel mb-3">15-Module Quick Action Grid</h2>
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

                <button
                  onClick={() => setActiveTab('profile')}
                  className="p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200 text-left transition-all col-span-2 sm:col-span-1"
                >
                  <Building2 className="w-5 h-5 text-purple-900 mb-1.5" />
                  <div className="text-xs font-bold text-purple-950">College Profile</div>
                  <div className="text-[10px] text-purple-700 font-medium">Supabase Logo & Bio</div>
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
            parents={parents}
            parentAccounts={parentAccounts}
          />
        )}

        {/* Module 3: Faculty & Staff Manager */}
        {activeTab === 'teachers' && (
          <TeachersManager
            staffList={staff}
            classesList={classes}
            assignmentsList={classTeacherAssignments}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
            onOpenAssignmentModal={(teacher) => {
              setSelectedTeacherForAssignment(teacher);
              setIsAssignmentModalOpen(true);
            }}
            canEdit={canEdit}
          />
        )}

        {/* Module 4: Academic Classes & Streams */}
        {activeTab === 'academic' && (
          <AcademicManager
            classes={classes}
            subjects={subjects}
            staffList={staff}
            assignmentsList={classTeacherAssignments}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onOpenHistoryModal={(cls) => {
              setSelectedClassForHistory(cls);
              setIsHistoryModalOpen(true);
            }}
            onOpenAssignmentModalForClass={(cls) => {
              const foundTeacher = staff.find(
                (t) => t.id === cls.classTeacherId || t.fullName === cls.classTeacher
              );
              setSelectedTeacherForAssignment(foundTeacher || staff[0]);
              setIsAssignmentModalOpen(true);
            }}
            canEdit={canEdit}
          />
        )}

        {/* Module 5: Attendance Manager */}
        {activeTab === 'attendance' && (
          <AttendanceManager
            attendanceList={attendance}
            students={students}
            classesList={classes}
            assignmentsList={classTeacherAssignments}
            substituteList={substituteAssignments}
            staffList={staff}
            currentTeacherId={currentTeacherId}
            selectedClassFilter={selectedAttendanceClassFilter}
            onMarkAttendance={handleMarkAttendance}
            onInitDateAttendance={handleInitDateAttendance}
            onOpenSubstituteModal={() => setIsSubstituteModalOpen(true)}
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
            staffList={staff}
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
            staffList={staff}
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

        {/* Module 11: Sports, Societies & Clubs */}
        {activeTab === 'activities' && (
          <ActivitiesManager
            activities={activities}
            students={students}
            staffList={staff}
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

        {/* Module 15: Parent & Guardian Directory */}
        {activeTab === 'parents' && (
          <ParentsManager
            parents={parents}
            parentAccounts={parentAccounts}
            students={students}
            onUpdateParent={(updated) => {
              setParents((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            }}
            onAddParent={(newParent, newAccount) => {
              setParents((prev) => [newParent, ...prev]);
              setParentAccounts((prev) => [newAccount, ...prev]);
            }}
          />
        )}

        {/* Module 15: School Profile & Institutional Control Center */}
        {activeTab === 'profile' && (
          <SchoolProfileDashboard
            initialRole={
              session.role === 'admin'
                ? 'SUPER_ADMIN'
                : session.role === 'principal'
                ? 'PRINCIPAL'
                : 'TEACHER'
            }
            actorName={session.name}
          />
        )}

        {/* Module 16: Emergency Alarm & Emergency Communication Center */}
        {activeTab === 'emergency' && (
          <EmergencyCenter
            session={session}
            students={students}
            staff={staff}
            classes={classes}
            parents={parents}
          />
        )}
      </main>

      {/* Class Teacher Assignment Modal */}
      {isAssignmentModalOpen && selectedTeacherForAssignment && (
        <ClassTeacherAssignmentModal
          teacher={selectedTeacherForAssignment}
          teachersList={staff}
          classesList={classes}
          assignmentsList={classTeacherAssignments}
          onSaveAssignments={handleSaveClassTeacherAssignments}
          onClose={() => {
            setIsAssignmentModalOpen(false);
            setSelectedTeacherForAssignment(null);
          }}
        />
      )}

      {/* Class Teacher Assignment History Modal */}
      {isHistoryModalOpen && selectedClassForHistory && (
        <ClassTeacherHistoryModal
          schoolClass={selectedClassForHistory}
          teachersList={staff}
          assignmentsList={classTeacherAssignments}
          auditLogs={assignmentAuditLogs}
          onChangeTeacherClick={(cls) => {
            setSelectedClassForHistory(null);
            setIsHistoryModalOpen(false);
            const foundTeacher = staff.find(
              (t) => t.id === cls.classTeacherId || t.fullName === cls.classTeacher
            );
            setSelectedTeacherForAssignment(foundTeacher || staff[0]);
            setIsAssignmentModalOpen(true);
          }}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedClassForHistory(null);
          }}
        />
      )}

      {/* Substitute Teacher Assignment Modal */}
      {isSubstituteModalOpen && (
        <SubstituteTeacherModal
          classesList={classes}
          teachersList={staff}
          currentAssignments={classTeacherAssignments}
          substituteAssignments={substituteAssignments}
          onSaveSubstitute={handleSaveSubstituteAssignment}
          onClose={() => setIsSubstituteModalOpen(false)}
        />
      )}

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

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-2xl bg-slate-900 text-white border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-rose-400' : 'bg-amber-400'}`} />
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Supabase Connection Inspection Modal */}
      {showSupabaseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${supabaseStatus?.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Supabase Connection & Database Inspector</h3>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Configured URL:</span>
                  <span className="font-mono text-purple-900 text-[11px] truncate max-w-xs">{supabaseStatus?.url || 'VITE_SUPABASE_URL'}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Anon Key Status:</span>
                  <span className="text-emerald-700 font-bold">{isSupabaseConfigured ? 'Valid & Injected' : 'Missing or Placeholder'}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Connection Status:</span>
                  <span className={`font-bold ${supabaseStatus?.isConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {supabaseStatus?.isConnected ? 'Live & Connected' : 'Checking / Notice'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Supabase Database Tables Status:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(supabaseStatus?.tablesStatus || {}).map(([table, ok]) => (
                    <div key={table} className={`p-2 rounded-lg border flex items-center justify-between ${ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                      <span className="font-mono text-[11px]">{table}</span>
                      <span className="font-bold">{ok ? '✓ Ready' : '⚡ Missing'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950 text-xs sm:text-sm">Supabase Database Setup SQL Script</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SETUP_SQL_SCRIPT);
                      setIsCopiedSql(true);
                      setTimeout(() => setIsCopiedSql(false), 3000);
                    }}
                    className="bg-purple-900 hover:bg-purple-950 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    {isCopiedSql ? '✓ Copied SQL to Clipboard!' : 'Copy SQL Script'}
                  </button>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  If any table above shows missing in your Supabase project, click <strong>"Copy SQL Script"</strong> and paste it directly into your <strong>Supabase Dashboard → SQL Editor</strong> to automatically create all 16 school tables & enable save access!
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close Inspector
              </button>
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
