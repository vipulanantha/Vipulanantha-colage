import React, { useState } from 'react';
import { StaffMember } from '../types/sms';
import { Briefcase, Plus, Search, Trash2, X, Phone, Mail, Award, CheckCircle, Clock } from 'lucide-react';

interface TeachersManagerProps {
  staffList: StaffMember[];
  onAddStaff: (staff: Omit<StaffMember, 'id'>) => void;
  onDeleteStaff: (id: string) => void;
  canEdit: boolean;
}

export const TeachersManager: React.FC<TeachersManagerProps> = ({
  staffList,
  onAddStaff,
  onDeleteStaff,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<StaffMember['role']>('Teacher');
  const [department, setDepartment] = useState('Mathematics & Computing');
  const [subjectsTaught, setSubjectsTaught] = useState('');
  const [assignedClasses, setAssignedClasses] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      s.subjectsTaught.some((sub) => sub.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !fullName.trim() || !email.trim()) {
      setFormError('Please fill in Employee ID, Full Name, and Official Email.');
      return;
    }

    onAddStaff({
      employeeId: employeeId.trim().toUpperCase(),
      fullName: fullName.trim(),
      role,
      department,
      subjectsTaught: subjectsTaught
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      assignedClasses: assignedClasses
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      qualifications: qualifications.trim() || 'B.Ed / Specialized Degree',
      email: email.trim(),
      phone: phone.trim() || '+94 77 000 0000',
      joinDate: new Date().toISOString().split('T')[0],
      attendanceStatus: 'Present',
      leaveBalance: { casual: 14, medical: 21, duty: 5 },
    });

    setEmployeeId('');
    setFullName('');
    setSubjectsTaught('');
    setAssignedClasses('');
    setQualifications('');
    setEmail('');
    setPhone('');
    setFormError('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Faculty & Academic Staff Directory</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              {staffList.length} Members
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Teaching staff, department heads, leave management & timetable allocations
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] hover:from-[#1E0533] hover:to-[#2A0845] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Add Faculty Member</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teachers by name, ID, subject, or department..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 transition-all shadow-xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-xs"
        >
          <option value="All">All Roles</option>
          <option value="Teacher">Teachers</option>
          <option value="Section Head">Section Heads</option>
          <option value="Principal">Principal / Executive</option>
        </select>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                  {staff.employeeId}
                </span>
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {staff.role}
                </span>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-800 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                  {staff.fullName
                    .split(' ')
                    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{staff.fullName}</h3>
                  <p className="text-xs text-purple-700 font-medium">{staff.department}</p>
                </div>
              </div>

              {/* Badges / Subject Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {staff.subjectsTaught.map((sub, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded"
                  >
                    {sub}
                  </span>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-1.5 truncate">
                  <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-[11px] text-slate-500">{staff.qualifications}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center space-x-1 text-slate-500">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[140px]">{staff.email}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-slate-500">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{staff.phone}</span>
                  </span>
                </div>

                {/* Leave info */}
                <div className="bg-slate-50 rounded-lg p-2 flex items-center justify-between text-[11px] text-slate-600 mt-2">
                  <span>
                    Leave Balance: <strong>{staff.leaveBalance.casual} Casual</strong>
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>{staff.attendanceStatus}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedStaff(staff)}
                className="text-xs font-semibold text-purple-900 hover:text-purple-700"
              >
                View Dossier & Classes →
              </button>

              {canEdit && (
                <button
                  onClick={() => onDeleteStaff(staff.id)}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center space-x-1 font-medium p-1 hover:bg-rose-50 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-purple-900 text-amber-300 font-bold flex items-center justify-center text-base shadow">
                  {selectedStaff.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-cinzel">{selectedStaff.fullName}</h3>
                  <p className="text-xs text-purple-800 font-medium">
                    {selectedStaff.role} • {selectedStaff.department}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedStaff(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold">Employee ID</span>
                  <div className="font-bold text-slate-900 font-mono">{selectedStaff.employeeId}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold">Joined Service</span>
                  <div className="font-bold text-slate-900">{selectedStaff.joinDate}</div>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-semibold">Assigned Teaching Classes</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedStaff.assignedClasses.map((cls, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded text-xs font-semibold">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-semibold">Subjects Taught</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedStaff.subjectsTaught.map((sub, idx) => (
                    <span key={idx} className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-xs font-semibold">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-semibold">Academic Qualifications</span>
                <p className="mt-0.5 text-slate-800 font-medium">{selectedStaff.qualifications}</p>
              </div>

              <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-100">
                <span className="text-[11px] text-purple-900 font-bold uppercase tracking-wider">
                  Annual Leave Balance 2026
                </span>
                <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-lg border border-purple-100 shadow-2xs">
                    <div className="font-bold text-purple-950 text-sm">{selectedStaff.leaveBalance.casual} Days</div>
                    <div className="text-[10px] text-slate-500">Casual Leave</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-purple-100 shadow-2xs">
                    <div className="font-bold text-purple-950 text-sm">{selectedStaff.leaveBalance.medical} Days</div>
                    <div className="text-[10px] text-slate-500">Medical Leave</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-purple-100 shadow-2xs">
                    <div className="font-bold text-purple-950 text-sm">{selectedStaff.leaveBalance.duty} Days</div>
                    <div className="text-[10px] text-slate-500">Duty / Exam</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Register Faculty Member</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-0108"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffMember['role'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Section Head">Section Head</option>
                    <option value="Principal">Principal / VP</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Accountant">Accountant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name with Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. K. Thanabalasingam"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Department</label>
                <input
                  type="text"
                  placeholder="e.g. Science & Chemistry Dept."
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subjects (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Chemistry, Science"
                    value={subjectsTaught}
                    onChange={(e) => setSubjectsTaught(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Classes (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Grade 11-A, Grade 12"
                    value={assignedClasses}
                    onChange={(e) => setAssignedClasses(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@vipulanantha.sch.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications</label>
                <input
                  type="text"
                  placeholder="e.g. B.Sc (Hons) Chemistry (Univ of Jaffna), PGDE"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold"
                >
                  Register Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
