import React, { useState } from 'react';
import {
  ProtectionSafetySettings,
  ConfidentialProtectionCase,
  SchoolLeader,
  UserRole,
} from '../../types/schoolProfile';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  HeartHandshake,
  Plus,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sparkles,
  Search,
  X,
  Save,
  MessageSquare,
  LifeBuoy,
  FileText,
} from 'lucide-react';

interface StudentProtectionTabProps {
  settings: ProtectionSafetySettings;
  cases: ConfidentialProtectionCase[];
  leaders: SchoolLeader[];
  currentRole: UserRole;
  canEdit: boolean;
  onSaveSettings: (settings: ProtectionSafetySettings) => Promise<void>;
  onSaveCase: (c: ConfidentialProtectionCase) => Promise<void>;
}

export const StudentProtectionTab: React.FC<StudentProtectionTabProps> = ({
  settings,
  cases,
  leaders,
  currentRole,
  canEdit,
  onSaveSettings,
  onSaveCase,
}) => {
  const [safetyConfig, setSafetyConfig] = useState<ProtectionSafetySettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Case management
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ConfidentialProtectionCase | null>(null);
  const [caseForm, setCaseForm] = useState<Partial<ConfidentialProtectionCase>>({
    caseNumber: `SAFE-2026-00${cases.length + 1}`,
    incidentType: 'Bullying & Harassment',
    targetGender: 'All Students',
    severity: 'Medium',
    status: 'Reported',
    reportedDate: new Date().toISOString().split('T')[0],
    studentGrade: 'Grade 10-A',
    description: '',
    assignedOfficer: 'Mrs. Sivanayaki (Female Welfare Officer)',
    confidentialityLevel: 'Strictly Restricted (CPO Only)',
    resolutionNotes: '',
    lastUpdated: new Date().toISOString().split('T')[0],
  });

  // Permission Guard for Confidential Cases
  // Only Super Admin, Principal, Vice Principal, and Child Protection Officer can view/manage confidential records
  const hasConfidentialAccess = [
    'SUPER_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'CHILD_PROTECTION_OFFICER',
  ].includes(currentRole);

  const handleToggle = (field: keyof ProtectionSafetySettings) => {
    if (!canEdit) return;
    setSafetyConfig((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleOfficerChange = (field: keyof ProtectionSafetySettings, leaderId: string) => {
    if (!canEdit) return;
    setSafetyConfig((prev) => ({
      ...prev,
      [field]: leaderId,
    }));
  };

  const handleSaveToggles = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    setNotification(null);

    try {
      await onSaveSettings(safetyConfig);
      setNotification({
        type: 'success',
        message: 'Student Protection & Mixed-School Safety Settings updated and enforced!',
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to save safety settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenNewCaseModal = () => {
    setSelectedCase(null);
    setCaseForm({
      id: `case-${Date.now()}`,
      caseNumber: `SAFE-2026-00${cases.length + 1}`,
      incidentType: 'Female Student Safety Concern',
      targetGender: 'Female Student',
      severity: 'Medium',
      status: 'Reported',
      reportedDate: new Date().toISOString().split('T')[0],
      studentGrade: 'Grade 10-A',
      description: '',
      assignedOfficer: 'Mrs. Sivanayaki (Female Welfare Officer)',
      confidentialityLevel: 'Strictly Restricted (CPO Only)',
      resolutionNotes: '',
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    setIsCaseModalOpen(true);
  };

  const handleSaveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConfidentialAccess) return;

    if (!caseForm.description?.trim()) {
      setNotification({ type: 'error', message: 'Case narrative/description is required.' });
      return;
    }

    try {
      await onSaveCase(caseForm as ConfidentialProtectionCase);
      setIsCaseModalOpen(false);
      setNotification({
        type: 'success',
        message: `Confidential Protection Case ${caseForm.caseNumber} recorded securely!`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to record case.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mixed School Co-Educational Safeguarding Protocol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-white">
            Student Protection & Mixed-School Safety Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Zero-tolerance safeguarding architecture for boys and girls, featuring confidential welfare reporting, female staff support desks, and role-enforced incident auditing.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSaveToggles}
            disabled={isSaving}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-md cursor-pointer transition-all self-start md:self-auto disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enforcing...' : 'Save Safety Rules'}</span>
          </button>
        )}
      </div>

      {/* Notification Toast */}
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

      {/* Safety Toggles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Toggle: Emergency SOS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Campus Emergency SOS</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              One-click panic broadcast to security and management.
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('emergencySosEnabled')}
            disabled={!canEdit}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              safetyConfig.emergencySosEnabled ? 'bg-rose-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                safetyConfig.emergencySosEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle: Confidential Reporting */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs">
              <Lock className="w-4 h-4" />
              <span>Confidential Reporting</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Encrypted submissions routed directly to CPO safe queue.
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('confidentialReportingEnabled')}
            disabled={!canEdit}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              safetyConfig.confidentialReportingEnabled ? 'bg-purple-900' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                safetyConfig.confidentialReportingEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle: Anonymous Reporting */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
              <EyeOff className="w-4 h-4" />
              <span>Anonymous Reporting</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Permits reports without exposing student identity or IP.
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('anonymousReportingEnabled')}
            disabled={!canEdit}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              safetyConfig.anonymousReportingEnabled ? 'bg-indigo-900' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                safetyConfig.anonymousReportingEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle: Bullying Reporting */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs">
              <MessageSquare className="w-4 h-4" />
              <span>Anti-Bullying Hotline</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Peer dispute and cyberbullying resolution desk.
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('bullyingReportingEnabled')}
            disabled={!canEdit}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              safetyConfig.bullyingReportingEnabled ? 'bg-amber-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                safetyConfig.bullyingReportingEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle: Female Staff Support Request */}
        <div className="bg-white rounded-2xl border border-purple-300 p-5 shadow-xs flex items-center justify-between bg-purple-50/50">
          <div>
            <div className="flex items-center space-x-2 text-purple-950 font-bold text-xs">
              <HeartHandshake className="w-4 h-4 text-purple-700" />
              <span>Female Staff Support Desk</span>
            </div>
            <div className="text-[11px] text-purple-900 font-medium mt-1">
              Dedicated private channel for female student & staff welfare.
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('femaleStaffSupportRequestEnabled')}
            disabled={!canEdit}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              safetyConfig.femaleStaffSupportRequestEnabled ? 'bg-purple-900' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                safetyConfig.femaleStaffSupportRequestEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle: Student Welfare Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
              <LifeBuoy className="w-4 h-4" />
              <span>Student Welfare Requests</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Health, nutrition, uniforms, and psychological support.
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('studentWelfareRequestsEnabled')}
            disabled={!canEdit}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              safetyConfig.studentWelfareRequestsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                safetyConfig.studentWelfareRequestsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Safety Officers Assignment Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel font-bold text-sm text-purple-950 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-purple-700" />
            <span>Designated Safeguarding & Welfare Officers</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            Assigned roles hold statutory Child Protection compliance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Child Protection Officer */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider">
              Child Protection Officer (CPO) *
            </label>
            <select
              value={safetyConfig.childProtectionOfficerId}
              onChange={(e) => handleOfficerChange('childProtectionOfficerId', e.target.value)}
              disabled={!canEdit}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-900"
            >
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.designation})
                </option>
              ))}
            </select>
          </div>

          {/* Deputy CPO */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider">
              Deputy Child Protection Officer *
            </label>
            <select
              value={safetyConfig.deputyCpoId}
              onChange={(e) => handleOfficerChange('deputyCpoId', e.target.value)}
              disabled={!canEdit}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-900"
            >
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.designation})
                </option>
              ))}
            </select>
          </div>

          {/* Female Student Welfare Officer */}
          <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5">
            <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center space-x-1">
              <span>Female Student Welfare Officer *</span>
              <span className="text-[10px] text-amber-700">(Mixed School)</span>
            </label>
            <select
              value={safetyConfig.femaleStudentWelfareOfficerId}
              onChange={(e) => handleOfficerChange('femaleStudentWelfareOfficerId', e.target.value)}
              disabled={!canEdit}
              className="w-full bg-white border border-purple-300 rounded-lg p-2 text-xs font-bold text-purple-950 focus:ring-2 focus:ring-purple-900"
            >
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.designation})
                </option>
              ))}
            </select>
          </div>

          {/* School Counsellor */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              School Counsellor
            </label>
            <select
              value={safetyConfig.schoolCounsellorId}
              onChange={(e) => handleOfficerChange('schoolCounsellorId', e.target.value)}
              disabled={!canEdit}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-900"
            >
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.designation})
                </option>
              ))}
            </select>
          </div>

          {/* School Nurse / Medical Officer */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              School Nurse / Medical Officer
            </label>
            <select
              value={safetyConfig.schoolNurseId}
              onChange={(e) => handleOfficerChange('schoolNurseId', e.target.value)}
              disabled={!canEdit}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-900"
            >
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.designation})
                </option>
              ))}
            </select>
          </div>

          {/* Campus Safety Coordinator */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Campus Safety & Discipline Coordinator
            </label>
            <select
              value={safetyConfig.safetyCoordinatorId}
              onChange={(e) => handleOfficerChange('safetyCoordinatorId', e.target.value)}
              disabled={!canEdit}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-900"
            >
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.designation})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Confidential Protection Cases (Role-Based Access Protected) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-purple-950 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Confidential Child Protection Case Records (RLS Enforced)</span>
            </div>
            <h3 className="font-cinzel font-bold text-base text-slate-900 mt-0.5">
              Safeguarding Incident Log & Investigation Safe
            </h3>
          </div>

          {hasConfidentialAccess && (
            <button
              onClick={handleOpenNewCaseModal}
              className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Log Protection Case</span>
            </button>
          )}
        </div>

        {/* Security Guard State */}
        {!hasConfidentialAccess ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
            <Lock className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Access Restricted to Child Protection Officers</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Per Ministry of Education safeguarding guidelines and institutional privacy rules, confidential student protection records are restricted to the CPO, Principal, and designated welfare leadership.
            </p>
            <div className="text-[11px] font-mono text-purple-900 bg-purple-50 py-1 px-3 rounded-full inline-block mt-2">
              Current Session Role: {currentRole} (Standard Access)
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Incident Category</th>
                  <th className="py-3 px-4">Target / Scope</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Assigned Officer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reported</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-950">{c.caseNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{c.incidentType}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-950 border border-purple-200">
                        {c.targetGender}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : c.severity === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{c.assignedOfficer}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Resolved & Closed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{c.reportedDate}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCase(c);
                          setCaseForm({ ...c });
                          setIsCaseModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log / Edit Case Modal */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-purple-900" />
                <h3 className="font-cinzel font-bold text-lg text-purple-950">
                  {selectedCase ? 'Review Protection Record' : 'Record Safeguarding Incident'}
                </h3>
              </div>
              <button
                onClick={() => setIsCaseModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCase} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Case Reference No.
                  </label>
                  <input
                    type="text"
                    value={caseForm.caseNumber || ''}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Reported Date
                  </label>
                  <input
                    type="date"
                    value={caseForm.reportedDate || ''}
                    onChange={(e) => setCaseForm({ ...caseForm, reportedDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Incident Category *
                  </label>
                  <select
                    value={caseForm.incidentType}
                    onChange={(e) => setCaseForm({ ...caseForm, incidentType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Female Student Safety Concern">Female Student Safety Concern</option>
                    <option value="Bullying & Harassment">Bullying & Harassment</option>
                    <option value="Emotional Distress">Emotional Distress</option>
                    <option value="Physical Safety / Injury">Physical Safety / Injury</option>
                    <option value="Online / Cyber Safety">Online / Cyber Safety</option>
                    <option value="Family / Welfare Emergency">Family / Welfare Emergency</option>
                    <option value="Special Needs Assistance">Special Needs Assistance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target / Student Group
                  </label>
                  <select
                    value={caseForm.targetGender}
                    onChange={(e) => setCaseForm({ ...caseForm, targetGender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="All Students">All Students</option>
                    <option value="Female Student">Female Student (Priority Support)</option>
                    <option value="Male Student">Male Student</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Severity Level
                  </label>
                  <select
                    value={caseForm.severity}
                    onChange={(e) => setCaseForm({ ...caseForm, severity: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Critical">Critical (Immediate Escalation)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Investigation Status
                  </label>
                  <select
                    value={caseForm.status}
                    onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Reported">Reported</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Support Provided">Support Provided</option>
                    <option value="Resolved & Closed">Resolved & Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confidential Incident Narrative *
                </label>
                <textarea
                  rows={3}
                  value={caseForm.description || ''}
                  onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                  placeholder="Record factual observations without disclosing identity to third parties..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Resolution & Follow-up Actions
                </label>
                <textarea
                  rows={2}
                  value={caseForm.resolutionNotes || ''}
                  onChange={(e) => setCaseForm({ ...caseForm, resolutionNotes: e.target.value })}
                  placeholder="Support provided, counseling sessions arranged, parents notified..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
