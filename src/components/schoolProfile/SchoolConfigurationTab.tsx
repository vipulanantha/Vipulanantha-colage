import React, { useState } from 'react';
import { SchoolSystemConfig } from '../../types/schoolProfile';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Clock,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface SchoolConfigurationTabProps {
  initialConfig: SchoolSystemConfig;
  onSave: (config: SchoolSystemConfig) => Promise<void>;
  canEdit: boolean;
}

export const SchoolConfigurationTab: React.FC<SchoolConfigurationTabProps> = ({
  initialConfig,
  onSave,
  canEdit,
}) => {
  const [config, setConfig] = useState<SchoolSystemConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleTermToggle = (termId: string) => {
    if (!canEdit) return;
    setConfig((prev) => ({
      ...prev,
      terms: prev.terms.map((t) => ({
        ...t,
        isActive: t.id === termId,
      })),
    }));
  };

  const handleTermDateChange = (termId: string, field: 'startDate' | 'endDate', val: string) => {
    if (!canEdit) return;
    setConfig((prev) => ({
      ...prev,
      terms: prev.terms.map((t) => (t.id === termId ? { ...t, [field]: val } : t)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsSaving(true);
    setNotification(null);

    try {
      await onSave(config);
      setNotification({
        type: 'success',
        message: 'School Academic & Operational Configuration saved successfully!',
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to save configuration.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4 text-purple-700" />
            <span>Academic Architecture & System Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-slate-900">
            School Configuration & Academic Calendar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure active academic year, terms, grade scales, pass marks, and daily bell schedules
          </p>
        </div>

        {canEdit && (
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer transition-all self-start md:self-auto disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs underline font-bold ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Academic Terms & Timings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Academic Terms */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel font-bold text-sm text-purple-950 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Academic Year & Term Schedule</span>
            </h3>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500">Active Year:</span>
              <input
                type="text"
                value={config.activeAcademicYear}
                onChange={(e) => setConfig({ ...config, activeAcademicYear: e.target.value })}
                disabled={!canEdit}
                className="w-24 bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1 text-xs font-bold text-purple-950"
              />
            </div>
          </div>

          <div className="space-y-3">
            {config.terms.map((term) => (
              <div
                key={term.id}
                className={`p-4 rounded-xl border transition-all ${
                  term.isActive
                    ? 'bg-purple-50/50 border-purple-300 ring-2 ring-purple-100'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="activeTerm"
                      checked={term.isActive}
                      onChange={() => handleTermToggle(term.id)}
                      disabled={!canEdit}
                      className="text-purple-900 focus:ring-purple-700 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-900">{term.name}</span>
                  </div>
                  {term.isActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-900 text-white">
                      Current Active Term
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Term Start Date
                    </label>
                    <input
                      type="date"
                      value={term.startDate}
                      onChange={(e) => handleTermDateChange(term.id, 'startDate', e.target.value)}
                      disabled={!canEdit}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Term End Date
                    </label>
                    <input
                      type="date"
                      value={term.endDate}
                      onChange={(e) => handleTermDateChange(term.id, 'endDate', e.target.value)}
                      disabled={!canEdit}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Schedule & Bell Timings */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-cinzel font-bold text-sm text-purple-950 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-700" />
            <span>Daily Bell Schedule & Hours</span>
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assembly & Start
                </label>
                <input
                  type="text"
                  value={config.dailySchedule.startTime}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      dailySchedule: { ...config.dailySchedule, startTime: e.target.value },
                    })
                  }
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dismissal Time
                </label>
                <input
                  type="text"
                  value={config.dailySchedule.endTime}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      dailySchedule: { ...config.dailySchedule, endTime: e.target.value },
                    })
                  }
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Period Duration
                </label>
                <input
                  type="text"
                  value={config.dailySchedule.periodDuration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      dailySchedule: { ...config.dailySchedule, periodDuration: e.target.value },
                    })
                  }
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Daily Periods
                </label>
                <input
                  type="number"
                  value={config.dailySchedule.periodsPerDay}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      dailySchedule: {
                        ...config.dailySchedule,
                        periodsPerDay: parseInt(e.target.value) || 8,
                      },
                    })
                  }
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Interval / Lunch Recess
              </label>
              <input
                type="text"
                value={config.dailySchedule.intervalTime}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    dailySchedule: { ...config.dailySchedule, intervalTime: e.target.value },
                  })
                }
                disabled={!canEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Grade Structure & Advanced Level Streams */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-cinzel font-bold text-sm text-purple-950 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Grade Structure & G.C.E. A/L Streams</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-purple-950 mb-1">Primary Section</div>
              <div className="text-xs text-slate-600">Grade 1 to Grade 5 (Scholarship Focus)</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-purple-950 mb-1">Junior Secondary</div>
              <div className="text-xs text-slate-600">Grade 6 to Grade 9</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-purple-950 mb-1">Senior Secondary (O/L)</div>
              <div className="text-xs text-slate-600">Grade 10 & Grade 11 (National GCE O/L)</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-purple-950 mb-1">Collegiate (A/L)</div>
              <div className="text-xs text-slate-600">Grade 12 & Grade 13 (6 Specialized Streams)</div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Configured A/L Academic Streams
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                'Physical Science (Maths)',
                'Biological Science (Bio)',
                'Commerce & Economics',
                'Arts & Social Sciences',
                'Engineering Technology (ET)',
                'Biosystems Technology (BST)',
              ].map((stream, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-950 text-xs font-bold rounded-lg"
                >
                  {stream}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Grading Scheme & Pass Marks */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel font-bold text-sm text-purple-950 flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Grading Scheme & Thresholds</span>
            </h3>

            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-500">Pass Mark:</span>
              <input
                type="number"
                value={config.passingMarks}
                onChange={(e) => setConfig({ ...config, passingMarks: parseInt(e.target.value) || 35 })}
                disabled={!canEdit}
                className="w-16 bg-slate-50 border border-slate-300 rounded-lg p-1 text-xs font-bold text-center text-slate-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <th className="py-2 px-3">Grade</th>
                  <th className="py-2 px-3">Score Range</th>
                  <th className="py-2 px-3">Standard Descriptor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {config.gradeScale.map((g) => (
                  <tr key={g.grade} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-purple-950">{g.grade}</td>
                    <td className="py-2 px-3 font-mono">
                      {g.minScore}% - {g.maxScore}%
                    </td>
                    <td className="py-2 px-3 text-slate-600">{g.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </form>
  );
};
