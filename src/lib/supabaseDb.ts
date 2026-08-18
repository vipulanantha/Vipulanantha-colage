import { supabase, isSupabaseConfigured } from './supabase';
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

export interface SupabaseConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  url: string;
  errorMessage?: string;
  tablesStatus: Record<string, boolean>;
}

/**
 * Test Supabase connection and verify access to database tables
 */
export const checkSupabaseConnection = async (): Promise<SupabaseConnectionStatus> => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConfigured: false,
      isConnected: false,
      url,
      errorMessage: 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing or invalid in environment.',
      tablesStatus: {},
    };
  }

  const tablesToTest = [
    'school_settings',
    'parents',
    'parent_accounts',
    'parent_student',
    'students',
    'teachers',
    'attendance',
    'fees',
    'exams',
    'circulars',
  ];

  const tablesStatus: Record<string, boolean> = {};
  let overallConnected = true;
  let lastError = '';

  for (const tableName of tablesToTest) {
    try {
      const { error } = await supabase.from(tableName).select('id').limit(1);
      if (error) {
        tablesStatus[tableName] = false;
        lastError = error.message;
      } else {
        tablesStatus[tableName] = true;
      }
    } catch (e: any) {
      tablesStatus[tableName] = false;
      lastError = e.message || 'Network error';
    }
  }

  const connectedTables = Object.values(tablesStatus).filter(Boolean).length;
  if (connectedTables === 0 && lastError.includes('FetchError')) {
    overallConnected = false;
  }

  return {
    isConfigured: true,
    isConnected: overallConnected,
    url,
    errorMessage: lastError ? `Notice: ${lastError}` : undefined,
    tablesStatus,
  };
};

/**
 * Utility to convert camelCase object to snake_case for Supabase
 */
const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
};

/**
 * Utility to convert snake_case object from Supabase to camelCase
 */
const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
};

/**
 * Resilient upsert helper that:
 * 1. Automatically strips missing columns if Supabase schema cache complains (e.g. 'email' missing in 'students').
 * 2. Automatically handles foreign key constraint failures (e.g. missing 'student_id' in 'students') by inserting referenced students first.
 */
