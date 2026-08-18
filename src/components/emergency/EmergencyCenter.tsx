import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Target,
  HeartHandshake,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Volume2,
  VolumeX,
  Plus,
  Search,
  Filter,
  FileText,
  Settings,
  Database,
  ArrowUpRight,
  RefreshCw,
  Phone,
  Lock,
  ChevronRight,
  Shield,
  Eye,
  Check,
  Send,
  Navigation,
  Download,
  Copy,
  CheckCheck,
  Building,
  Activity,
  Play,
  Pause,
  Sliders,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import {
  EmergencyAlert,
  EmergencyType,
  EmergencyPriority,
  EmergencyStatus,
  LocationPreset,
  RecipientRole,
  EmergencySettingsConfig,
  EmergencyAuditRecord,
} from '../../types/emergency';
import { UserSession } from '../../types';
import { Student, StaffMember, SchoolClass, ParentProfile } from '../../types/sms';
import {
  fetchEmergencyAlerts,
  createEmergencyAlert,
  acknowledgeEmergencyAlert,
  updateEmergencyResponseStatus,
  resolveEmergencyAlert,
  cancelEmergencyAlert,
  triggerEmergencyEscalation,
  saveEmergencySettings,
  getCachedEmergencySettings,
  getCachedAuditLogs,
  calculateEmergencyStats,
  checkCanTriggerGlobalAlarm,
  checkCanTriggerStudentSos,
  checkCanTriggerParentEmergency,
  checkCanTriggerTargetedAlert,
  checkCanResolveEmergency,
  checkCanUpdateResponseStatus,
  SUPABASE_EMERGENCY_SQL_SCHEMA,
} from '../../lib/emergencyService';
import {
  startEmergencySiren,
  stopEmergencySiren,
  getIsSirenPlaying,
  playTestSiren,
  setSirenVolume,
  playUrgentAlertChime,
} from '../../lib/emergencyAudio';
import { isSupabaseConfigured } from '../../lib/supabase';
import { GlobalAlarmModal } from './GlobalAlarmModal';
import { StudentSosModal } from './StudentSosModal';
import { TargetedAlertModal } from './TargetedAlertModal';
import { ParentEmergencyModal } from './ParentEmergencyModal';
import { ResolveEmergencyModal } from './ResolveEmergencyModal';

interface EmergencyCenterProps {
  session: UserSession;
  students: Student[];
  staff: StaffMember[];
  classes: SchoolClass[];
  parents: ParentProfile[];
  initialEmergencyId?: string;
}

