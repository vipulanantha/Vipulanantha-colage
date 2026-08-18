import { supabase, isSupabaseConfigured } from './supabase';
import {
  SchoolBasicInfo,
  SchoolBranding,
  SchoolLeader,
  ProtectionSafetySettings,
  ConfidentialProtectionCase,
  EmergencyContact,
  SchoolEmergencyContact,
  CampusFacility,
  SchoolPolicy,
  HealthWelfareInfo,
  SchoolSystemConfig,
  SchoolConfiguration,
  ProfileAuditLog,
  SchoolProfileAuditLog,
  SchoolProfileData,
  UserRole,
} from '../types/schoolProfile';
import { BUNDLED_OFFICIAL_LOGO, fetchSchoolSettings, applySchoolLogoUrl } from './schoolSettings';
import { resilientUpsert } from './supabaseDb';

// Storage cache keys
const CACHE_KEY_PREFIX = 'vc_school_profile_';

// Initial Default School Basic Info
export const DEFAULT_BASIC_INFO: SchoolBasicInfo = {
  id: 'vipulanantha-school-profile',
  schoolName: 'VIPULANANTHA COLLEGE',
  schoolShortName: 'VC Colombo',
  schoolCode: 'WP/CM/1920',
  establishedYear: 1920,
  schoolType: 'Mixed School',
  schoolCategory: 'National School 1AB',
  address: 'College Avenue, Colombo 06, Sri Lanka',
  city: 'Colombo',
  province: 'Western Province',
  district: 'Colombo District',
  educationZone: 'Colombo South',
  educationDivision: 'Colombo 06',
  postalCode: '00600',
  mainTelephone: '+94 11 258 1920',
  alternativePhone: '+94 11 258 1921',
  officialEmail: 'info@vipulanantha.edu.lk',
  website: 'https://vipulanantha.edu.lk',
  schoolMotto: 'நாளும் பயில்வோம் நட்பணி புரிவோம்',
  schoolMottoTamil: 'நாளும் பயில்வோம் நட்பணி புரிவோம்',
  schoolDescription:
    'Vipulananda College Colombo is a premier 1AB National Mixed School established in 1920, delivering century-long academic excellence, cultural heritage, holistic discipline, and safe, inclusive co-educational learning for boys and girls.',
  currentAcademicYear: '2026',
  status: 'Active • Fully Operational',
};

// Initial Branding
export const DEFAULT_BRANDING: SchoolBranding = {
  logoUrl: BUNDLED_OFFICIAL_LOGO,
  faviconUrl: '/assets/vipulanantha-college-logo.png',
  schoolName: 'VIPULANANTHA COLLEGE',
  schoolMotto: 'நாளும் பயில்வோம் நட்பணி புரிவோம்',
  loginPageLogoUrl: BUNDLED_OFFICIAL_LOGO,
  loginPageBackgroundUrl: '',
  primaryThemeColor: '#2A0845',
  secondaryThemeColor: '#F59E0B',
  schoolHeaderTitle: 'VIPULANANTHA COLLEGE COLOMBO',
  schoolFooterText: '© 1920 - 2026 Vipulananda College. Ministry of Education Approved 1AB National School.',
};

// Initial Leadership
export const DEFAULT_LEADERS: SchoolLeader[] = [
  {
    id: 'lead-1',
    fullName: 'Dr. M. Sivalingam',
    photoUrl: '',
    designation: 'Principal',
    employeeId: 'EMP-PRIN-001',
    department: 'Executive Administration & Sciences',
    officialEmail: 'principal@vipulanantha.edu.lk',
    officialPhone: '+94 11 258 1921',
    status: 'Active',
    qualifications: 'Ph.D. in Education Management, M.Sc (Physics), B.Sc (Hons), SLEAS I',
    appointmentDate: '2018-01-01',
    orderIndex: 1,
  },
  {
    id: 'lead-2',
    fullName: 'Mrs. V. Fernando',
    photoUrl: '',
    designation: 'Vice Principal (Academic)',
    employeeId: 'EMP-VP-002',
    department: 'Academic Affairs & Curriculum',
    officialEmail: 'vp.academic@vipulanantha.edu.lk',
    officialPhone: '+94 11 258 1922',
    status: 'Active',
    qualifications: 'M.Ed (Curriculum Dev), B.Sc Chemistry, PGDE',
    appointmentDate: '2019-03-15',
    orderIndex: 2,
  },
  {
    id: 'lead-3',
    fullName: 'Mr. K. Rajendran',
    photoUrl: '',
    designation: 'Vice Principal (Administration)',
    employeeId: 'EMP-VP-003',
    department: 'Institutional Operations & Student Welfare',
    officialEmail: 'vp.admin@vipulanantha.edu.lk',
    officialPhone: '+94 11 258 1923',
    status: 'Active',
    qualifications: 'M.Sc (Ed Admin), B.A (Econ), SLEAS II',
    appointmentDate: '2020-01-10',
    orderIndex: 3,
  },
  {
    id: 'lead-4',
    fullName: 'Mrs. Selvi Balasubramaniam',
    photoUrl: '',
    designation: 'Section Head (Senior Secondary)',
    employeeId: 'EMP-SEC-004',
    department: 'G.C.E. O/L Section (Grades 10 - 11)',
    officialEmail: 'ol.head@vipulanantha.edu.lk',
    officialPhone: '+94 11 258 1924',
    status: 'Active',
    qualifications: 'B.Sc (Mathematics), PGDE (Open University)',
    appointmentDate: '2021-02-01',
    orderIndex: 4,
  },
  {
    id: 'lead-5',
    fullName: 'Mrs. R. Jeyanthi',
    photoUrl: '',
    designation: 'Senior Student Welfare Officer',
    employeeId: 'EMP-WEL-005',
    department: 'Safeguarding & Female Welfare Desk',
    officialEmail: 'cpo@vipulanantha.edu.lk',
    officialPhone: '+94 11 258 1930',
    status: 'Active',
    qualifications: 'M.A (Psychology & Guidance), Dip. in Child Safeguarding',
    appointmentDate: '2021-06-01',
    orderIndex: 5,
  },
];

