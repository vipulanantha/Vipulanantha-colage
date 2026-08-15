import React, { useState } from 'react';
import { PortalRole, UserSession, DemoCredential } from '../types';
import { SchoolLogo } from './SchoolLogo';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  GraduationCap,
  Users,
  Briefcase,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Landmark,
  DollarSign,
  BookMarked,
} from 'lucide-react';

interface LoginCardProps {
  onLoginSuccess: (session: UserSession) => void;
  onOpenForgotPassword: () => void;
  onOpenHelpSupport: () => void;
}

const DEMO_CREDENTIALS: Record<PortalRole, DemoCredential> = {
  staff: {
    role: 'staff',
    label: 'Staff & Faculty',
    badge: 'Faculty',
    username: 'staff.rajendran@vipulanantha.sch.lk',
    roleTitle: 'Senior Faculty Member',
    departmentOrGrade: 'Mathematics & Science Dept.',
  },
  student: {
    role: 'student',
    label: 'Student Portal',
    badge: 'Student',
    username: 'VC/2024/0482',
    roleTitle: 'Advanced Level Student',
    departmentOrGrade: 'Grade 12 - Physical Science Stream',
  },
  parent: {
    role: 'parent',
    label: 'Parent Portal',
    badge: 'Parent',
    username: 'parent.kumar@vipulanantha.sch.lk',
    roleTitle: 'Guardian / Parent',
    departmentOrGrade: 'Student: Suresh Kumar (11-A)',
  },
  admin: {
    role: 'admin',
    label: 'Administrator',
    badge: 'Admin',
    username: 'admin.office@vipulanantha.sch.lk',
    roleTitle: 'Administrative Office & Registrar',
    departmentOrGrade: 'Executive Administration',
  },
  principal: {
    role: 'principal',
    label: 'Principal Office',
    badge: 'Principal',
    username: 'principal@vipulanantha.sch.lk',
    roleTitle: 'College Principal & Rector',
    departmentOrGrade: 'Executive Board of Governors',
  },
  accountant: {
    role: 'accountant',
    label: 'Bursar & Finance',
    badge: 'Bursar',
    username: 'bursar@vipulanantha.sch.lk',
    roleTitle: 'Head Accountant & Bursar',
    departmentOrGrade: 'Finance & Accounts Division',
  },
  librarian: {
    role: 'librarian',
    label: 'Library & Archives',
    badge: 'Librarian',
    username: 'library@vipulanantha.sch.lk',
    roleTitle: 'Chief Librarian & Curator',
    departmentOrGrade: 'Swami Vipulananda Memorial Library',
  },
};

