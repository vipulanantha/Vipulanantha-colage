import React, { useState } from 'react';
import { ParentProfile, ParentAccount, Student } from '../types/sms';
import {
  Search,
  Users,
  ShieldCheck,
  Phone,
  Smartphone,
  Eye,
  Key,
  Printer,
  UserCheck,
  MapPin,
  Check,
  UserPlus,
  X,
  AlertCircle,
} from 'lucide-react';
import { generateSecureTempPassword } from '../lib/parentManagement';
import { ParentProfileModal } from './ParentProfileModal';
import { ParentLoginDocModal } from './ParentLoginDocModal';

interface ParentsManagerProps {
  parents: ParentProfile[];
  parentAccounts: ParentAccount[];
  students: Student[];
  onUpdateParent?: (updated: ParentProfile) => void;
  onAddParent?: (newParent: ParentProfile, newAccount: ParentAccount, tempPassword: string) => void;
}

export const ParentsManager: React.FC<ParentsManagerProps> = ({
  parents,
  parentAccounts,
  students,
  onUpdateParent,
  onAddParent,
}) => {
  const [search, setSearch] = useState('');
  const [selectedParent, setSelectedParent] = useState<ParentProfile | null>(null);
  const [showAddParentModal, setShowAddParentModal] = useState(false);

  // New Parent Form state
  const [nic, setNic] = useState('');
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState('Father');
  const [mobileNumber, setMobileNumber] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [formError, setFormError] = useState('');

  // Newly created doc modal state
  const [createdDocData, setCreatedDocData] = useState<{
    parent: ParentProfile;
    account: ParentAccount;
    tempPassword: string;
    children: Student[];
  } | null>(null);

  const filteredParents = parents.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const matchesName = p.fullName.toLowerCase().includes(q);
    const matchesNic = p.nic.toLowerCase().includes(q);
    const matchesPhone = p.mobileNumber.includes(q);
    
    // Also search by children names
    const matchingChildren = students.filter(
      (s) =>
        (s.parentNic && s.parentNic.toLowerCase().includes(q)) ||
        (s.parentId === p.id && s.fullName.toLowerCase().includes(q))
    );

    return matchesName || matchesNic || matchesPhone || matchingChildren.length > 0;
  });

  const getChildrenForParent = (parent: ParentProfile): Student[] => {
    return students.filter(
      (s) => s.parentId === parent.id || (s.parentNic && s.parentNic.toUpperCase() === parent.nic.toUpperCase())
    );
  };

  const getAccountForParent = (parent: ParentProfile): ParentAccount | undefined => {
    return parentAccounts.find((a) => a.parentId === parent.id) || {
      id: `pa-${parent.nic}`,
      parentId: parent.id,
      username: `PAR${parent.nic}`,
      mustChangePassword: false,
      isActive: true,
    };
  };

  const handleMobileChange = (val: string) => {
    setMobileNumber(val);
    if (sameAsMobile) {
      setWhatsappNumber(val);
    }
  };

  const handleRegisterParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanNic = nic.trim().toUpperCase();
    if (!cleanNic || cleanNic.length < 5) {
      setFormError('Please enter a valid Parent NIC Number (e.g. 901234567V).');
      return;
    }

    if (parents.some((p) => p.nic.toUpperCase() === cleanNic)) {
      setFormError(`A parent profile with NIC ${cleanNic} already exists in the directory.`);
      return;
    }

    if (!fullName.trim() || !mobileNumber.trim()) {
      setFormError('Please fill in Full Name and Mobile Number.');
      return;
    }

    const parentId = `p-${cleanNic}`;
    const tempPass = generateSecureTempPassword();

    const newParent: ParentProfile = {
      id: parentId,
      nic: cleanNic,
      fullName: fullName.trim(),
      relationship,
      mobileNumber: mobileNumber.trim(),
      whatsappNumber: sameAsMobile ? mobileNumber.trim() : whatsappNumber.trim(),
      address: address.trim(),
      occupation: occupation.trim() || undefined,
      preferredLanguage: 'Tamil',
      status: 'Active',
    };

    const newAccount: ParentAccount = {
      id: `pa-${cleanNic}`,
      parentId: parentId,
      username: `PAR${cleanNic}`,
      tempPassword: tempPass,
      mustChangePassword: true,
      isActive: true,
    };

    if (onAddParent) {
      onAddParent(newParent, newAccount, tempPass);
    }

    setShowAddParentModal(false);
    // Reset form
    setNic('');
    setFullName('');
    setMobileNumber('');
    setWhatsappNumber('');
    setAddress('');
    setOccupation('');

    // Trigger printable login document slip with password
    setCreatedDocData({
      parent: newParent,
      account: newAccount,
      tempPassword: tempPass,
      children: [],
    });
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Parent & Guardian Directory</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              {parents.length} Profiles Registered
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            One parent account per NIC • Link multiple children • Reset credentials & prepare WhatsApp messages
          </p>
        </div>

        <button
          onClick={() => setShowAddParentModal(true)}
          className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] hover:from-[#1E0533] hover:to-[#2A0845] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>+ Register New Parent Profile</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search parents by NIC (e.g. 901234567V), Name, Mobile, or Child Name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-xs"
        />
      </div>

      {/* Parents Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParents.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
            No parent profiles match your query. Enrolling students creates or reuses parent profiles automatically.
          </div>
        ) : (
          filteredParents.map((parent) => {
            const children = getChildrenForParent(parent);
            const account = getAccountForParent(parent);

            return (
              <div
                key={parent.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{parent.fullName}</div>
                      <div className="text-[11px] text-purple-900 font-semibold mt-0.5">
                        {parent.relationship || 'Guardian'}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                      NIC: {parent.nic}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{parent.mobileNumber}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>WhatsApp: {parent.whatsappNumber || parent.mobileNumber}</span>
                    </div>
                    {parent.address && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{parent.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Username & Account Status */}
                  <div className="flex items-center justify-between text-xs bg-purple-900/5 px-2.5 py-1.5 rounded-lg border border-purple-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Portal Username</span>
                      <span className="font-mono font-bold text-purple-950 text-xs">
                        {account?.username || `PAR${parent.nic}`}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  </div>

                  {/* Linked Children */}
                  <div className="pt-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <Users className="w-3 h-3 text-amber-600" />
                      <span>Linked Children ({children.length})</span>
                    </div>

                    {children.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic">No linked students found</div>
                    ) : (
                      <div className="space-y-1">
                        {children.map((c, idx) => (
                          <div
                            key={c.id || idx}
                            className="text-xs bg-slate-100/80 px-2.5 py-1 rounded-lg flex items-center justify-between font-medium text-slate-800"
                          >
                            <span className="truncate">{idx + 1}. {c.fullName}</span>
                            <span className="text-[10px] text-slate-500 font-bold shrink-0 ml-1">
                              {c.grade}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* View Details Action Button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedParent(parent)}
                    className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-900" />
                    <span>View Parent Profile & Actions</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedParent && (
        <ParentProfileModal
          parent={selectedParent}
          account={getAccountForParent(selectedParent)}
          childrenList={getChildrenForParent(selectedParent)}
          onClose={() => setSelectedParent(null)}
          onUpdateParent={onUpdateParent}
        />
      )}

      {/* Modal to Register Standalone New Parent Profile */}
      {showAddParentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden my-auto flex flex-col">
            <div className="h-2.5 bg-gradient-to-r from-[#2A0845] via-[#D4AF37] to-[#1E3A8A]" />

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-cinzel">Register New Parent Profile</h3>
                    <p className="text-xs text-slate-500">Create Parent Account & Issue Login Credentials</p>
                  </div>
                </div>
                <button onClick={() => setShowAddParentModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterParentSubmit} className="space-y-3.5 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Parent NIC Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 901234567V or 198512345678"
                    value={nic}
                    onChange={(e) => setNic(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-purple-300 rounded-xl font-mono text-sm uppercase font-bold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Username will be automatically assigned as <strong>PAR&#123;NIC&#125;</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S. Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0771234567 or +94 77 123 4567"
                      value={mobileNumber}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsMobile}
                      onChange={(e) => {
                        setSameAsMobile(e.target.checked);
                        if (e.target.checked) setWhatsappNumber(mobileNumber);
                      }}
                      className="w-4 h-4 text-purple-900 rounded border-slate-300 focus:ring-purple-900"
                    />
                    <span>WhatsApp number same as mobile</span>
                  </label>

                  {!sameAsMobile && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                      <input
                        type="tel"
                        placeholder="0771234567"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    placeholder="e.g. No. 56 High Level Road, Colombo 06"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Accountant, Civil Engineer, Businessman"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
                </div>

                <div className="flex space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddParentModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>Create Profile & Generate Passcode</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generated Credential Slip Modal */}
      {createdDocData && (
        <ParentLoginDocModal
          parent={createdDocData.parent}
          account={createdDocData.account}
          tempPassword={createdDocData.tempPassword}
          childrenList={createdDocData.children}
          onClose={() => setCreatedDocData(null)}
        />
      )}
    </div>
  );
};