// Initial Safety Settings
export const DEFAULT_SAFETY_SETTINGS: ProtectionSafetySettings = {
  emergencySosEnabled: true,
  confidentialReportingEnabled: true,
  anonymousReportingEnabled: true,
  bullyingReportingEnabled: true,
  harassmentReportingEnabled: true,
  studentWelfareRequestsEnabled: true,
  femaleStaffSupportRequestEnabled: true,
  childProtectionOfficerId: 'lead-5',
  deputyCpoId: 'lead-2',
  studentWelfareOfficerId: 'lead-5',
  femaleStudentWelfareOfficerId: 'lead-5',
  schoolCounsellorId: 'lead-5',
  schoolNurseId: 'lead-1',
  safetyCoordinatorId: 'lead-3',
};

// Initial Protection Cases
export const DEFAULT_PROTECTION_CASES: ConfidentialProtectionCase[] = [
  {
    id: 'case-101',
    caseNumber: 'SAFE-2026-001',
    incidentType: 'Female Student Safety Concern',
    targetGender: 'Female Student',
    severity: 'Medium',
    status: 'Support Provided',
    reportedDate: '2026-08-10',
    studentAdmissionNo: 'ST-2024-089',
    studentGrade: 'Grade 11-A',
    description:
      'Female student requested dedicated counselling support regarding bus travel commute safety. Safe travel buddy coordinated with parent approval.',
    assignedOfficer: 'Mrs. R. Jeyanthi (Child Protection Officer)',
    confidentialityLevel: 'Strictly Restricted (CPO Only)',
    resolutionNotes: 'Assigned safe school transport buddy network. Parent updated and verified.',
    lastUpdated: '2026-08-12',
  },
  {
    id: 'case-102',
    caseNumber: 'SAFE-2026-002',
    incidentType: 'Bullying & Harassment',
    targetGender: 'All Students',
    severity: 'Low',
    status: 'Resolved & Closed',
    reportedDate: '2026-08-04',
    studentAdmissionNo: 'ST-2023-142',
    studentGrade: 'Grade 8-B',
    description:
      'Minor verbal disagreement during inter-house sports practice. Peer mediation conducted.',
    assignedOfficer: 'Mr. K. Rajendran (Discipline Committee)',
    confidentialityLevel: 'Leadership Level',
    resolutionNotes: 'Peer mediation successful. Mutual apology and sportsman pledge signed.',
    lastUpdated: '2026-08-06',
  },
];

