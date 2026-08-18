import React, { useState, useMemo } from 'react';
import {
  Target,
  X,
  Search,
  CheckSquare,
  Square,
  Users,
  UserCheck,
  ShieldCheck,
  Building,
  HeartPulse,
  Phone,
  AlertCircle,
  MapPin,
  Send,
} from 'lucide-react';
import { LocationPreset, EmergencyPriority, RecipientRole } from '../../types/emergency';
import { StaffMember, Student, SchoolClass, ParentProfile } from '../../types/sms';
import { VoiceRecorder } from './VoiceRecorder';

interface TargetedAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTargeted: (data: {
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
  }) => void;
  authorName: string;
  authorRole: string;
  studentsList: Student[];
  staffList: StaffMember[];
  classesList: SchoolClass[];
  parentsList: ParentProfile[];
}

const LOCATION_PRESETS: LocationPreset[] = [
  'Classroom Block A (Primary)',
  'Classroom Block B (Secondary & A/L)',
  'Science & Computer Laboratories',
  'Medical Bay & Infirmary',
  'Playground & Sports Pavilion',
  'Saraswathi Block (Girls Lounge)',
  'Library & Reading Hall',
  'Main Gate & Security Post',
  'College Canteen & Dining Area',
  'School Bus & Transport Terminal',
  'Other (Custom)',
];

interface SelectableContact {
  id: string;
  name: string;
  role: RecipientRole;
  roleLabel: string;
  departmentOrClass: string;
  contactNumber?: string;
  email?: string;
  category: 'LEADERSHIP' | 'CPO_SAFEGUARD' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'MEDICAL_SECURITY';
}

