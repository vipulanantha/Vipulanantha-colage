export type SchoolType = 'Boys' | 'Girls' | 'Mixed School';
export type SchoolCategory = 'National School 1AB' | 'Provincial School 1AB' | 'Special Secondary' | 'Semi-Government';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'CHILD_PROTECTION_OFFICER'
  | 'TEACHER'
  | 'STAFF'
  | 'STUDENT'
  | 'PARENT';

export interface SchoolBasicInfo {
  id: string;
  schoolName: string;
  schoolShortName: string;
  schoolCode: string;
  establishedYear: number;
  schoolType: SchoolType;
  schoolCategory: SchoolCategory;
  address: string;
  city: string;
  province: string;
  district: string;
  educationZone: string;
  educationDivision: string;
  postalCode: string;
  mainTelephone: string;
  alternativePhone?: string;
  officialEmail: string;
  website: string;
  schoolMotto: string;
  schoolMottoTamil: string;
  schoolDescription: string;
  currentAcademicYear: string;
  status: 'Active • Fully Operational' | 'Academic Break' | 'Examination Session';
}

export interface SchoolBranding {
  logoUrl: string;
  faviconUrl?: string;
  schoolName: string;
  schoolMotto: string;
  loginPageLogoUrl?: string;
  loginPageBackgroundUrl?: string;
  primaryThemeColor: string; // e.g. #2A0845
  secondaryThemeColor: string; // e.g. #F59E0B
  schoolHeaderTitle: string;
  schoolFooterText: string;
}

export interface SchoolLeader {
  id: string;
  fullName: string;
  name?: string;
  photoUrl?: string;
  designation:
    | 'Principal'
    | 'Deputy Principal'
    | 'Vice Principal (Academic)'
    | 'Vice Principal (Administration)'
    | 'Assistant Principal'
    | 'Section Head (Senior Secondary)'
    | 'Section Head (Junior Secondary)'
    | 'Section Head (Primary)'
    | 'Academic Coordinator'
    | 'Discipline Coordinator'
    | 'Senior Student Welfare Officer'
    | string;
  employeeId?: string;
  department?: string;
  officialEmail: string;
  email?: string;
  officialPhone: string;
  phone?: string;
  status: 'Active' | 'On Sabbatical' | 'Acting Duty' | string;
  qualifications?: string;
  appointmentDate?: string;
  orderIndex?: number;
}

export interface ProtectionSafetySettings {
  emergencySosEnabled: boolean;
  confidentialReportingEnabled: boolean;
  anonymousReportingEnabled: boolean;
  bullyingReportingEnabled: boolean;
  harassmentReportingEnabled: boolean;
  studentWelfareRequestsEnabled: boolean;
  femaleStaffSupportRequestEnabled: boolean;
  childProtectionOfficerId: string;
  deputyCpoId: string;
  studentWelfareOfficerId: string;
  femaleStudentWelfareOfficerId: string;
  schoolCounsellorId: string;
  schoolNurseId: string;
  safetyCoordinatorId: string;
}

export interface ConfidentialProtectionCase {
  id: string;
  caseNumber: string;
  incidentType:
    | 'Bullying & Harassment'
    | 'Emotional Distress'
    | 'Female Student Safety Concern'
    | 'Physical Safety / Injury'
    | 'Online / Cyber Safety'
    | 'Family / Welfare Emergency'
    | 'Special Needs Assistance';
  targetGender: 'All Students' | 'Female Student' | 'Male Student';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Reported' | 'Under Investigation' | 'Support Provided' | 'Resolved & Closed';
  reportedDate: string;
  studentAdmissionNo?: string;
  studentGrade?: string;
  description: string;
  assignedOfficer: string;
  confidentialityLevel: 'Strictly Restricted (CPO Only)' | 'Leadership Level' | 'Welfare Team';
  resolutionNotes?: string;
  lastUpdated: string;
}

export interface SchoolEmergencyContact {
  id: string;
  name?: string;
  serviceName?: string;
  designation?:
    | 'School Emergency Hotline'
    | 'Principal Office Direct'
    | 'Child Protection Officer'
    | 'Student Welfare Officer'
    | 'Female Student Support Line'
    | 'Medical Clinic / Nurse'
    | 'Main Gate Security Office'
    | 'School Transport Coordinator'
    | 'Colombo Fire & Rescue'
    | 'Local Police Post (Bambalapitiya/Wellawatte)'
    | string;
  category?: string;
  contactPerson?: string;
  phone?: string;
  telephone?: string;
  alternativePhone?: string;
  email?: string;
  availability?: '24/7 Hotline' | 'School Hours (07:00 - 16:00)' | 'On-Call Emergency' | 'All Working Days' | string;
  availableHours?: string;
  priority?: 'Critical' | 'High' | 'Normal' | string;
  isPrimary?: boolean;
  isRestricted?: boolean;
  address?: string;
  notes?: string;
}

