import React, { useState } from 'react';
import { UserRole } from '../../types/schoolProfile';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

interface PermissionsTabProps {
  currentRole: UserRole;
  onSwitchRole: (newRole: UserRole) => void;
  canEdit: boolean;
}

interface RoleCapability {
  id: string;
  name: string;
  category: string;
  description: string;
  allowedRoles: UserRole[];
}

const DEFAULT_CAPABILITIES: RoleCapability[] = [
  {
    id: 'edit_basic_info',
    name: 'Edit School Basic Info & Ministry Registry',
    category: 'General Administration',
    description: 'Modify official name, census code, contact details, and location.',
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'],
  },
  {
    id: 'manage_branding',
    name: 'Upload Logo & Manage Theme Colors',
    category: 'Institutional Branding',
    description: 'Update official emblem, change primary/secondary theme colors, login background.',
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
  },
  {
    id: 'manage_leadership',
    name: 'Manage Leadership Directory',
    category: 'Executive Governance',
    description: 'Add, update or remove Principal, Vice Principals and Section Heads.',
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
  },
  {
    id: 'access_confidential_cases',
    name: 'Access Confidential Child Protection Cases',
    category: 'Safeguarding & Student Protection',
    description: 'Strictly restricted view and investigation log of child protection records.',
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'CHILD_PROTECTION_OFFICER'],
  },
  {
    id: 'manage_safety_settings',
    name: 'Configure Student Safety & SOS Toggles',
    category: 'Safeguarding & Student Protection',
    description: 'Enable/disable emergency hotlines, anonymous reporting, female welfare desk.',
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'CHILD_PROTECTION_OFFICER'],
  },
  {
    id: 'manage_emergency_contacts',
    name: 'Manage Emergency Services & Hotlines',
    category: 'Crisis Management',
    description: 'Update police, hospital, fire, and NCPA contacts.',
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'],
  },
  {
    id: 'manage_facilities',
    name: 'Update Campus Facilities & Lab Inventory',
    category: 'Campus Operations',
    description: 'Modify classroom counts, lab equipment, athletic facilities.',
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'],
  },
  {
    id: 'publish_policies',
    name: 'Publish & Ratify Official Policies',
    category: 'Statutory Compliance',
    description: 'Update student conduct, ethical charters, assessment regulations.',
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
  },
  {
    id: 'configure_academic_system',
    name: 'Configure Academic Year, Terms & Grading',
    category: 'Academic System Engine',
    description: 'Switch active terms, define period schedules, pass marks.',
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'],
  },
  {
    id: 'view_audit_trail',
    name: 'View Security Audit Trail & Access Logs',
    category: 'Security & Audit',
    description: 'Inspect cryptographic timestamps, actor IDs, IP logs, and change diffs.',
    allowedRoles: ['SUPER_ADMIN', 'PRINCIPAL'],
  },
];

const ROLES_LIST: { role: UserRole; label: string; description: string }[] = [
  {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Full unconstrained system authority and security audit oversight',
  },
  {
    role: 'PRINCIPAL',
    label: 'Principal',
    description: 'Chief institutional officer with full governance and policy authority',
  },
  {
    role: 'VICE_PRINCIPAL',
    label: 'Vice Principal',
    description: 'Academic & administrative operations leadership',
  },
  {
    role: 'CHILD_PROTECTION_OFFICER',
    label: 'Child Protection Officer',
    description: 'Statutory safeguarding officer with exclusive confidential cases clearance',
  },
  {
    role: 'TEACHER',
    label: 'Teacher / Staff',
    description: 'Academic instructor with standard read and classroom input access',
  },
  {
    role: 'STUDENT',
    label: 'Student',
    description: 'Student portal with welfare access and public directory view',
  },
  {
    role: 'PARENT',
    label: 'Parent / Guardian',
    description: 'Parent portal with emergency services and school info view',
  },
];