export const TargetedAlertModal: React.FC<TargetedAlertModalProps> = ({
  isOpen,
  onClose,
  onSendTargeted,
  authorName,
  authorRole,
  studentsList = [],
  staffList = [],
  classesList = [],
  parentsList = [],
}) => {
  const [title, setTitle] = useState('Urgent Safety Notice - Action Required');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<EmergencyPriority>('HIGH');
  const [locationPreset, setLocationPreset] = useState<LocationPreset>('Classroom Block B (Secondary & A/L)');
  const [locationCustom, setLocationCustom] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<Set<string>>(new Set());
  const [voiceBlob, setVoiceBlob] = useState<Blob | undefined>(undefined);
  const [voiceDuration, setVoiceDuration] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compile unified searchable contact pool
  const allContacts: SelectableContact[] = useMemo(() => {
    const list: SelectableContact[] = [];

    // 1. Leadership & Safeguarding CPO
    list.push({
      id: 'cpo-01',
      name: 'Mrs. S. Meenakshi',
      role: 'CPO',
      roleLabel: 'Child Protection Officer (CPO Lead)',
      departmentOrClass: 'Student Safeguarding Commission',
      contactNumber: '+94 77 123 4567',
      email: 'cpo.meenakshi@vipulanantha.sch.lk',
      category: 'CPO_SAFEGUARD',
    });

    list.push({
      id: 'prn-01',
      name: 'Mr. K. Thirunavukkarasu',
      role: 'PRINCIPAL',
      roleLabel: 'College Principal',
      departmentOrClass: 'Principal Executive Office',
      contactNumber: '+94 11 258 8492',
      email: 'principal@vipulanantha.sch.lk',
      category: 'LEADERSHIP',
    });

    list.push({
      id: 'vp-01',
      name: 'Mrs. P. Vimalarani',
      role: 'VICE_PRINCIPAL',
      roleLabel: 'Vice Principal (Academic & Discipline)',
      departmentOrClass: 'Vice Principal Office',
      contactNumber: '+94 11 258 8493',
      email: 'vp.academic@vipulanantha.sch.lk',
      category: 'LEADERSHIP',
    });

    list.push({
      id: 'nurse-01',
      name: 'Sister Kamala (Nurse)',
      role: 'NURSE',
      roleLabel: 'College Medical Officer',
      departmentOrClass: 'Infirmary / Health Bay',
      contactNumber: '+94 77 555 1212',
      email: 'nurse@vipulanantha.sch.lk',
      category: 'MEDICAL_SECURITY',
    });

    list.push({
      id: 'sec-01',
      name: 'Chief Security Officer Perera',
      role: 'SECURITY',
      roleLabel: 'Campus Security Marshal',
      departmentOrClass: 'Main Security Post',
      contactNumber: '+94 77 444 8899',
      email: 'security@vipulanantha.sch.lk',
      category: 'MEDICAL_SECURITY',
    });

    // 2. Teachers & Staff
    (staffList || []).forEach((s) => {
      if (!list.some((existing) => existing.id === s.id)) {
        list.push({
          id: s.id,
          name: s.fullName,
          role: 'TEACHER',
          roleLabel: s.role || s.specialization || 'Teacher',
          departmentOrClass: s.department || 'Academic',
          contactNumber: s.phone || '',
          email: s.email || '',
          category: 'TEACHER',
        });
      }
    });

    // 3. Students
    (studentsList || []).forEach((st) => {
      list.push({
        id: st.id,
        name: st.fullName,
        role: 'STUDENT',
        roleLabel: `Student (${st.grade || 'Grade'}-${st.stream || 'General'})`,
        departmentOrClass: `Index: ${st.indexNumber || st.id}`,
        category: 'STUDENT',
      });
    });

    // 4. Parents
    (parentsList || []).forEach((p) => {
      const childNames = (p.children || []).map((c) => c.studentName).join(', ');
      list.push({
        id: p.id,
        name: `${p.fatherName || p.motherName || p.guardianName || 'Parent'} (Guardian)`,
        role: 'PARENT',
        roleLabel: childNames ? `Guardian of ${childNames}` : 'Guardian',
        departmentOrClass: `Phone: ${p.primaryContactNumber || ''}`,
        contactNumber: p.primaryContactNumber || '',
        category: 'PARENT',
      });
    });

    return list;
  }, [staffList, studentsList, parentsList]);

  // Filter contacts by category & search query
  const filteredContacts = useMemo(() => {
    return allContacts.filter((c) => {
      const matchCat = categoryFilter === 'ALL' || c.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.roleLabel.toLowerCase().includes(q) ||
        c.departmentOrClass.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [allContacts, categoryFilter, searchQuery]);

  const toggleRecipient = (id: string) => {
    const next = new Set(selectedRecipientIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRecipientIds(next);
  };

  const handleSelectGroup = (groupType: 'LEADERSHIP_CPO' | 'CLASS_TEACHERS' | 'MEDICAL_SEC') => {
    const next = new Set(selectedRecipientIds);
    if (groupType === 'LEADERSHIP_CPO') {
      allContacts
        .filter((c) => c.category === 'LEADERSHIP' || c.category === 'CPO_SAFEGUARD')
        .forEach((c) => next.add(c.id));
    } else if (groupType === 'CLASS_TEACHERS') {
      allContacts.filter((c) => c.category === 'TEACHER').forEach((c) => next.add(c.id));
    } else if (groupType === 'MEDICAL_SEC') {
      allContacts.filter((c) => c.category === 'MEDICAL_SECURITY').forEach((c) => next.add(c.id));
    }
    setSelectedRecipientIds(next);
  };

  const clearSelection = () => {
    setSelectedRecipientIds(new Set());
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecipientIds.size === 0) return;

    setIsSubmitting(true);

    const recipients = Array.from(selectedRecipientIds).map((id) => {
      const contact = allContacts.find((c) => c.id === id)!;
      return {
        recipientId: contact.id,
        recipientName: contact.name,
        recipientRole: contact.role,
        contactNumber: contact.contactNumber,
        email: contact.email,
      };
    });

    const targetSummary = recipients
      .map((r) => `${r.recipientName} (${r.recipientRole})`)
      .slice(0, 4)
      .join(', ') + (recipients.length > 4 ? ` + ${recipients.length - 4} others` : '');

    onSendTargeted({
      title: title.trim(),
      message: message.trim(),
      priority,
      locationPreset,
      locationCustom: locationPreset === 'Other (Custom)' ? locationCustom.trim() : undefined,
      targetSummary,
      recipients,
      voiceBlob,
      voiceDuration,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-400 text-purple-950 rounded-2xl shadow-md">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-amber-300">
                Authorized Targeted Alert Gateway
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-cinzel text-white">
                🎯 TARGETED EMERGENCY ALERT
              </h2>
              <p className="text-xs text-purple-200 mt-0.5">
                Send a secure, verified emergency notification directly to specific individuals or response groups.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
          {/* Headline & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Emergency Alert Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EmergencyPriority)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-600"
              >
                <option value="CRITICAL">🚨 CRITICAL (Siren Alarm)</option>
                <option value="HIGH">⚠️ HIGH (Urgent Tone)</option>
                <option value="MEDIUM">ℹ️ MEDIUM</option>
                <option value="LOW">📝 LOW</option>
              </select>
            </div>
          </div>

          {/* Location Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-700" />
                <span>Incident Location <span className="text-rose-600">*</span></span>
              </label>
              <select
                value={locationPreset}
                onChange={(e) => setLocationPreset(e.target.value as LocationPreset)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-purple-600"
              >
                {LOCATION_PRESETS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {locationPreset === 'Other (Custom)' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Custom Location Details
                </label>
                <input
                  type="text"
                  required
                  placeholder="Specify exact room or campus wing"
                  value={locationCustom}
                  onChange={(e) => setLocationCustom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-purple-600"
                />
              </div>
            )}
          </div>

          {/* Message Directives */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Emergency Message & Action Directives <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide exact details for the selected recipients..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Voice Message Recorder */}
          <VoiceRecorder
            onRecordingComplete={(blob, duration) => {
              setVoiceBlob(blob);
              setVoiceDuration(duration);
            }}
            onRecordingRemoved={() => {
              setVoiceBlob(undefined);
              setVoiceDuration(undefined);
            }}
          />

          {/* Target Recipients Multi-Picker Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-900" />
                  <span>Select Target Recipients ({selectedRecipientIds.size} Selected)</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Alert is strictly delivered only to the verified individuals checked below.
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleSelectGroup('LEADERSHIP_CPO')}
                  className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  + CPO & Leadership
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectGroup('MEDICAL_SEC')}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  + Nurse & Security
                </button>
                {selectedRecipientIds.size > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-[11px] text-rose-600 hover:underline font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, role, index or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex overflow-x-auto no-scrollbar space-x-1 w-full sm:w-auto">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'CPO_SAFEGUARD', label: 'CPO' },
                  { id: 'LEADERSHIP', label: 'Executive' },
                  { id: 'TEACHER', label: 'Teachers' },
                  { id: 'MEDICAL_SECURITY', label: 'Health/Sec' },
                  { id: 'STUDENT', label: 'Students' },
                  { id: 'PARENT', label: 'Parents' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setCategoryFilter(pill.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      categoryFilter === pill.id
                        ? 'bg-purple-900 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 bg-white rounded-xl">
              {filteredContacts.map((contact) => {
                const isSelected = selectedRecipientIds.has(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => toggleRecipient(contact.id)}
                    className={`p-2.5 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-400 ring-1 ring-purple-400'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="mt-0.5 text-purple-900">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 fill-purple-900 text-white" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 truncate">{contact.name}</span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 shrink-0 ml-1">
                          {contact.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{contact.roleLabel}</div>
                      <div className="text-[9px] text-slate-400 truncate">{contact.departmentOrClass}</div>
                    </div>
                  </div>
                );
              })}

              {filteredContacts.length === 0 && (
                <div className="col-span-2 py-6 text-center text-xs text-slate-400">
                  No contacts found matching search query
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              [ CANCEL ]
            </button>

            <button
              type="submit"
              disabled={selectedRecipientIds.size === 0 || isSubmitting}
              className={`w-full sm:w-auto px-7 py-3 rounded-xl text-xs sm:text-sm font-black tracking-wide shadow-lg flex items-center justify-center space-x-2 transition-all ${
                selectedRecipientIds.size > 0 && !isSubmitting
                  ? 'bg-purple-900 hover:bg-purple-950 text-white cursor-pointer shadow-purple-900/30'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>[ SEND TARGETED ALERT ({selectedRecipientIds.size} RECIPIENTS) ]</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
