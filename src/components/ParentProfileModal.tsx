import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Smartphone,
  MapPin,
  Briefcase,
  Users,
  Key,
  Printer,
  MessageSquare,
  ShieldAlert,
  Check,
  Edit2,
  Lock,
} from 'lucide-react';
import { ParentProfile, ParentAccount, Student } from '../types/sms';
import { generateSecureTempPassword } from '../lib/parentManagement';
import { ParentLoginDocModal } from './ParentLoginDocModal';

interface ParentProfileModalProps {
  parent: ParentProfile;
  account?: ParentAccount;
  childrenList: Student[];
  onClose: () => void;
  onUpdateParent?: (updated: ParentProfile) => void;
}

export const ParentProfileModal: React.FC<ParentProfileModalProps> = ({
  parent,
  account,
  childrenList,
  onClose,
  onUpdateParent,
}) => {
  const [showDocModal, setShowDocModal] = useState(false);
  const [activeAccount, setActiveAccount] = useState<ParentAccount>(
    account || {
      id: `pa-${parent.nic}`,
      parentId: parent.id,
      username: `PAR${parent.nic}`,
      mustChangePassword: false,
      isActive: true,
    }
  );
  const [currentParent, setCurrentParent] = useState<ParentProfile>(parent);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(parent.fullName);
  const [editPhone, setEditPhone] = useState(parent.mobileNumber);
  const [editWa, setEditWa] = useState(parent.whatsappNumber || parent.mobileNumber);
  const [editAddress, setEditAddress] = useState(parent.address || '');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ParentProfile = {
      ...currentParent,
      fullName: editName.trim(),
      mobileNumber: editPhone.trim(),
      whatsappNumber: editWa.trim(),
      address: editAddress.trim(),
    };
    setCurrentParent(updated);
    if (onUpdateParent) {
      onUpdateParent(updated);
    }
    setIsEditing(false);
  };

  const handleResetPassword = () => {
    const newTemp = generateSecureTempPassword();
    setActiveAccount((prev) => ({
      ...prev,
      tempPassword: newTemp,
      mustChangePassword: true,
    }));
    setResetSuccess(`New password generated: ${newTemp}`);
    setShowDocModal(true);
  };

  const toggleAccountStatus = () => {
    setActiveAccount((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-purple-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-auto">
          <div className="h-3 bg-gradient-to-r from-[#2A0845] via-[#D4AF37] to-[#1E3A8A]" />

          <div className="p-6 sm:p-8">
            {/* Title Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-cinzel">
                    Parent & Guardian Profile
                  </h2>
                  <p className="text-xs text-slate-500">
                    NIC: <span className="font-mono font-bold text-amber-900">{currentParent.nic}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center justify-between">
                <span>{resetSuccess}</span>
                <button
                  onClick={() => setShowDocModal(true)}
                  className="font-bold underline text-emerald-900 hover:text-emerald-950 cursor-pointer"
                >
                  View Credential Slip
                </button>
              </div>
            )}

            {/* Profile Overview Card */}
            {!isEditing ? (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{currentParent.fullName}</h3>
                    <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                      <span className="font-semibold text-purple-900">{currentParent.relationship || 'Guardian'}</span>
                      <span>•</span>
                      <span>Language: {currentParent.preferredLanguage || 'Tamil'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        activeAccount.isActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {activeAccount.isActive ? '● Account Active' : '● Deactivated'}
                    </span>

                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 text-slate-600 hover:text-purple-900 hover:bg-white rounded-lg border border-slate-200 cursor-pointer"
                      title="Edit Parent Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact & Account Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mobile</span>
                        <span className="font-semibold">{currentParent.mobileNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-700">
                      <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">WhatsApp</span>
                        <span className="font-semibold">{currentParent.whatsappNumber || currentParent.mobileNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Address</span>
                        <span>{currentParent.address || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-purple-900/5 p-3 rounded-xl border border-purple-100">
                    <div className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                      Parent Portal Account
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-semibold">Portal Username</span>
                      <span className="font-mono font-bold text-purple-950 text-xs bg-purple-100 px-2 py-0.5 rounded">
                        {activeAccount.username}
                      </span>
                    </div>

                    {currentParent.occupation && (
                      <div className="flex items-center space-x-1.5 text-slate-700 text-xs pt-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{currentParent.occupation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Children List */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>Enrolled Children Linked to Parent ({childrenList.length})</span>
                  </div>

                  {childrenList.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-2">
                      No children currently linked to this parent profile.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {childrenList.map((child, idx) => (
                        <div key={child.id || idx} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{idx + 1}. {child.fullName}</span>
                            {child.fullNameTamil && (
                              <span className="text-amber-800 font-tamil ml-2 text-[11px] font-medium">
                                {child.fullNameTamil}
                              </span>
                            )}
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              {child.grade} • Section {child.section} • House {child.house}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {child.admissionNo}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSaveEdit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-800 border-b border-slate-200 pb-2">Edit Parent Details</div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={editWa}
                      onChange={(e) => setEditWa(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#2A0845] text-white font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Action Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleResetPassword}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-700" />
                  <span>Reset Password</span>
                </button>

                <button
                  onClick={() => setShowDocModal(true)}
                  className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-800" />
                  <span>Login Slip / WhatsApp</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleAccountStatus}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                    activeAccount.isActive
                      ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {activeAccount.isActive ? 'Deactivate Account' : 'Activate Account'}
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDocModal && (
        <ParentLoginDocModal
          parent={currentParent}
          account={activeAccount}
          tempPassword={activeAccount.tempPassword}
          childrenList={childrenList}
          onClose={() => setShowDocModal(false)}
        />
      )}
    </>
  );
};
