import React from 'react';
import { SchoolBasicInfo, SchoolBranding, SchoolLeader } from '../../types/schoolProfile';
import { SchoolLogo } from '../SchoolLogo';
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  Globe,
  MapPin,
  ShieldCheck,
  Award,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Edit3,
  Palette,
  Settings,
  PhoneCall,
  FileText,
  Building,
  HeartPulse,
  Lock,
} from 'lucide-react';

interface ProfileOverviewTabProps {
  basicInfo: SchoolBasicInfo;
  branding: SchoolBranding;
  leaders: SchoolLeader[];
  totalStudents?: number;
  totalTeachers?: number;
  totalStaff?: number;
  totalClasses?: number;
  totalGrades?: number;
  canEdit?: boolean;
  onNavigateTab: (tabId: string) => void;
}

export const ProfileOverviewTab: React.FC<ProfileOverviewTabProps> = ({
  basicInfo,
  branding,
  leaders,
  totalStudents = 1450,
  totalTeachers = 84,
  totalStaff = 112,
  totalClasses = 38,
  totalGrades = 13,
  canEdit = true,
  onNavigateTab,
}) => {
  const principal = leaders.find((l) => l.designation === 'Principal') || leaders[0];
  const academicVP = leaders.find((l) => l.designation.includes('Academic')) || leaders[1];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero School Identity Card */}
      <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        {/* Background decorative watermark */}
        <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
          <SchoolLogo size="xl" />
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8 relative z-10">
          {/* Official Emblem */}
          <div className="shrink-0 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center">
            <SchoolLogo size="lg" showGlowRing={true} id="overview-hero-logo" />
            <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-amber-300">
              ESTD {basicInfo.establishedYear}
            </span>
          </div>

          {/* School Details */}
          <div className="flex-1 text-center lg:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-400/20 border border-amber-400/30 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{basicInfo.schoolCategory} • {basicInfo.schoolType}</span>
              </div>
              {canEdit && (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 rounded-full text-[11px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Edit Access Granted</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-cinzel tracking-wide text-white drop-shadow-sm">
              {basicInfo.schoolName}
            </h1>

            <div className="text-sm sm:text-base font-tamil text-amber-200 font-semibold italic">
              "{basicInfo.schoolMottoTamil}"
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {basicInfo.schoolDescription}
            </p>

            {/* Meta Tags Row */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{basicInfo.address}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{basicInfo.mainTelephone}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{basicInfo.officialEmail}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
                <Globe className="w-4 h-4 text-purple-300 shrink-0" />
                <span>{basicInfo.website}</span>
              </div>
            </div>
          </div>

          {/* Status & Action Controls */}
          <div className="shrink-0 flex flex-col items-center lg:items-end gap-3">
            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center space-x-2 text-emerald-300 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{basicInfo.status}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Academic Cycle: <strong className="text-white">{basicInfo.currentAcademicYear}</strong>
            </div>

            {canEdit && (
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full mt-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('basic_info')}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit School Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('branding')}
                  className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-300" />
                  <span>Branding & Logo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Quick Editing Action Bar (When User is Admin / Principal) */}
      {canEdit && (
        <div className="bg-white rounded-2xl border border-purple-200 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2 text-purple-950 font-bold text-xs uppercase tracking-wider">
              <Edit3 className="w-4 h-4 text-purple-700" />
              <span>Administrator Profile Management Hub</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Click any section below to directly edit and update institutional records
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {[
              { id: 'basic_info', label: 'Basic Info', icon: Building2, desc: 'Name, Address & Code' },
              { id: 'branding', label: 'Branding', icon: Palette, desc: 'Emblem & Theme Colors' },
              { id: 'leadership', label: 'Leadership', icon: Award, desc: 'Principal & Deans' },
              { id: 'protection', label: 'Child Protection', icon: ShieldCheck, desc: 'CPO & Safeguards' },
              { id: 'emergency', label: 'Emergency', icon: PhoneCall, desc: 'Hotlines & Police' },
              { id: 'health_welfare', label: 'Medical & Bay', icon: HeartPulse, desc: 'Infirmary & Nurse' },
              { id: 'facilities', label: 'Facilities', icon: Building, desc: 'Labs & Auditorium' },
              { id: 'configuration', label: 'System Config', icon: Settings, desc: 'Terms & Pass Marks' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  className="p-3 bg-purple-50/60 hover:bg-purple-100/80 rounded-xl border border-purple-200/70 text-left flex flex-col justify-between transition-all group cursor-pointer hover:shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className="w-4 h-4 text-purple-900 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-purple-800">Edit &rarr;</span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900 leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-purple-900 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students</span>
            <div className="p-2 bg-purple-50 rounded-xl">
              <Users className="w-4 h-4 text-purple-900" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalStudents.toLocaleString()}</div>
          <div className="text-[11px] font-semibold text-purple-900 mt-1">Co-Ed (Boys & Girls)</div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teachers</span>
            <div className="p-2 bg-amber-50 rounded-xl">
              <GraduationCap className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalTeachers}</div>
          <div className="text-[11px] font-semibold text-amber-700 mt-1">Academic Staff</div>
        </div>

        {/* Total Staff */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Staff</span>
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalStaff}</div>
          <div className="text-[11px] font-semibold text-indigo-700 mt-1">Academic & Support</div>
        </div>

        {/* Total Classes */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Classes</span>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalClasses}</div>
          <div className="text-[11px] font-semibold text-emerald-700 mt-1">Active Classrooms</div>
        </div>

        {/* Total Grades */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grades</span>
            <div className="p-2 bg-sky-50 rounded-xl">
              <BookOpen className="w-4 h-4 text-sky-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalGrades}</div>
          <div className="text-[11px] font-semibold text-sky-700 mt-1">Grade 1 to 13 (A/L)</div>
        </div>

        {/* Academic Year */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Year</span>
            <div className="p-2 bg-rose-50 rounded-xl">
              <Calendar className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{basicInfo.currentAcademicYear}</div>
          <div className="text-[11px] font-semibold text-rose-700 mt-1">Active Academic Term 2</div>
        </div>
      </div>

      {/* Lower Dashboard Section: Leadership Spotlight & Mixed School Safeguards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Leadership Highlight */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-cinzel font-bold text-base text-slate-900">Institutional Leadership</h3>
            </div>
            <button
              onClick={() => onNavigateTab('leadership')}
              className="text-xs font-bold text-purple-900 hover:text-purple-950 underline cursor-pointer"
            >
              Manage Leadership &rarr;
            </button>
          </div>

          <div className="space-y-4">
            {principal && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-purple-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                  {principal.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-900">
                    {principal.designation}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{principal.fullName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{principal.qualifications}</p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-600 mt-2">
                    <span>{principal.officialEmail}</span>
                    <span>•</span>
                    <span>{principal.officialPhone}</span>
                  </div>
                </div>
              </div>
            )}

            {academicVP && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-indigo-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                  {academicVP.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    {academicVP.designation}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{academicVP.fullName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{academicVP.qualifications}</p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-600 mt-2">
                    <span>{academicVP.officialEmail}</span>
                    <span>•</span>
                    <span>{academicVP.officialPhone}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Mixed-School Co-Ed Safety & Welfare Framework */}
        <div className="lg:col-span-6 bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-2xl border border-purple-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-purple-950 font-bold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-purple-800" />
              <span>Mixed-School Safeguarding & Welfare</span>
            </div>
            <h3 className="font-cinzel font-extrabold text-lg text-purple-950">
              Co-Educational Student Protection Center
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              As an established co-educational institution with over 1,400 boys and girls, Vipulananda College enforces zero-tolerance safeguarding, confidential multi-tier reporting, and dedicated female staff welfare support.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="bg-white p-3 rounded-xl border border-purple-200/80 shadow-2xs">
                <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Child Protection Officers</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Designated CPO & Deputy CPO active on campus daily.
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-200/80 shadow-2xs">
                <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs">
                  <HeartHandshake className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Female Welfare Helpline</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Direct, confidential helpline for female students and staff.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 flex items-center justify-between border-t border-purple-200/60 mt-4">
            <span className="text-xs font-semibold text-purple-900">
              Emergency SOS & Confidential Reports Active
            </span>
            <button
              onClick={() => onNavigateTab('protection')}
              className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
            >
              Open Safety Center &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
