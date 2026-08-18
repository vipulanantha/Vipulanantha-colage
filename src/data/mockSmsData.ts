import {
  Student,
  StaffMember,
  Subject,
  SchoolClass,
  ClassTeacherAssignment,
  SubstituteAssignment,
  AssignmentAuditLog,
  AttendanceRecord,
  TimetablePeriod,
  ExamAssessment,
  StudentResult,
  FeeInvoice,
  CircularItem,
  LibraryBook,
  BookBorrowing,
  TransportRoute,
  ExtracurricularActivity,
  HealthVisitLog,
  ParentProfile,
  ParentAccount,
  ParentStudentRelation,
} from '../types/sms';

export const INITIAL_PARENTS: ParentProfile[] = [];

export const INITIAL_PARENT_ACCOUNTS: ParentAccount[] = [];

export const INITIAL_PARENT_STUDENT: ParentStudentRelation[] = [];

export const INITIAL_CLASSES: SchoolClass[] = [
  { id: 'c-1', grade: 'Grade 1', section: 'A', stream: 'Primary', roomNo: 'RM-101', classTeacherId: '' },
  { id: 'c-2', grade: 'Grade 6', section: 'A', stream: 'Junior Secondary', roomNo: 'RM-201', classTeacherId: '' },
  { id: 'c-3', grade: 'Grade 10', section: 'A', stream: 'Senior (O/L)', roomNo: 'RM-301', classTeacherId: '' },
  { id: 'c-4', grade: 'Grade 12', section: 'Science', stream: 'Collegiate (A/L)', roomNo: 'SCI-01', classTeacherId: '' },
];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_STAFF: StaffMember[] = [];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Tamil Language & Literature', code: 'TAM', category: 'Language', grades: ['Grade 1', 'Grade 6', 'Grade 10', 'Grade 12'] },
  { id: 'sub-2', name: 'Mathematics', code: 'MAT', category: 'Core', grades: ['Grade 1', 'Grade 6', 'Grade 10', 'Grade 12'] },
  { id: 'sub-3', name: 'English Language', code: 'ENG', category: 'Language', grades: ['Grade 1', 'Grade 6', 'Grade 10', 'Grade 12'] },
  { id: 'sub-4', name: 'Science & Technology', code: 'SCI', category: 'Science', grades: ['Grade 6', 'Grade 10', 'Grade 12'] },
  { id: 'sub-5', name: 'Information & Communication Tech (ICT)', code: 'ICT', category: 'Technical', grades: ['Grade 10', 'Grade 12'] },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_CIRCULARS: CircularItem[] = [];

export const INITIAL_TIMETABLE: TimetablePeriod[] = [];

export const INITIAL_EXAMS: ExamAssessment[] = [];

export const INITIAL_RESULTS: StudentResult[] = [];

export const INITIAL_FEES: FeeInvoice[] = [];

export const INITIAL_BOOKS: LibraryBook[] = [];

export const INITIAL_BORROWINGS: BookBorrowing[] = [];

export const INITIAL_TRANSPORT: TransportRoute[] = [];

export const INITIAL_ACTIVITIES: ExtracurricularActivity[] = [
  {
    id: 'act-1',
    title: 'Swami Vipulananda Memorial Carnatic Music & Bharatanatyam Troupe',
    category: 'Arts & Culture',
    teacherInCharge: '',
    meetingSchedule: 'Mondays & Wednesdays (02:00 - 04:00 PM)',
    venue: 'Auditorio / Hall A',
    memberCount: 0,
    recentAchievements: 'Annual Cultural Showcase',
  },
  {
    id: 'act-2',
    title: 'Tamil Literary Society & Yazh Club',
    category: 'Society',
    teacherInCharge: '',
    meetingSchedule: 'Tuesdays (02:00 - 03:30 PM)',
    venue: 'Cultural Hall',
    memberCount: 0,
    recentAchievements: 'Inter-School Competitions',
  },
  {
    id: 'act-3',
    title: 'Science & Robotics Innovators Club',
    category: 'Club',
    teacherInCharge: '',
    meetingSchedule: 'Thursdays (02:00 - 04:00 PM)',
    venue: 'Computer Lab A',
    memberCount: 0,
    recentAchievements: 'National Science Fair',
  },
];

export const INITIAL_HEALTH_LOGS: HealthVisitLog[] = [];

export const INITIAL_CLASS_TEACHER_ASSIGNMENTS: ClassTeacherAssignment[] = [];
export const INITIAL_SUBSTITUTE_ASSIGNMENTS: SubstituteAssignment[] = [];
export const INITIAL_AUDIT_LOGS: AssignmentAuditLog[] = [];