// Initial Emergency Contacts
export const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'em-1',
    name: 'College Emergency Action Desk',
    designation: 'School Emergency Hotline',
    phone: '+94 11 258 1999',
    email: 'sos@vipulanantha.edu.lk',
    availability: '24/7 Hotline',
    priority: 'Critical',
    isRestricted: false,
  },
  {
    id: 'em-2',
    name: 'Dr. M. Sivalingam (Principal)',
    designation: 'Principal Office Direct',
    phone: '+94 77 123 4567',
    email: 'principal.direct@vipulanantha.edu.lk',
    availability: 'On-Call Emergency',
    priority: 'Critical',
    isRestricted: false,
  },
  {
    id: 'em-3',
    name: 'Mrs. R. Jeyanthi (CPO)',
    designation: 'Child Protection Officer',
    phone: '+94 77 987 6543',
    email: 'cpo.hotline@vipulanantha.edu.lk',
    availability: '24/7 Hotline',
    priority: 'Critical',
    isRestricted: false,
  },
  {
    id: 'em-4',
    name: 'Female Student Safety Desk',
    designation: 'Female Student Support Line',
    phone: '+94 11 258 1935',
    email: 'girls.welfare@vipulanantha.edu.lk',
    availability: 'School Hours (07:00 - 16:00)',
    priority: 'High',
    isRestricted: false,
  },
  {
    id: 'em-5',
    name: 'Colombo South Teaching Hospital (Kalubowila)',
    designation: 'Medical Clinic / Nurse',
    phone: '+94 11 276 3066',
    email: 'csth@health.gov.lk',
    availability: '24/7 Hotline',
    priority: 'Critical',
    isRestricted: false,
  },
  {
    id: 'em-6',
    name: 'Wellawatte Police Station',
    designation: 'Local Police Post (Bambalapitiya/Wellawatte)',
    phone: '+94 11 258 8212',
    email: 'oic.wellawatte@police.lk',
    availability: '24/7 Hotline',
    priority: 'High',
    isRestricted: false,
  },
];

// Initial Health & Welfare Info
export const DEFAULT_HEALTH_WELFARE: HealthWelfareInfo = {
  infirmaryLocation: 'Ground Floor, Swami Vipulananda Memorial Wing (Room G-04)',
  nurseOnDuty: 'Mrs. Kamala Wickramasinghe (Registered School Nurse)',
  nurseContact: '+94 11 258 1940 (Ext 14)',
  doctorVisits: 'Weekly on Tuesdays & Thursdays (09:00 - 12:00)',
  bedCapacity: 6,
  firstAidStations: [
    'Main Infirmary (Room G-04)',
    'Senior Science Laboratory Block',
    'Main Sports Pavilion & Gymnasium',
    'Primary Section Staff Room',
    'Junior Secondary Block (1st Floor)',
  ],
  counselorName: 'Mrs. R. Jeyanthi (Senior Counsellor & CPO)',
  counselorSchedule: 'Daily 08:00 - 14:00 (Private Consultation Room C-102)',
  dietaryCateringPolicy:
    'Ministry of Education certified hygienic vegetarian and standard meal canteen. Nut-allergy monitoring and clean RO filtered drinking water points in every floor.',
  specialNeedsSupport:
    'Ground floor wheelchair ramps, dedicated accessibility washrooms in all blocks, sensory quiet corner in Library.',
  femaleRestRoomLocation:
    'Saraswathi Block (1st Floor, Room S-108) with private sanitary care dispensary and hygiene facilities.',
};

// Initial Campus Facilities
export const DEFAULT_FACILITIES: CampusFacility[] = [
  {
    id: 'fac-1',
    name: 'Swami Vipulananda Memorial Auditorium & Cultural Hall',
    category: 'Administration',
    building: 'Main Heritage Block',
    floor: '1st & 2nd Floor',
    roomNumber: 'AUD-01',
    description:
      'Air-conditioned 1,200 seat heritage auditorium with acoustic stage, pro-audio lighting system, and dual green rooms.',
    safetyLevel: 'GREEN',
    responsibleStaff: 'Mr. K. Rajendran',
    capacity: 1200,
    features: ['Acoustic Soundproofing', 'Stage Lighting Rig', 'Dual Emergency Fire Exits', 'Surround Sound'],
  },
  {
    id: 'fac-2',
    name: 'Advanced Science Laboratory Complex (Physics, Chemistry, Bio)',
    category: 'Science & Computer Labs',
    building: 'Science & Technology Wing',
    floor: '2nd Floor',
    roomNumber: 'LAB-SCI-01',
    description:
      'Fully equipped National 1AB standard laboratory for A/L and O/L practical sciences with chemical fume hoods and eye-wash safety stations.',
    safetyLevel: 'GREEN',
    responsibleStaff: 'Mrs. V. Fernando (VP Academic)',
    capacity: 80,
    features: ['Chemical Fume Hoods', 'Eye Wash Stations', 'Gas Leak Sensors', 'CO2 Fire Extinguishers'],
  },
  {
    id: 'fac-3',
    name: 'Smart ICT Innovation Lab & Digital Learning Hub',
    category: 'Science & Computer Labs',
    building: 'Technology Block',
    floor: '1st Floor',
    roomNumber: 'ICT-HUB-01',
    description:
      '60 high-performance workstations with gigabit fiber network, interactive smart boards, and coding lab.',
    safetyLevel: 'GREEN',
    responsibleStaff: 'Mr. T. Saravanan (ICT Coordinator)',
    capacity: 60,
    features: ['High-speed Fiber', 'Interactive Smartboard', 'UPS Power Backup', 'Fire Suppression'],
  },
  {
    id: 'fac-4',
    name: 'Yazh Noolagam Heritage Library & Resource Centre',
    category: 'Library & Resources',
    building: 'Heritage Block',
    floor: 'Ground Floor',
    roomNumber: 'LIB-01',
    description:
      'Over 25,000 volumes across Tamil, English, and Sinhala literature, digital e-library stations, and silent study cubicles.',
    safetyLevel: 'GREEN',
    responsibleStaff: 'Mrs. P. Vigneswaran (Chief Librarian)',
    capacity: 150,
    features: ['RFID Book Tagging', 'Digital E-Reader Hub', 'Quiet Study Area', 'Ancient Palm Leaf Archives'],
  },
  {
    id: 'fac-5',
    name: 'Main Sports Complex, Cricket Pavilion & Athletics Turf',
    category: 'Sports & Recreation',
    building: 'College Grounds Complex',
    floor: 'Outdoor & Pavilion',
    roomNumber: 'SPORTS-01',
    description:
      'Full-size turf cricket pitch, basketball court, badminton hall, 400m running track, and modern pavilion.',
    safetyLevel: 'GREEN',
    responsibleStaff: 'Mr. S. Mahendran (Director of Physical Education)',
    capacity: 2500,
    features: ['Floodlit Courts', 'First Aid Station', 'Changing Rooms & Showers', 'Spectator Pavilion'],
  },
  {
    id: 'fac-6',
    name: 'Dedicated Female Student Welfare & Sanitary Care Lounge',
    category: 'Girls Facilities',
    building: 'Saraswathi Wing',
    floor: '1st Floor',
    roomNumber: 'S-108',
    description:
      'Secure, private resting room equipped with medical day-beds, feminine hygiene dispensing units, and direct access to Welfare Officer.',
    safetyLevel: 'GREEN',
    responsibleStaff: 'Mrs. R. Jeyanthi (Female Student Welfare Officer)',
    capacity: 20,
    features: ['Private Rest Beds', 'Hygiene Dispenser', 'Attached Private Restrooms', 'Intercom to CPO'],
  },
];

