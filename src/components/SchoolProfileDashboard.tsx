import React, { useState, useEffect } from 'react';
import {
  SchoolProfileData,
  SchoolBasicInfo,
  SchoolBranding,
  SchoolLeader,
  ProtectionSafetySettings,
  ConfidentialProtectionCase,
  EmergencyContact,
  HealthWelfareInfo,
  CampusFacility,
  SchoolPolicy,
  SchoolSystemConfig,
  UserRole,
} from '../types/schoolProfile';
import {
  fetchFullSchoolProfile,
  updateSchoolBasicInfo,
  updateSchoolBranding,
  saveSchoolLeader,
  deleteSchoolLeader,
  updateProtectionSafetySettings,
  saveConfidentialProtectionCase,
  saveEmergencyContact,
  deleteEmergencyContact,
  updateHealthWelfareInfo,
  saveCampusFacility,
  deleteCampusFacility,
  saveSchoolPolicy,
  deleteSchoolPolicy,
  updateSchoolSystemConfig,
} from '../lib/schoolProfileService';
import { ProfileOverviewTab } from './schoolProfile/ProfileOverviewTab';
import { BasicInformationTab } from './schoolProfile/BasicInformationTab';
import { BrandingTab } from './schoolProfile/BrandingTab';
import { LeadershipTab } from './schoolProfile/LeadershipTab';
import { StudentProtectionTab } from './schoolProfile/StudentProtectionTab';
import { EmergencyContactsTab } from './schoolProfile/EmergencyContactsTab';
import { HealthWelfareTab } from './schoolProfile/HealthWelfareTab';
import { CampusFacilitiesTab } from './schoolProfile/CampusFacilitiesTab';
import { PoliciesTab } from './schoolProfile/PoliciesTab';
import { SchoolConfigurationTab } from './schoolProfile/SchoolConfigurationTab';
import { PermissionsTab } from './schoolProfile/PermissionsTab';
import { AuditLogTab } from './schoolProfile/AuditLogTab';
import { SchoolLogo } from './SchoolLogo';
import {
  Building2,
  Palette,
  Award,
  ShieldCheck,
  PhoneCall,
  HeartPulse,
  Building,
  FileText,
  Settings,
  Lock,
  History,
  LayoutDashboard,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface SchoolProfileDashboardProps {
  initialRole?: UserRole;
  actorName?: string;
  onNavigateHome?: () => void;
}

export type ProfileTabId =
  | 'overview'
  | 'basic_info'
  | 'branding'
  | 'leadership'
  | 'protection'
  | 'emergency'
  | 'health_welfare'
  | 'facilities'
  | 'policies'
  | 'configuration'
  | 'permissions'
  | 'audit_log';

export const SchoolProfileDashboard: React.FC<SchoolProfileDashboardProps> = ({
  initialRole = 'SUPER_ADMIN',
  actorName = 'System Administrator',
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTabId>('overview');
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);
  const [profileData, setProfileData] = useState<SchoolProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Load data on mount
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchFullSchoolProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching school profile:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading || !profileData) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4 p-8">
        <SchoolLogo size="lg" showGlowRing={true} />
        <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading School Control Center...</span>
        </div>
      </div>
    );
  }

  // Permissions helper based on active role
  const canEditGeneral = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(currentRole);
  const canEditStrict = ['SUPER_ADMIN', 'PRINCIPAL'].includes(currentRole);
  const isCpoOrAdmin = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'CHILD_PROTECTION_OFFICER'].includes(currentRole);

  const navTabs: { id: ProfileTabId; label: string; icon: React.FC<any>; count?: number }[] = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'basic_info', label: 'Basic Information', icon: Building2 },
    { id: 'branding', label: 'Branding & Theme', icon: Palette },
    { id: 'leadership', label: 'Leadership Directory', icon: Award, count: profileData.leaders.length },
    {
      id: 'protection',
      label: 'Student Protection & Safety',
      icon: ShieldCheck,
      count: isCpoOrAdmin ? profileData.confidentialProtectionCases.length : undefined,
    },
    { id: 'emergency', label: 'Emergency Contacts', icon: PhoneCall, count: profileData.emergencyContacts.length },
    { id: 'health_welfare', label: 'Health & Welfare', icon: HeartPulse },
    { id: 'facilities', label: 'Campus Facilities', icon: Building, count: profileData.campusFacilities.length },
    { id: 'policies', label: 'Policies & Charters', icon: FileText, count: profileData.policies.length },
    { id: 'configuration', label: 'School Configuration', icon: Settings },
    { id: 'permissions', label: 'Permissions & RBAC', icon: Lock },
    { id: 'audit_log', label: 'Audit Trail', icon: History, count: profileData.auditLogs.length },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-12 animate-fade-in">
      {/* Top Banner Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <SchoolLogo size="md" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold font-cinzel text-slate-900 text-lg sm:text-xl tracking-tight">
                {profileData.basicInfo.schoolName}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase rounded-md">
                ESTD {profileData.basicInfo.establishedYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              School Control Center • {profileData.basicInfo.schoolType} • {profileData.basicInfo.schoolCategory}
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center space-x-3 self-end lg:self-auto">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 text-xs font-bold">
            <span>Role:</span>
            <span className="font-mono text-purple-900">{currentRole}</span>
          </div>

          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all disabled:opacity-50"
            title="Reload latest profile data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary 12-Section Navigation Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs overflow-x-auto scrollbar-thin">
        <div className="flex items-center space-x-1.5 min-w-max">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-950 hover:bg-purple-50/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content Display */}
      <div className="transition-all">
        {activeTab === 'overview' && (
          <ProfileOverviewTab
            basicInfo={profileData.basicInfo}
            branding={profileData.branding}
            leaders={profileData.leaders}
            canEdit={canEditGeneral}
            onNavigateTab={(tabId) => setActiveTab(tabId as ProfileTabId)}
          />
        )}

        {activeTab === 'basic_info' && (
          <BasicInformationTab
            initialInfo={profileData.basicInfo}
            canEdit={canEditGeneral}
            onSave={async (updated) => {
              await updateSchoolBasicInfo(updated, actorName, currentRole);
              await loadData();
            }}
          />
        )}

        {activeTab === 'branding' && (
          <BrandingTab
            initialBranding={profileData.branding}
            canEdit={canEditStrict}
            onSave={async (updated) => {
              await updateSchoolBranding(updated, actorName, currentRole);
              await loadData();
            }}
          />
        )}

        {activeTab === 'leadership' && (
          <LeadershipTab
            leaders={profileData.leaders}
            canEdit={canEditStrict}
            onSaveLeader={async (leader) => {
              await saveSchoolLeader(leader, actorName, currentRole);
              await loadData();
            }}
            onDeleteLeader={async (id) => {
              await deleteSchoolLeader(id, actorName, currentRole);
              await loadData();
            }}
          />
        )}

        {activeTab === 'protection' && (
          <StudentProtectionTab
            settings={profileData.protectionSafetySettings}
            cases={profileData.confidentialProtectionCases}
            leaders={profileData.leaders}
            currentRole={currentRole}
            canEdit={isCpoOrAdmin}
            onSaveSettings={async (settings) => {
              await updateProtectionSafetySettings(settings, actorName, currentRole);
              await loadData();
            }}
            onSaveCase={async (c) => {
              await saveConfidentialProtectionCase(c, actorName, currentRole);
              await loadData();
            }}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyContactsTab
            contacts={profileData.emergencyContacts}
            canEdit={canEditGeneral}
            onSaveContact={async (contact) => {
              await saveEmergencyContact(contact, actorName, currentRole);
              await loadData();
            }}
            onDeleteContact={async (id) => {
              await deleteEmergencyContact(id, actorName, currentRole);
              await loadData();
            }}
          />
        )}

        {activeTab === 'health_welfare' && (
          <HealthWelfareTab
            initialInfo={profileData.healthWelfareInfo}
            canEdit={canEditGeneral}
            onSave={async (info) => {
              await updateHealthWelfareInfo(info, actorName, currentRole);
              await loadData();
            }}
          />
        )}

        {activeTab === 'facilities' && (
          <CampusFacilitiesTab
            facilities={profileData.campusFacilities}
            canEdit={canEditGeneral}
            onSaveFacility={async (facility) => {
              await saveCampusFacility(facility, actorName, currentRole);
              await loadData();
            }}
            onDeleteFacility={async (id) => {
              await deleteCampusFacility(id, actorName, currentRole);
              await loadData();
            }}
          />
        )}

        {activeTab === 'policies' && (
          <PoliciesTab
            policies={profileData.policies}
            canEdit={canEditStrict}
            onSavePolicy={async (policy) => {
              await saveSchoolPolicy(policy, actorName, currentRole);
              await loadData();
            }}
            onDeletePolicy={async (id) => {
              await deleteSchoolPolicy(id, actorName, currentRole);
              await loadData();
            }}
          />
        )}

        {activeTab === 'configuration' && (
          <SchoolConfigurationTab
            initialConfig={profileData.systemConfig}
            canEdit={canEditGeneral}
            onSave={async (config) => {
              await updateSchoolSystemConfig(config, actorName, currentRole);
              await loadData();
            }}
          />
        )}

        {activeTab === 'permissions' && (
          <PermissionsTab
            currentRole={currentRole}
            onSwitchRole={(newRole) => setCurrentRole(newRole)}
            canEdit={canEditStrict}
          />
        )}

        {activeTab === 'audit_log' && (
          <AuditLogTab auditLogs={profileData.auditLogs} />
        )}
      </div>
    </div>
  );
};
