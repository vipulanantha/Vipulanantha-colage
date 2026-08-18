import React, { useState } from 'react';
import { SchoolLeader } from '../../types/schoolProfile';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Search,
  X,
  Save,
  UserCheck,
} from 'lucide-react';

interface LeadershipTabProps {
  leaders: SchoolLeader[];
  onSaveLeader: (leader: SchoolLeader) => Promise<void>;
  onDeleteLeader: (id: string) => Promise<void>;
  canEdit: boolean;
}

export const LeadershipTab: React.FC<LeadershipTabProps> = ({
  leaders,
  onSaveLeader,
  onDeleteLeader,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [selectedLeader, setSelectedLeader] = useState<SchoolLeader | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaderToDelete, setLeaderToDelete] = useState<SchoolLeader | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formState, setFormState] = useState<Partial<SchoolLeader>>({
    fullName: '',
    designation: 'Principal',
    employeeId: '',
    department: '',
    officialEmail: '',
    officialPhone: '',
    status: 'Active',
    qualifications: '',
    appointmentDate: '2026-01-01',
    orderIndex: leaders.length + 1,
  });

  const getLeaderName = (l?: Partial<SchoolLeader> | null) => l?.fullName || l?.name || 'School Official';
  const getLeaderEmail = (l?: Partial<SchoolLeader> | null) => l?.officialEmail || l?.email || '';
  const getLeaderPhone = (l?: Partial<SchoolLeader> | null) => l?.officialPhone || l?.phone || '';

  const filteredLeaders = (leaders || []).filter((l) => {
    if (!l) return false;
    const name = (l.fullName || l.name || '').toLowerCase();
    const des = (l.designation || '').toLowerCase();
    const dept = (l.department || '').toLowerCase();
    const empId = (l.employeeId || '').toLowerCase();
    const email = (l.officialEmail || l.email || '').toLowerCase();
    const q = (search || '').toLowerCase().trim();
    if (!q) return true;
    return name.includes(q) || des.includes(q) || dept.includes(q) || empId.includes(q) || email.includes(q);
  });

  const handleOpenAddModal = () => {
    setSelectedLeader(null);
    setFormState({
      id: `lead-${Date.now()}`,
      fullName: '',
      designation: 'Principal',
      employeeId: `EMP-LDR-${Math.floor(100 + Math.random() * 900)}`,
      department: 'Executive Administration',
      officialEmail: '',
      officialPhone: '+94 11 258 1920',
      status: 'Active',
      qualifications: '',
      appointmentDate: new Date().toISOString().split('T')[0],
      orderIndex: leaders.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (leader: SchoolLeader) => {
    setSelectedLeader(leader);
    setFormState({ ...leader });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!formState.fullName?.trim()) {
      setNotification({ type: 'error', message: 'Full Name is required.' });
      return;
    }
    if (!formState.officialEmail?.trim()) {
      setNotification({ type: 'error', message: 'Official Email is required.' });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      await onSaveLeader(formState as SchoolLeader);
      setIsModalOpen(false);
      setNotification({
        type: 'success',
        message: `${formState.fullName} leadership profile saved successfully!`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to save leader.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!leaderToDelete || !canEdit) return;

    try {
      await onDeleteLeader(leaderToDelete.id);
      setNotification({
        type: 'success',
        message: `Removed ${leaderToDelete.fullName} from leadership directory.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to delete leader.' });
    } finally {
      setLeaderToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-purple-700" />
            <span>Executive Governance • School Hierarchy</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-slate-900">
            School Leadership & Administrative Hierarchy
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Executive profiles of the Principal, Vice Principals, Section Heads, and Coordinators
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add Leadership Member</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs underline font-bold ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center bg-white rounded-2xl border border-slate-200 px-4 py-2.5 shadow-xs max-w-md">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, designation, department or ID..."
          className="w-full text-xs sm:text-sm text-slate-900 focus:outline-none bg-transparent"
        />
      </div>

      {/* Leadership Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeaders.map((leader) => (
          <div
            key={leader.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header card with avatar */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {leader.fullName.charAt(0)}
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-950 font-bold text-[10px] uppercase tracking-wider rounded-md border border-purple-200">
                      {leader.designation}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                      {leader.fullName}
                    </h3>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    leader.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {leader.status}
                </span>
              </div>

              {/* Department & Qualifications */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-start space-x-2 text-slate-600">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="font-semibold text-slate-800">{leader.department}</span>
                </div>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                  {leader.qualifications}
                </div>
                <div className="flex items-center space-x-2 text-slate-600 pt-1">
                  <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">{leader.officialEmail}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{leader.officialPhone}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>ID: {leader.employeeId}</span>
                  <span>Since {leader.appointmentDate}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {canEdit && (
              <div className="flex items-center justify-end space-x-2 pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEditModal(leader)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setLeaderToDelete(leader)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-cinzel font-bold text-lg text-purple-950">
                {selectedLeader ? 'Edit Leadership Profile' : 'Add Leadership Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  value={formState.fullName || ''}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  placeholder="e.g. Dr. M. Sivalingam"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designation *
                  </label>
                  <select
                    value={formState.designation || 'Principal'}
                    onChange={(e) => setFormState({ ...formState, designation: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                  >
                    <option value="Principal">Principal</option>
                    <option value="Deputy Principal">Deputy Principal</option>
                    <option value="Vice Principal (Academic)">Vice Principal (Academic)</option>
                    <option value="Vice Principal (Administration)">Vice Principal (Administration)</option>
                    <option value="Assistant Principal">Assistant Principal</option>
                    <option value="Section Head (Senior Secondary)">Section Head (Senior Secondary)</option>
                    <option value="Section Head (Junior Secondary)">Section Head (Junior Secondary)</option>
                    <option value="Section Head (Primary)">Section Head (Primary)</option>
                    <option value="Academic Coordinator">Academic Coordinator</option>
                    <option value="Discipline Coordinator">Discipline Coordinator</option>
                    <option value="Senior Student Welfare Officer">Senior Student Welfare Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formState.employeeId || ''}
                    onChange={(e) => setFormState({ ...formState, employeeId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department / Responsibility Area
                </label>
                <input
                  type="text"
                  value={formState.department || ''}
                  onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                  placeholder="e.g. Executive Administration & Sciences"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Academic & Professional Qualifications
                </label>
                <textarea
                  rows={2}
                  value={formState.qualifications || ''}
                  onChange={(e) => setFormState({ ...formState, qualifications: e.target.value })}
                  placeholder="e.g. Ph.D. in Education Management, M.Sc (Physics), SLEAS I"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    value={formState.officialEmail || ''}
                    onChange={(e) => setFormState({ ...formState, officialEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Phone
                  </label>
                  <input
                    type="text"
                    value={formState.officialPhone || ''}
                    onChange={(e) => setFormState({ ...formState, officialPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={formState.appointmentDate || ''}
                    onChange={(e) => setFormState({ ...formState, appointmentDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formState.status || 'Active'}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                  >
                    <option value="Active">Active</option>
                    <option value="On Sabbatical">On Sabbatical</option>
                    <option value="Acting Duty">Acting Duty</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {leaderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Remove Leadership Member?</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to remove{' '}
              <strong className="text-slate-900">{leaderToDelete.fullName}</strong> (
              {leaderToDelete.designation}) from the official school leadership directory?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setLeaderToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
