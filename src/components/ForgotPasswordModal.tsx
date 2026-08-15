import React, { useState } from 'react';
import { X, Mail, ShieldCheck, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your school admission number or registered email.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 900);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some(digit => !digit)) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Your password has been successfully reset. You can now sign in.');
      setTimeout(() => {
        onClose();
        setStep(1);
        setIdentifier('');
        setOtp(['', '', '', '', '', '']);
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMessage('');
      }, 2000);
    }, 1000);
  };

  return (
    <div
      id="forgot-password-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto">
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-purple-900 via-amber-500 to-blue-900" />

        <div className="p-5 sm:p-8">
          {/* Close button */}
          <button
            id="close-forgot-password-btn"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-5 sm:mb-6 pr-8">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center border border-purple-200 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 id="forgot-password-title" className="text-lg sm:text-xl font-bold text-slate-900 font-cinzel leading-tight">
                Password Recovery
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Vipulanantha College Student & Staff Portal</p>
            </div>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center justify-between mb-5 sm:mb-6 px-1">
            <div className={`flex items-center space-x-1 text-xs font-semibold ${step >= 1 ? 'text-purple-900' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-purple-900 text-white' : 'bg-slate-200'}`}>1</span>
              <span>Account</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-purple-900' : 'bg-slate-200'}`} />
            <div className={`flex items-center space-x-1 text-xs font-semibold ${step >= 2 ? 'text-purple-900' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-purple-900 text-white' : 'bg-slate-200'}`}>2</span>
              <span>Verify</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-purple-900' : 'bg-slate-200'}`} />
            <div className={`flex items-center space-x-1 text-xs font-semibold ${step >= 3 ? 'text-purple-900' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-purple-900 text-white' : 'bg-slate-200'}`}>3</span>
              <span>Reset</span>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Step 1: Identifier */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label htmlFor="recovery-identifier" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Admission No. / Staff ID / School Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="recovery-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. VC/2024/0482 or staff@vipulanantha.sch.lk"
                    className="w-full pl-10 pr-4 py-3 sm:py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  A 6-digit verification code will be dispatched to your linked mobile or email.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-sm font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 touch-manipulation"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                  Enter 6-Digit OTP Code sent to your device
                </label>
                <div className="flex justify-center gap-1.5 xs:gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-9 h-11 xs:w-10 xs:h-12 text-center text-base sm:text-lg font-bold bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    />
                  ))}
                </div>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Didn't receive code?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(['1', '9', '2', '0', '8', '8']);
                      setErrorMessage('Demo code auto-filled: 192088');
                    }}
                    className="text-purple-700 font-semibold hover:underline min-h-[36px] inline-flex items-center touch-manipulation"
                  >
                    Use Demo Code (192088)
                  </button>
                </p>
              </div>

              <div className="flex space-x-2.5 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 min-h-[46px] py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors touch-manipulation"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 min-h-[46px] py-2.5 px-4 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-sm font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-70 touch-manipulation"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  New Strong Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-3 sm:py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                />
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-3 sm:py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-gradient-to-r from-purple-900 to-blue-900 hover:from-purple-950 hover:to-blue-950 text-white text-sm font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 touch-manipulation"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Save & Update Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-5 pt-3.5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              For manual assistance, reach the IT Support Help Desk at <span className="font-semibold text-slate-700">ext: 104</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