// Initial Policies
export const DEFAULT_POLICIES: SchoolPolicy[] = [
  {
    id: 'pol-1',
    name: 'Comprehensive Child Protection & Safeguarding Framework',
    category: 'Child Protection Policy',
    description:
      'Zero-tolerance policy on abuse, harassment, and neglect. Establishes mandatory reporting, clear escalation lines to CPO, and supportive welfare mechanisms.',
    version: '4.0',
    publishedDate: '2026-01-05',
    lastUpdated: '2026-08-15',
    status: 'Active • Enforced',
    updatedBy: 'Dr. M. Sivalingam (Principal)',
    fileUrl: '/policies/child-protection-2026.pdf',
    keyPoints: [
      'Zero-tolerance enforcement across physical, emotional, and digital domains.',
      'Mandatory incident logging within 24 hours of notification.',
      'Direct confidential reporting desk for female students.',
      'Quarterly safeguarding refresher training for 100% of staff members.',
    ],
  },
  {
    id: 'pol-2',
    name: 'Student Code of Conduct & Co-Educational Mutual Respect Charter',
    category: 'Student Code of Conduct',
    description:
      'Defines behavioral standards, mutual gender respect, classroom ethics, uniform protocols, and restorative disciplinary guidelines.',
    version: '5.2',
    publishedDate: '2025-12-20',
    lastUpdated: '2026-08-10',
    status: 'Active • Enforced',
    updatedBy: 'Discipline & Welfare Council',
    fileUrl: '/policies/student-conduct-charter.pdf',
    keyPoints: [
      'Mandatory adherence to College uniform, punctual arrival before 07:30 AM.',
      'Cultivation of gender equality, courtesy, and mutual respect among boys and girls.',
      'Restorative mediation prioritized over punitive measures for minor infractions.',
    ],
  },
  {
    id: 'pol-3',
    name: 'Anti-Bullying & Cyber Safety Regulations',
    category: 'Anti-Bullying Policy',
    description:
      'Clear definitions of verbal, physical, and online bullying with swift investigation protocols and counseling intervention.',
    version: '3.1',
    publishedDate: '2026-02-01',
    lastUpdated: '2026-08-01',
    status: 'Active • Enforced',
    updatedBy: 'Mrs. R. Jeyanthi (CPO)',
    fileUrl: '/policies/anti-bullying-policy.pdf',
    keyPoints: [
      'Prohibition of unauthorized mobile devices during instructional hours.',
      'Strict penalties for cyber-bullying, non-consensual photography, or online defamation.',
      'Anonymous reporting hotline accessible 24/7 for all students and parents.',
    ],
  },
  {
    id: 'pol-4',
    name: 'Campus Safety, Disaster Management & Fire Evacuation Protocol',
    category: 'Emergency Safety Policy',
    description:
      'Standard Operating Procedures for fire alerts, inclement weather, emergency evacuations, and parent-child reunification.',
    version: '2.4',
    publishedDate: '2026-01-15',
    lastUpdated: '2026-07-20',
    status: 'Active • Enforced',
    updatedBy: 'Safety Coordinator & Civil Defense',
    fileUrl: '/policies/emergency-crisis-manual.pdf',
    keyPoints: [
      'Bi-annual unannounced fire and evacuation drills.',
      'Designated assembly points on Main Grounds (Assembly Zone Alpha & Beta).',
      'Automated parent SMS alerts in any emergency situation.',
    ],
  },
];