export const PermissionsTab: React.FC<PermissionsTabProps> = ({
  currentRole,
  onSwitchRole,
  canEdit,
}) => {
  const [capabilities, setCapabilities] = useState<RoleCapability[]>(DEFAULT_CAPABILITIES);
  const [notification, setNotification] = useState<string | null>(null);

  const handleToggleRolePermission = (capId: string, role: UserRole) => {
    if (!canEdit || currentRole !== 'SUPER_ADMIN') return;

    setCapabilities((prev) =>
      prev.map((cap) => {
        if (cap.id !== capId) return cap;
        const exists = cap.allowedRoles.includes(role);
        return {
          ...cap,
          allowedRoles: exists
            ? cap.allowedRoles.filter((r) => r !== role)
            : [...cap.allowedRoles, role],
        };
      })
    );

    setNotification(`Permissions updated for role ${role}`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4 text-purple-700" />
            <span>Role-Based Access Control (RBAC) & Row-Level Security</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-slate-900">
            Permissions Matrix & Role Authority Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure functional privileges, confidential data clearance, and audit access per role
          </p>
        </div>

        {/* Role Simulator Selector */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="text-xs font-bold text-purple-950 flex items-center space-x-1.5">
            <UserCheck className="w-4 h-4 text-purple-800 shrink-0" />
            <span>Active Session Role:</span>
          </div>
          <select
            value={currentRole}
            onChange={(e) => onSwitchRole(e.target.value as UserRole)}
            className="bg-white border border-purple-300 rounded-xl px-3 py-1.5 text-xs font-bold text-purple-950 focus:ring-2 focus:ring-purple-900 cursor-pointer"
          >
            {ROLES_LIST.map((r) => (
              <option key={r.role} value={r.role}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Role Switcher Explanatory Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-purple-900 shrink-0 mt-0.5" />
        <div className="flex-1">
          <strong className="text-slate-900 font-bold">Role Simulator Enabled:</strong> Switch the active session role above to test permissions across all 12 modules in real-time. Notice how confidential child protection cases in Tab 5 and administrative edit tools automatically adapt to your role.
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-cinzel font-bold text-sm text-slate-900">
            System Privileges & Authorization Matrix
          </h3>
          <span className="text-[11px] font-semibold text-purple-900 font-mono">
            RLS Policy Synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[220px]">Capability / Module</th>
                <th className="py-3 px-3 text-center">Super Admin</th>
                <th className="py-3 px-3 text-center">Principal</th>
                <th className="py-3 px-3 text-center">Vice Principal</th>
                <th className="py-3 px-3 text-center bg-purple-50/50 text-purple-950 font-extrabold">CPO</th>
                <th className="py-3 px-3 text-center">Teacher</th>
                <th className="py-3 px-3 text-center">Student</th>
                <th className="py-3 px-3 text-center">Parent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {capabilities.map((cap) => (
                <tr key={cap.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{cap.name}</div>
                    <div className="text-[11px] text-slate-500">{cap.description}</div>
                  </td>

                  {(['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'CHILD_PROTECTION_OFFICER', 'TEACHER', 'STUDENT', 'PARENT'] as UserRole[]).map(
                    (role) => {
                      const allowed = cap.allowedRoles.includes(role);
                      return (
                        <td
                          key={role}
                          className={`py-3 px-3 text-center ${
                            role === 'CHILD_PROTECTION_OFFICER' ? 'bg-purple-50/20' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleRolePermission(cap.id, role)}
                            disabled={!canEdit || currentRole !== 'SUPER_ADMIN'}
                            className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition-all ${
                              allowed
                                ? 'bg-emerald-500 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-300'
                            } ${canEdit && currentRole === 'SUPER_ADMIN' ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                          >
                            {allowed ? <CheckCircle2 className="w-3.5 h-3.5" /> : '—'}
                          </button>
                        </td>
                      );
                    }
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
