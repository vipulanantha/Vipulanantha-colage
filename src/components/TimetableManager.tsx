import React, { useState } from 'react';
import { TimetablePeriod, SchoolClass, StaffMember } from '../types/sms';
import { Calendar, Plus, Clock, MapPin, UserCheck, X } from 'lucide-react';

interface TimetableManagerProps {
  periods: TimetablePeriod[];
  classes: SchoolClass[];
  staff: StaffMember[];
  onAddPeriod: (period: Omit<TimetablePeriod, 'id'>) => void;
  canEdit: boolean;
}

export const TimetableManager: React.FC<TimetableManagerProps> = ({
  periods,
  classes,
  staff,
  onAddPeriod,
  canEdit,
}) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedClass, setSelectedClass] = useState(classes[1]?.grade ? `${classes[1].grade}-${classes[1].section}` : 'Grade 11-A');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [periodNumber, setPeriodNumber] = useState(1);
  const [time, setTime] = useState('07:45 - 08:30 AM');
  const [subject, setSubject] = useState('Pure Mathematics');
  const [teacher, setTeacher] = useState(staff[0]?.fullName || 'Mr. K. Rajendran');
  const [room, setRoom] = useState('Hall 3A');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filteredPeriods = periods
    .filter((p) => p.day === selectedDay && (p.grade === selectedClass || selectedClass === 'All'))
    .sort((a, b) => a.periodNumber - b.periodNumber);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPeriod({
      day: selectedDay,
      periodNumber: Number(periodNumber),
      time,
      subject,
      teacher,
      room,
      grade: selectedClass === 'All' ? 'Grade 11-A' : selectedClass,
      status: 'Upcoming',
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Academic Master Timetable & Class Schedule</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              8 Periods / Day
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Bell schedule, teacher classroom allocations, period tracking and substitution management
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Allocate Period</span>
          </button>
        )}
      </div>

      {/* Selector Bars */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Days Tabs */}
        <div className="flex overflow-x-auto space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedDay === d
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Class Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-900"
          >
            <option value="All">All Grades (Master View)</option>
            {classes.map((c) => (
              <option key={c.id} value={`${c.grade}-${c.section}`}>
                {c.grade} - Section {c.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Daily Periods Timeline */}
      <div className="grid grid-cols-1 gap-3">
        {filteredPeriods.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No scheduled periods for {selectedDay} ({selectedClass})</p>
            <p className="text-xs text-slate-500 mt-1">Click "+ Allocate Period" to assign curriculum subject and lecturer.</p>
          </div>
        ) : (
          filteredPeriods.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-purple-700 font-bold uppercase">Period</span>
                  <span className="text-lg font-bold text-purple-950 leading-none">{p.periodNumber}</span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-sm">{p.subject}</h3>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {p.grade}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-purple-700" />
                      <span>{p.time}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-700 font-semibold">{p.teacher}</strong>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.room}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    p.status === 'In Progress'
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : p.status === 'Completed'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Period Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Allocate Timetable Period</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Period (1 - 8)</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={periodNumber}
                    onChange={(e) => setPeriodNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Combined Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Teacher</label>
                <select
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {staff.map((st) => (
                    <option key={st.id} value={st.fullName}>
                      {st.fullName} ({st.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Classroom / Lab</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
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
                  Assign Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