export const LoginCard: React.FC<LoginCardProps> = ({
  onLoginSuccess,
  onOpenForgotPassword,
  onOpenHelpSupport,
}) => {
  const [selectedRole, setSelectedRole] = useState<PortalRole>('staff');
  const [username, setUsername] = useState('staff.rajendran@vipulanantha.sch.lk');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [capsLockActive, setCapsLockActive] = useState(false);

  const handleRoleChange = (role: PortalRole) => {
    setSelectedRole(role);
    setUsername(DEMO_CREDENTIALS[role].username);
    setPassword('Vipulanantha#1920');
    setErrorMessage('');
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setErrorMessage('Please enter your Username, Admission Number or Email.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    // Simulate login verification
    setTimeout(() => {
      setIsLoading(false);
      const cred = DEMO_CREDENTIALS[selectedRole];
      const session: UserSession = {
        username: username,
        name:
          selectedRole === 'staff'
            ? 'Mr. K. Rajendran'
            : selectedRole === 'student'
            ? 'K. Saravanan'
            : selectedRole === 'parent'
            ? 'Mr. S. Kumaravel'
            : selectedRole === 'principal'
            ? 'Prof. S. Sivakumaran (Principal)'
            : selectedRole === 'accountant'
            ? 'Mr. M. Thavanesan (Bursar)'
            : selectedRole === 'librarian'
            ? 'Mrs. R. Vani (Librarian)'
            : 'Administrative Office / Registrar',
        role: selectedRole,
        roleTitle: cred.roleTitle,
        departmentOrGrade: cred.departmentOrGrade,
        avatarInitials:
          selectedRole === 'staff'
            ? 'KR'
            : selectedRole === 'student'
            ? 'KS'
            : selectedRole === 'parent'
            ? 'SK'
            : selectedRole === 'principal'
            ? 'SS'
            : selectedRole === 'accountant'
            ? 'MT'
            : selectedRole === 'librarian'
            ? 'RV'
            : 'VC',
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      onLoginSuccess(session);
    }, 1100);
  };

  return (
    <div
      id="login-card-container"
      className="w-full max-w-[440px] mx-auto bg-white/95 sm:bg-white/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(42,8,69,0.18)] sm:shadow-[0_32px_64px_-16px_rgba(42,8,69,0.2)] border border-purple-100/90 overflow-hidden text-slate-800 transition-all duration-300 hover:shadow-[0_36px_72px_-16px_rgba(42,8,69,0.26)]"
    >
      {/* Top Ornamental Gold & Purple Accent Ribbon */}
      <div className="h-2 sm:h-2.5 bg-gradient-to-r from-[#2A0845] via-[#D4AF37] to-[#1E3A8A] w-full shadow-sm" />

      <div className="p-5 sm:p-8">
        {/* Header with Small School Logo at top */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="flex justify-center mb-2.5 sm:mb-3">
            <SchoolLogo size="md" showGlowRing={true} id="card-school-logo" />
          </div>

          <h1 className="text-base sm:text-lg font-bold font-cinzel tracking-wide text-[#2A0845]">
            VIPULANANTHA COLLEGE COLOMBO
          </h1>

          <div className="flex items-center justify-center space-x-2 my-1">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-amber-500" />
            <span className="text-[11px] font-semibold text-amber-700 font-sans tracking-wider">
              ESTD 1920
            </span>
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-amber-500" />
          </div>

          <div className="mt-1.5 inline-block px-3 py-1 rounded-full bg-purple-50 text-[#3B185F] text-xs font-semibold border border-purple-200/80 shadow-xs">
            School Management System
          </div>
        </div>

        {/* Portal Role Tabs */}
        <div className="mb-4 sm:mb-5">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
            Select Portal Access
          </label>
          <div
            className="grid grid-cols-4 sm:grid-cols-7 gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 text-xs"
            role="tablist"
            aria-label="Portal Selection"
          >
            {[
              { id: 'principal', label: 'Principal', icon: Landmark },
              { id: 'admin', label: 'Admin', icon: ShieldCheck },
              { id: 'staff', label: 'Faculty', icon: Briefcase },
              { id: 'student', label: 'Student', icon: GraduationCap },
              { id: 'parent', label: 'Parent', icon: Users },
              { id: 'accountant', label: 'Bursar', icon: DollarSign },
              { id: 'librarian', label: 'Library', icon: BookMarked },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleRoleChange(tab.id as PortalRole)}
                  className={`min-h-[46px] sm:min-h-[44px] flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all font-medium cursor-pointer touch-manipulation active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#3B185F] to-[#2A0845] text-white shadow-md shadow-purple-950/20 font-semibold'
                      : 'text-slate-600 hover:text-purple-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 mb-1 shrink-0 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span className="text-[10px] sm:text-[11px] font-medium leading-none truncate w-full text-center">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Demo Pill Helper */}
        <div className="mb-4 flex items-center justify-between bg-amber-50/80 border border-amber-200/90 rounded-xl px-3 py-2 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center space-x-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px] text-amber-800 truncate">
              Demo: <strong className="font-semibold text-amber-950">{DEMO_CREDENTIALS[selectedRole].label}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setUsername(DEMO_CREDENTIALS[selectedRole].username);
              setPassword('Vipulanantha#1920');
              setErrorMessage('');
            }}
            className="text-[11px] font-bold text-purple-900 bg-amber-200/90 hover:bg-amber-300 active:bg-amber-400 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-1.5 min-h-[30px] flex items-center touch-manipulation"
          >
            Auto Fill
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            id="login-error-alert"
            className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-shake"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Main Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Username / Email Field */}
          <div>
            <label
              htmlFor="username-input"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              {selectedRole === 'student'
                ? 'Admission Number / Student ID'
                : selectedRole === 'staff'
                ? 'Staff ID / College Email'
                : selectedRole === 'parent'
                ? 'Registered Phone / Email'
                : 'Administrator Email / Username'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-purple-900/60" />
              </div>
              <input
                id="username-input"
                name="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  selectedRole === 'student'
                    ? 'e.g. VC/2024/0482'
                    : 'user@vipulanantha.sch.lk'
                }
                className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B185F] focus:border-[#3B185F] transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password-input"
                className="block text-xs font-bold text-slate-700"
              >
                Password
              </label>
              {capsLockActive && (
                <span className="text-[10px] text-amber-600 font-semibold animate-pulse">
                  Caps Lock is ON
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-purple-900/60" />
              </div>
              <input
                id="password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handleKeyUp}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 sm:py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B185F] focus:border-[#3B185F] transition-all shadow-xs"
              />
              <button
                type="button"
                id="toggle-password-visibility-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-slate-400 hover:text-purple-900 focus:outline-none cursor-pointer transition-colors touch-manipulation"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox & Forgot Password Link */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none min-h-[44px] py-1 touch-manipulation">
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#3B185F] focus:ring-[#3B185F] border-slate-300 accent-[#3B185F] cursor-pointer"
              />
              <span className="text-slate-700 font-medium text-xs">Remember me</span>
            </label>

            <button
              id="forgot-password-link"
              type="button"
              onClick={onOpenForgotPassword}
              className="text-[#3B185F] hover:text-[#1E3A8A] font-semibold hover:underline focus:outline-none cursor-pointer transition-colors min-h-[44px] flex items-center px-1 touch-manipulation"
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#2A0845] via-[#3B185F] to-[#1E3A8A] hover:from-[#200535] hover:via-[#30124f] hover:to-[#172e6e] text-white font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-purple-950/25 hover:shadow-xl hover:shadow-purple-950/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group touch-manipulation"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                <span className="text-amber-200">Authenticating Session...</span>
              </div>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                <span>Log In to {DEMO_CREDENTIALS[selectedRole].label}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Support Links */}
        <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            id="help-support-link"
            type="button"
            onClick={onOpenHelpSupport}
            className="flex items-center space-x-1.5 hover:text-purple-900 transition-colors cursor-pointer min-h-[44px] py-1 touch-manipulation"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-600 hover:text-purple-900">Need Help & Support?</span>
          </button>

          <div className="flex items-center space-x-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
