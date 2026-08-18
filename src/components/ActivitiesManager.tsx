import React, { useState } from 'react';
import { ExtracurricularActivity, Student, StaffMember } from '../types/sms';
import { Trophy, Plus, Search, Users, Calendar, MapPin, Award, X } from 'lucide-react';
import { TeacherSelect } from './TeacherSelect';

interface ActivitiesManagerProps {
  activities: ExtracurricularActivity[];
  students: Student[];
  staffList?: StaffMember[];
  onAddActivity: (activity: Omit<ExtracurricularActivity, 'id'>) => void;
  canEdit: boolean;
}

export const ActivitiesManager: React.FC<ActivitiesManagerProps> = ({
  activities,
  students,
  staffList = [],
  onAddActivity,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExtracurricularActivity['category']>('Sports');
  const [teacherInCharge, setTeacherInCharge] = useState('');
  const [teacherInChargeId, setTeacherInChargeId] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('Tuesdays (02:30 - 04:00 PM)');
  const [venue, setVenue] = useState('College Main Grounds');
  const [recentAchievements, setRecentAchievements] = useState('');

  const filteredActivities = activities.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.teacherInCharge.toLowerCase().includes(search.toLowerCase()) ||
      a.venue.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (!teacherInCharge.trim() && !teacherInChargeId)) return;

    onAddActivity({
      title: title.trim(),
      category,
      teacherInCharge: teacherInCharge.trim(),
      teacherInChargeId: teacherInChargeId || undefined,
      meetingSchedule,
      venue,
      memberCount: 20,
      recentAchievements: recentAchievements.trim() || 'Active participation in All-Island competitions',
    });

    setTitle('');
    setTeacherInCharge('');
    setTeacherInChargeId('');
    setRecentAchievements('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Co-Curricular & Student Societies</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              {activities.length} Clubs & Teams
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Cadet Corps, Western & Eastern Band, Tamil Literary Association, Sports teams and Masters-in-Charge
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Register Club / Team</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search societies, sports teams, or teacher in charge..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-xs"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-xs w-full sm:w-auto"
        >
          <option value="All">All Categories</option>
          <option value="Sports">Sports Teams</option>
          <option value="Club">Academic Clubs</option>
          <option value="Society">Cultural Societies</option>
          <option value="Cadet & Band">Cadet Corps & Band</option>
          <option value="Religious & Cultural">Religious & Cultural</option>
        </select>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredActivities.map((act) => {
          const teacher = staffList.find(
            (t) => t.id === act.teacherInChargeId || t.employeeId === act.teacherInChargeId
          );
          const teacherDisplayName = teacher ? `${teacher.fullName} (${teacher.employeeId})` : act.teacherInCharge;

          return (
            <div
              key={act.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-100">
                    {act.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{act.memberCount} Members</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{act.title}</h3>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>
                      Teacher-in-Charge: <strong className="text-slate-800">{teacherDisplayName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{act.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{act.venue}</span>
                  </div>
                </div>

                <div className="mt-3 p-2 rounded-lg bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900">
                  <span className="font-bold">Recent Honor: </span>
                  <span>{act.recentAchievements}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Register Club / Society</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Club / Society Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tamil Debating & Literary Society"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExtracurricularActivity['category'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Sports">Sports</option>
                  <option value="Club">Club</option>
                  <option value="Society">Society</option>
                  <option value="Cadet & Band">Cadet & Band</option>
                  <option value="Religious & Cultural">Religious & Cultural</option>
                </select>
              </div>

              <TeacherSelect
                label="Master / Teacher in Charge *"
                teachers={staffList}
                value={teacherInChargeId || teacherInCharge}
                onChange={(id, t) => {
                  setTeacherInChargeId(id);
                  if (t) setTeacherInCharge(t.fullName);
                }}
                placeholder="Search teacher master list..."
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Practice / Meeting Schedule</label>
                <input
                  type="text"
                  value={meetingSchedule}
                  onChange={(e) => setMeetingSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Practice Ground</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recent Achievements</label>
                <input
                  type="text"
                  placeholder="e.g. All-Island Champions 2025"
                  value={recentAchievements}
                  onChange={(e) => setRecentAchievements(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold cursor-pointer"
                >
                  Register Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