export const resilientUpsert = async (
  tableName: string,
  recordOrArray: Record<string, any> | Array<Record<string, any>>,
  allStudentsContext?: Student[]
): Promise<{ ok: boolean; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Supabase is not configured' };
  }

  const isArray = Array.isArray(recordOrArray);
  let payloadList = isArray
    ? (recordOrArray as Array<Record<string, any>>).map((r) => toSnakeCase(r))
    : [toSnakeCase(recordOrArray as Record<string, any>)];

  // Fill sensible defaults for 'students' table to avoid NOT NULL constraint errors
  if (tableName === 'students') {
    payloadList.forEach((item) => {
      if (item.stream === undefined || item.stream === null) item.stream = 'General';
      if (item.house === undefined || item.house === null) item.house = 'Royal Gold';
      if (item.status === undefined || item.status === null) item.status = 'Active';
      if (item.gender === undefined || item.gender === null) item.gender = 'Male';
      if (item.grade === undefined || item.grade === null) item.grade = '10';
      if (item.section === undefined || item.section === null) item.section = 'A';
      if (item.dob === undefined || item.dob === null) item.dob = '2010-01-01';
      if (item.address === undefined || item.address === null) item.address = 'Colombo 06, Sri Lanka';
      if (item.parent_name === undefined || item.parent_name === null) item.parent_name = 'Parent';
      if (item.parent_phone === undefined || item.parent_phone === null) item.parent_phone = '+94 77 000 0000';
      if (item.email === undefined || item.email === null) item.email = `${item.admission_no || item.id || 'student'}@vipulanantha.edu.lk`;
      if (item.emergency_contact === undefined || item.emergency_contact === null) item.emergency_contact = '+94 77 000 0000';
      if (item.admission_date === undefined || item.admission_date === null) item.admission_date = '2020-01-01';
    });
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const payload = isArray ? payloadList : payloadList[0];
      const { error } = await supabase.from(tableName).upsert(payload as any);

      if (!error) {
        return { ok: true };
      }

      const errMsg = error.message || '';

      // CASE A: Missing column in schema cache error
      // e.g. "Could not find the 'email' column of 'students' in the schema cache"
      const missingColMatch = errMsg.match(/Could not find the '([^']+)' column/i);
      if (missingColMatch && missingColMatch[1]) {
        const missingCol = missingColMatch[1];
        console.warn(`[Supabase Sync] Column '${missingCol}' missing in table '${tableName}'. Stripping and retrying...`);
        payloadList.forEach((item) => {
          delete item[missingCol];
        });
        continue;
      }

      // CASE B: Foreign Key Constraint failure
      // e.g. "insert or update on table "attendance" violates foreign key constraint "attendance_student_id_fkey""
      if (errMsg.includes('violates foreign key constraint') || error.code === '23503') {
        console.warn(`[Supabase Sync] Foreign key constraint on '${tableName}' triggered. Auto-seeding missing parent student records...`);

        if (tableName === 'attendance') {
          const studentIds = new Set(payloadList.map((p) => p.student_id).filter(Boolean));

          for (const sId of studentIds) {
            const knownStudent = (allStudentsContext || []).find((s) => s.id === sId) ||
              INITIAL_STUDENTS.find((s) => s.id === sId);

            const studentToSeed: Student = knownStudent || {
              id: sId,
              admissionNo: sId,
              fullName: `Student ${sId}`,
              dob: '2010-01-01',
              gender: 'Male',
              address: 'Colombo, Sri Lanka',
              grade: '10',
              section: 'A',
              stream: 'General',
              house: 'Royal Gold',
              parentName: 'Parent',
              parentPhone: '+94 77 000 0000',
              email: `${sId}@vipulanantha.edu.lk`,
              emergencyContact: '+94 77 000 0000',
              admissionDate: '2020-01-01',
              status: 'Active',
            };

            // Seed missing student into 'students' table first
            await resilientUpsert('students', studentToSeed);
          }

          // Retry upserting attendance after seeding parent student records
          continue;
        }
      }

      // CASE C: NOT NULL constraint violation
      // e.g. "null value in column "stream" of relation "students" violates not-null constraint"
      if (errMsg.includes('violates not-null constraint') || error.code === '23502') {
        const nullColMatch = errMsg.match(/column "([^"]+)"/i) || errMsg.match(/column ([a-z0-9_]+)/i);
        const nullCol = nullColMatch ? nullColMatch[1] : null;

        console.warn(`[Supabase Sync] Not-null constraint on '${tableName}' triggered (column: ${nullCol || 'unknown'}). Filling default values...`);

        payloadList.forEach((item) => {
          if (nullCol) {
            if (nullCol === 'stream') item[nullCol] = 'General';
            else if (nullCol === 'house') item[nullCol] = 'Royal Gold';
            else if (nullCol === 'status') item[nullCol] = 'Active';
            else if (nullCol === 'gender') item[nullCol] = 'Male';
            else if (nullCol === 'grade') item[nullCol] = '10';
            else if (nullCol === 'section') item[nullCol] = 'A';
            else item[nullCol] = 'General';
          } else {
            for (const k of ['stream', 'house', 'status', 'gender', 'grade', 'section']) {
              if (item[k] === undefined || item[k] === null) {
                item[k] = k === 'stream' ? 'General' : k === 'status' ? 'Active' : 'N/A';
              }
            }
          }
        });
        continue;
      }

      console.error(`[Supabase Sync] Error on table '${tableName}':`, errMsg);
      return { ok: false, error: errMsg };
    } catch (e: any) {
      console.error(`[Supabase Sync] Exception during upsert on '${tableName}':`, e);
      return { ok: false, error: e.message || 'Network error' };
    }
  }

  return { ok: false, error: 'Exceeded retry attempts for schema compatibility' };
};

// ==========================================
// DATA FETCHERS & INITIALIZER
// ==========================================

