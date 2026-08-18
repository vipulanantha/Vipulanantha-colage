export type EmergencyType =
  | 'GLOBAL_EMERGENCY_ALARM'
  | 'TARGETED_EMERGENCY_ALERT'
  | 'STUDENT_SOS'
  | 'PARENT_EMERGENCY_ALERT'
  | 'TEACHER_STAFF_EMERGENCY_ALERT'
  | 'CHILD_PROTECTION_ALERT';

export type EmergencyPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EmergencyStatus =
  | 'ACTIVE'
  | 'ACKNOWLEDGED'
  | 'RESPONDING'
  | 'ASSISTANCE_DISPATCHED'
  | 'RESOLVED'
  | 'CANCELLED';

export type RecipientDeliveryStatus = 'SENT' | 'DELIVERED' | 'VIEWED' | 'ACKNOWLEDGED' | 'FAILED';

export type RecipientRole =
  | 'STUDENT'
  | 'PARENT'
  | 'TEACHER'
  | 'STAFF'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'CPO' // Child Protection Officer
  | 'NURSE'
  | 'SECURITY'
  | 'ADMIN';

export type LocationPreset =
  | 'School Ground'
  | 'Main Gate & Security Post'
  | 'Classroom Block A (Primary)'
  | 'Classroom Block B (Secondary & A/L)'
  | 'Science & Computer Laboratories'
  | 'Library & Reading Hall'
  | 'Playground & Sports Pavilion'
  | 'College Canteen & Dining Area'
  | 'School Bus & Transport Terminal'
  | 'Medical Bay & Infirmary'
  | 'Saraswathi Block (Girls Lounge)'
  | 'Auditorium & Cultural Hall'
  | 'Other (Custom)';

export interface EmergencyLocationCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  capturedAt: string;
}

export interface EmergencyVoiceRecording {
  id: string;
  emergencyId: string;
  storagePath?: string;
  signedUrl?: string;
  audioBlobUrl?: string;
  durationSeconds: number;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  uploadedByName: string;
}

export interface EmergencyRecipient {
  id: string;
  emergencyId: string;
  recipientId: string;
  recipientName: string;
  recipientRole: RecipientRole;
  contactNumber?: string;
  email?: string;
  deliveryStatus: RecipientDeliveryStatus;
  sentAt: string;
  deliveredAt?: string;
  viewedAt?: string;
  acknowledgedAt?: string;
  acknowledgementNote?: string;
}

export interface EmergencyResponseUpdate {
  id: string;
  emergencyId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  previousStatus: EmergencyStatus;
  newStatus: EmergencyStatus;
  note: string;
  timestamp: string;
  actionTaken?: string;
}

export interface EmergencyAuditRecord {
  id: string;
  emergencyId: string;
  userId: string;
  userName: string;
  userRole: string;
  action:
    | 'CREATED'
    | 'ACTIVATED'
    | 'SENT'
    | 'DELIVERED'
    | 'VIEWED'
    | 'ACKNOWLEDGED'
    | 'VOICE_RECORDED'
    | 'VOICE_ACCESSED'
    | 'STATUS_UPDATED'
    | 'ESCALATED'
    | 'RESOLVED'
    | 'CANCELLED'
    | 'SETTINGS_UPDATED';
  timestamp: string;
  details: string;
  previousStatus?: EmergencyStatus;
  newStatus?: EmergencyStatus;
  recipientName?: string;
}

export interface EmergencyAlert {
  id: string; // e.g. EMG-2026-000127
  type: EmergencyType;
  title: string;
  message: string;
  priority: EmergencyPriority;
  status: EmergencyStatus;
  locationPreset: LocationPreset;
  locationCustom?: string;
  coordinates?: EmergencyLocationCoordinates;
  createdByUserId: string;
  createdByName: string;
  createdByRole: string;
  targetType: 'GLOBAL' | 'TARGETED' | 'STUDENT_SOS_ROUTING' | 'PARENT_CHILD_ROUTING' | 'CLASS_GROUP';
  targetSummary: string;
  targetClassId?: string;
  createdAt: string;
  updatedAt: string;
  voiceMessage?: EmergencyVoiceRecording;
  recipients: EmergencyRecipient[];
  acknowledgedCount: number;
  totalRecipientsCount: number;
  responseUpdates: EmergencyResponseUpdate[];
  escalationLevel: number; // 0 = initial, 1 = CPO level, 2 = Principal level, 3 = Management Team
  escalationTriggeredAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  actionTaken?: string;
  isSimulated?: boolean;
}

export interface EmergencySettingsConfig {
  globalAlarmEnabled: boolean;
  studentSosEnabled: boolean;
  parentEmergencyEnabled: boolean;
  teacherEmergencyEnabled: boolean;
  voiceMessagesEnabled: boolean;
  emergencySoundEnabled: boolean;
  emergencyAcknowledgementRequired: boolean;
  automaticEscalationEnabled: boolean;
  escalationTimeMinutesLevel1: number; // 2 minutes
  escalationTimeMinutesLevel2: number; // 5 minutes
  escalationTimeMinutesLevel3: number; // 10 minutes
  authorizedGlobalAlarmRoles: string[];
  defaultStudentSosRecipients: RecipientRole[];
  defaultParentRecipients: RecipientRole[];
  soundVolume: number; // 0.0 to 1.0
  vibrationEnabled: boolean;
  soundAlarmStyle: 'siren' | 'urgent_beep' | 'chime';
}

export interface EmergencyStats {
  totalActive: number;
  globalAlerts: number;
  targetedAlerts: number;
  studentSosAlerts: number;
  unacknowledgedAlerts: number;
  resolvedAlerts: number;
  totalHistorical: number;
}
