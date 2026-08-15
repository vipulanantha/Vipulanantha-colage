import React, { useState } from 'react';
import { ExtracurricularActivity, Student } from '../types/sms';
import { Trophy, Plus, Search, Users, Calendar, MapPin, Award, X } from 'lucide-react';

interface ActivitiesManagerProps {
  activities: ExtracurricularActivity[];
  students: Student[];
  onAddActivity: (activity: Omit<ExtracurricularActivity, 'id'>) => void;
  canEdit: boolean;
}

export const ActivitiesManager: React.FC<ActivitiesManagerProps> = ({
  activities,
  students,
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

  const totalMembers = activities.reduce((acc, a) => acc + a.memberCount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !teacherInCharge.trim()) return;

    onAddActivity({
      title: title.trim(),
      category,
      teacherInCharge: teacherInCharge.trim(),
      meetingSchedule,
      venue,
      memberCount: 20,
      recentAchievements: recentAchievements.trim() || 'Active participation in All-Island competitions',
    });

    setTitle('');
    setTeacherInCharge('');
    setRecentAchievements('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Sports, Societies & Extracurricular Clubs</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              {activities.length} Active Societies
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Cricket, Yazh Club, Tamil Literary Society, Robotics, Cadet Platoon & Inter-House Sports
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Register Club / Society</span>
          </button>
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Clubs & Teams</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{activities.length} Organizations</div>
          <div className="text-[11px] text-slate-500 font-medium">Sports, Arts, Tech & Cadets</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-purple-900 font-semibold uppercase">Active Student Members</div>
          <div className="text-2xl font-bold text-purple-900 mt-0.5">{totalMembers} Enrolled</div>
          <div className="text-[11px] text-emerald-600 font-medium">Over 70% Co-Curricular Enrollment</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-amber-700 font-semibold uppercase">College Houses</div>
          <div className="text-xl font-bold text-amber-700 mt-0.5">4 Houses</div>
          <div className="text-[11px] text-slate-500 font-medium">Royal Gold, Lotus Red, Blue, Green</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-700 font-semibold uppercase">Island Championships</div>
          <div className="text-2xl font-bold text-emerald-700 mt-0.5">8 Titles</div>
          <div className="text-[11px] text-slate-500 font-medium">2025 - 2026 Academic Cycle</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs by name, teacher in charge, venue..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 transition-all shadow-xs"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-xs"
        >
          <option value="All">All Categories</option>
          <option value="Sports">Sports</option>
          <option value="Society">Societies</option>
          <option value="Club">Clubs & Tech</option>
          <option value="Cadet & Band">Cadet & Band</option>
        </select>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActivities.map((act) => (
          <div
            key={act.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-100">
                  {act.category}
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded flex items-center space-x-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>{act.memberCount} Members</span>
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{act.title}</h3>

              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Master-in-Charge: <strong className="text-slate-800">{act.teacherInCharge}</strong></span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Session Time: <strong className="text-slate-800">{act.meetingSchedule}</strong></span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Venue: <strong className="text-slate-800">{act.venue}</strong></span>
                </div>

                {act.recentAchievements && (
                  <div className="mt-2 bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg text-amber-950">
                    <span className="font-bold text-[11px] block uppercase text-amber-900">Recent Accolade:</span>
                    <span className="text-xs font-medium">{act.recentAchievements}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-900">Official College Representative</span>
              <button
                onClick={() => alert(`Enrolling for ${act.title}. Notice sent to ${act.teacherInCharge}.`)}
                className="px-3 py-1 bg-purple-900 hover:bg-purple-950 text-white font-bold rounded-lg text-xs"
              >
                Join Squad
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Register Club or Society</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Club / Society Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swami Vipulananda Yazh & Music Troupe"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExtracurricularActivity['category'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Sports">Sports</option>
                    <option value="Society">Society</option>
                    <option value="Club">Club</option>
                    <option value="Cadet & Band">Cadet & Band</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teacher in Charge *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mrs. S. Navaratnam"
                    value={teacherInCharge}
                    onChange={(e) => setTeacherInCharge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Time / Practice</label>
                <input
                  type="text"
                  placeholder="e.g. Fridays (03:30 - 05:00 PM)"
                  value={meetingSchedule}
                  onChange={(e) => setMeetingSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Grounds</label>
                <input
                  type="text"
                  placeholder="e.g. College Auditorium / Lab A"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notable Achievement</label>
                <input
                  type="text"
                  placeholder="e.g. 1st Place in All-Island Trophy"
                  value={recentAchievements}
                  onChange={(e) => setRecentAchievements(e.target.value)}
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
                  Save Society
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