// Initial School System Config
export const DEFAULT_SYSTEM_CONFIG: SchoolSystemConfig = {
  activeAcademicYear: '2026',
  terms: [
    { id: 'term-1', name: 'Term 1 (First Term)', startDate: '2026-01-05', endDate: '2026-04-10', isActive: false },
    { id: 'term-2', name: 'Term 2 (Second Term)', startDate: '2026-04-27', endDate: '2026-08-21', isActive: true },
    { id: 'term-3', name: 'Term 3 (Third Term)', startDate: '2026-09-07', endDate: '2026-12-11', isActive: false },
  ],
  dailySchedule: {
    startTime: '07:30 AM',
    endTime: '01:30 PM',
    periodDuration: '40 Minutes',
    periodsPerDay: 8,
    intervalTime: '10:10 AM - 10:35 AM (25 Mins)',
  },
  passingMarks: 35,
  gradeScale: [
    { grade: 'A (Distinction)', minScore: 75, maxScore: 100, description: 'Outstanding Academic Mastery' },
    { grade: 'B (Very Good)', minScore: 65, maxScore: 74, description: 'Commendable Achievement' },
    { grade: 'C (Credit)', minScore: 50, maxScore: 64, description: 'Satisfactory Performance' },
    { grade: 'S (Simple Pass)', minScore: 35, maxScore: 49, description: 'Minimum Pass Standard' },
    { grade: 'F (Failure / Re-sit)', minScore: 0, maxScore: 34, description: 'Needs Targeted Intervention' },
  ],
};

// Initial Profile Audit Logs
export const DEFAULT_PROFILE_AUDIT_LOGS: SchoolProfileAuditLog[] = [
  {
    id: 'log-prof-1',
    timestamp: '2026-08-15T08:00:00.000Z',
    actorName: 'System Administrator',
    actorRole: 'SUPER_ADMIN',
    module: 'Institutional Profile',
    action: 'CREATE',
    details: 'Vipulananda College 1AB National Profile & Control Center Initialized',
    ipAddress: '192.168.1.10',
  },
  {
    id: 'log-prof-2',
    timestamp: '2026-08-16T09:30:15.000Z',
    actorName: 'Dr. M. Sivalingam',
    actorRole: 'PRINCIPAL',
    module: 'Policies',
    action: 'UPDATE',
    details: 'Ratified Child Protection & Safeguarding Framework v4.0',
    ipAddress: '192.168.1.12',
  },
  {
    id: 'log-prof-3',
    timestamp: '2026-08-17T07:15:22.000Z',
    actorName: 'System Administrator',
    actorRole: 'SUPER_ADMIN',
    module: 'Student Protection',
    action: 'UPDATE',
    details: 'Verified Female Staff Support & Anonymous Hotline Toggles Active',
    ipAddress: '192.168.1.10',
  },
];

// Local Storage Cache Helpers
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
  }
  return fallback;
}

function setLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('school_profile_updated', { detail: { key, data } }));
  } catch (e) {
    console.warn(`Error writing ${key} to storage:`, e);
  }
}

// ====================================================================
// SERVICE API METHODS
// ====================================================================

