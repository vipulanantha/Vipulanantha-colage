import React, { useState } from 'react';
import { SchoolClass, Subject, StaffMember, ClassTeacherAssignment } from '../types/sms';
import { Layers, Plus, Search, Trash2, X, Users, BookOpen, MapPin, UserCheck, History, RefreshCw } from 'lucide-react';
import { TeacherSelect } from './TeacherSelect';

interface AcademicManagerProps {
  classes: SchoolClass[];
  subjects: Subject[];
  staffList: StaffMember[];
  assignmentsList?: ClassTeacherAssignment[];
  onAddClass: (cls: Omit<SchoolClass, 'id'>) => void;
  onDeleteClass: (id: string) => void;
  onOpenHistoryModal?: (cls: SchoolClass) => void;
  onOpenAssignmentModalForClass?: (cls: SchoolClass) => void;
  canEdit: boolean;
}

export const AcademicManager: React.FC<AcademicManagerProps> = ({
  classes = [],
  subjects = [],
  staffList = [],
  assignmentsList = [],
  onAddClass,
  onDeleteClass,
  onOpenHistoryModal,
  onOpenAssignmentModalForClass,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [grade, setGrade] = useState('Grade 10');
  const [section, setSection] = useState('A');
  const [stream, setStream] = useState('General Secondary');
  const [classTeacher, setClassTeacher] = useState('');
  const [classTeacherId, setClassTeacherId] = useState('');
  const [room, setRoom] = useState('Hall 2A');
  const [capacity, setCapacity] = useState(35);
  const [formError, setFormError] = useState('');

  const filteredClasses = (classes || []).filter(
    (c) =>
      c &&
      (c.grade.toLowerCase().includes(search.toLowerCase()) ||
        c.section.toLowerCase().includes(search.toLowerCase()) ||
        (c.stream && c.stream.toLowerCase().includes(search.toLowerCase())) ||
        (c.classTeacher && c.classTeacher.toLowerCase().includes(search.toLowerCase())))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classTeacher.trim() && !classTeacherId) {
      setFormError('Please select the assigned Class Teacher.');
      return;
    }

    onAddClass({
      grade,
      section,
      stream,
      classTeacher: classTeacher.trim(),
      classTeacherId: classTeacherId || undefined,
      room,
      capacity: Number(capacity) || 35,
      studentCount: 0,
      academicYear: '2026',
    });

    setClassTeacher('');
    setClassTeacherId('');
    setFormError('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Class & Academic Stream Structure</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              {classes.length} Class Divisions
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Structure: Grade → Class Section → Academic Stream → Class Master
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] hover:from-[#1E0533] hover:to-[#2A0845] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Create Class Division</span>
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
          placeholder="Search classes by grade, section, stream, or class teacher..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 transition-all shadow-xs"
        />
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredClasses.map((cls) => {
          // Resolve live teacher if classTeacherId is present
          const assignedTeacher = staffList.find(
            (t) => t.id === cls.classTeacherId || t.employeeId === cls.classTeacherId
          );
          const teacherName = assignedTeacher ? `${assignedTeacher.fullName} (${assignedTeacher.employeeId})` : cls.classTeacher;

          return (
            <div
              key={cls.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    {cls.grade} - Section {cls.section}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Year {cls.academicYear}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{cls.stream}</h3>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>
                      Class Master: <strong className="text-slate-800">{teacherName}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Location: <strong className="text-slate-800">{cls.room}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center space-x-1 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Enrolled: <strong>{cls.studentCount} / {cls.capacity}</strong>
                      </span>
                    </span>
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-900 h-2 rounded-full"
                        style={{ width: `${Math.min((cls.studentCount / cls.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                {onOpenHistoryModal && (
                  <button
                    onClick={() => onOpenHistoryModal(cls)}
                    className="text-xs text-purple-900 font-bold hover:text-purple-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-purple-700" />
                    <span>View History</span>
                  </button>
                )}

                {canEdit && (
                  <div className="flex items-center space-x-1">
                    {onOpenAssignmentModalForClass && (
                      <button
                        onClick={() => onOpenAssignmentModalForClass(cls)}
                        className="text-xs text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded border border-purple-200 font-bold flex items-center space-x-0.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-purple-700" />
                        <span>Change Teacher</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteClass(cls.id)}
                      className="text-xs text-rose-600 hover:text-rose-800 flex items-center space-x-1 font-medium p-1 hover:bg-rose-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Create Class Division</h3>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11 (O/L)</option>
                    <option value="Grade 12">Grade 12 (A/L)</option>
                    <option value="Grade 13">Grade 13 (A/L)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A or Science 1"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Stream</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physical Science A/L, GCE O/L Core"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <TeacherSelect
                label="Assigned Class Teacher *"
                teachers={staffList}
                value={classTeacherId || classTeacher}
                onChange={(id, t) => {
                  setClassTeacherId(id);
                  if (t) setClassTeacher(t.fullName);
                }}
                placeholder="Search & select teacher master..."
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Classroom</label>
                  <input
                    type="text"
                    placeholder="e.g. Hall 3A"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min={15}
                    max={50}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
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
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
