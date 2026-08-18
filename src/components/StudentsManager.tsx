import React, { useState, useEffect } from 'react';
import { Student, ParentProfile, ParentAccount } from '../types/sms';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  GraduationCap,
  Phone,
  Mail,
  UserPlus,
  X,
  Check,
  ShieldCheck,
  User,
  Users,
  Smartphone,
  Eye,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  searchParentByNic,
  createOrLinkParentForStudent,
} from '../lib/parentManagement';
import { ParentLoginDocModal } from './ParentLoginDocModal';
import { ParentProfileModal } from './ParentProfileModal';

interface StudentsManagerProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onDeleteStudent: (id: string) => void;
  canEdit: boolean;
  parents?: ParentProfile[];
  parentAccounts?: ParentAccount[];
}

export const StudentsManager: React.FC<StudentsManagerProps> = ({
  students,
  onAddStudent,
  onDeleteStudent,
  canEdit,
  parents = [],
  parentAccounts = [],
}) => {
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Student Form State
  const [admissionNo, setAdmissionNo] = useState('');
  const [fullName, setFullName] = useState('');
  const [fullNameTamil, setFullNameTamil] = useState('');
  const [grade, setGrade] = useState('Grade 11');
  const [section, setSection] = useState('A');
  const [house, setHouse] = useState<Student['house']>('Royal Gold');
  const [dob, setDob] = useState('2009-01-01');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = useState('Colombo 06');

  // Parent Form & Search State
  const [parentNic, setParentNic] = useState('');
  const [isSearchingNic, setIsSearchingNic] = useState(false);
  const [existingParentData, setExistingParentData] = useState<{
    found: boolean;
    parent?: ParentProfile;
    account?: ParentAccount;
    children: Student[];
  } | null>(null);

  const [parentFullName, setParentFullName] = useState('');
  const [relationship, setRelationship] = useState('Father');
  const [mobileNumber, setMobileNumber] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [parentOccupation, setParentOccupation] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Modals
  const [createdDocData, setCreatedDocData] = useState<{
    parent: ParentProfile;
    account: ParentAccount;
    tempPassword?: string;
    children: Student[];
  } | null>(null);

  const [viewingParentModal, setViewingParentModal] = useState<{
    parent: ParentProfile;
    account?: ParentAccount;
    children: Student[];
  } | null>(null);

  // Debounced search for Parent NIC
  useEffect(() => {
    const cleanNic = parentNic.trim().toUpperCase();
    if (!cleanNic || cleanNic.length < 5) {
      setExistingParentData(null);
      setIsSearchingNic(false);
      return;
    }

    setIsSearchingNic(true);
    const timer = setTimeout(async () => {
      const res = await searchParentByNic(cleanNic, students, parents, parentAccounts);
      setExistingParentData(res);
      setIsSearchingNic(false);

      if (res.found && res.parent) {
        // Pre-fill fields from existing parent
        setParentFullName(res.parent.fullName);
        setRelationship(res.parent.relationship || 'Father');
        setMobileNumber(res.parent.mobileNumber);
        setWhatsappNumber(res.parent.whatsappNumber || res.parent.mobileNumber);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [parentNic, students, parents, parentAccounts]);

  const handleMobileChange = (val: string) => {
    setMobileNumber(val);
    if (sameAsMobile) {
      setWhatsappNumber(val);
    }
  };

  const handleSameAsMobileChange = (checked: boolean) => {
    setSameAsMobile(checked);
    if (checked) {
      setWhatsappNumber(mobileNumber);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
      (s.parentNic && s.parentNic.toLowerCase().includes(search.toLowerCase())) ||
      (s.fullNameTamil && s.fullNameTamil.includes(search));
    const matchesGrade = selectedGrade === 'All' || s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!admissionNo.trim() || !fullName.trim()) {
      setFormError('Please fill in Admission No and Student Full Name.');
      return;
    }

    if (!parentNic.trim() || parentNic.trim().length < 5) {
      setFormError('Please enter a valid Parent NIC Number (e.g. 901234567V).');
      return;
    }

    if (!existingParentData?.found && (!parentFullName.trim() || !mobileNumber.trim())) {
      setFormError('Please fill in Parent Full Name and Mobile Number for new parent registration.');
      return;
    }

    setIsSubmitting(true);

    try {
      const studentInput: Omit<Student, 'id'> = {
        admissionNo: admissionNo.trim(),
        fullName: fullName.trim(),
        fullNameTamil: fullNameTamil.trim() || undefined,
        dob,
        gender,
        address: address.trim(),
        grade,
        section: section.trim() || 'A',
        stream: 'General',
        house,
        parentName: existingParentData?.parent?.fullName || parentFullName.trim(),
        parentPhone: existingParentData?.parent?.mobileNumber || mobileNumber.trim(),
        parentNic: parentNic.trim().toUpperCase(),
        relationship,
        parentOccupation: parentOccupation.trim() || undefined,
        email: `${admissionNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@vipulanantha.sch.lk`,
        emergencyContact: mobileNumber.trim() || '+94 77 123 4567',
        admissionDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      };

      const result = await createOrLinkParentForStudent(
        studentInput,
        {
          nic: parentNic.trim().toUpperCase(),
          fullName: parentFullName.trim(),
          relationship,
          mobileNumber: mobileNumber.trim(),
          whatsappNumber: sameAsMobile ? mobileNumber.trim() : whatsappNumber.trim(),
          address: address.trim(),
          occupation: parentOccupation.trim(),
        },
        existingParentData?.parent
      );

      setIsSubmitting(false);

      if (result.ok) {
        onAddStudent(result.student);

        // Reset form
        setAdmissionNo('');
        setFullName('');
        setFullNameTamil('');
        setParentNic('');
        setParentFullName('');
        setMobileNumber('');
        setWhatsappNumber('');
        setExistingParentData(null);
        setShowAddModal(false);

        if (result.isNewParent) {
          // Open Login Document Modal for New Parent Account
          setCreatedDocData({
            parent: result.parent,
            account: result.account,
            tempPassword: result.tempPassword,
            children: result.children,
          });
        } else {
          // Toast for existing parent reuse
          setSuccessNotice(
            `Student enrolled! Linked to existing parent ${result.parent.fullName} (Username: ${result.account.username}). No new password generated.`
          );
          setTimeout(() => setSuccessNotice(''), 6000);
        }
      } else {
        setFormError(result.error || 'Failed to enroll student and process parent record.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'An unexpected error occurred during enrollment.');
    }
  };

  const handleOpenParentModalForStudent = async (student: Student) => {
    const nic = student.parentNic || '901234567V';
    const res = await searchParentByNic(nic, students, parents, parentAccounts);
    if (res.found && res.parent) {
      setViewingParentModal({
        parent: res.parent,
        account: res.account,
        children: res.children,
      });
    } else {
      // Create ad-hoc parent view from student data
      setViewingParentModal({
        parent: {
          id: student.parentId || `p-${nic}`,
          nic,
          fullName: student.parentName,
          relationship: student.relationship || 'Guardian',
          mobileNumber: student.parentPhone,
          whatsappNumber: student.parentPhone,
          address: student.address,
          status: 'Active',
        },
        account: {
          id: `pa-${nic}`,
          parentId: student.parentId || `p-${nic}`,
          username: `PAR${nic}`,
          mustChangePassword: false,
          isActive: true,
        },
        children: students.filter(
          (s) => s.parentId === student.parentId || (s.parentNic && s.parentNic.toUpperCase() === nic.toUpperCase())
        ),
      });
    }
  };

  const getHouseBadge = (house: Student['house']) => {
    switch (house) {
      case 'Royal Gold':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Lotus Red':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'Sapphire Blue':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Emerald Green':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notice */}
      {successNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice('')} className="p-1 hover:bg-emerald-100 rounded-lg">
            <X className="w-4 h-4 text-emerald-800" />
          </button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Student Directory & Admissions</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              {students.length} Enrolled
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Manage student profiles • Automatic Parent NIC search & deduplication
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] hover:from-[#1E0533] hover:to-[#2A0845] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>+ Enroll New Student</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, admission no, Parent NIC (e.g. 901234567V)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs sm:text-sm py-2.5 px-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-xs cursor-pointer"
          >
            <option value="All">All Grades</option>
            <option value="Grade 5">Grade 5</option>
            <option value="Grade 8">Grade 8</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12 (A/L)</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider font-semibold">
                <th className="py-3 px-4">Student & Admission</th>
                <th className="py-3 px-4">Grade & House</th>
                <th className="py-3 px-4">Parent / Guardian & NIC</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs sm:text-sm">
                    No students match your query. Click "+ Enroll New Student" to add.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.fullName}</div>
                      {s.fullNameTamil && (
                        <div className="text-[11px] text-amber-800 font-tamil font-medium">{s.fullNameTamil}</div>
                      )}
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{s.admissionNo}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {s.grade} ({s.section})
                      </div>
                      <span className={`inline-block px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold border ${getHouseBadge(s.house)}`}>
                        {s.house}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{s.parentName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span className="font-mono text-[10px] font-bold bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
                          NIC: {s.parentNic || '901234567V'}
                        </span>
                        <span>{s.parentPhone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ● Active
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenParentModalForStudent(s)}
                        title="View Parent Profile"
                        className="px-2.5 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg font-bold transition-colors cursor-pointer inline-flex items-center space-x-1"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Parent Profile</span>
                      </button>

                      {canEdit && (
                        <button
                          onClick={() => onDeleteStudent(s.id)}
                          title="Remove student record"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal with PARENT / GUARDIAN INFORMATION SECTION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="h-2.5 bg-gradient-to-r from-[#2A0845] via-[#D4AF37] to-[#1E3A8A]" />

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-cinzel">Enroll New Student</h3>
                    <p className="text-xs text-slate-500">Colombo Campus Admission Register & Parent Linking</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                {/* 1. STUDENT INFORMATION */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                    <GraduationCap className="w-4 h-4 text-amber-600" />
                    <span>Student Basic Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VC/2026/0590"
                        value={admissionNo}
                        onChange={(e) => setAdmissionNo(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">College House</label>
                      <select
                        value={house}
                        onChange={(e) => setHouse(e.target.value as Student['house'])}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                      >
                        <option value="Royal Gold">Royal Gold</option>
                        <option value="Lotus Red">Lotus Red</option>
                        <option value="Sapphire Blue">Sapphire Blue</option>
                        <option value="Emerald Green">Emerald Green</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name (English) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kaneshan Vinothan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name in Tamil (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. கணேசன் வினோதன்"
                      value={fullNameTamil}
                      onChange={(e) => setFullNameTamil(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900 font-tamil"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Level *</label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                      >
                        <option value="Grade 5">Grade 5</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12 (A/L)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                      <input
                        type="text"
                        placeholder="e.g. A, B, Science, Commerce"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. PARENT / GUARDIAN INFORMATION SECTION */}
                <div className="bg-purple-900/5 p-4 rounded-2xl border border-purple-100 space-y-3">
                  <div className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center justify-between border-b border-purple-200/60 pb-2">
                    <span className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-900" />
                      <span>PARENT / GUARDIAN INFORMATION</span>
                    </span>
                    <span className="text-[10px] text-amber-900 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                      NIC Unique Identification
                    </span>
                  </div>

                  {/* PARENT NIC SEARCH FIELD */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Parent NIC Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Enter NIC e.g. 901234567V or 198512345678"
                        value={parentNic}
                        onChange={(e) => setParentNic(e.target.value)}
                        className="w-full pl-3 pr-10 py-2.5 bg-white border border-purple-300 rounded-xl font-mono text-sm uppercase font-bold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-900"
                      />
                      {isSearchingNic && (
                        <Loader2 className="w-4 h-4 text-purple-700 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>

                  {/* EXISTING PARENT DETECTED CARD */}
                  {existingParentData?.found && existingParentData.parent && (
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-300 text-xs text-emerald-950 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between font-bold border-b border-emerald-200/80 pb-1.5">
                        <span className="text-emerald-900 flex items-center space-x-1">
                          <Check className="w-4 h-4 text-emerald-700" />
                          <span>Existing Parent Found</span>
                        </span>
                        <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded font-mono">
                          Reuse Account
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><span className="text-slate-500">Name:</span> <strong>{existingParentData.parent.fullName}</strong></div>
                        <div><span className="text-slate-500">NIC:</span> <strong className="font-mono">{existingParentData.parent.nic}</strong></div>
                        <div><span className="text-slate-500">Mobile:</span> {existingParentData.parent.mobileNumber}</div>
                        <div><span className="text-slate-500">Username:</span> <strong className="font-mono text-purple-900">{existingParentData.account?.username}</strong></div>
                      </div>

                      {/* Existing Children List */}
                      {existingParentData.children.length > 0 && (
                        <div className="pt-1">
                          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                            Existing Children Enrolled ({existingParentData.children.length}):
                          </div>
                          <div className="space-y-0.5">
                            {existingParentData.children.map((c, i) => (
                              <div key={c.id || i} className="bg-white/80 px-2 py-0.5 rounded text-[11px] font-medium text-slate-800">
                                {i + 1}. {c.fullName} - {c.grade} ({c.section})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-[11px] text-emerald-800 pt-1 italic font-medium">
                        ✓ This parent account will be reused automatically. No duplicate account or password will be created.
                      </div>
                    </div>
                  )}

                  {/* NEW PARENT FIELDS (SHOWN IF NIC DOES NOT MATCH EXISTING PARENT) */}
                  {!existingParentData?.found && parentNic.trim().length >= 5 && (
                    <div className="space-y-3 pt-1 animate-fade-in">
                      <div className="text-[11px] font-bold text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        New parent profile will be created automatically upon saving.
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. S. Kumar"
                          value={parentFullName}
                          onChange={(e) => setParentFullName(e.target.value)}
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

                      {/* Same as Mobile Checkbox */}
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameAsMobile}
                            onChange={(e) => handleSameAsMobileChange(e.target.checked)}
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
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                        <input
                          type="text"
                          placeholder="e.g. No. 56 High Level Road, Colombo 06"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Enrolling...</span>
                      </>
                    ) : (
                      <span>Save Student & Link Parent</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generated Parent Login Document & WhatsApp Slip Modal */}
      {createdDocData && (
        <ParentLoginDocModal
          parent={createdDocData.parent}
          account={createdDocData.account}
          tempPassword={createdDocData.tempPassword}
          childrenList={createdDocData.children}
          onClose={() => setCreatedDocData(null)}
        />
      )}

      {/* Parent Detail Modal */}
      {viewingParentModal && (
        <ParentProfileModal
          parent={viewingParentModal.parent}
          account={viewingParentModal.account}
          childrenList={viewingParentModal.children}
          onClose={() => setViewingParentModal(null)}
        />
      )}
    </div>
  );
};