export const fetchAllSmsData = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      students: INITIAL_STUDENTS,
      staff: INITIAL_STAFF,
      classes: INITIAL_CLASSES,
      subjects: INITIAL_SUBJECTS,
      attendance: INITIAL_ATTENDANCE,
      circulars: INITIAL_CIRCULARS,
      timetable: INITIAL_TIMETABLE,
      exams: INITIAL_EXAMS,
      results: INITIAL_RESULTS,
      fees: INITIAL_FEES,
      books: INITIAL_BOOKS,
      borrowings: INITIAL_BORROWINGS,
      routes: INITIAL_TRANSPORT,
      activities: INITIAL_ACTIVITIES,
      healthLogs: INITIAL_HEALTH_LOGS,
      fromSupabase: false,
    };
  }

  try {
    // 1. Students
    const { data: dbStudents } = await supabase.from('students').select('*');
    let students: Student[] = INITIAL_STUDENTS;
    if (dbStudents && dbStudents.length > 0) {
      students = dbStudents.map((s) => toCamelCase(s) as Student);
    } else {
      // Seed initial students into Supabase so foreign key constraints pass
      await resilientUpsert('students', INITIAL_STUDENTS);
    }

    // 2. Teachers / Staff
    const { data: dbStaff } = await supabase.from('teachers').select('*');
    const staff: StaffMember[] = dbStaff && dbStaff.length > 0
      ? dbStaff.map((s) => toCamelCase(s) as StaffMember)
      : INITIAL_STAFF;

    // 3. Classes
    const { data: dbClasses } = await supabase.from('classes').select('*');
    const classes: SchoolClass[] = dbClasses && dbClasses.length > 0
      ? dbClasses.map((c) => toCamelCase(c) as SchoolClass)
      : INITIAL_CLASSES;

    // 4. Subjects
    const { data: dbSubjects } = await supabase.from('subjects').select('*');
    const subjects: Subject[] = dbSubjects && dbSubjects.length > 0
      ? dbSubjects.map((s) => toCamelCase(s) as Subject)
      : INITIAL_SUBJECTS;

    // 5. Attendance
    const { data: dbAttendance } = await supabase.from('attendance').select('*').order('date', { ascending: false });
    const attendance: AttendanceRecord[] = dbAttendance && dbAttendance.length > 0
      ? dbAttendance.map((a) => toCamelCase(a) as AttendanceRecord)
      : INITIAL_ATTENDANCE;

    // 6. Circulars
    const { data: dbCirculars } = await supabase.from('circulars').select('*').order('created_at', { ascending: false });
    const circulars: CircularItem[] = dbCirculars && dbCirculars.length > 0
      ? dbCirculars.map((c) => toCamelCase(c) as CircularItem)
      : INITIAL_CIRCULARS;

    // 7. Timetable
    const { data: dbTimetable } = await supabase.from('timetable').select('*');
    const timetable: TimetablePeriod[] = dbTimetable && dbTimetable.length > 0
      ? dbTimetable.map((t) => toCamelCase(t) as TimetablePeriod)
      : INITIAL_TIMETABLE;

    // 8. Exams
    const { data: dbExams } = await supabase.from('exams').select('*');
    const exams: ExamAssessment[] = dbExams && dbExams.length > 0
      ? dbExams.map((e) => toCamelCase(e) as ExamAssessment)
      : INITIAL_EXAMS;

    // 9. Results
    const { data: dbResults } = await supabase.from('results').select('*');
    const results: StudentResult[] = dbResults && dbResults.length > 0
      ? dbResults.map((r) => toCamelCase(r) as StudentResult)
      : INITIAL_RESULTS;

    // 10. Fees
    const { data: dbFees } = await supabase.from('fees').select('*');
    const fees: FeeInvoice[] = dbFees && dbFees.length > 0
      ? dbFees.map((f) => toCamelCase(f) as FeeInvoice)
      : INITIAL_FEES;

    // 11. Books
    const { data: dbBooks } = await supabase.from('library_books').select('*');
    const books: LibraryBook[] = dbBooks && dbBooks.length > 0
      ? dbBooks.map((b) => toCamelCase(b) as LibraryBook)
      : INITIAL_BOOKS;

    // 12. Borrowings
    const { data: dbBorrowings } = await supabase.from('book_borrowings').select('*');
    const borrowings: BookBorrowing[] = dbBorrowings && dbBorrowings.length > 0
      ? dbBorrowings.map((b) => toCamelCase(b) as BookBorrowing)
      : INITIAL_BORROWINGS;

    // 13. Transport
    const { data: dbRoutes } = await supabase.from('transport_routes').select('*');
    const routes: TransportRoute[] = dbRoutes && dbRoutes.length > 0
      ? dbRoutes.map((r) => toCamelCase(r) as TransportRoute)
      : INITIAL_TRANSPORT;

    // 14. Activities
    const { data: dbActivities } = await supabase.from('extracurricular_activities').select('*');
    const activities: ExtracurricularActivity[] = dbActivities && dbActivities.length > 0
      ? dbActivities.map((a) => toCamelCase(a) as ExtracurricularActivity)
      : INITIAL_ACTIVITIES;

    // 15. Health Logs
    const { data: dbHealth } = await supabase.from('health_logs').select('*');
    const healthLogs: HealthVisitLog[] = dbHealth && dbHealth.length > 0
      ? dbHealth.map((h) => toCamelCase(h) as HealthVisitLog)
      : INITIAL_HEALTH_LOGS;

    return {
      students,
      staff,
      classes,
      subjects,
      attendance,
      circulars,
      timetable,
      exams,
      results,
      fees,
      books,
      borrowings,
      routes,
      activities,
      healthLogs,
      fromSupabase: true,
    };
  } catch (err) {
    console.warn('Failed to load full data from Supabase, returning local defaults:', err);
    return {
      students: INITIAL_STUDENTS,
      staff: INITIAL_STAFF,
      classes: INITIAL_CLASSES,
      subjects: INITIAL_SUBJECTS,
      attendance: INITIAL_ATTENDANCE,
      circulars: INITIAL_CIRCULARS,
      timetable: INITIAL_TIMETABLE,
      exams: INITIAL_EXAMS,
      results: INITIAL_RESULTS,
      fees: INITIAL_FEES,
      books: INITIAL_BOOKS,
      borrowings: INITIAL_BORROWINGS,
      routes: INITIAL_TRANSPORT,
      activities: INITIAL_ACTIVITIES,
      healthLogs: INITIAL_HEALTH_LOGS,
      fromSupabase: false,
    };
  }
};