export type EmergencyContact = SchoolEmergencyContact;

export interface CampusFacility {
  id: string;
  name?: string;
  facilityName?: string;
  category:
    | 'Administration'
    | 'Classroom Block'
    | 'Science & Computer Labs'
    | 'Library & Resources'
    | 'Sports & Recreation'
    | 'Health & Welfare'
    | 'Dining & Canteen'
    | 'Transport & Gates'
    | 'Security & Safety'
    | 'Boys Facilities'
    | 'Girls Facilities'
    | string;
  building?: string;
  floor?: string;
  roomNumber?: string;
  description?: string;
  equipmentDetails?: string;
  safetyLevel?: 'GREEN' | 'YELLOW' | 'RED';
  responsibleStaff?: string;
  managedBy?: string;
  unitCount?: number;
  capacity?: number;
  status?: 'Operational' | 'Under Maintenance' | 'Scheduled Upgrade' | string;
  features?: string[];
}

export interface SchoolPolicy {
  id: string;
  name?: string;
  policyTitle?: string;
  category:
    | 'Student Code of Conduct'
    | 'Child Protection Policy'
    | 'Child Protection & Safeguarding'
    | 'Anti-Bullying Policy'
    | 'Anti-Harassment Policy'
    | 'Attendance Policy'
    | 'Discipline Policy'
    | 'ICT Usage Policy'
    | 'Internet Usage Policy'
    | 'Social Media Policy'
    | 'School Transport Policy'
    | 'Emergency Safety Policy'
    | 'Privacy & Data Protection Policy'
    | string;
  description?: string;
  summary?: string;
  fullContent?: string;
  version: string;
  publishedDate?: string;
  effectiveDate?: string;
  lastUpdated: string;
  status: 'Active • Enforced' | 'Active' | 'Under Periodic Review' | 'Archived' | string;
  updatedBy?: string;
  approvedBy?: string;
  fileUrl?: string;
  keyPoints?: string[];
  versionHistory?: {
    version: string;
    date: string;
    updatedBy: string;
    notes: string;
  }[];
}

export interface HealthWelfareInfo {
  infirmaryLocation: string;
  nurseOnDuty: string;
  nurseContact: string;
  doctorVisits: string;
  bedCapacity: number;
  firstAidStations: string[];
  counselorName: string;
  counselorSchedule: string;
  dietaryCateringPolicy: string;
  specialNeedsSupport: string;
  femaleRestRoomLocation: string;
}

export interface SchoolSystemConfig {
  activeAcademicYear: string;
  terms: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }[];
  dailySchedule: {
    startTime: string;
    endTime: string;
    periodDuration: string;
    periodsPerDay: number;
    intervalTime: string;
  };
  passingMarks: number;
  gradeScale: {
    grade: string;
    minScore: number;
    maxScore: number;
    description: string;
  }[];
}

export interface SchoolConfiguration {
  academicYear: string;
  activeTerm: 'Term 1' | 'Term 2' | 'Term 3';
  terms: string[];
  grades: string[];
  mediums: string[];
  studentHouses: { name: string; color: string; motto: string }[];
  workingDays: string[];
  schoolStartTime: string;
  schoolEndTime: string;
  lateArrivalCutoffTime: string;
  attendanceGracePeriodMinutes: number;
  gradingScales: {
    grade: string;
    minScore: number;
    maxScore: number;
    gpa: number;
    remark: string;
  }[];
  examSystems: string[];
}

export interface ProfileAuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  module: string;
  record: string;
  date: string;
  time: string;
  ipAddress?: string;
  previousValue?: string;
  newValue?: string;
}

export interface SchoolProfileAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  module: string;
  action: string;
  details: string;
  ipAddress?: string;
  oldValues?: any;
  newValues?: any;
}

export interface SchoolProfileData {
  basicInfo: SchoolBasicInfo;
  branding: SchoolBranding;
  leaders: SchoolLeader[];
  protectionSafetySettings: ProtectionSafetySettings;
  confidentialProtectionCases: ConfidentialProtectionCase[];
  emergencyContacts: EmergencyContact[];
  healthWelfareInfo: HealthWelfareInfo;
  campusFacilities: CampusFacility[];
  policies: SchoolPolicy[];
  systemConfig: SchoolSystemConfig;
  auditLogs: SchoolProfileAuditLog[];
}