export const fetchFullSchoolProfile = async (): Promise<SchoolProfileData> => {
  const basicInfo = getLocal<SchoolBasicInfo>('basic_info', DEFAULT_BASIC_INFO);
  const branding = getLocal<SchoolBranding>('branding', DEFAULT_BRANDING);
  const leaders = getLocal<SchoolLeader[]>('leaders', DEFAULT_LEADERS);
  const protectionSafetySettings = getLocal<ProtectionSafetySettings>('safety', DEFAULT_SAFETY_SETTINGS);
  const confidentialProtectionCases = getLocal<ConfidentialProtectionCase[]>('cases', DEFAULT_PROTECTION_CASES);
  const emergencyContacts = getLocal<EmergencyContact[]>('emergency', DEFAULT_EMERGENCY_CONTACTS);
  const healthWelfareInfo = getLocal<HealthWelfareInfo>('health', DEFAULT_HEALTH_WELFARE);
  const campusFacilities = getLocal<CampusFacility[]>('facilities', DEFAULT_FACILITIES);
  const policies = getLocal<SchoolPolicy[]>('policies', DEFAULT_POLICIES);
  const systemConfig = getLocal<SchoolSystemConfig>('config', DEFAULT_SYSTEM_CONFIG);
  const auditLogs = getLocal<SchoolProfileAuditLog[]>('audit_logs', DEFAULT_PROFILE_AUDIT_LOGS);

  // Sync cloud settings & logo from Supabase across all devices
  try {
    const cloudSettings = await fetchSchoolSettings();
    if (cloudSettings && cloudSettings.logo_url && cloudSettings.logo_url.trim().length > 0) {
      branding.logoUrl = cloudSettings.logo_url;
      branding.loginPageLogoUrl = cloudSettings.logo_url;
      setLocal('branding', branding);
    }
  } catch (e) {
    // Continue
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: schoolDb } = await supabase.from('schools').select('*').limit(1).maybeSingle();
      if (schoolDb) {
        basicInfo.schoolName = schoolDb.school_name || basicInfo.schoolName;
        basicInfo.establishedYear = schoolDb.established_year || basicInfo.establishedYear;
        basicInfo.schoolType = schoolDb.school_type || basicInfo.schoolType;
        basicInfo.address = schoolDb.address || basicInfo.address;
        basicInfo.mainTelephone = schoolDb.telephone || basicInfo.mainTelephone;
        basicInfo.officialEmail = schoolDb.email || basicInfo.officialEmail;
        basicInfo.website = schoolDb.website || basicInfo.website;
        basicInfo.schoolMotto = schoolDb.motto || basicInfo.schoolMotto;
        if (schoolDb.logo_url && schoolDb.logo_url.trim().length > 0) {
          branding.logoUrl = schoolDb.logo_url;
          branding.loginPageLogoUrl = schoolDb.logo_url;
        }
      }
    } catch (e) {
      // Continue gracefully
    }

    try {
      const { data: brandingDb } = await supabase.from('school_branding').select('*').limit(1).maybeSingle();
      if (brandingDb) {
        if (brandingDb.logo_url && brandingDb.logo_url.trim().length > 0) {
          branding.logoUrl = brandingDb.logo_url;
          branding.loginPageLogoUrl = brandingDb.logo_url;
        }
        if (brandingDb.primary_color) branding.primaryThemeColor = brandingDb.primary_color;
        if (brandingDb.secondary_color) branding.secondaryThemeColor = brandingDb.secondary_color;
        if (brandingDb.header_title) branding.schoolHeaderTitle = brandingDb.header_title;
        if (brandingDb.footer_text) branding.schoolFooterText = brandingDb.footer_text;
      }
    } catch (e) {
      // Continue gracefully
    }
  }

  return {
    basicInfo,
    branding,
    leaders,
    protectionSafetySettings,
    confidentialProtectionCases,
    emergencyContacts,
    healthWelfareInfo,
    campusFacilities,
    policies,
    systemConfig,
    auditLogs,
  };
};

export const fetchSchoolProfileData = fetchFullSchoolProfile;