export const EmergencyCenter: React.FC<EmergencyCenterProps> = ({
  session,
  students = [],
  staff = [],
  classes = [],
  parents = [],
  initialEmergencyId,
}) => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<EmergencyAuditRecord[]>([]);
  const [settings, setSettings] = useState<EmergencySettingsConfig>(getCachedEmergencySettings());
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<
    'active' | 'trigger' | 'acknowledgements' | 'escalation' | 'history' | 'audit' | 'settings'
  >('active');

  // Selected emergency for detail / acknowledgement viewing
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(initialEmergencyId || null);

  // Modals state
  const [isGlobalAlarmOpen, setIsGlobalAlarmOpen] = useState(false);
  const [isStudentSosOpen, setIsStudentSosOpen] = useState(false);
  const [isTargetedAlertOpen, setIsTargetedAlertOpen] = useState(false);
  const [isParentAlertOpen, setIsParentAlertOpen] = useState(false);
  const [resolvingEmergency, setResolvingEmergency] = useState<EmergencyAlert | null>(null);

  // Search & Filters for History & Audits
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('ALL');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('ALL');

  // Response Update Note Input state
  const [responseNoteInput, setResponseNoteInput] = useState<{ [id: string]: string }>({});
  const [responseStatusInput, setResponseStatusInput] = useState<{ [id: string]: EmergencyStatus }>({});

  // Audio Playback state for voice dispatches
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Copy feedback state
  const [sqlCopied, setSqlCopied] = useState(false);

  // Load initial data
  const loadEmergencyData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchEmergencyAlerts();
      setAlerts(data);
      setAuditLogs(getCachedAuditLogs());
      setSettings(getCachedEmergencySettings());
      if (data.length > 0 && !selectedEmergencyId) {
        setSelectedEmergencyId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading emergency data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencyData();

    // Polling interval for live emergency state & escalation tick
    const interval = setInterval(() => {
      fetchEmergencyAlerts().then((data) => {
        setAlerts(data);
        setAuditLogs(getCachedAuditLogs());
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => calculateEmergencyStats(alerts), [alerts]);

  const activeEmergencies = useMemo(() => {
    return alerts.filter(
      (a) => a.status === 'ACTIVE' || a.status === 'RESPONDING' || a.status === 'ASSISTANCE_DISPATCHED'
    );
  }, [alerts]);

  const selectedEmergency = useMemo(() => {
    return alerts.find((a) => a.id === selectedEmergencyId) || alerts[0] || null;
  }, [alerts, selectedEmergencyId]);

  // Audio playback handler
  const handleTogglePlayVoice = (emergencyId: string, audioUrl?: string) => {
    if (!audioUrl) return;

    if (playingAudioId === emergencyId && audioElement) {
      audioElement.pause();
      setPlayingAudioId(null);
      setAudioElement(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setPlayingAudioId(null);
        setAudioElement(null);
      };
      audio.play().catch((err) => console.warn('Audio playback error:', err));
      setAudioElement(audio);
      setPlayingAudioId(emergencyId);
    }
  };

  // Handlers for creating alerts
  const handleCreateGlobalAlarm = async (data: {
    title: string;
    message: string;
    priority: EmergencyPriority;
    locationPreset: LocationPreset;
    locationCustom?: string;
    reason: string;
    voiceBlob?: Blob;
    voiceDuration?: number;
  }) => {
    const recipients: Array<{ recipientId: string; recipientName: string; recipientRole: RecipientRole }> = [];
    staff.forEach((s) => recipients.push({ recipientId: s.id, recipientName: s.fullName, recipientRole: 'TEACHER' }));
    students.slice(0, 15).forEach((st) => recipients.push({ recipientId: st.id, recipientName: st.fullName, recipientRole: 'STUDENT' }));
    parents.slice(0, 15).forEach((p) => recipients.push({ recipientId: p.id, recipientName: p.fatherName || p.guardianName, recipientRole: 'PARENT' }));

    const res = await createEmergencyAlert({
      type: 'GLOBAL_EMERGENCY_ALARM',
      title: data.title,
      message: data.message,
      priority: data.priority,
      locationPreset: data.locationPreset,
      locationCustom: data.locationCustom,
      createdByUserId: session.username,
      createdByName: session.name,
      createdByRole: session.roleTitle || session.role.toUpperCase(),
      targetType: 'GLOBAL',
      targetSummary: 'ALL AUTHORIZED SCHOOL MEMBERS (Staff, Parents, Students)',
      recipients,
      voiceRecordingBlob: data.voiceBlob,
      voiceDurationSeconds: data.voiceDuration,
    });

    if (res.success && res.alert) {
      setAlerts((prev) => [res.alert!, ...prev]);
      setSelectedEmergencyId(res.alert.id);
      setActiveSubTab('active');
      setAuditLogs(getCachedAuditLogs());
    }
  };

  const handleCreateStudentSos = async (data: {
    message: string;
    locationPreset: LocationPreset;
    locationCustom?: string;
    coordinates?: any;
    voiceBlob?: Blob;
    voiceDuration?: number;
  }) => {
    const res = await createEmergencyAlert({
      type: 'STUDENT_SOS',
      title: `Student Emergency SOS - ${session.name}`,
      message: data.message,
      priority: 'CRITICAL',
      locationPreset: data.locationPreset,
      locationCustom: data.locationCustom,
      coordinates: data.coordinates,
      createdByUserId: session.username,
      createdByName: session.name,
      createdByRole: 'STUDENT',
      targetType: 'STUDENT_SOS_ROUTING',
      targetSummary: 'Auto-Routing: CPO (Mrs. Meenakshi) + Class Teacher + Parent + Principal',
      recipients: [
        { recipientId: 'cpo-01', recipientName: 'Mrs. S. Meenakshi (CPO)', recipientRole: 'CPO' },
        { recipientId: 'tch-01', recipientName: 'Mr. K. Rajendran (Class Teacher)', recipientRole: 'TEACHER' },
        { recipientId: 'par-01', recipientName: 'Parent / Guardian', recipientRole: 'PARENT' },
        { recipientId: 'prn-01', recipientName: 'Mr. K. Thirunavukkarasu (Principal)', recipientRole: 'PRINCIPAL' },
      ],
      voiceRecordingBlob: data.voiceBlob,
      voiceDurationSeconds: data.voiceDuration,
    });

    if (res.success && res.alert) {
      setAlerts((prev) => [res.alert!, ...prev]);
      setSelectedEmergencyId(res.alert.id);
      setActiveSubTab('active');
      setAuditLogs(getCachedAuditLogs());
    }
  };

  const handleCreateTargeted = async (data: {
    title: string;
    message: string;
    priority: EmergencyPriority;
    locationPreset: LocationPreset;
    locationCustom?: string;
    targetSummary: string;
    recipients: Array<{
      recipientId: string;
      recipientName: string;
      recipientRole: RecipientRole;
      contactNumber?: string;
      email?: string;
    }>;
    voiceBlob?: Blob;
    voiceDuration?: number;
  }) => {
    const res = await createEmergencyAlert({
      type: 'TARGETED_EMERGENCY_ALERT',
      title: data.title,
      message: data.message,
      priority: data.priority,
      locationPreset: data.locationPreset,
      locationCustom: data.locationCustom,
      createdByUserId: session.username,
      createdByName: session.name,
      createdByRole: session.roleTitle || session.role.toUpperCase(),
      targetType: 'TARGETED',
      targetSummary: data.targetSummary,
      recipients: data.recipients,
      voiceRecordingBlob: data.voiceBlob,
      voiceDurationSeconds: data.voiceDuration,
    });

    if (res.success && res.alert) {
      setAlerts((prev) => [res.alert!, ...prev]);
      setSelectedEmergencyId(res.alert.id);
      setActiveSubTab('active');
      setAuditLogs(getCachedAuditLogs());
    }
  };

  const handleCreateParentAlert = async (data: {
    title: string;
    message: string;
    priority: EmergencyPriority;
    locationPreset: LocationPreset;
    locationCustom?: string;
    childName: string;
    childGrade: string;
    voiceBlob?: Blob;
    voiceDuration?: number;
  }) => {
    const res = await createEmergencyAlert({
      type: 'PARENT_EMERGENCY_ALERT',
      title: data.title,
      message: data.message,
      priority: data.priority,
      locationPreset: data.locationPreset,
      locationCustom: data.locationCustom,
      createdByUserId: session.username,
      createdByName: session.name,
      createdByRole: 'PARENT',
      targetType: 'PARENT_CHILD_ROUTING',
      targetSummary: `Student: ${data.childName} (${data.childGrade}) -> Class Teacher + CPO + Principal`,
      recipients: [
        { recipientId: 'tch-01', recipientName: 'Class Teacher', recipientRole: 'TEACHER' },
        { recipientId: 'cpo-01', recipientName: 'Mrs. S. Meenakshi (CPO)', recipientRole: 'CPO' },
        { recipientId: 'prn-01', recipientName: 'Principal Office', recipientRole: 'PRINCIPAL' },
      ],
      voiceRecordingBlob: data.voiceBlob,
      voiceDurationSeconds: data.voiceDuration,
    });

    if (res.success && res.alert) {
      setAlerts((prev) => [res.alert!, ...prev]);
      setSelectedEmergencyId(res.alert.id);
      setActiveSubTab('active');
      setAuditLogs(getCachedAuditLogs());
    }
  };

  // Acknowledge Action
  const handleAcknowledge = async (emergencyId: string, note?: string) => {
    const res = await acknowledgeEmergencyAlert(
      emergencyId,
      session.username,
      session.name,
      session.roleTitle || session.role.toUpperCase(),
      note || 'Acknowledged via Emergency Center'
    );

    if (res.success && res.alert) {
      setAlerts((prev) => prev.map((a) => (a.id === emergencyId ? res.alert! : a)));
      setAuditLogs(getCachedAuditLogs());
    }
  };

  // Response Status Update Action
  const handleUpdateStatus = async (emergencyId: string) => {
    const newStatus = responseStatusInput[emergencyId];
    const note = responseNoteInput[emergencyId] || 'Status updated by on-site officer';
    if (!newStatus) return;

    const res = await updateEmergencyResponseStatus(
      emergencyId,
      newStatus,
      session.username,
      session.name,
      session.roleTitle || session.role.toUpperCase(),
      note
    );

    if (res.success && res.alert) {
      setAlerts((prev) => prev.map((a) => (a.id === emergencyId ? res.alert! : a)));
      setAuditLogs(getCachedAuditLogs());
      setResponseNoteInput((prev) => ({ ...prev, [emergencyId]: '' }));
    }
  };

  // Escalate Action
  const handleEscalate = async (emergencyId: string) => {
    const res = await triggerEmergencyEscalation(
      emergencyId,
      session.username,
      session.name,
      session.roleTitle || session.role.toUpperCase(),
      'Manual priority escalation requested by commanding supervisor'
    );

    if (res.success && res.alert) {
      setAlerts((prev) => prev.map((a) => (a.id === emergencyId ? res.alert! : a)));
      setAuditLogs(getCachedAuditLogs());
    }
  };

  // Resolve Action
  const handleConfirmResolve = async (data: {
    emergencyId: string;
    resolutionNote: string;
    actionTaken: string;
  }) => {
    const res = await resolveEmergencyAlert(
      data.emergencyId,
      session.username,
      session.name,
      session.roleTitle || session.role.toUpperCase(),
      data.resolutionNote,
      data.actionTaken
    );

    if (res.success && res.alert) {
      setAlerts((prev) => prev.map((a) => (a.id === data.emergencyId ? res.alert! : a)));
      setAuditLogs(getCachedAuditLogs());
      setResolvingEmergency(null);
    }
  };

  // Cancel / False Alarm Action
  const handleCancelAlarm = async (emergencyId: string) => {
    const reason = window.prompt('Please enter the reason for cancelling this alarm / false alarm declaration:');
    if (!reason || !reason.trim()) return;

    const res = await cancelEmergencyAlert(
      emergencyId,
      session.username,
      session.name,
      session.roleTitle || session.role.toUpperCase(),
      reason.trim()
    );

    if (res.success && res.alert) {
      setAlerts((prev) => prev.map((a) => (a.id === emergencyId ? res.alert! : a)));
      setAuditLogs(getCachedAuditLogs());
    }
  };

  // Save Settings
  const handleSaveConfig = async (newConfig: EmergencySettingsConfig) => {
    setSettings(newConfig);
    await saveEmergencySettings(newConfig, session.name, session.roleTitle || session.role.toUpperCase());
    setAuditLogs(getCachedAuditLogs());
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    return alerts.filter((a) => {
      const matchType = historyTypeFilter === 'ALL' || a.type === historyTypeFilter;
      const matchStatus = historyStatusFilter === 'ALL' || a.status === historyStatusFilter;
      const q = historySearch.toLowerCase();
      const matchQuery =
        !q ||
        a.id.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        a.locationPreset.toLowerCase().includes(q) ||
        a.createdByName.toLowerCase().includes(q);

      return matchType && matchStatus && matchQuery;
    });
  }, [alerts, historyTypeFilter, historyStatusFilter, historySearch]);

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_EMERGENCY_SQL_SCHEMA);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  const exportHistoryCsv = () => {
    const rows = [
      ['ID', 'Type', 'Title', 'Priority', 'Status', 'Location', 'Created By', 'Created At', 'Resolved At', 'Action Taken'],
      ...filteredHistory.map((a) => [
        a.id,
        a.type,
        `"${a.title.replace(/"/g, '""')}"`,
        a.priority,
        a.status,
        `"${a.locationPreset}"`,
        `"${a.createdByName}"`,
        a.createdAt,
        a.resolvedAt || '',
        `"${(a.actionTaken || '').replace(/"/g, '""')}"`,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vipulananda_emergency_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canTriggerGlobal = checkCanTriggerGlobalAlarm(session.role);
  const canTriggerTargeted = checkCanTriggerTargetedAlert(session.role);
  const canResolve = checkCanResolveEmergency(session.role);
  const canUpdateStatus = checkCanUpdateResponseStatus(session.role);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 bg-gradient-to-br from-rose-600 to-red-700 text-white rounded-2xl shadow-lg ring-4 ring-rose-500/20 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Vipulananda College Colombo
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <Activity className="w-3 h-3" />
                  <span>Realtime Safety Network</span>
                </span>
                {isSupabaseConfigured ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                    <Database className="w-3 h-3" />
                    <span>Supabase Cloud Sync</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Local Resilient Storage (Offline-First)
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-cinzel tracking-wide text-white mt-1.5 flex items-center space-x-3">
                <span>🚨 EMERGENCY CENTER</span>
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/90 mt-1 max-w-2xl">
                Centralized emergency alarm dispatch, Student SOS routing, live acknowledgement matrix, voice communications, and multi-tier escalation protocol.
              </p>
            </div>
          </div>

          {/* Quick Trigger Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {canTriggerGlobal && (
              <button
                onClick={() => setIsGlobalAlarmOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-900/40 flex items-center space-x-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <Radio className="w-4 h-4 animate-ping" />
                <span>Global Alarm</span>
              </button>
            )}

            <button
              onClick={() => setIsStudentSosOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-900/30 flex items-center space-x-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Student SOS</span>
            </button>

            {canTriggerTargeted && (
              <button
                onClick={() => setIsTargetedAlertOpen(true)}
                className="px-3.5 py-2.5 bg-purple-900/80 hover:bg-purple-800 text-white font-bold text-xs rounded-xl border border-purple-700/50 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Target className="w-4 h-4 text-purple-300" />
                <span>Targeted Alert</span>
              </button>
            )}

            <button
              onClick={() => setIsParentAlertOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4 text-amber-300" />
              <span>Parent Portal</span>
            </button>
          </div>
        </div>

        {/* Live Statistics Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mt-6 pt-6 border-t border-purple-800/50">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-black tracking-wider uppercase text-rose-300 flex items-center justify-between">
              <span>Active Incidents</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">{stats.totalActive}</div>
            <div className="text-[10px] text-purple-200/70">Requiring attention</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-black tracking-wider uppercase text-amber-300">
              Global Alarms
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">{stats.globalAlerts}</div>
            <div className="text-[10px] text-purple-200/70">Campus-wide broadcast</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-black tracking-wider uppercase text-indigo-300">
              Targeted Alerts
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">{stats.targetedAlerts}</div>
            <div className="text-[10px] text-purple-200/70">Selective response</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-black tracking-wider uppercase text-orange-300">
              Student SOS
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">{stats.studentSosAlerts}</div>
            <div className="text-[10px] text-purple-200/70">Safety distress alerts</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-black tracking-wider uppercase text-red-400">
              Unacknowledged
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">{stats.unacknowledgedAlerts}</div>
            <div className="text-[10px] text-purple-200/70">Awaiting response</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <div className="text-[10px] font-black tracking-wider uppercase text-emerald-300">
              Resolved Cases
            </div>
            <div className="text-2xl font-black text-white mt-1 font-mono">{stats.resolvedAlerts}</div>
            <div className="text-[10px] text-purple-200/70">Successfully closed</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        {[
          { id: 'active', label: 'Active Incidents & Live Map', icon: Radio, count: stats.totalActive },
          { id: 'trigger', label: 'Trigger Emergency Gateway', icon: Plus },
          { id: 'acknowledgements', label: 'Acknowledgement Matrix', icon: CheckCheck },
          { id: 'escalation', label: 'Escalation Monitor', icon: TrendingUp },
          { id: 'history', label: 'Historical Reports', icon: FileText, count: stats.totalHistorical },
          { id: 'audit', label: 'Immutable Audit Ledger', icon: Shield },
          { id: 'settings', label: 'Safety Settings & SQL Schema', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-purple-950 text-white shadow-sm ring-1 ring-purple-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-rose-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: ACTIVE INCIDENTS & LIVE MAP */}
      {activeSubTab === 'active' && (
        <div className="space-y-6 animate-fade-in">
          {activeEmergencies.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 font-cinzel">All Clear • No Active Emergencies</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                The Vipulananda College campus is secure. All historical emergencies have been resolved and logged in the immutable audit trail.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-3">
                <button
                  onClick={() => setIsStudentSosOpen(true)}
                  className="px-4 py-2 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold rounded-xl border border-amber-200 cursor-pointer"
                >
                  Test Student SOS Drill
                </button>
                {canTriggerGlobal && (
                  <button
                    onClick={() => setIsGlobalAlarmOpen(true)}
                    className="px-4 py-2 bg-rose-50 text-rose-900 hover:bg-rose-100 text-xs font-bold rounded-xl border border-rose-200 cursor-pointer"
                  >
                    Broadcast Campus Drill
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: List of Active Incidents */}
              <div className="lg:col-span-1 space-y-3">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Active Incident Queue ({activeEmergencies.length})</span>
                  <button
                    onClick={loadEmergencyData}
                    className="text-purple-900 hover:text-purple-950 p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Refresh data"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {activeEmergencies.map((emg) => {
                  const isSelected = selectedEmergency?.id === emg.id;
                  const isCritical = emg.priority === 'CRITICAL';
                  const ackPercentage =
                    emg.totalRecipientsCount > 0
                      ? Math.round((emg.acknowledgedCount / emg.totalRecipientsCount) * 100)
                      : 0;

                  return (
                    <div
                      key={emg.id}
                      onClick={() => setSelectedEmergencyId(emg.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-purple-50/90 border-purple-500 shadow-md ring-1 ring-purple-500'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      {isCritical && (
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-600" />
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {emg.priority} • {emg.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(emg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 mt-2 line-clamp-1">{emg.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{emg.message}</p>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                        <span className="flex items-center space-x-1 truncate max-w-[160px]">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span className="truncate">{emg.locationPreset}</span>
                        </span>
                        <span className="font-mono font-bold text-purple-950">
                          {emg.acknowledgedCount}/{emg.totalRecipientsCount} Ack ({ackPercentage}%)
                        </span>
                      </div>

                      {/* Status indicator pill */}
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                            emg.status === 'ACTIVE'
                              ? 'bg-red-100 text-red-800 animate-pulse'
                              : emg.status === 'RESPONDING'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          ● {emg.status}
                        </span>

                        {emg.escalationLevel > 0 && (
                          <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-bold">
                            Escalated L{emg.escalationLevel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Detailed Active Incident Commander */}
              <div className="lg:col-span-2 space-y-4">
                {selectedEmergency ? (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 sm:p-7 space-y-5">
                    {/* Header Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 font-mono text-xs font-black rounded-lg">
                            {selectedEmergency.id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                              selectedEmergency.priority === 'CRITICAL'
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {selectedEmergency.priority} PRIORITY
                          </span>
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                            {selectedEmergency.status}
                          </span>
                        </div>

                        <h3 className="text-xl font-black font-cinzel text-slate-900 mt-2">
                          {selectedEmergency.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Triggered by <strong>{selectedEmergency.createdByName}</strong> ({selectedEmergency.createdByRole}) on{' '}
                          {new Date(selectedEmergency.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Siren toggle for this incident */}
                      <button
                        onClick={() => {
                          if (getIsSirenPlaying()) {
                            stopEmergencySiren();
                          } else {
                            startEmergencySiren(0.85);
                          }
                        }}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl border border-rose-200 flex items-center space-x-2 transition-all cursor-pointer self-start"
                      >
                        <Volume2 className="w-4 h-4 text-rose-600" />
                        <span>Siren Sound Control</span>
                      </button>
                    </div>

                    {/* Location and GPS Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                        <div className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-600" />
                          <span>Campus Location</span>
                        </div>
                        <div className="text-sm font-black text-slate-900 mt-1">
                          {selectedEmergency.locationPreset}
                        </div>
                        {selectedEmergency.locationCustom && (
                          <div className="text-xs text-slate-600 mt-0.5 font-medium">
                            Details: {selectedEmergency.locationCustom}
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                        <div className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center space-x-1.5">
                          <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                          <span>GPS Coordinates / Accuracy</span>
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                          {selectedEmergency.coordinates ? (
                            <span>
                              Lat: {selectedEmergency.coordinates.latitude.toFixed(5)}, Lng:{' '}
                              {selectedEmergency.coordinates.longitude.toFixed(5)} (±
                              {Math.round(selectedEmergency.coordinates.accuracyMeters || 10)}m)
                            </span>
                          ) : (
                            <span className="text-slate-400 font-sans">Campus Preset Location (Colombo 06)</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Vipulananda College Security Grid Reference
                        </div>
                      </div>
                    </div>

                    {/* Emergency Message & Voice Dispatch Card */}
                    <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-3">
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-purple-950 mb-1">
                          Directives & Situation Message:
                        </div>
                        <p className="text-sm text-slate-800 font-medium leading-relaxed">
                          {selectedEmergency.message}
                        </p>
                      </div>

                      {/* Voice Audio Message if available */}
                      {selectedEmergency.voiceMessage && (
                        <div className="bg-white rounded-xl p-3 border border-purple-200 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleTogglePlayVoice(
                                  selectedEmergency.id,
                                  selectedEmergency.voiceMessage?.audioBlobUrl || selectedEmergency.voiceMessage?.signedUrl
                                )
                              }
                              className="p-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl shadow-xs cursor-pointer"
                            >
                              {playingAudioId === selectedEmergency.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </button>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900">
                                🎙️ Emergency Voice Dispatch Audio
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Duration: {selectedEmergency.voiceMessage.durationSeconds}s • Recorded by{' '}
                                {selectedEmergency.voiceMessage.uploadedByName || selectedEmergency.createdByName}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                            Verified Dispatch Audio
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Acknowledgement Status Meter */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                          <CheckCheck className="w-4 h-4 text-emerald-600" />
                          <span>Response & Acknowledgement Progress</span>
                        </span>
                        <span className="font-mono font-bold text-purple-900">
                          {selectedEmergency.acknowledgedCount} of {selectedEmergency.totalRecipientsCount} Acknowledged (
                          {selectedEmergency.totalRecipientsCount > 0
                            ? Math.round((selectedEmergency.acknowledgedCount / selectedEmergency.totalRecipientsCount) * 100)
                            : 0}
                          %)
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all"
                          style={{
                            width: `${
                              selectedEmergency.totalRecipientsCount > 0
                                ? (selectedEmergency.acknowledgedCount / selectedEmergency.totalRecipientsCount) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Target: {selectedEmergency.targetSummary}</span>
                        <button
                          onClick={() => setActiveSubTab('acknowledgements')}
                          className="text-purple-900 hover:underline font-bold"
                        >
                          View Full Recipient Matrix &rarr;
                        </button>
                      </div>
                    </div>

                    {/* Action Command Bar for Responder & Administrators */}
                    <div className="bg-gradient-to-r from-slate-900 to-purple-950 rounded-2xl p-4 text-white space-y-4">
                      <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center justify-between">
                        <span>🚨 Incident Command Actions</span>
                        <span className="text-[10px] text-purple-300 font-sans">
                          Logged as {session.name} ({session.roleTitle || session.role})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {/* 1. Quick Acknowledge */}
                        <button
                          onClick={() => handleAcknowledge(selectedEmergency.id)}
                          className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Acknowledge</span>
                        </button>

                        {/* 2. Manual Escalate */}
                        <button
                          onClick={() => handleEscalate(selectedEmergency.id)}
                          className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Escalate Priority</span>
                        </button>

                        {/* 3. Resolve Emergency */}
                        {canResolve && (
                          <button
                            onClick={() => setResolvingEmergency(selectedEmergency)}
                            className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Resolve Incident</span>
                          </button>
                        )}

                        {/* 4. Cancel False Alarm */}
                        {canResolve && (
                          <button
                            onClick={() => handleCancelAlarm(selectedEmergency.id)}
                            className="px-3.5 py-2.5 bg-slate-700 hover:bg-slate-600 text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span>False Alarm</span>
                          </button>
                        )}
                      </div>

                      {/* Response Status Transition Form */}
                      {canUpdateStatus && (
                        <div className="pt-3 border-t border-purple-800/60 space-y-2">
                          <div className="text-[11px] font-bold text-purple-200">
                            Update Operational Response Status & Log Notes:
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <select
                              value={responseStatusInput[selectedEmergency.id] || selectedEmergency.status}
                              onChange={(e) =>
                                setResponseStatusInput({
                                  ...responseStatusInput,
                                  [selectedEmergency.id]: e.target.value as EmergencyStatus,
                                })
                              }
                              className="w-full sm:w-48 px-3 py-2 bg-purple-900 border border-purple-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                              <option value="RESPONDING">RESPONDING (On-Site)</option>
                              <option value="ASSISTANCE_DISPATCHED">ASSISTANCE DISPATCHED</option>
                            </select>

                            <input
                              type="text"
                              placeholder="Enter on-site notes (e.g. Officer deployed with medical kit)..."
                              value={responseNoteInput[selectedEmergency.id] || ''}
                              onChange={(e) =>
                                setResponseNoteInput({
                                  ...responseNoteInput,
                                  [selectedEmergency.id]: e.target.value,
                                })
                              }
                              className="flex-1 w-full px-3 py-2 bg-purple-900/60 border border-purple-700 rounded-xl text-xs text-white placeholder:text-purple-400 focus:outline-none"
                            />

                            <button
                              onClick={() => handleUpdateStatus(selectedEmergency.id)}
                              className="w-full sm:w-auto px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                            >
                              Update Status
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline of Response Updates */}
                    {selectedEmergency.responseUpdates.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                          Response History & Notes ({selectedEmergency.responseUpdates.length})
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {selectedEmergency.responseUpdates.map((ru) => (
                            <div key={ru.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                              <div className="flex items-center justify-between font-bold text-slate-900">
                                <span>
                                  {ru.actorName} ({ru.actorRole})
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(ru.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-slate-700 mt-1">{ru.note}</div>
                              {ru.actionTaken && (
                                <div className="text-emerald-700 text-[11px] font-semibold mt-0.5">
                                  Action: {ru.actionTaken}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
                    <p className="text-xs text-slate-400">Select an emergency from the queue to view command controls</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: TRIGGER EMERGENCY GATEWAY */}
      {activeSubTab === 'trigger' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 font-cinzel">Emergency Trigger Gateway</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the appropriate safety alarm archetype below according to the nature of the situation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Global Alarm */}
            <div className="bg-gradient-to-br from-rose-50 to-red-50/50 rounded-3xl p-6 border-2 border-rose-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="p-3 bg-rose-600 text-white rounded-2xl w-fit shadow-md mb-3">
                  <Radio className="w-6 h-6 animate-ping" />
                </div>
                <div className="text-[10px] font-black uppercase text-rose-600 tracking-wider">Campus-Wide</div>
                <h4 className="text-lg font-black text-slate-900 font-cinzel mt-0.5">Global Emergency Alarm</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Broadcasts an instant acoustic siren and critical warning notification to all faculty, staff, parents, and students across Vipulananda College.
                </p>
                <div className="mt-3 text-[11px] text-rose-900 font-bold bg-rose-100/70 p-2 rounded-xl">
                  Authorized: Principal, Vice Principal, Admin, CPO, Security
                </div>
              </div>

              <button
                disabled={!canTriggerGlobal}
                onClick={() => setIsGlobalAlarmOpen(true)}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                  canTriggerGlobal
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>[ Broadcast Global Alarm ]</span>
              </button>
            </div>

            {/* Card 2: Student SOS Distress */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-6 border-2 border-amber-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="p-3 bg-amber-500 text-white rounded-2xl w-fit shadow-md mb-3">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Student Safety</div>
                <h4 className="text-lg font-black text-slate-900 font-cinzel mt-0.5">Student SOS Distress</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  One-touch safety distress call that automatically notifies the designated Child Protection Officer, Class Teacher, Guardian, and Principal.
                </p>
                <div className="mt-3 text-[11px] text-amber-900 font-bold bg-amber-100/70 p-2 rounded-xl">
                  Immediate 4-Way Safeguarding Auto-Routing
                </div>
              </div>

              <button
                onClick={() => setIsStudentSosOpen(true)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md shadow-amber-500/30 cursor-pointer transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>[ Trigger Student SOS ]</span>
              </button>
            </div>

            {/* Card 3: Targeted Emergency */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-3xl p-6 border-2 border-purple-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="p-3 bg-purple-900 text-white rounded-2xl w-fit shadow-md mb-3">
                  <Target className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black uppercase text-purple-900 tracking-wider">Selective Response</div>
                <h4 className="text-lg font-black text-slate-900 font-cinzel mt-0.5">Targeted Emergency Alert</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Selectively notify specific students, parents, class teachers, infirmary medical officers, or campus security marshals with voice dispatch.
                </p>
                <div className="mt-3 text-[11px] text-purple-950 font-bold bg-purple-100/70 p-2 rounded-xl">
                  Authorized: Teachers, Staff, Leadership, CPO
                </div>
              </div>

              <button
                disabled={!canTriggerTargeted}
                onClick={() => setIsTargetedAlertOpen(true)}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                  canTriggerTargeted
                    ? 'bg-purple-900 hover:bg-purple-950 text-white shadow-md shadow-purple-900/30 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>[ Configure Targeted Alert ]</span>
              </button>
            </div>

            {/* Card 4: Parent Emergency Portal */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-3xl p-6 border-2 border-orange-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="p-3 bg-orange-600 text-white rounded-2xl w-fit shadow-md mb-3">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black uppercase text-orange-700 tracking-wider">Family & Guardian</div>
                <h4 className="text-lg font-black text-slate-900 font-cinzel mt-0.5">Parent Emergency Portal</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Direct line for parents and legal guardians to transmit urgent healthcare, pickup proxy, or transport emergency alerts regarding their children.
                </p>
              </div>

              <button
                onClick={() => setIsParentAlertOpen(true)}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md shadow-orange-600/30 cursor-pointer transition-all"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>[ Transmit Parent Alert ]</span>
              </button>
            </div>

            {/* Card 5: Child Protection Safeguarding */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50/50 rounded-3xl p-6 border-2 border-teal-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="p-3 bg-teal-700 text-white rounded-2xl w-fit shadow-md mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black uppercase text-teal-800 tracking-wider">Confidential Safeguarding</div>
                <h4 className="text-lg font-black text-slate-900 font-cinzel mt-0.5">Child Protection Alert</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Confidential safeguarding channel connecting directly to Mrs. S. Meenakshi (Lead CPO) and the Principal under Sri Lankan Child Protection guidelines.
                </p>
              </div>

              <button
                onClick={() => setIsTargetedAlertOpen(true)}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md shadow-teal-700/30 cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>[ Confidential CPO Alert ]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: ACKNOWLEDGEMENT MATRIX */}
      {activeSubTab === 'acknowledgements' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-cinzel">Acknowledgement & Delivery Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of individual delivery, receipt, and confirmation timestamps.
              </p>
            </div>

            {/* Select active emergency to inspect */}
            <select
              value={selectedEmergencyId || ''}
              onChange={(e) => setSelectedEmergencyId(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            >
              {alerts.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.id}] {a.title} ({a.status})
                </option>
              ))}
            </select>
          </div>

          {selectedEmergency ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-900">{selectedEmergency.title}</div>
                  <div className="text-[11px] text-slate-500">
                    Location: {selectedEmergency.locationPreset} • Created: {new Date(selectedEmergency.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    Total: {selectedEmergency.recipients.length} Recipients
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full">
                    {selectedEmergency.acknowledgedCount} Acknowledged
                  </span>
                </div>
              </div>

              {selectedEmergency.recipients.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Global broadcast alert delivered to all active session portals.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">Recipient Name</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Sent Time</th>
                        <th className="py-3 px-4">Delivered</th>
                        <th className="py-3 px-4">Acknowledged At</th>
                        <th className="py-3 px-4">Note / Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {selectedEmergency.recipients.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900">{rec.recipientName}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-900 rounded font-bold text-[10px]">
                              {rec.recipientRole}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                rec.deliveryStatus === 'ACKNOWLEDGED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.deliveryStatus === 'DELIVERED'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {rec.deliveryStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                            {new Date(rec.sentAt).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                            {rec.deliveredAt ? new Date(rec.deliveredAt).toLocaleTimeString() : '—'}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-emerald-700 font-bold">
                            {rec.acknowledgedAt ? new Date(rec.acknowledgedAt).toLocaleTimeString() : 'Pending'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 italic">
                            {rec.acknowledgementNote || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">No emergency selected</div>
          )}
        </div>
      )}

      {/* SUB-VIEW 4: ESCALATION MONITOR */}
      {activeSubTab === 'escalation' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 font-cinzel">Automatic Escalation Monitor</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unacknowledged high-priority incidents automatically trigger secondary and tertiary escalation tiers to ensure zero neglected emergencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-3xl border-2 border-indigo-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-900 font-bold text-xs rounded-full">
                  Level 1 Escalation
                </span>
                <span className="font-mono text-xs text-slate-500 font-bold">{settings.escalationTimeMinutesLevel1} Minutes</span>
              </div>
              <h4 className="text-sm font-black text-slate-900">Child Protection Lead (CPO)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                If unacknowledged after {settings.escalationTimeMinutesLevel1} minutes, the incident escalates directly to Mrs. S. Meenakshi (Lead CPO) with high-priority acoustic chime.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-purple-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 font-bold text-xs rounded-full">
                  Level 2 Escalation
                </span>
                <span className="font-mono text-xs text-slate-500 font-bold">{settings.escalationTimeMinutesLevel2} Minutes</span>
              </div>
              <h4 className="text-sm font-black text-slate-900">Principal & Vice Principal</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                If unacknowledged after {settings.escalationTimeMinutesLevel2} minutes, alert elevates to Principal Mr. K. Thirunavukkarasu & Vice Principal Mrs. P. Vimalarani.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-rose-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-900 font-bold text-xs rounded-full">
                  Level 3 Escalation
                </span>
                <span className="font-mono text-xs text-slate-500 font-bold">{settings.escalationTimeMinutesLevel3} Minutes</span>
              </div>
              <h4 className="text-sm font-black text-slate-900">Emergency Response Taskforce</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                If unacknowledged after {settings.escalationTimeMinutesLevel3} minutes, campus lockdown security marshals and College Medical Unit are automatically dispatched.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: HISTORICAL REPORTS */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-cinzel">Historical Emergency Reports</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Archived records of all past emergencies, resolution notes, and deployed action plans.
              </p>
            </div>

            <button
              onClick={exportHistoryCsv}
              className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search history by ID, location, author..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <select
              value={historyTypeFilter}
              onChange={(e) => setHistoryTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="GLOBAL_EMERGENCY_ALARM">Global Alarms</option>
              <option value="STUDENT_SOS">Student SOS</option>
              <option value="TARGETED_EMERGENCY_ALERT">Targeted Alerts</option>
              <option value="PARENT_EMERGENCY_ALERT">Parent Alerts</option>
              <option value="CHILD_PROTECTION_ALERT">Child Protection</option>
            </select>

            <select
              value={historyStatusFilter}
              onChange={(e) => setHistoryStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Emergency ID</th>
                  <th className="py-3 px-4">Type & Title</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Resolved By / Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-purple-950">{h.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{h.title}</div>
                      <div className="text-[10px] text-slate-500">{h.type}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          h.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : h.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {h.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{h.locationPreset}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          h.status === 'ACTIVE'
                            ? 'bg-rose-100 text-rose-800'
                            : h.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(h.createdAt).toLocaleDateString()}{' '}
                      {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      {h.resolvedBy ? (
                        <div>
                          <div className="text-[11px] font-bold text-emerald-800">{h.resolvedBy}</div>
                          <div className="text-[10px] text-slate-500 italic truncate max-w-xs">{h.resolutionNote}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Active Incident</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: IMMUTABLE AUDIT LEDGER */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-900" />
                <h3 className="text-lg font-black text-slate-900 font-cinzel">Immutable Emergency Audit Ledger</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cryptographically sequenced trail of every safety alert creation, acknowledgment, voice message access, escalation, and resolution.
              </p>
            </div>

            <span className="text-xs font-mono font-bold bg-purple-50 text-purple-900 px-3 py-1 rounded-full border border-purple-200">
              {auditLogs.length} Immutable Entries
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 text-xs flex items-start justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-950 rounded font-mono font-black text-[10px]">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-900">
                      {log.userName} ({log.userRole})
                    </span>
                    {log.emergencyId && (
                      <span className="text-slate-400 font-mono text-[10px]">[{log.emergencyId}]</span>
                    )}
                  </div>
                  <p className="text-slate-700 text-xs">{log.details}</p>
                </div>

                <div className="text-right shrink-0 font-mono text-[10px] text-slate-400">
                  <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: SAFETY SETTINGS & SUPABASE BACKEND SCHEMA */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Settings Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-cinzel">Safety & Communication Settings</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure acoustic alarms, vibration triggers, escalation timeouts, and authorized global broadcast credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              {/* Sound & Siren Controls */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-purple-950 tracking-wider flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-purple-900" />
                  <span>Acoustic Siren & Audio Synthesizer</span>
                </h4>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Emergency Sound Alarm</div>
                      <div className="text-[11px] text-slate-500">Play synthesize emergency warble siren tone</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emergencySoundEnabled}
                      onChange={(e) =>
                        handleSaveConfig({ ...settings, emergencySoundEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-purple-900 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>Alarm Volume</span>
                      <span className="font-mono">{Math.round(settings.soundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.soundVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSirenVolume(val);
                        handleSaveConfig({ ...settings, soundVolume: val });
                      }}
                      className="w-full accent-purple-900 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => playTestSiren(2)}
                      className="px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      🔊 Test Siren (2s)
                    </button>
                    <button
                      type="button"
                      onClick={playUrgentAlertChime}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      🔔 Test Chime
                    </button>
                  </div>
                </div>
              </div>

              {/* Escalation Thresholds */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-purple-950 tracking-wider flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-900" />
                  <span>Escalation Time Thresholds</span>
                </h4>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Level 1 (CPO)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.escalationTimeMinutesLevel1}
                        onChange={(e) =>
                          handleSaveConfig({
                            ...settings,
                            escalationTimeMinutesLevel1: parseInt(e.target.value) || 2,
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Level 2 (Principal)</label>
                      <input
                        type="number"
                        min="2"
                        max="60"
                        value={settings.escalationTimeMinutesLevel2}
                        onChange={(e) =>
                          handleSaveConfig({
                            ...settings,
                            escalationTimeMinutesLevel2: parseInt(e.target.value) || 5,
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Level 3 (Taskforce)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={settings.escalationTimeMinutesLevel3}
                        onChange={(e) =>
                          handleSaveConfig({
                            ...settings,
                            escalationTimeMinutesLevel3: parseInt(e.target.value) || 10,
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supabase Database SQL Schema Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white font-cinzel">Supabase Production SQL DDL Schema</h4>
                  <p className="text-xs text-slate-400">
                    Tables, foreign keys, and RLS policies for emergency alerts, recipients, voice recordings, and audit logs.
                  </p>
                </div>
              </div>

              <button
                onClick={copySqlSchema}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
              >
                {sqlCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{sqlCopied ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
              </button>
            </div>

            <pre className="p-4 bg-black/50 rounded-2xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-72 border border-slate-800">
              {SUPABASE_EMERGENCY_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}

      {/* MODALS */}
      <GlobalAlarmModal
        isOpen={isGlobalAlarmOpen}
        onClose={() => setIsGlobalAlarmOpen(false)}
        onActivate={handleCreateGlobalAlarm}
        authorName={session.name}
        authorRole={session.roleTitle || session.role.toUpperCase()}
      />

      <StudentSosModal
        isOpen={isStudentSosOpen}
        onClose={() => setIsStudentSosOpen(false)}
        onSendSos={handleCreateStudentSos}
        studentName={session.name}
        studentGrade={session.departmentOrGrade || 'Grade 10-A'}
      />

      <TargetedAlertModal
        isOpen={isTargetedAlertOpen}
        onClose={() => setIsTargetedAlertOpen(false)}
        onSendTargeted={handleCreateTargeted}
        authorName={session.name}
        authorRole={session.roleTitle || session.role.toUpperCase()}
        studentsList={students}
        staffList={staff}
        classesList={classes}
        parentsList={parents}
      />

      <ParentEmergencyModal
        isOpen={isParentAlertOpen}
        onClose={() => setIsParentAlertOpen(false)}
        onSendParentAlert={handleCreateParentAlert}
        parentName={session.name}
        childName="Suresh Kumar"
        childGrade="Grade 11-A"
      />

      <ResolveEmergencyModal
        isOpen={Boolean(resolvingEmergency)}
        onClose={() => setResolvingEmergency(null)}
        emergency={resolvingEmergency}
        onResolve={handleConfirmResolve}
        resolverName={session.name}
        resolverRole={session.roleTitle || session.role.toUpperCase()}
      />
    </div>
  );
};
