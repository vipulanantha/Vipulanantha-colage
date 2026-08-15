import React, { useState } from 'react';
import { UserSession } from '../types';
import { SchoolLogo } from './SchoolLogo';
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
} from 'lucide-react';

interface DashboardPreviewProps {
  session: UserSession;
  onLogout: () => void;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ session, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timetable' | 'attendance' | 'announcements'>('overview');

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
                  SMS v4.2
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-purple-200 font-tamil truncate">
                நாளும் பயில்வோம் நற்பணி புரிவோம்
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center bg-white/10 rounded-full px-3 py-1 text-xs text-purple-100 border border-white/10">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              <span>Academic Term 2 • 2026</span>
            </div>

            <button
              className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-full transition-colors relative touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Notifications"
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
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-5 sm:p-8 relative overflow-hidden shadow-xl border border-amber-500/20">
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
            <SchoolLogo size="intro" showGlowRing={false} />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2 sm:mb-3">
              ESTD 1920 • Colombo 06
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold font-cinzel text-white mb-1.5 sm:mb-2">
              Welcome, {session.name}
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
              Logged in to the <strong className="text-amber-300">{session.roleTitle}</strong> ({session.departmentOrGrade}). All academic schedules, grade sheets, attendance tracking, and administrative circulars are active.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-purple-100 flex items-center space-x-1.5 text-[11px] sm:text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Last session: Today at {session.lastLogin}</span>
              </span>
              <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-purple-100 flex items-center space-x-1.5 text-[11px] sm:text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>System: Optimal</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">96.8%</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 sm:mt-1 truncate">✓ Term Target Achieved</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Courses</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-50 text-purple-900 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">8 Subjects</div>
            <div className="text-[10px] sm:text-[11px] text-purple-800 font-medium mt-0.5 sm:mt-1 truncate">National Curriculum 2026</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Assessments</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">Mid-Term II</div>
            <div className="text-[10px] sm:text-[11px] text-blue-600 font-medium mt-0.5 sm:mt-1 truncate">Commencing Aug 25</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">College House</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-700">Royal Gold</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">Inter-House: 1st Place</div>
          </div>
        </div>

        {/* Content Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Academic Schedule (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 font-cinzel">Today's Academic Schedule</h2>
                <p className="text-[11px] sm:text-xs text-slate-500">Colombo Campus • Timetable Schedule for Today</p>
              </div>
              <span className="self-start sm:self-auto text-[11px] sm:text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-900 rounded-md border border-purple-100">
                Period 4 In Progress
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                { time: '08:00 - 08:45 AM', subject: 'Tamil Literature & Grammar', teacher: 'Mrs. S. Navaratnam', room: 'Hall 3A', status: 'Completed' },
                { time: '08:45 - 09:30 AM', subject: 'Pure Mathematics', teacher: 'Mr. K. Rajendran', room: 'Hall 3A', status: 'Completed' },
                { time: '09:30 - 10:15 AM', subject: 'Combined Science & Lab', teacher: 'Dr. M. Sivalingam', room: 'Science Lab 2', status: 'In Progress' },
                { time: '10:45 - 11:30 AM', subject: 'English Language & Lit', teacher: 'Mrs. V. Fernando', room: 'Hall 3A', status: 'Upcoming' },
                { time: '11:30 - 12:15 PM', subject: 'Information & Comms Tech', teacher: 'Mr. T. Krishan', room: 'Computer Lab A', status: 'Upcoming' },
              ].map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm gap-2">
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
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 font-cinzel">College Circulars</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Official notices from Principal's Desk</p>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-purple-900 uppercase">Academic Notice</span>
                  <span className="text-[10px] text-slate-400">14 Aug 2026</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800">Term 2 Exam Timetable Released</h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Students and teachers can download the finalized schedule from the Examinations portal.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">Cultural & Heritage</span>
                  <span className="text-[10px] text-slate-400">12 Aug 2026</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800">Swami Vipulananda Remembrance Day</h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Special assembly and literary celebrations planned for next Friday at the College Auditorium.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase">Sports Meet</span>
                  <span className="text-[10px] text-slate-400">10 Aug 2026</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800">Inter-House Athletics Trials</h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Track and field trials will commence after school hours at College Grounds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p className="font-cinzel text-slate-700 font-semibold">VIPULANANTHA COLLEGE COLOMBO • ESTD 1920</p>
        <p className="text-[11px] text-slate-400 mt-0.5">School Management System • Secure Academic Session</p>
      </footer>
    </div>
  );
};
