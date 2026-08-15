import React, { useState } from 'react';
import { HealthVisitLog, Student } from '../types/sms';
import { HeartPulse, Plus, Search, AlertCircle, Phone, UserCheck, Activity, ShieldCheck, X } from 'lucide-react';

interface HealthManagerProps {
  logs: HealthVisitLog[];
  students: Student[];
  onAddLog: (log: Omit<HealthVisitLog, 'id'>) => void;
  canEdit: boolean;
}

export const HealthManager: React.FC<HealthManagerProps> = ({
  logs,
  students,
  onAddLog,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentForEmergency, setSelectedStudentForEmergency] = useState<Student | null>(null);

  // Form State
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [symptoms, setSymptoms] = useState('');
  const [treatmentProvided, setTreatmentProvided] = useState('');
  const [attendingNurseOrOfficer, setAttendingNurseOrOfficer] = useState('Nurse M. Pushpa (Health Bay)');
  const [parentInformed, setParentInformed] = useState(false);
  const [status, setStatus] = useState<HealthVisitLog['status']>('Returned to Class');

  const filteredLogs = logs.filter(
    (l) =>
      l.studentName.toLowerCase().includes(search.toLowerCase()) ||
      l.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
      l.symptoms.toLowerCase().includes(search.toLowerCase())
  );

  const studentsWithMedicalAlerts = students.filter(
    (s) => (s.medicalConditions && s.medicalConditions !== 'None') || (s.allergies && s.allergies !== 'None')
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === studentId);
    if (!st || !symptoms.trim() || !treatmentProvided.trim()) return;

    onAddLog({
      date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      studentName: st.fullName,
      admissionNo: st.admissionNo,
      grade: `${st.grade}-${st.section}`,
      symptoms: symptoms.trim(),
      treatmentProvided: treatmentProvided.trim(),
      attendingNurseOrOfficer: attendingNurseOrOfficer.trim(),
      parentInformed,
      status,
    });

    setSymptoms('');
    setTreatmentProvided('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Student Health, Clinic & Emergency Center</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              Medical Bay
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            First aid clinic logs, emergency blood groups, severe allergy registers & parent notifications
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Record Clinic Visit</span>
          </button>
        )}
      </div>

      {/* Emergency Medical Alerts Bar */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-rose-900 flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Active Campus Medical & Allergy Watchlist ({studentsWithMedicalAlerts.length})</span>
          </span>
          <span className="text-[11px] text-rose-700 font-semibold">Immediate Emergency Protocol</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-2">
          {studentsWithMedicalAlerts.map((st) => (
            <div
              key={st.id}
              onClick={() => setSelectedStudentForEmergency(st)}
              className="bg-white p-3 rounded-lg border border-rose-200 shadow-2xs hover:border-rose-400 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{st.fullName}</span>
                <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-900">
                  {st.bloodGroup}
                </span>
              </div>
              <div className="text-[11px] text-rose-700 mt-1 font-medium">
                {st.medicalConditions !== 'None' && <div>Condition: {st.medicalConditions}</div>}
                {st.allergies !== 'None' && <div>Allergy: {st.allergies}</div>}
              </div>
              <div className="mt-2 text-[10px] text-slate-500 flex justify-between items-center pt-1 border-t border-slate-100">
                <span>{st.grade}-{st.section}</span>
                <span className="text-purple-900 font-semibold">Emergency: {st.emergencyContact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Clinic Visits Recorded</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{logs.length} Encounters</div>
          <div className="text-[11px] text-slate-500 font-medium">Current Academic Term</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-700 font-semibold uppercase">Resolved & In Class</div>
          <div className="text-2xl font-bold text-emerald-700 mt-0.5">
            {logs.filter((l) => l.status === 'Returned to Class').length} Treated
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Mild Injuries & First Aid</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-amber-700 font-semibold uppercase">Parents Contacted</div>
          <div className="text-2xl font-bold text-amber-700 mt-0.5">
            {logs.filter((l) => l.parentInformed).length} Automated Calls
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Via SMS / Voice Gateway</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-purple-900 font-semibold uppercase">Sick Bay Capacity</div>
          <div className="text-2xl font-bold text-purple-900 mt-0.5">4 Beds Available</div>
          <div className="text-[11px] text-slate-500 font-medium">Nurse M. Pushpa on Duty</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clinic encounter log by student, admission no, or symptom..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 transition-all shadow-xs"
        />
      </div>

      {/* Health Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Student & Class</th>
                <th className="py-3 px-4">Symptoms / Condition</th>
                <th className="py-3 px-4">Treatment Administered</th>
                <th className="py-3 px-4">Attending Staff</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{log.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{log.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {log.admissionNo} • {log.grade}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-rose-900">{log.symptoms}</td>
                  <td className="py-3 px-4 text-slate-700">{log.treatmentProvided}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs">{log.attendingNurseOrOfficer}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        log.status === 'Returned to Class'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'Sent Home'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Detail Modal */}
      {selectedStudentForEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-rose-400 overflow-hidden my-auto p-6">
            <div className="flex items-center space-x-2 text-rose-700 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base font-cinzel text-slate-900">Student Emergency Dossier</h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                <div className="text-base font-bold text-slate-900">{selectedStudentForEmergency.fullName}</div>
                <div className="text-xs text-slate-600">
                  {selectedStudentForEmergency.admissionNo} • {selectedStudentForEmergency.grade}-
                  {selectedStudentForEmergency.section} • Blood Group:{' '}
                  <strong className="text-rose-900">{selectedStudentForEmergency.bloodGroup}</strong>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">KNOWN MEDICAL CONDITIONS</span>
                <p className="font-bold text-rose-900">{selectedStudentForEmergency.medicalConditions}</p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">ALLERGIES</span>
                <p className="font-bold text-amber-900">{selectedStudentForEmergency.allergies}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">PARENT / GUARDIAN CONTACT</span>
                <div className="font-bold text-slate-900">{selectedStudentForEmergency.parentName}</div>
                <div className="flex items-center space-x-1.5 text-purple-900 font-bold">
                  <Phone className="w-3.5 h-3.5" />
                  <a href={`tel:${selectedStudentForEmergency.parentPhone}`}>{selectedStudentForEmergency.parentPhone}</a>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedStudentForEmergency(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Clinic Visit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Record Sick Bay Visit</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Candidate</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNo} • {s.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Symptoms Reported *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Headache, sports injury, fever 100.5F"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Administered *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Paracetamol, cleaned wound with Dettol and applied bandage"
                  value={treatmentProvided}
                  onChange={(e) => setTreatmentProvided(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as HealthVisitLog['status'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Returned to Class">Returned to Class</option>
                    <option value="Resting in Bay">Resting in Bay</option>
                    <option value="Sent Home">Sent Home</option>
                    <option value="Hospital Transfer">Hospital Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Attending Nurse</label>
                  <input
                    type="text"
                    value={attendingNurseOrOfficer}
                    onChange={(e) => setAttendingNurseOrOfficer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="notifyParent"
                  checked={parentInformed}
                  onChange={(e) => setParentInformed(e.target.checked)}
                  className="rounded border-slate-300 text-purple-900 focus:ring-purple-900"
                />
                <label htmlFor="notifyParent" className="text-xs font-semibold text-slate-700">
                  Notify Parent via Emergency SMS Gateway
                </label>
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
                  Log Encounter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
