import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Send,
  ShieldCheck,
  UserCheck,
  Lock,
  Building,
  Users,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { ParentProfile, ParentAccount, Student } from '../types/sms';
import { formatParentWhatsAppMessage } from '../lib/parentManagement';

interface ParentLoginDocModalProps {
  parent: ParentProfile;
  account: ParentAccount;
  tempPassword?: string;
  childrenList: Student[];
  onClose: () => void;
}

export const ParentLoginDocModal: React.FC<ParentLoginDocModalProps> = ({
  parent,
  account,
  tempPassword,
  childrenList,
  onClose,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const rawPassword = tempPassword || account.tempPassword || '••••••••';
  const whatsappMsg = formatParentWhatsAppMessage(
    parent.fullName,
    account.username,
    tempPassword || account.tempPassword
  );

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMsg);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(account.username);
    setCopiedUsername(true);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const handleCopyPassword = () => {
    if (rawPassword && !rawPassword.includes('•')) {
      navigator.clipboard.writeText(rawPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Format clean phone for WhatsApp link e.g. 0771234567 -> 94771234567
  const cleanPhone = (phone: string) => {
    let p = phone.replace(/[^0-9]/g, '');
    if (p.startsWith('0')) {
      p = '94' + p.substring(1);
    }
    return p;
  };

  const waNumber = cleanPhone(parent.whatsappNumber || parent.mobileNumber);
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-purple-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-auto">
        {/* Header Ribbon */}
        <div className="h-3 bg-gradient-to-r from-[#2A0845] via-[#D4AF37] to-[#1E3A8A]" />

        <div className="p-6 sm:p-8">
          {/* Close & Action Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-6 h-6 text-[#2A0845]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-cinzel">
                  Parent Portal Login Slip
                </h2>
                <p className="text-xs text-slate-500">Official Access Credentials & Student Linkage</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Printable Document Area */}
          <div id="printable-parent-slip" className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
            {/* School Letterhead */}
            <div className="text-center border-b border-slate-200 pb-4">
              <div className="inline-flex items-center space-x-2 text-[#2A0845] font-bold text-sm tracking-wide font-cinzel">
                <Building className="w-4 h-4 text-amber-600" />
                <span>VIPULANANTHA COLLEGE COLOMBO</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                College Avenue, Colombo 06 • Estd 1920 • Parent Portal Official Credential
              </p>
            </div>

            {/* Parent & Account Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Parent / Guardian Details
                </div>
                <div className="font-bold text-sm text-slate-900">{parent.fullName}</div>
                <div className="text-slate-600 flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-500">NIC:</span>
                  <span className="font-mono bg-amber-50 px-1.5 py-0.5 rounded text-amber-900 font-bold border border-amber-200">
                    {parent.nic}
                  </span>
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-500">Mobile:</span> {parent.mobileNumber}
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-500">WhatsApp:</span> {parent.whatsappNumber || parent.mobileNumber}
                </div>
              </div>

              <div className="bg-purple-900 text-white p-3.5 rounded-xl space-y-2 border border-purple-800 shadow-xs">
                <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Portal Login Credentials</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full font-bold">
                    Official Account
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div>
                    <div className="text-[10px] text-purple-200 uppercase font-semibold">Username (NIC Based)</div>
                    <div className="flex items-center justify-between bg-purple-950/80 px-2.5 py-1.5 rounded-lg border border-purple-700/50">
                      <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm">
                        {account.username}
                      </span>
                      <button
                        onClick={handleCopyUsername}
                        className="text-purple-300 hover:text-white p-1 rounded"
                        title="Copy Username"
                      >
                        {copiedUsername ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-purple-200 uppercase font-semibold">
                      {(tempPassword || account.tempPassword) ? 'Login Password' : 'Password Status'}
                    </div>
                    <div className="flex items-center justify-between bg-purple-950/80 px-2.5 py-1.5 rounded-lg border border-purple-700/50">
                      <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm tracking-wider">
                        {rawPassword}
                      </span>
                      {(tempPassword || account.tempPassword) && (
                        <button
                          onClick={handleCopyPassword}
                          className="text-purple-300 hover:text-white p-1 rounded cursor-pointer"
                          title="Copy Password"
                        >
                          {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Children List */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-purple-900" />
                <span>Linked Children ({childrenList.length})</span>
              </div>
              <div className="divide-y divide-slate-100">
                {childrenList.map((c, idx) => (
                  <div key={c.id || idx} className="py-1.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{idx + 1}. {c.fullName}</span>
                      <span className="text-slate-500 ml-2 font-medium">({c.grade} - {c.section})</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {c.admissionNo}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portal Login Instructions */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Security Instruction for Parent</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Please log into the Parent Portal using your <strong>Username ({account.username})</strong> and temporary password. For security, you will be prompted to change your password after your initial login.
              </p>
            </div>
          </div>

          {/* WhatsApp Message Preview & Copy Box */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Prepared WhatsApp Message</span>
              </span>
              <button
                onClick={handleCopyMessage}
                className="flex items-center space-x-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 cursor-pointer"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto border border-slate-800">
              {whatsappMsg}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Login Slip</span>
            </button>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {parent.whatsappNumber || parent.mobileNumber ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-emerald-200 ml-1" />
                </a>
              ) : null}

              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
