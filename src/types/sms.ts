export type PortalRole = 'staff' | 'student' | 'parent' | 'admin' | 'principal' | 'accountant' | 'librarian';

// 1. Student Management
export interface Student {
  id: string;
  admissionNo: string;
  fullName: string;
  fullNameTamil?: string;
  photo?: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  grade: string;
  section: string;
  stream?: 'Physical Science' | 'Bio Science' | 'Commerce' | 'Arts' | 'Technology' | 'General';
  house: 'Royal Gold' | 'Lotus Red' | 'Sapphire Blue' | 'Emerald Green';
  parentName: string;
  parentPhone: string;
  parentOccupation?: string;
  email: string;
  emergencyContact: string;
  medicalConditions?: string;
  allergies?: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  previousSchool?: string;
  admissionDate: string;
  status: 'Active' | 'Transferred' | 'Graduated' | 'Inactive';
}

// 2. Teacher & Staff Management
export interface StaffMember {
  id: string;
  employeeId: string;
  fullName: string;
  role: 'Teacher' | 'Principal' | 'Vice Principal' | 'Section Head' | 'Librarian' | 'Accountant' | 'Support Staff';
  department: string;
  subjectsTaught: string[];
  assignedClasses: string[];
  qualifications: string;
  email: string;
  phone: string;
  joinDate: string;
  attendanceStatus: 'Present' | 'Absent' | 'On Leave' | 'Late';
  leaveBalance: {
    casual: number;
    medical: number;
    duty: number;
  };
}

// 3. Subjects & Curriculum
export interface Subject {
  id: string;
  code: string;
  name: string;
  nameTamil: string;
  gradeLevel: string;
  stream?: string;
  teacherName: string;
  periodsPerWeek: number;
  room: string;
}

// 4. Class / Academic Management
export interface SchoolClass {
  id: string;
  grade: string;
  section: string;
  stream: string;
  classTeacher: string;
  room: string;
  capacity: number;
  studentCount: number;
  academicYear: string;
}

// 5. Attendance Management
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  grade: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
}

// 6. Timetable
export interface TimetablePeriod {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time: string;
  periodNumber: number;
  subject: string;
  teacher: string;
  room: string;
  grade: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  isSubstitute?: boolean;
}

// 7. Examination & Results
export interface ExamAssessment {
  id: string;
  title: string;
  term: 'Term 1' | 'Term 2' | 'Term 3' | 'Unit Test 1' | 'Unit Test 2' | 'Mock GCE O/L' | 'Mock GCE A/L';
  academicYear: string;
  grade: string;
  startDate: string;
  endDate: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Published';
}

export interface StudentResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  grade: string;
  marks: Record<string, number>; // subject code -> mark
  totalMarks: number;
  average: number;
  rank: number;
  gradeLetter: 'A' | 'B' | 'C' | 'S' | 'W';
  remarks: string;
}

// 8. Fees & Finance
export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  grade: string;
  category: 'Term Facility Fee' | 'Lab & Science Equipment' | 'Sports & Society Fund' | 'Examination Fee' | 'Library & ICT';
  amount: number;
  discount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  paymentDate?: string;
  receiptNo?: string;
}

// 9. Circulars & Communication
export interface CircularItem {
  id: string;
  title: string;
  category: 'Academic Notice' | 'Cultural & Heritage' | 'Sports' | 'Administrative' | 'Emergency';
  date: string;
  summary: string;
  targetRole: 'All Campus' | 'Parents Only' | 'Teachers' | 'Students' | 'Grade 10-12';
  sentViaSMS?: boolean;
  sentViaEmail?: boolean;
}

// 10. Library Management
export interface LibraryBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: 'Literature' | 'Pure Science' | 'Mathematics' | 'History & Culture' | 'Information Tech' | 'Tamil Classics';
  copiesTotal: number;
  copiesAvailable: number;
  rackLocation: string;
}

export interface BookBorrowing {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowerType: 'Student' | 'Staff';
  borrowerName: string;
  borrowerId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Borrowed' | 'Returned' | 'Overdue';
  fineAmount: number;
}

// 11. Transport Management
export interface TransportRoute {
  id: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  routeTitle: string;
  pickupStops: string[];
  vehicleCapacity: number;
  studentsCount: number;
  departureMorning: string;
  departureAfternoon: string;
  status: 'On Route' | 'At Depot' | 'Maintenance';
}

// 12. Activities & Clubs
export interface ExtracurricularActivity {
  id: string;
  title: string;
  category: 'Sports' | 'Club' | 'Society' | 'Cadet & Band' | 'Religious & Cultural';
  teacherInCharge: string;
  meetingSchedule: string;
  venue: string;
  memberCount: number;
  recentAchievements: string;
}

// 13. Health & Medical
export interface HealthVisitLog {
  id: string;
  date: string;
  studentName: string;
  admissionNo: string;
  grade: string;
  symptoms: string;
  treatmentProvided: string;
  attendingNurseOrOfficer: string;
  parentInformed: boolean;
  status: 'Returned to Class' | 'Sent Home' | 'Referred to Clinic';
}
