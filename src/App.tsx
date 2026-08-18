import React, { useState, useEffect } from 'react';
import { UserSession } from './types';
import { SchoolLogo } from './components/SchoolLogo';
import { LoginCard } from './components/LoginCard';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { HelpSupportModal } from './components/HelpSupportModal';
import { DashboardPreview } from './components/DashboardPreview';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import {
  RotateCcw,
  Languages,
  Shield,
  BookOpen,
  MapPin,
  Sparkles,
  Phone,
  Info,
} from 'lucide-react';

export default function App() {
  // Animation stage:
  // 0: logo entry (0 - 800ms)
  // 1: text reveal (800ms - 1500ms)
  // 2: card slide/fade in & full UI (1500ms - 2000ms+)
  const [animStage, setAnimStage] = useState<0 | 1 | 2>(0);
  const [isAnimationCompleted, setIsAnimationCompleted] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [lang, setLang] = useState<'en' | 'ta'>('en');

  // Trigger initial quick intro animation
  useEffect(() => {
    runIntroAnimation();
  }, []);

  const runIntroAnimation = () => {
    setAnimStage(0);
    setIsAnimationCompleted(false);

    // Step 1: Text reveal quickly after 200ms
    const t1 = setTimeout(() => {
      setAnimStage(1);
    }, 200);

    // Step 2: Card reveal quickly after 400ms
    const t2 = setTimeout(() => {
      setAnimStage(2);
      setIsAnimationCompleted(true);
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
  };

  const handleLogout = () => {
    setUserSession(null);
  };

  // If user is logged in, show the comprehensive School Management Dashboard
  if (userSession) {
    return <DashboardPreview session={userSession} onLogout={handleLogout} />;
  }

  return (
    <div
      id="school-portal-root"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/50 to-blue-50/40 text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-purple-900 selection:text-amber-200"
    >
      {/* Background Decorative Ambient Blobs & Subtle Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Subtle geometric grid background pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(#2A0845 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top Announcement Bar */}
      <AnnouncementTicker />

      {/* Header Controls (Language Toggle, Replay Animation, Help) */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-purple-900/5 px-2.5 py-1 rounded-full border border-purple-900/10">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold tracking-wider text-purple-950 uppercase font-cinzel truncate">
              Colombo Campus
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* Language Switcher */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white active:bg-slate-100 text-purple-950 text-xs font-semibold border border-purple-200/80 shadow-xs transition-all cursor-pointer min-h-[38px] touch-manipulation"
            title="Toggle Language"
          >
            <Languages className="w-3.5 h-3.5 text-purple-700 shrink-0" />
            <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Replay Intro Animation Button */}
          <button
            id="replay-animation-btn"
            onClick={runIntroAnimation}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white active:bg-slate-100 text-purple-950 text-xs font-semibold border border-purple-200/80 shadow-xs transition-all cursor-pointer min-h-[38px] touch-manipulation"
            title="Replay Entrance Animation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">Replay Intro</span>
          </button>

          {/* Support Helpline Trigger */}
          <button
            id="header-support-btn"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-950 active:bg-purple-900 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer min-h-[38px] touch-manipulation"
          >
            <Phone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="hidden md:inline">Contact Office</span>
            <span className="md:hidden">Help</span>
          </button>
        </div>
      </header>

      {/* Main Stage Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8">
        {/* ============================================================ */}
        {/* INITIAL SPLASH / INTRO ANIMATION SCREEN (First ~1.6 seconds) */}
        {/* ============================================================ */}
        {animStage < 2 && (
          <div
            id="intro-animation-screen"
            className="fixed inset-0 z-40 bg-gradient-to-br from-[#2A0845] via-[#1E1138] to-[#0F2C59] flex flex-col items-center justify-center text-center p-4 sm:p-6 transition-opacity duration-700"
          >
            {/* Ambient animated light background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-gradient-to-tr from-amber-500/15 via-purple-600/20 to-blue-500/20 blur-3xl animate-pulse" />
            </div>

            {/* School Logo Center Piece */}
            <div className="relative animate-logo-intro mb-4 sm:mb-6">
              <SchoolLogo size="intro" showGlowRing={true} id="intro-school-logo" />
            </div>

            {/* School Name & ESTD 1920 Reveal (after ~850ms) */}
            <div
              className={`transition-all duration-700 transform px-2 ${
                animStage >= 1
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6 pointer-events-none'
              }`}
            >
              <h1 className="text-lg sm:text-3xl md:text-4xl font-extrabold font-cinzel tracking-wider text-white drop-shadow-md leading-tight">
                VIPULANANTHA COLLEGE COLOMBO
              </h1>

              <div className="flex items-center justify-center space-x-3 my-2">
                <span className="h-0.5 w-8 sm:w-12 bg-gradient-to-r from-transparent to-amber-400" />
                <span className="text-xs sm:text-sm font-semibold tracking-widest text-amber-300 font-sans">
                  ESTD 1920
                </span>
                <span className="h-0.5 w-8 sm:w-12 bg-gradient-to-l from-transparent to-amber-400" />
              </div>

              {/* Official Tamil Motto */}
              <div className="text-xs sm:text-base font-tamil text-amber-200/90 tracking-wide mt-1">
                நாளும் பயில்வோம் நற்பணி புரிவோம்
              </div>

              <div className="mt-3.5 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-1.5 rounded-full bg-white/10 text-purple-200 text-xs tracking-wider border border-white/15 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300 animate-spin shrink-0" />
                <span className="text-[11px] sm:text-xs">Loading School Portal...</span>
              </div>
            </div>

            {/* Skip animation button */}
            <button
              id="skip-intro-btn"
              onClick={() => {
                setAnimStage(2);
                setIsAnimationCompleted(true);
              }}
              className="absolute bottom-5 sm:bottom-6 right-4 sm:right-6 text-xs text-purple-200 hover:text-white px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-md transition-all cursor-pointer min-h-[40px] flex items-center touch-manipulation"
            >
              Skip Intro →
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* MAIN RESPONSIVE LOGIN LAYOUT (Slides & Fades in at stage 2)   */}
        {/* ============================================================ */}
        <div
          id="main-login-viewport"
          className={`w-full max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-6 sm:gap-8 items-center transition-all duration-700 ${
            animStage === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Top on Mobile, Right on Desktop: The Login Card */}
          <div className="w-full order-1 lg:order-2 lg:col-span-6 xl:col-span-5 flex justify-center">
            <LoginCard
              onLoginSuccess={handleLoginSuccess}
              onOpenForgotPassword={() => setShowForgotModal(true)}
              onOpenHelpSupport={() => setShowHelpModal(true)}
            />
          </div>

          {/* Bottom on Mobile, Left on Desktop: School Heritage & Overview */}
          <div className="w-full order-2 lg:order-1 lg:col-span-6 xl:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6 text-center lg:text-left py-2 sm:py-4">
            <div className="inline-flex items-center self-center lg:self-start px-3.5 py-1.5 rounded-full bg-purple-100 text-[#2A0845] text-xs font-bold border border-purple-200/80 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Premier Educational Institution in Sri Lanka'
                  : 'இலங்கையின் முன்னணி கல்வி நிறுவனம்'}
              </span>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-xl sm:text-3xl xl:text-5xl font-black font-cinzel text-[#2A0845] leading-tight tracking-tight">
                VIPULANANTHA COLLEGE COLOMBO
              </h1>
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <span className="h-0.5 w-6 sm:w-8 bg-amber-500" />
                <p className="text-xs sm:text-base font-bold text-amber-700 font-sans tracking-wider sm:tracking-widest">
                  ESTD 1920 • 100+ YEARS OF EXCELLENCE
                </p>
                <span className="h-0.5 w-6 sm:w-8 bg-amber-500 lg:hidden" />
              </div>
            </div>

            {/* School Motto Box in Tamil & English */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950 via-[#3B185F] to-[#1E3A8A] text-white shadow-lg border border-amber-400/30 relative overflow-hidden text-left">
              <div className="relative z-10">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>College Motto • கல்லூரியின் தாரக மந்திரம்</span>
                </div>
                <div className="text-base sm:text-xl font-bold font-tamil text-amber-200 tracking-wide">
                  "நாளும் பயில்வோம் நற்பணி புரிவோம்"
                </div>
                <div className="text-xs text-purple-200 italic mt-1 leading-relaxed">
                  "Learn Daily, Serve Nobly" — Cultivating intellect, character, and leadership since 1920.
                </div>
              </div>
              <div className="absolute right-2 bottom-0 translate-y-4 opacity-15 pointer-events-none">
                <SchoolLogo size="md" showGlowRing={false} />
              </div>
            </div>

            {/* Feature Highlights Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <div className="p-3 sm:p-3.5 rounded-xl bg-white/85 backdrop-blur-sm border border-purple-100 shadow-xs hover:border-purple-300 transition-colors text-left flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center sm:mb-2 font-bold shrink-0">
                  🎓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Academic Portal</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Real-time attendance & term results</div>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-white/85 backdrop-blur-sm border border-purple-100 shadow-xs hover:border-purple-300 transition-colors text-left flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center sm:mb-2 font-bold shrink-0">
                  🏛️
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Faculty Hub</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Curriculum planning & grading</div>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-white/85 backdrop-blur-sm border border-purple-100 shadow-xs hover:border-purple-300 transition-colors text-left flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center sm:mb-2 font-bold shrink-0">
                  🛡️
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Parent Connect</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Daily reports & fee management</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Colombo 06, Sri Lanka</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ministry of Education Accredited</span>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="relative z-20 w-full bg-white/90 border-t border-purple-100/80 py-4 px-4 text-center text-xs text-slate-500 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <span className="font-bold font-cinzel text-slate-800 text-[11px] sm:text-xs">VIPULANANTHA COLLEGE COLOMBO</span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-700 font-semibold text-[11px] sm:text-xs">ESTD 1920</span>
          </div>

          <div className="text-[11px] text-slate-500">
            © 1920–2026 Vipulanantha College Colombo • SMS v4.2
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <button
              onClick={() => setShowHelpModal(true)}
              className="hover:text-purple-900 transition-colors cursor-pointer py-1 touch-manipulation"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => setShowHelpModal(true)}
              className="hover:text-purple-900 transition-colors cursor-pointer py-1 touch-manipulation"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              onClick={() => setShowHelpModal(true)}
              className="hover:text-purple-900 transition-colors cursor-pointer py-1 touch-manipulation"
            >
              IT Support
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />

      <HelpSupportModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}
