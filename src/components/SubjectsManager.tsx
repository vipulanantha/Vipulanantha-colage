import React, { useState } from 'react';
import { Subject, StaffMember } from '../types/sms';
import { BookOpen, Plus, Search, Trash2, X, Clock, MapPin, User } from 'lucide-react';
import { TeacherSelect } from './TeacherSelect';

interface SubjectsManagerProps {
  subjects: Subject[];
  staffList: StaffMember[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onDeleteSubject: (id: string) => void;
  canEdit: boolean;
}

export const SubjectsManager: React.FC<SubjectsManagerProps> = ({
  subjects,
  staffList = [],
  onAddSubject,
  onDeleteSubject,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameTamil, setNameTamil] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 10 - 11');
  const [teacherName, setTeacherName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [periodsPerWeek, setPeriodsPerWeek] = useState(5);
  const [room, setRoom] = useState('Hall 3A');
  const [formError, setFormError] = useState('');

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.teacherName.toLowerCase().includes(search.toLowerCase()) ||
      s.nameTamil.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || (!teacherName.trim() && !teacherId)) {
      setFormError('Please fill in Subject Code, Name, and Assigned Teacher.');
      return;
    }

    onAddSubject({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      nameTamil: nameTamil.trim() || name.trim(),
      gradeLevel,
      teacherName: teacherName.trim(),
      teacherId: teacherId || undefined,
      periodsPerWeek: Number(periodsPerWeek) || 4,
      room: room.trim() || 'Hall 3A',
    });

    setCode('');
    setName('');
    setNameTamil('');
    setTeacherName('');
    setTeacherId('');
    setFormError('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Curriculum & Subjects</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              {subjects.length} Courses
            </span>
          </h2>
          <p className="text-xs text-slate-500">Ministry of Education accredited curriculum and faculty assignments</p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] hover:from-[#1E0533] hover:to-[#2A0845] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Add Subject Course</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects, codes, or teachers..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 transition-all shadow-xs"
        />
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredSubjects.map((sub) => {
          const assignedTeacher = staffList.find(
            (t) => t.id === sub.teacherId || t.employeeId === sub.teacherId
          );
          const displayTeacher = assignedTeacher ? `${assignedTeacher.fullName} (${assignedTeacher.employeeId})` : sub.teacherName;

          return (
            <div
              key={sub.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-purple-300 hover:shadow-md transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    {sub.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {sub.gradeLevel}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{sub.name}</h3>
                {sub.nameTamil && (
                  <div className="text-xs text-amber-800 font-tamil mt-0.5 font-medium">{sub.nameTamil}</div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span className="font-medium text-slate-800">{displayTeacher}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{sub.room}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{sub.periodsPerWeek} Periods / Wk</span>
                    </span>
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="mt-3 pt-2 flex justify-end">
                  <button
                    onClick={() => onDeleteSubject(sub.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center space-x-1 font-medium p-1 hover:bg-rose-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto">
            <div className="h-2 bg-gradient-to-r from-[#2A0845] via-[#D4AF37] to-[#1E3A8A]" />
            <div className="p-5 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-cinzel">Add New Subject Course</h3>
                    <p className="text-xs text-slate-500">Curriculum register for academic year</p>
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
                      Subject Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. COMM-107"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900 uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Grade Level
                    </label>
                    <select
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                    >
                      <option value="Grade 10 - 11">Grade 10 - 11 (O/L)</option>
                      <option value="Grade 12 - 13">Grade 12 - 13 (A/L)</option>
                      <option value="Grade 6 - 9">Grade 6 - 9 (Junior)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Business Studies & Accounting"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Name in Tamil (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. வணிகக் கல்வியும் கணக்கீடும்"
                    value={nameTamil}
                    onChange={(e) => setNameTamil(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900 font-tamil"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <TeacherSelect
                      label="Assigned Course Teacher *"
                      teachers={staffList}
                      value={teacherId || teacherName}
                      onChange={(id, t) => {
                        setTeacherId(id);
                        if (t) setTeacherName(t.fullName);
                      }}
                      placeholder="Search faculty master list..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Periods/Week
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={periodsPerWeek}
                      onChange={(e) => setPeriodsPerWeek(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Room / Laboratory
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Commerce Lab / Hall 2C"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
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
                    Create Subject
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