// ==========================================
// MUTATION PERSISTENCE HANDLERS (SAVE / DELETE)
// ==========================================

export const saveAttendanceRecordToSupabase = async (
  record: AttendanceRecord,
  allStudentsContext?: Student[]
): Promise<boolean> => {
  const result = await resilientUpsert('attendance', record, allStudentsContext);
  return result.ok;
};

export const saveAttendanceBatchToSupabase = async (
  records: AttendanceRecord[],
  allStudentsContext?: Student[]
): Promise<boolean> => {
  if (records.length === 0) return true;
  const result = await resilientUpsert('attendance', records, allStudentsContext);
  return result.ok;
};

export const saveStudentToSupabase = async (student: Student): Promise<boolean> => {
  const result = await resilientUpsert('students', student);
  return result.ok;
};

export const deleteStudentFromSupabase = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('students').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
};

export const saveStaffToSupabase = async (staffMember: StaffMember): Promise<boolean> => {
  const result = await resilientUpsert('teachers', staffMember);
  return result.ok;
};

export const deleteStaffFromSupabase = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
};

export const saveFeeInvoiceToSupabase = async (invoice: FeeInvoice): Promise<boolean> => {
  const result = await resilientUpsert('fees', invoice);
  return result.ok;
};

export const saveExamResultToSupabase = async (examResult: StudentResult): Promise<boolean> => {
  const result = await resilientUpsert('results', examResult);
  return result.ok;
};

export const saveCircularToSupabase = async (circular: CircularItem): Promise<boolean> => {
  const result = await resilientUpsert('circulars', circular);
  return result.ok;
};

export const saveGenericRecordToSupabase = async (tableName: string, data: Record<string, any>): Promise<boolean> => {
  const result = await resilientUpsert(tableName, data);
  return result.ok;
};

/**
 * Copyable Supabase SQL setup script for user to run in Supabase SQL Editor
 */
