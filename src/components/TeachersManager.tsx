import React, { useState } from 'react';
import { StaffMember, SchoolClass, ClassTeacherAssignment } from '../types/sms';
import { Briefcase, Plus, Search, Trash2, X, Phone, Mail, Award, CheckCircle, Edit2, ShieldAlert, UserCheck, AlertCircle, Calendar } from 'lucide-react';
import { saveTeacherToSupabase } from '../lib/teacherService';

interface TeachersManagerProps {
  staffList: StaffMember[];
  classesList?: SchoolClass[];
  assignmentsList?: ClassTeacherAssignment[];
  onAddStaff: (staff: Omit<StaffMember, 'id'>) => void;
  onUpdateStaff?: (staff: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
  onOpenAssignmentModal?: (teacher: StaffMember) => void;
  canEdit: boolean;
}

export const TeachersManager: React.FC<TeachersManagerProps> = ({
  staffList,
  classesList = [],
  assignmentsList = [],
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onOpenAssignmentModal,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [nic, setNic] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [role, setRole] = useState<StaffMember['role']>('Teacher');
  const [department, setDepartment] = useState('Mathematics & Computing');
  const [specialization, setSpecialization] = useState('Mathematics');
  const [subjectsTaught, setSubjectsTaught] = useState('');
  const [assignedClasses, setAssignedClasses] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [employmentType, setEmploymentType] = useState('Permanent');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Resigned' | 'Transferred'>('Active');
  const [formError, setFormError] = useState('');

  const filteredStaff = staffList.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.employeeId.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      (s.specialization && s.specialization.toLowerCase().includes(q)) ||
      s.subjectsTaught.some((sub) => sub.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter || (!s.status && statusFilter === 'Active');

    return matchesSearch && matchesRole && matchesStatus;
  });

  const resetForm = () => {
    setEmployeeId('');
    setFullName('');
    setDisplayName('');
    setNic('');
    setGender('Male');
    setRole('Teacher');
    setDepartment('Mathematics & Computing');
    setSpecialization('Mathematics');
    setSubjectsTaught('');
    setAssignedClasses('');
    setQualifications('');
    setEmail('');
    setPhone('');
    setWhatsappNumber('');
    setEmploymentType('Permanent');
    setStatus('Active');
    setFormError('');
    setEditingStaff(null);
  };

  const openAddModal = () => {
    resetForm();
    // Auto-generate employee ID TCH-00X
    const maxNumber = staffList.reduce((max, s) => {
      const match = s.employeeId.match(/\d+/);
      return match ? Math.max(max, parseInt(match[0], 10)) : max;
    }, 100);
    setEmployeeId(`TCH-${String(maxNumber + 1).padStart(3, '0')}`);
    setShowAddModal(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setEmployeeId(staff.employeeId);
    setFullName(staff.fullName);
    setDisplayName(staff.displayName || staff.fullName);
    setNic(staff.nic || '');
    setGender(staff.gender || 'Male');
    setRole(staff.role);
    setDepartment(staff.department);
    setSpecialization(staff.specialization || staff.department);
    setSubjectsTaught(staff.subjectsTaught ? staff.subjectsTaught.join(', ') : '');
    setAssignedClasses(staff.assignedClasses ? staff.assignedClasses.join(', ') : '');
    setQualifications(staff.qualifications || '');
    setEmail(staff.email);
    setPhone(staff.phone);
    setWhatsappNumber(staff.whatsappNumber || staff.phone);
    setEmploymentType(staff.employmentType || 'Permanent');
    setStatus(staff.status || 'Active');
    setFormError('');
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanEmpId = employeeId.trim().toUpperCase();
    const cleanName = fullName.trim();

    if (!cleanEmpId || !cleanName || !email.trim()) {
      setFormError('Please fill in Employee ID, Full Name, and Official Email.');
      return;
    }

    // Check unique Employee ID for new teachers
    if (!editingStaff && staffList.some((s) => s.employeeId.toUpperCase() === cleanEmpId)) {
      setFormError(`Employee ID ${cleanEmpId} is already assigned to another teacher.`);
      return;
    }

    const teacherData: StaffMember = {
      id: editingStaff ? editingStaff.id : `tch-${cleanEmpId.toLowerCase()}`,
      employeeId: cleanEmpId,
      fullName: cleanName,
      displayName: displayName.trim() || cleanName,
      firstName: cleanName.split(' ')[0],
      lastName: cleanName.split(' ').slice(1).join(' '),
      nic: nic.trim().toUpperCase(),
      gender,
      role,
      department: department.trim() || 'Academic',
      specialization: specialization.trim() || department.trim(),
      subjectsTaught: subjectsTaught.split(',').map((s) => s.trim()).filter(Boolean),
      assignedClasses: assignedClasses.split(',').map((s) => s.trim()).filter(Boolean),
      qualifications: qualifications.trim() || 'B.Ed / Specialized Degree',
      email: email.trim(),
      phone: phone.trim() || '+94 77 000 0000',
      whatsappNumber: whatsappNumber.trim() || phone.trim() || '+94 77 000 0000',
      joinDate: editingStaff ? editingStaff.joinDate : new Date().toISOString().split('T')[0],
      employmentType,
      status,
      attendanceStatus: editingStaff ? editingStaff.attendanceStatus : 'Present',
      leaveBalance: editingStaff ? editingStaff.leaveBalance : { casual: 14, medical: 21, duty: 5 },
    };

    // Save to Supabase master table
    await saveTeacherToSupabase(teacherData);

    if (editingStaff && onUpdateStaff) {
      onUpdateStaff(teacherData);
    } else {
      onAddStaff(teacherData);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleStatusToggle = async (staff: StaffMember, newStatus: StaffMember['status']) => {
    const updated: StaffMember = { ...staff, status: newStatus };
    await saveTeacherToSupabase(updated);
    if (onUpdateStaff) {
      onUpdateStaff(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Faculty Master Directory</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              {staffList.filter((s) => s.status === 'Active' || !s.status).length} Active Teachers
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Central source of truth for class teachers, subject allocations, exam invigilators & timetables
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] hover:from-[#1E0533] hover:to-[#2A0845] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Add New Teacher</span>
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
            placeholder="Search teacher by name, ID (TCH-001), specialization, or subject..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 transition-all shadow-xs"
          />
        </div>

        <div className="flex space-x-2">
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-xs"
          >
            <option value="Active">Active Teachers Only</option>
            <option value="All">All Statuses</option>
            <option value="Inactive">Inactive</option>
            <option value="Resigned">Resigned</option>
            <option value="Transferred">Transferred</option>
          </select>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredStaff.map((staff) => {
          const isActive = staff.status === 'Active' || !staff.status;

          return (
            <div
              key={staff.id}
              className={`bg-white rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                isActive ? 'border-slate-200 hover:border-purple-300 hover:shadow-md' : 'border-slate-200 bg-slate-50/70 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    {staff.employeeId}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {staff.role}
                    </span>
                    {!isActive && (
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                        {staff.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-800 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                    {staff.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{staff.fullName}</h3>
                    <p className="text-xs text-purple-700 font-medium">{staff.specialization || staff.department}</p>
                  </div>
                </div>

                {/* Badges / Subject Tags */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {staff.subjectsTaught.map((sub, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                {/* Class Teacher Assignments Badges */}
                {(() => {
                  const activeAssignments = (assignmentsList || []).filter(
                    (a) => a && a.teacherId === staff.id && a.isActive
                  );
                  const assignedClassesFromList = (classesList || []).filter(
                    (c) =>
                      c &&
                      (activeAssignments.some((a) => a && a.classId === c.id) ||
                        c.classTeacherId === staff.id ||
                        c.classTeacher === staff.fullName)
                  );

                  return (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Class Teacher Duties:</span>
                        {assignedClassesFromList.length > 0 && (
                          <span className="text-purple-900 font-extrabold font-mono">
                            {assignedClassesFromList.length} Class{assignedClassesFromList.length > 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {assignedClassesFromList.length > 0 ? (
                          assignedClassesFromList.map((c) => (
                            <span
                              key={c.id}
                              className="text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-md flex items-center space-x-1"
                            >
                              <UserCheck className="w-2.5 h-2.5 text-purple-700" />
                              <span>{c.grade}-{c.section}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No class assigned</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
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
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedStaff(staff)}
                  className="text-xs font-semibold text-purple-900 hover:text-purple-700 cursor-pointer"
                >
                  View Dossier →
                </button>

                {canEdit && (
                  <div className="flex items-center space-x-1">
                    {onOpenAssignmentModal && (
                      <button
                        onClick={() => onOpenAssignmentModal(staff)}
                        className="text-xs text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-md border border-purple-200 font-bold flex items-center space-x-1 cursor-pointer"
                        title="Manage Class Teacher Assignments"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                        <span>Manage Classes</span>
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(staff)}
                      className="text-xs text-slate-700 hover:text-purple-900 p-1 hover:bg-slate-100 rounded flex items-center space-x-0.5 font-medium cursor-pointer"
                      title="Edit Teacher Record"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {isActive ? (
                      <button
                        onClick={() => handleStatusToggle(staff, 'Inactive')}
                        className="text-xs text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded font-medium cursor-pointer"
                        title="Deactivate Teacher (Preserves historical records)"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusToggle(staff, 'Active')}
                        className="text-xs text-emerald-700 hover:text-emerald-900 p-1 hover:bg-emerald-50 rounded font-medium cursor-pointer"
                        title="Reactivate Teacher"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
              <button onClick={() => setSelectedStaff(null)} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
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
                  <span className="text-[11px] text-slate-500 font-semibold">Status</span>
                  <div className="font-bold text-slate-900">{selectedStaff.status || 'Active'}</div>
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
                <span className="text-[11px] text-slate-500 font-semibold">Qualifications</span>
                <p className="mt-0.5 text-slate-800 font-medium">{selectedStaff.qualifications}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">
                  {editingStaff ? 'Edit Teacher Master Record' : 'Register New Faculty Member'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TCH-001"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl uppercase font-mono font-bold text-purple-950"
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
                  placeholder="e.g. Mr. S. Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics & Computing"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Mathematics"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subjects (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Mathematics, Science"
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
                    placeholder="Grade 10-A, Grade 11-B"
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
                    placeholder="kumar.s@vipulanantha.sch.lk"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Sc (Hons) Maths, PGDE"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold cursor-pointer shadow-md"
                >
                  {editingStaff ? 'Save Master Changes' : 'Register Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
