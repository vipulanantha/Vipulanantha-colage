import React, { useState } from 'react';
import { Student } from '../types/sms';
import { Plus, Search, Filter, Trash2, Edit, GraduationCap, Phone, Mail, UserPlus, X, Check } from 'lucide-react';

interface StudentsManagerProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onDeleteStudent: (id: string) => void;
  canEdit: boolean;
}

export const StudentsManager: React.FC<StudentsManagerProps> = ({
  students,
  onAddStudent,
  onDeleteStudent,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [admissionNo, setAdmissionNo] = useState('');
  const [fullName, setFullName] = useState('');
  const [fullNameTamil, setFullNameTamil] = useState('');
  const [grade, setGrade] = useState('Grade 11');
  const [section, setSection] = useState('A');
  const [house, setHouse] = useState<Student['house']>('Royal Gold');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
      (s.fullNameTamil && s.fullNameTamil.includes(search));
    const matchesGrade = selectedGrade === 'All' || s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNo.trim() || !fullName.trim() || !parentPhone.trim()) {
      setFormError('Please fill in Admission No, Student Name, and Parent Contact.');
      return;
    }

    onAddStudent({
      admissionNo: admissionNo.trim(),
      fullName: fullName.trim(),
      fullNameTamil: fullNameTamil.trim() || undefined,
      grade,
      section,
      house,
      parentName: parentName.trim() || 'Parent / Guardian',
      parentPhone: parentPhone.trim(),
      email: email.trim() || `${admissionNo.toLowerCase().replace('/', '')}@vipulanantha.sch.lk`,
      status: 'Active',
    });

    // Reset form
    setAdmissionNo('');
    setFullName('');
    setFullNameTamil('');
    setParentName('');
    setParentPhone('');
    setEmail('');
    setFormError('');
    setShowAddModal(false);
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
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Student Directory & Admissions</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              {students.length} Enrolled
            </span>
          </h2>
          <p className="text-xs text-slate-500">Manage student profiles, house allocation, and parent contacts</p>
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
            placeholder="Search by student name, admission no (VC/2024/...), or Tamil name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-purple-900 transition-all shadow-xs"
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
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12 (A/L)</option>
          </select>
        </div>
      </div>

      {/* Students List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider font-semibold">
                <th className="py-3 px-4">Student & Admission</th>
                <th className="py-3 px-4">Grade & Section</th>
                <th className="py-3 px-4">House</th>
                <th className="py-3 px-4">Parent / Guardian</th>
                <th className="py-3 px-4">Status</th>
                {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs sm:text-sm">
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
                      <span className="font-semibold text-slate-800">{s.grade}</span>
                      <span className="text-slate-500 ml-1">({s.section})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getHouseBadge(s.house)}`}>
                        {s.house}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{s.parentName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{s.parentPhone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ● Active
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteStudent(s.id)}
                          title="Remove student record"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto">
            <div className="h-2 bg-gradient-to-r from-[#2A0845] via-[#D4AF37] to-[#1E3A8A]" />
            <div className="p-5 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-cinzel">Enroll New Student</h3>
                    <p className="text-xs text-slate-500">Add to Colombo Campus SMS Register</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Admission Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VC/2026/0590"
                      value={admissionNo}
                      onChange={(e) => setAdmissionNo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      College House
                    </label>
                    <select
                      value={house}
                      onChange={(e) => setHouse(e.target.value as Student['house'])}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                    >
                      <option value="Royal Gold">Royal Gold</option>
                      <option value="Lotus Red">Lotus Red</option>
                      <option value="Sapphire Blue">Sapphire Blue</option>
                      <option value="Emerald Green">Emerald Green</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kaneshan Vinothan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name in Tamil (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. கணேசன் வினோதன்"
                    value={fullNameTamil}
                    onChange={(e) => setFullNameTamil(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900 font-tamil"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Grade</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                    >
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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. K. Kaneshan"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Parent Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+94 77 123 4567"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold shadow-md active:scale-95 transition-all"
                  >
                    Save Student Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