export const SUPABASE_SETUP_SQL_SCRIPT = `-- ====================================================================
-- VIPULANANTHA COLLEGE COLOMBO - SUPABASE DATABASE SCHEMA SETUP
-- Run this in your Supabase SQL Editor to enable full persistent storage
-- ====================================================================

-- 1. SCHOOL SETTINGS
CREATE TABLE IF NOT EXISTS public.school_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary-school-settings',
  school_name TEXT NOT NULL DEFAULT 'VIPULANANTHA COLLEGE COLOMBO',
  established_year INTEGER NOT NULL DEFAULT 1920,
  school_motto TEXT NOT NULL DEFAULT 'நாளும் பயில்வோம் நட்பனி புரிவோம்',
  logo_url TEXT,
  address TEXT DEFAULT 'College Avenue, Colombo 06, Sri Lanka',
  phone TEXT DEFAULT '+94 11 258 1920',
  email TEXT DEFAULT 'info@vipulanantha.edu.lk',
  ministry_code TEXT DEFAULT 'WP/CM/1920',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.1 PARENTS / GUARDIANS (NIC AS UNIQUE IDENTIFIER)
CREATE TABLE IF NOT EXISTS public.parents (
  id TEXT PRIMARY KEY,
  nic TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  relationship TEXT DEFAULT 'Guardian',
  mobile_number TEXT NOT NULL,
  whatsapp_number TEXT,
  address TEXT,
  occupation TEXT,
  preferred_language TEXT DEFAULT 'Tamil',
  emergency_contact TEXT,
  status TEXT DEFAULT 'Active',
  auth_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 PARENT ACCOUNTS (ONE PARENT = ONE ACCOUNT)
CREATE TABLE IF NOT EXISTS public.parent_accounts (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES public.parents(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  auth_user_id TEXT,
  must_change_password BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 PARENT_STUDENT JUNCTION TABLE (ONE PARENT -> MANY STUDENTS)
CREATE TABLE IF NOT EXISTS public.parent_student (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  relationship TEXT DEFAULT 'Guardian',
  is_primary_guardian BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT parent_student_unique_pair UNIQUE (parent_id, student_id)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_parents_nic ON public.parents(nic);
CREATE INDEX IF NOT EXISTS idx_parent_accounts_username ON public.parent_accounts(username);
CREATE INDEX IF NOT EXISTS idx_parent_student_parent_id ON public.parent_student(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student_id ON public.parent_student(student_id);

-- Disable RLS for parent tables to enable full portal access
ALTER TABLE public.parents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student DISABLE ROW LEVEL SECURITY;

-- 2. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  admission_no TEXT NOT NULL,
  full_name TEXT NOT NULL,
  full_name_tamil TEXT,
  photo TEXT,
  dob TEXT,
  gender TEXT,
  address TEXT,
  grade TEXT,
  section TEXT,
  stream TEXT,
  house TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_occupation TEXT,
  email TEXT,
  emergency_contact TEXT,
  medical_conditions TEXT,
  allergies TEXT,
  blood_group TEXT,
  previous_school TEXT,
  admission_date TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all optional student columns exist in case table was created earlier
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS full_name_tamil TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS previous_school TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS stream TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS house TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_occupation TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Drop NOT NULL constraints on optional columns if they were created as NOT NULL earlier
ALTER TABLE public.students ALTER COLUMN stream DROP NOT NULL;
ALTER TABLE public.students ALTER COLUMN stream SET DEFAULT 'General';
ALTER TABLE public.students ALTER COLUMN house DROP NOT NULL;
ALTER TABLE public.students ALTER COLUMN house SET DEFAULT 'Royal Gold';
ALTER TABLE public.students ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.students ALTER COLUMN address DROP NOT NULL;
ALTER TABLE public.students ALTER COLUMN parent_name DROP NOT NULL;
ALTER TABLE public.students ALTER COLUMN parent_phone DROP NOT NULL;

-- 3. TEACHERS & STAFF
CREATE TABLE IF NOT EXISTS public.teachers (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'Teacher',
  department TEXT,
  subjects_taught JSONB DEFAULT '[]',
  assigned_classes JSONB DEFAULT '[]',
  qualifications TEXT,
  email TEXT,
  phone TEXT,
  join_date TEXT,
  attendance_status TEXT DEFAULT 'Present',
  leave_balance JSONB DEFAULT '{"casual": 12, "medical": 21, "duty": 10}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CLASSES
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  grade TEXT,
  section TEXT,
  stream TEXT,
  class_teacher TEXT,
  class_teacher_id TEXT,
  room TEXT,
  capacity INTEGER,
  student_count INTEGER,
  academic_year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.1 RELATIONAL CLASS TEACHER ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.class_teacher_assignments (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  academic_year_id TEXT NOT NULL DEFAULT '2026',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for class teacher assignments
CREATE INDEX IF NOT EXISTS idx_cta_class_id ON public.class_teacher_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_cta_teacher_id ON public.class_teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_cta_academic_year ON public.class_teacher_assignments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_cta_is_active ON public.class_teacher_assignments(is_active);

-- Ensure only ONE active class teacher assignment per class per academic year
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_class_teacher 
  ON public.class_teacher_assignments(class_id, academic_year_id) 
  WHERE is_active = TRUE;

-- 4.2 SUBSTITUTE ATTENDANCE ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_substitute_assignments (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  period_id TEXT DEFAULT 'Full Day',
  reason TEXT,
  assigned_by TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.3 ASSIGNMENT AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.class_assignment_audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  academic_year_id TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT,
  name_tamil TEXT,
  grade_level TEXT,
  stream TEXT,
  teacher_name TEXT,
  periods_per_week INTEGER,
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  student_name TEXT,
  admission_no TEXT,
  grade TEXT,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Present',
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop rigid foreign key constraint if present from earlier script
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;

-- 7. TIMETABLE
CREATE TABLE IF NOT EXISTS public.timetable (
  id TEXT PRIMARY KEY,
  day TEXT,
  time TEXT,
  period_number INTEGER,
  subject TEXT,
  teacher TEXT,
  room TEXT,
  grade TEXT,
  status TEXT DEFAULT 'Scheduled',
  is_substitute BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. EXAMS & RESULTS
CREATE TABLE IF NOT EXISTS public.exams (
  id TEXT PRIMARY KEY,
  title TEXT,
  term TEXT,
  academic_year TEXT,
  grade TEXT,
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'Scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.results (
  id TEXT PRIMARY KEY,
  exam_id TEXT,
  student_id TEXT,
  student_name TEXT,
  admission_no TEXT,
  grade TEXT,
  marks JSONB DEFAULT '{}',
  total_marks NUMERIC,
  average NUMERIC,
  rank INTEGER,
  grade_letter TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. FEES & FINANCE
CREATE TABLE IF NOT EXISTS public.fees (
  id TEXT PRIMARY KEY,
  invoice_no TEXT,
  student_id TEXT,
  student_name TEXT,
  admission_no TEXT,
  grade TEXT,
  category TEXT,
  amount NUMERIC,
  discount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  balance_amount NUMERIC,
  due_date TEXT,
  status TEXT DEFAULT 'Pending',
  payment_date TEXT,
  receipt_no TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CIRCULARS & NOTICES
CREATE TABLE IF NOT EXISTS public.circulars (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  date TEXT,
  summary TEXT,
  target_role TEXT DEFAULT 'All Campus',
  sent_via_sms BOOLEAN DEFAULT FALSE,
  sent_via_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. LIBRARY BOOKS & BORROWINGS
CREATE TABLE IF NOT EXISTS public.library_books (
  id TEXT PRIMARY KEY,
  isbn TEXT,
  title TEXT,
  author TEXT,
  category TEXT,
  copies_total INTEGER,
  copies_available INTEGER,
  rack_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.book_borrowings (
  id TEXT PRIMARY KEY,
  book_id TEXT,
  book_title TEXT,
  borrower_type TEXT,
  borrower_name TEXT,
  borrower_id TEXT,
  borrow_date TEXT,
  due_date TEXT,
  return_date TEXT,
  status TEXT DEFAULT 'Borrowed',
  fine_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TRANSPORT, ACTIVITIES, HEALTH
CREATE TABLE IF NOT EXISTS public.transport_routes (
  id TEXT PRIMARY KEY,
  bus_number TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  route_title TEXT,
  pickup_stops JSONB DEFAULT '[]',
  vehicle_capacity INTEGER,
  students_count INTEGER,
  departure_morning TEXT,
  departure_afternoon TEXT,
  status TEXT DEFAULT 'On Route',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.extracurricular_activities (
  id TEXT PRIMARY KEY,
  title TEXT,
  category TEXT,
  teacher_in_charge TEXT,
  meeting_schedule TEXT,
  venue TEXT,
  member_count INTEGER,
  recent_achievements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.health_logs (
  id TEXT PRIMARY KEY,
  date TEXT,
  student_name TEXT,
  admission_no TEXT,
  grade TEXT,
  symptoms TEXT,
  treatment_provided TEXT,
  attending_nurse_or_officer TEXT,
  parent_informed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Returned to Class',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- DISABLE RLS FOR PUBLIC DEMO / TEST ACCESS
-- ====================================================================
ALTER TABLE public.school_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.circulars DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_borrowings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracurricular_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_teacher_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_substitute_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_assignment_audit_logs DISABLE ROW LEVEL SECURITY;

-- ====================================================================
-- STRICT PRODUCTION ROW LEVEL SECURITY (RLS) FOR ATTENDANCE PERMISSIONS
-- To enable strict teacher attendance RLS in production, run:
-- ====================================================================
-- ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY teacher_attendance_strict_policy ON public.attendance
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM public.class_teacher_assignments cta
        WHERE cta.is_active = true
          AND (cta.class_id = attendance.class_id OR cta.class_id = attendance.grade)
--     ) OR EXISTS (
--       SELECT 1 FROM public.attendance_substitute_assignments asa
--       WHERE asa.class_id = attendance.grade AND asa.date = attendance.date
--     )
--   );

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('school-assets', 'school-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;
`;