export const recordProfileAuditLog = async (log: {
  actorName: string;
  actorRole: string;
  module: string;
  action: string;
  details: string;
  oldValues?: any;
  newValues?: any;
}) => {
  const newLog: SchoolProfileAuditLog = {
    id: `log-prof-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    actorName: log.actorName || 'Administrator',
    actorRole: log.actorRole || 'SUPER_ADMIN',
    module: log.module,
    action: log.action,
    details: log.details,
    ipAddress: '192.168.1.10',
    oldValues: log.oldValues,
    newValues: log.newValues,
  };

  const currentLogs = getLocal<SchoolProfileAuditLog[]>('audit_logs', DEFAULT_PROFILE_AUDIT_LOGS);
  setLocal('audit_logs', [newLog, ...currentLogs]);

  if (isSupabaseConfigured && supabase) {
    await resilientUpsert('audit_logs', {
      id: newLog.id,
      user_name: newLog.actorName,
      role: newLog.actorRole,
      action: newLog.action,
      module: newLog.module,
      record: newLog.details,
      created_at: newLog.timestamp,
    });
  }
};

export const updateSchoolBasicInfo = async (
  info: SchoolBasicInfo,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const prev = getLocal<SchoolBasicInfo>('basic_info', DEFAULT_BASIC_INFO);
  setLocal('basic_info', info);

  await recordProfileAuditLog({
    actorName,
    actorRole,
    module: 'Basic Information',
    action: 'UPDATE',
    details: `Updated basic info for ${info.schoolName} (Est. ${info.establishedYear}, ${info.schoolType})`,
    oldValues: prev,
    newValues: info,
  });

  if (isSupabaseConfigured && supabase) {
    await resilientUpsert('schools', {
      id: info.id || 'vipulanantha-school-profile',
      school_name: info.schoolName,
      short_name: info.schoolShortName,
      school_code: info.schoolCode,
      established_year: info.establishedYear,
      school_type: info.schoolType,
      category: info.schoolCategory,
      address: info.address,
      city: info.city,
      province: info.province,
      district: info.district,
      education_zone: info.educationZone,
      education_division: info.educationDivision,
      postal_code: info.postalCode,
      telephone: info.mainTelephone,
      email: info.officialEmail,
      website: info.website,
      motto: info.schoolMotto,
      description: info.schoolDescription,
      updated_at: new Date().toISOString(),
    });
  }
};

export const saveBasicInfo = updateSchoolBasicInfo;

export const updateSchoolBranding = async (
  branding: SchoolBranding,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const prev = getLocal<SchoolBranding>('branding', DEFAULT_BRANDING);
  setLocal('branding', branding);

  // Synchronize logo across school settings so all components & devices reflect it
  if (branding.logoUrl) {
    try {
      await applySchoolLogoUrl(branding.logoUrl);
    } catch (e) {
      // Continue
    }
  }

  await recordProfileAuditLog({
    actorName,
    actorRole,
    module: 'Branding',
    action: 'UPDATE',
    details: `Updated institutional branding & colors (Primary: ${branding.primaryThemeColor})`,
    oldValues: prev,
    newValues: branding,
  });

  if (isSupabaseConfigured && supabase) {
    await resilientUpsert('school_branding', {
      id: 'primary-branding',
      school_name: branding.schoolName,
      logo_url: branding.logoUrl,
      favicon_url: branding.faviconUrl,
      motto: branding.schoolMotto,
      primary_color: branding.primaryThemeColor,
      secondary_color: branding.secondaryThemeColor,
      header_title: branding.schoolHeaderTitle,
      footer_text: branding.schoolFooterText,
      updated_at: new Date().toISOString(),
    });
  }
};

export const saveBranding = updateSchoolBranding;

export const saveSchoolLeader = async (
  leader: SchoolLeader,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const list = getLocal<SchoolLeader[]>('leaders', DEFAULT_LEADERS);
  const exists = list.some((l) => l.id === leader.id);
  const updated = exists ? list.map((l) => (l.id === leader.id ? leader : l)) : [leader, ...list];
  setLocal('leaders', updated);

  await recordProfileAuditLog({
    actorName,
    actorRole,
    module: 'Leadership',
    action: exists ? 'UPDATE' : 'CREATE',
    details: `${exists ? 'Updated' : 'Added'} leadership member ${leader.fullName} (${leader.designation})`,
    newValues: leader,
  });
};

export const saveLeadershipMember = saveSchoolLeader;

export const deleteSchoolLeader = async (
  id: string,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const list = getLocal<SchoolLeader[]>('leaders', DEFAULT_LEADERS);
  const target = list.find((l) => l.id === id);
  const updated = list.filter((l) => l.id !== id);
  setLocal('leaders', updated);

  if (target) {
    await recordProfileAuditLog({
      actorName,
      actorRole,
      module: 'Leadership',
      action: 'DELETE',
      details: `Removed leadership member ${target.fullName} (${target.designation})`,
      oldValues: target,
    });
  }
};

export const deleteLeadershipMember = deleteSchoolLeader;

export const updateProtectionSafetySettings = async (
  settings: ProtectionSafetySettings,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const prev = getLocal<ProtectionSafetySettings>('safety', DEFAULT_SAFETY_SETTINGS);
  setLocal('safety', settings);

  await recordProfileAuditLog({
    actorName,
    actorRole,
    module: 'Student Protection',
    action: 'UPDATE',
    details: 'Updated Student Protection & Safeguarding Framework settings',
    oldValues: prev,
    newValues: settings,
  });
};

export const saveSafetySettings = updateProtectionSafetySettings;

export const saveConfidentialProtectionCase = async (
  c: ConfidentialProtectionCase,
  actorName: string = 'Child Protection Officer',
  actorRole: string = 'CHILD_PROTECTION_OFFICER'
) => {
  const list = getLocal<ConfidentialProtectionCase[]>('cases', DEFAULT_PROTECTION_CASES);
  const exists = list.some((item) => item.id === c.id);
  const updated = exists ? list.map((item) => (item.id === c.id ? c : item)) : [c, ...list];
  setLocal('cases', updated);

  await recordProfileAuditLog({
    actorName,
    actorRole,
    module: 'Student Protection',
    action: exists ? 'UPDATE' : 'CREATE',
    details: `${exists ? 'Updated' : 'Logged'} protection case ${c.caseNumber} (${c.incidentType}, Severity: ${c.severity})`,
    newValues: { caseNumber: c.caseNumber, status: c.status, severity: c.severity },
  });
};

export const saveProtectionCase = saveConfidentialProtectionCase;

export const saveEmergencyContact = async (
  contact: EmergencyContact,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const list = getLocal<EmergencyContact[]>('emergency', DEFAULT_EMERGENCY_CONTACTS);
  const exists = list.some((item) => item.id === contact.id);
  const updated = exists ? list.map((item) => (item.id === contact.id ? contact : item)) : [contact, ...list];
  setLocal('emergency', updated);

  await recordProfileAuditLog({
    actorName,
    actorRole,
    module: 'Emergency Contacts',
    action: exists ? 'UPDATE' : 'CREATE',
    details: `${exists ? 'Updated' : 'Added'} emergency contact ${contact.name} (${contact.phone})`,
    newValues: contact,
  });
};

export const deleteEmergencyContact = async (
  id: string,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const list = getLocal<EmergencyContact[]>('emergency', DEFAULT_EMERGENCY_CONTACTS);
  const target = list.find((c) => c.id === id);
  const updated = list.filter((c) => c.id !== id);
  setLocal('emergency', updated);

  if (target) {
    await recordProfileAuditLog({
      actorName,
      actorRole,
      module: 'Emergency Contacts',
      action: 'DELETE',
      details: `Removed emergency contact ${target.name} (${target.designation})`,
      oldValues: target,
    });
  }
};

export const updateHealthWelfareInfo = async (
  info: HealthWelfareInfo,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const prev = getLocal<HealthWelfareInfo>('health', DEFAULT_HEALTH_WELFARE);
  setLocal('health', info);

  await recordProfileAuditLog({
    actorName,
    actorRole,
    module: 'Health & Welfare',
    action: 'UPDATE',
    details: 'Updated Infirmary, Medical Clinic & Student Welfare Desk configurations',
    oldValues: prev,
    newValues: info,
  });
};

export const saveCampusFacility = async (
  facility: CampusFacility,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const list = getLocal<CampusFacility[]>('facilities', DEFAULT_FACILITIES);
  const exists = list.some((f) => f.id === facility.id);
  const updated = exists ? list.map((f) => (f.id === facility.id ? facility : f)) : [facility, ...list];
  setLocal('facilities', updated);

  await recordProfileAuditLog({
    actorName,
    actorRole,
    module: 'Campus Facilities',
    action: exists ? 'UPDATE' : 'CREATE',
    details: `${exists ? 'Updated' : 'Added'} campus facility ${facility.name} (${facility.building})`,
    newValues: facility,
  });
};

export const deleteCampusFacility = async (
  id: string,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const list = getLocal<CampusFacility[]>('facilities', DEFAULT_FACILITIES);
  const target = list.find((f) => f.id === id);
  const updated = list.filter((f) => f.id !== id);
  setLocal('facilities', updated);

  if (target) {
    await recordProfileAuditLog({
      actorName,
      actorRole,
      module: 'Campus Facilities',
      action: 'DELETE',
      details: `Removed campus facility ${target.name}`,
      oldValues: target,
    });
  }
};

export const saveSchoolPolicy = async (
  policy: SchoolPolicy,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const list = getLocal<SchoolPolicy[]>('policies', DEFAULT_POLICIES);
  const exists = list.some((p) => p.id === policy.id);
  const updated = exists ? list.map((p) => (p.id === policy.id ? policy : p)) : [policy, ...list];
  setLocal('policies', updated);

  await recordProfileAuditLog({
    actorName,
    actorRole,
    module: 'Policies',
    action: exists ? 'UPDATE' : 'CREATE',
    details: `${exists ? 'Updated' : 'Published'} policy ${policy.name} (v${policy.version})`,
    newValues: policy,
  });
};

export const deleteSchoolPolicy = async (
  id: string,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const list = getLocal<SchoolPolicy[]>('policies', DEFAULT_POLICIES);
  const target = list.find((p) => p.id === id);
  const updated = list.filter((p) => p.id !== id);
  setLocal('policies', updated);

  if (target) {
    await recordProfileAuditLog({
      actorName,
      actorRole,
      module: 'Policies',
      action: 'DELETE',
      details: `Archived/Deleted policy document ${target.name}`,
      oldValues: target,
    });
  }
};

export const updateSchoolSystemConfig = async (
  config: SchoolSystemConfig,
  actorName: string = 'Administrator',
  actorRole: string = 'SUPER_ADMIN'
) => {
  const prev = getLocal<SchoolSystemConfig>('config', DEFAULT_SYSTEM_CONFIG);
  setLocal('config', config);

  await recordProfileAuditLog({
    actorName,
    actorRole,
    module: 'School Configuration',
    action: 'UPDATE',
    details: `Updated school system configuration (Academic Year ${config.activeAcademicYear})`,
    oldValues: prev,
    newValues: config,
  });
};

export const saveSchoolConfiguration = updateSchoolSystemConfig;
