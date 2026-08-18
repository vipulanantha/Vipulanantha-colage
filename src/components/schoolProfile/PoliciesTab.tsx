import React, { useState } from 'react';
import { SchoolPolicy } from '../../types/schoolProfile';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  X,
  Save,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

interface PoliciesTabProps {
  policies: SchoolPolicy[];
  onSavePolicy: (policy: SchoolPolicy) => Promise<void>;
  onDeletePolicy: (id: string) => Promise<void>;
  canEdit: boolean;
}

export const PoliciesTab: React.FC<PoliciesTabProps> = ({
  policies,
  onSavePolicy,
  onDeletePolicy,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<SchoolPolicy | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState<SchoolPolicy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<SchoolPolicy | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<Partial<SchoolPolicy>>({
    policyTitle: '',
    category: 'Child Protection & Safeguarding',
    version: '2.0',
    status: 'Active',
    effectiveDate: new Date().toISOString().split('T')[0],
    summary: '',
    fullContent: '',
    approvedBy: 'Principal & College Board of Governance',
  });

  const filteredPolicies = policies.filter(
    (p) =>
      p.policyTitle.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setSelectedPolicy(null);
    setFormState({
      id: `pol-${Date.now()}`,
      policyTitle: '',
      category: 'Child Protection & Safeguarding',
      version: '1.0',
      status: 'Active',
      effectiveDate: new Date().toISOString().split('T')[0],
      summary: '',
      fullContent: '',
      approvedBy: 'Principal & Board of Governance',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (policy: SchoolPolicy) => {
    setSelectedPolicy(policy);
    setFormState({ ...policy });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!formState.policyTitle?.trim() || !formState.summary?.trim()) {
      setNotification({ type: 'error', message: 'Policy title and summary are required.' });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      await onSavePolicy(formState as SchoolPolicy);
      setIsModalOpen(false);
      setNotification({
        type: 'success',
        message: `${formState.policyTitle} saved to official policies registry!`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to save policy.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!policyToDelete || !canEdit) return;

    try {
      await onDeletePolicy(policyToDelete.id);
      setNotification({
        type: 'success',
        message: `Removed ${policyToDelete.policyTitle} from policies registry.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to delete policy.' });
    } finally {
      setPolicyToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-purple-700" />
            <span>Institutional Governance & Compliance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-slate-900">
            School Policies, Charters & Statutory Guidelines
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official statutory policies for Student Conduct, Ethics, Safeguarding, Examination, and Digital Safety
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Publish New Policy</span>
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
            onClick={() => setNotification(null)}
            className="text-xs underline font-bold ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center bg-white rounded-2xl border border-slate-200 px-4 py-2.5 shadow-xs max-w-md">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search policies by title, category or keywords..."
          className="w-full text-xs sm:text-sm text-slate-900 focus:outline-none bg-transparent"
        />
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPolicies.map((policy) => (
          <div
            key={policy.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-md">
                      {policy.category} • v{policy.version}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                      {policy.policyTitle}
                    </h3>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    policy.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {policy.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {policy.summary}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                <span>Effective: {policy.effectiveDate}</span>
                <span>Approved: {policy.approvedBy}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setViewingPolicy(policy)}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-950 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Read Full Document</span>
              </button>

              {canEdit && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(policy)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setPolicyToDelete(policy)}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Policy Full Modal */}
      {viewingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-900 tracking-wider">
                  {viewingPolicy.category} • Version {viewingPolicy.version}
                </span>
                <h3 className="font-cinzel font-bold text-xl text-slate-900 mt-0.5">
                  {viewingPolicy.policyTitle}
                </h3>
              </div>
              <button
                onClick={() => setViewingPolicy(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-purple-950 font-medium">
                <strong className="block text-xs uppercase font-bold text-purple-900 mb-1">Executive Summary:</strong>
                {viewingPolicy.summary}
              </div>

              <div className="space-y-2 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                {viewingPolicy.fullContent || 'Full policy charter text is maintained in the institutional archive.'}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>Effective Since: {viewingPolicy.effectiveDate}</span>
                <span>Ratified by: {viewingPolicy.approvedBy}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingPolicy(null)}
                className="px-5 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Policy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-cinzel font-bold text-lg text-slate-900">
                {selectedPolicy ? 'Edit Policy Document' : 'Publish Policy Document'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Policy Title *
                </label>
                <input
                  type="text"
                  value={formState.policyTitle || ''}
                  onChange={(e) => setFormState({ ...formState, policyTitle: e.target.value })}
                  placeholder="e.g. Student Code of Conduct & Co-Ed Ethics"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formState.category || 'Child Protection & Safeguarding'}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Student Code of Conduct">Student Code of Conduct</option>
                    <option value="Teacher Code of Ethics">Teacher Code of Ethics</option>
                    <option value="Child Protection & Safeguarding">Child Protection & Safeguarding</option>
                    <option value="Anti-Bullying & Harassment">Anti-Bullying & Harassment</option>
                    <option value="Digital Device & Online Safety">Digital Device & Online Safety</option>
                    <option value="Examination & Assessment Policy">Examination & Assessment Policy</option>
                    <option value="Emergency Evacuation & Safety">Emergency Evacuation & Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formState.version || '1.0'}
                    onChange={(e) => setFormState({ ...formState, version: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={formState.effectiveDate || ''}
                    onChange={(e) => setFormState({ ...formState, effectiveDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formState.status || 'Active'}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Executive Summary *
                </label>
                <textarea
                  rows={2}
                  value={formState.summary || ''}
                  onChange={(e) => setFormState({ ...formState, summary: e.target.value })}
                  placeholder="Key principles and application scope..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Policy Content & Clauses
                </label>
                <textarea
                  rows={4}
                  value={formState.fullContent || ''}
                  onChange={(e) => setFormState({ ...formState, fullContent: e.target.value })}
                  placeholder="Section 1: General provisions..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approving Authority
                </label>
                <input
                  type="text"
                  value={formState.approvedBy || ''}
                  onChange={(e) => setFormState({ ...formState, approvedBy: e.target.value })}
                  placeholder="e.g. Principal & College Board of Governance"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>{isSaving ? 'Saving...' : 'Save Policy'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {policyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Remove Policy Document?</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to remove <strong className="text-slate-900">{policyToDelete.policyTitle}</strong> from the official policies register?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setPolicyToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
