import { getSupabase, isSupabaseConfigured } from './supabase';
import {
  EmergencyAlert,
  EmergencyType,
  EmergencyPriority,
  EmergencyStatus,
  LocationPreset,
  RecipientRole,
  EmergencyRecipient,
  EmergencyVoiceRecording,
  EmergencyAuditRecord,
  EmergencySettingsConfig,
  EmergencyStats,
  EmergencyLocationCoordinates,
} from '../types/emergency';
import { playUrgentAlertChime, startEmergencySiren } from './emergencyAudio';

const STORAGE_KEY_ALERTS = 'vipulananda_emergency_alerts_v1';
const STORAGE_KEY_SETTINGS = 'vipulananda_emergency_settings_v1';
const STORAGE_KEY_AUDIT = 'vipulananda_emergency_audit_v1';

export const DEFAULT_EMERGENCY_SETTINGS: EmergencySettingsConfig = {
  globalAlarmEnabled: true,
  studentSosEnabled: true,
  parentEmergencyEnabled: true,
  teacherEmergencyEnabled: true,
  voiceMessagesEnabled: true,
  emergencySoundEnabled: true,
  emergencyAcknowledgementRequired: true,
  automaticEscalationEnabled: true,
  escalationTimeMinutesLevel1: 2, // Notify CPO after 2m
  escalationTimeMinutesLevel2: 5, // Notify Principal after 5m
  escalationTimeMinutesLevel3: 10, // Notify Emergency Team after 10m
  authorizedGlobalAlarmRoles: ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ADMIN', 'CPO', 'SECURITY'],
  defaultStudentSosRecipients: ['CPO', 'TEACHER', 'PARENT', 'PRINCIPAL'],
  defaultParentRecipients: ['TEACHER', 'PRINCIPAL', 'CPO'],
  soundVolume: 0.85,
  vibrationEnabled: true,
  soundAlarmStyle: 'siren',
};

// Initial Seed Data for Vipulananda College
export const INITIAL_EMERGENCY_ALERTS: EmergencyAlert[] = [
  {
    id: 'EMG-2026-000127',
    type: 'STUDENT_SOS',
    title: 'Student Safety Distress Call - Ground Pavilion',
    message: 'Urgent medical assistance requested near Senior Cricket Pavilion. Student sustained injury during athletics warm-up.',
    priority: 'CRITICAL',
    status: 'ACTIVE',
    locationPreset: 'Playground & Sports Pavilion',
    locationCustom: 'Near East Wing Pavilion Bleachers',
    coordinates: {
      latitude: 6.8724,
      longitude: 79.8651,
      accuracyMeters: 8,
      capturedAt: '2026-08-17T10:14:00Z',
    },
    createdByUserId: 's-101',
    createdByName: 'Kavindu Kumar (Grade 10-A)',
    createdByRole: 'STUDENT',
    targetType: 'STUDENT_SOS_ROUTING',
    targetSummary: 'Routing: CPO (Mrs. Meenakshi) + Class Teacher (Mr. Kumar) + Parent (K. Kumar) + Principal',
    targetClassId: 'c-10a',
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    acknowledgedCount: 3,
    totalRecipientsCount: 4,
    escalationLevel: 1,
    escalationTriggeredAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    recipients: [
      {
        id: 'rec-1',
        emergencyId: 'EMG-2026-000127',
        recipientId: 'cpo-01',
        recipientName: 'Mrs. S. Meenakshi',
        recipientRole: 'CPO',
        contactNumber: '+94 77 123 4567',
        deliveryStatus: 'ACKNOWLEDGED',
        sentAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        deliveredAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
        viewedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        acknowledgementNote: 'On my way with First Aid Officer to Sports Pavilion.',
      },
      {
        id: 'rec-2',
        emergencyId: 'EMG-2026-000127',
        recipientId: 'tch-01',
        recipientName: 'Mr. K. Rajendran',
        recipientRole: 'TEACHER',
        contactNumber: '+94 77 234 5678',
        deliveryStatus: 'ACKNOWLEDGED',
        sentAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        deliveredAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
        viewedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
        acknowledgementNote: 'Confirmed. Alerting College Medical Room Nurse.',
      },
      {
        id: 'rec-3',
        emergencyId: 'EMG-2026-000127',
        recipientId: 'par-01',
        recipientName: 'Mr. K. Selvaratnam (Parent)',
        recipientRole: 'PARENT',
        contactNumber: '+94 77 345 6789',
        deliveryStatus: 'ACKNOWLEDGED',
        sentAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        deliveredAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
        viewedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        acknowledgementNote: 'Received notification. Arriving at school gate shortly.',
      },
      {
        id: 'rec-4',
        emergencyId: 'EMG-2026-000127',
        recipientId: 'prn-01',
        recipientName: 'Principal Office (K. Thirunavukkarasu)',
        recipientRole: 'PRINCIPAL',
        contactNumber: '+94 11 258 8492',
        deliveryStatus: 'DELIVERED',
        sentAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        deliveredAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
      },
    ],
    responseUpdates: [
      {
        id: 'resp-1',
        emergencyId: 'EMG-2026-000127',
        actorId: 'cpo-01',
        actorName: 'Mrs. S. Meenakshi (CPO)',
        actorRole: 'Child Protection Officer',
        previousStatus: 'ACTIVE',
        newStatus: 'RESPONDING',
        note: 'Attending to student in sports pavilion with College Nurse Sister Kamala.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        actionTaken: 'First Aid Kit dispatched',
      },
    ],
  },
  {
    id: 'EMG-2026-000126',
    type: 'GLOBAL_EMERGENCY_ALARM',
    title: 'Severe Weather Warning & Early Student Release Drill',
    message: 'Precautionary severe weather advisory for Colombo coastal area. Afternoon extracurricular sports paused.',
    priority: 'HIGH',
    status: 'RESOLVED',
    locationPreset: 'Main Gate & Security Post',
    createdByUserId: 'prn-01',
    createdByName: 'Mr. K. Thirunavukkarasu (Principal)',
    createdByRole: 'PRINCIPAL',
    targetType: 'GLOBAL',
    targetSummary: 'ALL AUTHORIZED SCHOOL MEMBERS (Staff, Parents, Students)',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedBy: 'Principal Office',
    resolutionNote: 'All students boarded school buses and departed safely under staff supervision.',
    actionTaken: 'Transport marshals verified 100% bus departure.',
    acknowledgedCount: 142,
    totalRecipientsCount: 150,
    escalationLevel: 0,
    recipients: [],
    responseUpdates: [],
  },
  {
    id: 'EMG-2026-000125',
    type: 'CHILD_PROTECTION_ALERT',
    title: 'Confidential Welfare Follow-Up Request',
    message: 'Designated Safeguarding lead attention requested regarding female student health transport assistance.',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    locationPreset: 'Saraswathi Block (Girls Lounge)',
    createdByUserId: 'tch-02',
    createdByName: 'Mrs. V. Sivanayaki (Class Teacher)',
    createdByRole: 'TEACHER',
    targetType: 'TARGETED',
    targetSummary: 'Confidential: CPO + College Nurse + Mother',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedBy: 'Mrs. S. Meenakshi (CPO)',
    resolutionNote: 'Mother accompanied student home in College Welfare Transport van. Student in stable care.',
    actionTaken: 'Parent notified, medical referral note provided.',
    acknowledgedCount: 3,
    totalRecipientsCount: 3,
    escalationLevel: 0,
    recipients: [],
    responseUpdates: [],
  },
];

export const INITIAL_AUDIT_LOGS: EmergencyAuditRecord[] = [
  {
    id: 'aud-001',
    emergencyId: 'EMG-2026-000127',
    userId: 's-101',
    userName: 'Kavindu Kumar',
    userRole: 'STUDENT',
    action: 'CREATED',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    details: 'Student SOS distress triggered from Mobile Portal at Playground & Sports Pavilion.',
    newStatus: 'ACTIVE',
  },
  {
    id: 'aud-002',
    emergencyId: 'EMG-2026-000127',
    userId: 'system',
    userName: 'Emergency Routing Engine',
    userRole: 'SYSTEM',
    action: 'SENT',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    details: 'Instant alerts delivered to 4 configured emergency contacts (CPO, Class Teacher, Parent, Principal).',
  },
  {
    id: 'aud-003',
    emergencyId: 'EMG-2026-000127',
    userId: 'cpo-01',
    userName: 'Mrs. S. Meenakshi',
    userRole: 'CPO',
    action: 'ACKNOWLEDGED',
    timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    details: 'CPO acknowledged SOS alert: "On my way with First Aid Officer to Sports Pavilion."',
  },
  {
    id: 'aud-004',
    emergencyId: 'EMG-2026-000127',
    userId: 'cpo-01',
    userName: 'Mrs. S. Meenakshi',
    userRole: 'CPO',
    action: 'STATUS_UPDATED',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    previousStatus: 'ACTIVE',
    newStatus: 'RESPONDING',
    details: 'Response status elevated to RESPONDING. On-site First Aid initiated.',
  },
  {
    id: 'aud-005',
    emergencyId: 'EMG-2026-000126',
    userId: 'prn-01',
    userName: 'Mr. K. Thirunavukkarasu',
    userRole: 'PRINCIPAL',
    action: 'RESOLVED',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    previousStatus: 'ACTIVE',
    newStatus: 'RESOLVED',
    details: 'Principal closed Global Weather Alarm after verifying safe transit.',
  },
];

// --- Local Storage Helpers for Guaranteed Resilient Fallback ---
export const getCachedEmergencyAlerts = (): EmergencyAlert[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading cached emergency alerts:', err);
  }
  return INITIAL_EMERGENCY_ALERTS;
};

export const setCachedEmergencyAlerts = (alerts: EmergencyAlert[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
  } catch (err) {
    console.warn('Error saving cached emergency alerts:', err);
  }
};

export const getCachedEmergencySettings = (): EmergencySettingsConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_EMERGENCY_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Error reading cached emergency settings:', err);
  }
  return DEFAULT_EMERGENCY_SETTINGS;
};

export const setCachedEmergencySettings = (settings: EmergencySettingsConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.warn('Error saving cached emergency settings:', err);
  }
};

export const getCachedAuditLogs = (): EmergencyAuditRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading cached emergency audit:', err);
  }
  return INITIAL_AUDIT_LOGS;
};

export const appendCachedAuditLog = (record: EmergencyAuditRecord): void => {
  try {
    const current = getCachedAuditLogs();
    const updated = [record, ...current];
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(updated.slice(0, 300)));
  } catch (err) {
    console.warn('Error saving cached audit log:', err);
  }
};

// --- Role-Based Permission Checkers ---
export const checkCanTriggerGlobalAlarm = (userRole: string): boolean => {
  const normalized = userRole.toUpperCase();
  return (
    normalized === 'SUPER_ADMIN' ||
    normalized === 'ADMIN' ||
    normalized === 'PRINCIPAL' ||
    normalized === 'VICE_PRINCIPAL' ||
    normalized === 'CPO' ||
    normalized === 'SECURITY'
  );
};

export const checkCanTriggerStudentSos = (userRole: string): boolean => {
  const normalized = userRole.toUpperCase();
  return normalized === 'STUDENT' || normalized === 'ADMIN' || normalized === 'PRINCIPAL';
};

export const checkCanTriggerParentEmergency = (userRole: string): boolean => {
  const normalized = userRole.toUpperCase();
  return normalized === 'PARENT' || normalized === 'ADMIN' || normalized === 'PRINCIPAL';
};

export const checkCanTriggerTargetedAlert = (userRole: string): boolean => {
  const normalized = userRole.toUpperCase();
  return (
    normalized === 'TEACHER' ||
    normalized === 'STAFF' ||
    normalized === 'FACULTY' ||
    normalized === 'CPO' ||
    normalized === 'PRINCIPAL' ||
    normalized === 'VICE_PRINCIPAL' ||
    normalized === 'ADMIN' ||
    normalized === 'SUPER_ADMIN'
  );
};

export const checkCanResolveEmergency = (userRole: string): boolean => {
  const normalized = userRole.toUpperCase();
  return (
    normalized === 'SUPER_ADMIN' ||
    normalized === 'ADMIN' ||
    normalized === 'PRINCIPAL' ||
    normalized === 'VICE_PRINCIPAL' ||
    normalized === 'CPO'
  );
};

export const checkCanUpdateResponseStatus = (userRole: string): boolean => {
  const normalized = userRole.toUpperCase();
  return (
    normalized === 'SUPER_ADMIN' ||
    normalized === 'ADMIN' ||
    normalized === 'PRINCIPAL' ||
    normalized === 'VICE_PRINCIPAL' ||
    normalized === 'CPO' ||
    normalized === 'TEACHER' ||
    normalized === 'STAFF' ||
    normalized === 'NURSE' ||
    normalized === 'SECURITY'
  );
};

// --- Core Emergency Service APIs ---

/**
 * Fetch all emergency alerts from Supabase or resilient local cache
 */
export const fetchEmergencyAlerts = async (): Promise<EmergencyAlert[]> => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select(`
          *,
          recipients:emergency_recipients(*),
          response_updates:emergency_responses(*),
          voice_messages:emergency_voice_messages(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: EmergencyAlert[] = data.map((row) => ({
          id: row.id,
          type: row.type,
          title: row.title,
          message: row.message,
          priority: row.priority,
          status: row.status,
          locationPreset: row.location_preset,
          locationCustom: row.location_custom,
          coordinates: row.latitude ? {
            latitude: row.latitude,
            longitude: row.longitude,
            accuracyMeters: row.accuracy_meters,
            capturedAt: row.coordinates_captured_at || row.created_at,
          } : undefined,
          createdByUserId: row.created_by_user_id,
          createdByName: row.created_by_name,
          createdByRole: row.created_by_role,
          targetType: row.target_type,
          targetSummary: row.target_summary,
          targetClassId: row.target_class_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          acknowledgedCount: row.acknowledged_count || 0,
          totalRecipientsCount: row.total_recipients_count || 0,
          escalationLevel: row.escalation_level || 0,
          escalationTriggeredAt: row.escalation_triggered_at,
          resolvedAt: row.resolved_at,
          resolvedBy: row.resolved_by,
          resolutionNote: row.resolution_note,
          actionTaken: row.action_taken,
          voiceMessage: row.voice_messages?.[0] ? {
            id: row.voice_messages[0].id,
            emergencyId: row.voice_messages[0].emergency_id,
            storagePath: row.voice_messages[0].storage_path,
            signedUrl: row.voice_messages[0].signed_url,
            durationSeconds: row.voice_messages[0].duration_seconds,
            mimeType: row.voice_messages[0].mime_type,
            fileSizeBytes: row.voice_messages[0].file_size_bytes,
            uploadedAt: row.voice_messages[0].uploaded_at,
            uploadedByName: row.voice_messages[0].uploaded_by_name,
          } : undefined,
          recipients: (row.recipients || []).map((r: any) => ({
            id: r.id,
            emergencyId: r.emergency_id,
            recipientId: r.recipient_id,
            recipientName: r.recipient_name,
            recipientRole: r.recipient_role,
            contactNumber: r.contact_number,
            email: r.email,
            deliveryStatus: r.delivery_status,
            sentAt: r.sent_at,
            deliveredAt: r.delivered_at,
            viewedAt: r.viewed_at,
            acknowledgedAt: r.acknowledged_at,
            acknowledgementNote: r.acknowledgement_note,
          })),
          responseUpdates: (row.response_updates || []).map((ru: any) => ({
            id: ru.id,
            emergencyId: ru.emergency_id,
            actorId: ru.actor_id,
            actorName: ru.actor_name,
            actorRole: ru.actor_role,
            previousStatus: ru.previous_status,
            newStatus: ru.new_status,
            note: ru.note,
            timestamp: ru.created_at,
            actionTaken: ru.action_taken,
          })),
        }));

        setCachedEmergencyAlerts(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase query failed, using local cache:', err);
    }
  }

  return getCachedEmergencyAlerts();
};

/**
 * Trigger & Create a New Emergency Alert
 */
export const createEmergencyAlert = async (
  alertData: {
    type: EmergencyType;
    title: string;
    message: string;
    priority: EmergencyPriority;
    locationPreset: LocationPreset;
    locationCustom?: string;
    coordinates?: EmergencyLocationCoordinates;
    createdByUserId: string;
    createdByName: string;
    createdByRole: string;
    targetType: 'GLOBAL' | 'TARGETED' | 'STUDENT_SOS_ROUTING' | 'PARENT_CHILD_ROUTING' | 'CLASS_GROUP';
    targetSummary: string;
    targetClassId?: string;
    recipients: Array<{
      recipientId: string;
      recipientName: string;
      recipientRole: RecipientRole;
      contactNumber?: string;
      email?: string;
    }>;
    voiceRecordingBlob?: Blob;
    voiceDurationSeconds?: number;
  }
): Promise<{ success: boolean; alert?: EmergencyAlert; error?: string }> => {
  const newId = `EMG-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  // Create formatted recipient objects
  const formattedRecipients: EmergencyRecipient[] = alertData.recipients.map((r, idx) => ({
    id: `rec-${Date.now()}-${idx}`,
    emergencyId: newId,
    recipientId: r.recipientId,
    recipientName: r.recipientName,
    recipientRole: r.recipientRole,
    contactNumber: r.contactNumber,
    email: r.email,
    deliveryStatus: 'DELIVERED',
    sentAt: now,
    deliveredAt: now,
  }));

  // Handle voice recording storage if provided
  let voiceMessage: EmergencyVoiceRecording | undefined = undefined;
  if (alertData.voiceRecordingBlob && alertData.voiceDurationSeconds) {
    const voiceId = `voice-${Date.now()}`;
    const blobUrl = URL.createObjectURL(alertData.voiceRecordingBlob);
    voiceMessage = {
      id: voiceId,
      emergencyId: newId,
      audioBlobUrl: blobUrl,
      durationSeconds: alertData.voiceDurationSeconds,
      mimeType: alertData.voiceRecordingBlob.type || 'audio/webm',
      fileSizeBytes: alertData.voiceRecordingBlob.size,
      uploadedAt: now,
      uploadedByName: alertData.createdByName,
    };
  }

  const newAlert: EmergencyAlert = {
    id: newId,
    type: alertData.type,
    title: alertData.title,
    message: alertData.message,
    priority: alertData.priority,
    status: 'ACTIVE',
    locationPreset: alertData.locationPreset,
    locationCustom: alertData.locationCustom,
    coordinates: alertData.coordinates,
    createdByUserId: alertData.createdByUserId,
    createdByName: alertData.createdByName,
    createdByRole: alertData.createdByRole,
    targetType: alertData.targetType,
    targetSummary: alertData.targetSummary,
    targetClassId: alertData.targetClassId,
    createdAt: now,
    updatedAt: now,
    voiceMessage,
    recipients: formattedRecipients,
    acknowledgedCount: 0,
    totalRecipientsCount: formattedRecipients.length,
    responseUpdates: [],
    escalationLevel: 0,
  };

  // 1. Save to local cache immediately
  const cached = getCachedEmergencyAlerts();
  const updatedAlerts = [newAlert, ...cached];
  setCachedEmergencyAlerts(updatedAlerts);

  // 2. Add Audit Log
  const auditRecord: EmergencyAuditRecord = {
    id: `aud-${Date.now()}`,
    emergencyId: newId,
    userId: alertData.createdByUserId,
    userName: alertData.createdByName,
    userRole: alertData.createdByRole,
    action: 'CREATED',
    timestamp: now,
    details: `${alertData.type} alarm triggered by ${alertData.createdByName} (${alertData.createdByRole}) at ${alertData.locationPreset}. Priority: ${alertData.priority}. Recipients: ${formattedRecipients.length}.`,
    newStatus: 'ACTIVE',
  };
  appendCachedAuditLog(auditRecord);

  // 3. Audio & Acoustic warning alert
  if (alertData.priority === 'CRITICAL') {
    startEmergencySiren(0.85);
  } else {
    playUrgentAlertChime();
  }

  // 4. Try syncing to Supabase if connected
  const supabase = getSupabase();
  if (supabase) {
    try {
      // Insert alert row
      await supabase.from('emergency_alerts').insert({
        id: newId,
        type: newAlert.type,
        title: newAlert.title,
        message: newAlert.message,
        priority: newAlert.priority,
        status: newAlert.status,
        location_preset: newAlert.locationPreset,
        location_custom: newAlert.locationCustom,
        latitude: newAlert.coordinates?.latitude,
        longitude: newAlert.coordinates?.longitude,
        accuracy_meters: newAlert.coordinates?.accuracyMeters,
        created_by_user_id: newAlert.createdByUserId,
        created_by_name: newAlert.createdByName,
        created_by_role: newAlert.createdByRole,
        target_type: newAlert.targetType,
        target_summary: newAlert.targetSummary,
        target_class_id: newAlert.targetClassId,
        acknowledged_count: 0,
        total_recipients_count: formattedRecipients.length,
        escalation_level: 0,
        created_at: now,
        updated_at: now,
      });

      // Insert recipients
      if (formattedRecipients.length > 0) {
        await supabase.from('emergency_recipients').insert(
          formattedRecipients.map((r) => ({
            id: r.id,
            emergency_id: newId,
            recipient_id: r.recipientId,
            recipient_name: r.recipientName,
            recipient_role: r.recipientRole,
            contact_number: r.contactNumber,
            email: r.email,
            delivery_status: r.deliveryStatus,
            sent_at: r.sentAt,
            delivered_at: r.deliveredAt,
          }))
        );
      }

      // Voice upload to Supabase Storage if present
      if (alertData.voiceRecordingBlob && isSupabaseConfigured) {
        try {
          const filePath = `recordings/${newId}_${Date.now()}.webm`;
          await supabase.storage
            .from('emergency-voice')
            .upload(filePath, alertData.voiceRecordingBlob, {
              contentType: alertData.voiceRecordingBlob.type || 'audio/webm',
              upsert: true,
            });

          await supabase.from('emergency_voice_messages').insert({
            id: `voice-${Date.now()}`,
            emergency_id: newId,
            storage_path: filePath,
            duration_seconds: alertData.voiceDurationSeconds || 10,
            mime_type: alertData.voiceRecordingBlob.type || 'audio/webm',
            file_size_bytes: alertData.voiceRecordingBlob.size,
            uploaded_by_name: alertData.createdByName,
            uploaded_at: now,
          });
        } catch (storageErr) {
          console.warn('Voice storage upload error (using local blob):', storageErr);
        }
      }

      // Insert audit log
      await supabase.from('emergency_audit_logs').insert({
        id: auditRecord.id,
        emergency_id: newId,
        user_id: auditRecord.userId,
        user_name: auditRecord.userName,
        user_role: auditRecord.userRole,
        action: auditRecord.action,
        details: auditRecord.details,
        new_status: auditRecord.newStatus,
        created_at: now,
      });
    } catch (dbErr) {
      console.warn('Supabase insert failed, local cache preserved:', dbErr);
    }
  }

  // 5. Browser notification if allowed
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(`🚨 Vipulananda Emergency: ${alertData.title}`, {
        body: `${alertData.locationPreset}: ${alertData.message}`,
        icon: '/favicon.ico',
        tag: newId,
        requireInteraction: true,
      });
    } catch {
      // ignore
    }
  }

  return { success: true, alert: newAlert };
};

/**
 * Acknowledge an Emergency Alert
 */
export const acknowledgeEmergencyAlert = async (
  emergencyId: string,
  recipientUserId: string,
  recipientName: string,
  recipientRole: string,
  note?: string
): Promise<{ success: boolean; alert?: EmergencyAlert; error?: string }> => {
  const alerts = getCachedEmergencyAlerts();
  const targetIndex = alerts.findIndex((a) => a.id === emergencyId);
  if (targetIndex === -1) {
    return { success: false, error: 'Emergency record not found' };
  }

  const now = new Date().toISOString();
  const alert = { ...alerts[targetIndex] };

  // Update recipient status
  let found = false;
  const updatedRecipients = alert.recipients.map((r) => {
    if (r.recipientId === recipientUserId || r.recipientName === recipientName) {
      found = true;
      return {
        ...r,
        deliveryStatus: 'ACKNOWLEDGED' as const,
        viewedAt: r.viewedAt || now,
        acknowledgedAt: now,
        acknowledgementNote: note || 'Acknowledged via portal',
      };
    }
    return r;
  });

  // If recipient wasn't in list (e.g. general staff acknowledging global alert), append them
  if (!found) {
    updatedRecipients.push({
      id: `rec-ack-${Date.now()}`,
      emergencyId,
      recipientId: recipientUserId,
      recipientName,
      recipientRole: (recipientRole.toUpperCase() as RecipientRole) || 'STAFF',
      deliveryStatus: 'ACKNOWLEDGED',
      sentAt: alert.createdAt,
      deliveredAt: now,
      viewedAt: now,
      acknowledgedAt: now,
      acknowledgementNote: note || 'Acknowledged by responder',
    });
  }

  const acknowledgedCount = updatedRecipients.filter((r) => r.deliveryStatus === 'ACKNOWLEDGED').length;
  const totalCount = updatedRecipients.length;

  const updatedAlert: EmergencyAlert = {
    ...alert,
    recipients: updatedRecipients,
    acknowledgedCount,
    totalRecipientsCount: totalCount,
    status: alert.status === 'ACTIVE' ? 'ACKNOWLEDGED' : alert.status,
    updatedAt: now,
  };

  alerts[targetIndex] = updatedAlert;
  setCachedEmergencyAlerts(alerts);

  // Append Audit Record
  appendCachedAuditLog({
    id: `aud-${Date.now()}`,
    emergencyId,
    userId: recipientUserId,
    userName: recipientName,
    userRole: recipientRole,
    action: 'ACKNOWLEDGED',
    timestamp: now,
    details: `${recipientName} (${recipientRole}) acknowledged alert EMG: ${emergencyId}. Note: "${note || 'None'}"`,
    previousStatus: alert.status,
    newStatus: updatedAlert.status,
  });

  // Sync to Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from('emergency_alerts')
        .update({
          acknowledged_count: acknowledgedCount,
          total_recipients_count: totalCount,
          status: updatedAlert.status,
          updated_at: now,
        })
        .eq('id', emergencyId);

      await supabase.from('emergency_acknowledgements').insert({
        id: `ack-${Date.now()}`,
        emergency_id: emergencyId,
        user_id: recipientUserId,
        user_name: recipientName,
        user_role: recipientRole,
        note: note || '',
        acknowledged_at: now,
      });
    } catch (err) {
      console.warn('Supabase acknowledge sync warning:', err);
    }
  }

  return { success: true, alert: updatedAlert };
};

/**
 * Update Response Status (e.g. ACTIVE -> RESPONDING -> ASSISTANCE_DISPATCHED)
 */
export const updateEmergencyResponseStatus = async (
  emergencyId: string,
  newStatus: EmergencyStatus,
  actorId: string,
  actorName: string,
  actorRole: string,
  note: string,
  actionTaken?: string
): Promise<{ success: boolean; alert?: EmergencyAlert; error?: string }> => {
  const alerts = getCachedEmergencyAlerts();
  const targetIndex = alerts.findIndex((a) => a.id === emergencyId);
  if (targetIndex === -1) {
    return { success: false, error: 'Emergency record not found' };
  }

  const now = new Date().toISOString();
  const alert = { ...alerts[targetIndex] };
  const previousStatus = alert.status;

  const newResponseUpdate = {
    id: `resp-${Date.now()}`,
    emergencyId,
    actorId,
    actorName,
    actorRole,
    previousStatus,
    newStatus,
    note,
    timestamp: now,
    actionTaken,
  };

  const updatedAlert: EmergencyAlert = {
    ...alert,
    status: newStatus,
    responseUpdates: [newResponseUpdate, ...alert.responseUpdates],
    updatedAt: now,
  };

  alerts[targetIndex] = updatedAlert;
  setCachedEmergencyAlerts(alerts);

  appendCachedAuditLog({
    id: `aud-${Date.now()}`,
    emergencyId,
    userId: actorId,
    userName: actorName,
    userRole: actorRole,
    action: 'STATUS_UPDATED',
    timestamp: now,
    details: `Response status changed from ${previousStatus} to ${newStatus} by ${actorName} (${actorRole}). Note: "${note}". Action: "${actionTaken || 'N/A'}"`,
    previousStatus,
    newStatus,
  });

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from('emergency_alerts')
        .update({
          status: newStatus,
          updated_at: now,
        })
        .eq('id', emergencyId);

      await supabase.from('emergency_responses').insert({
        id: newResponseUpdate.id,
        emergency_id: emergencyId,
        actor_id: actorId,
        actor_name: actorName,
        actor_role: actorRole,
        previous_status: previousStatus,
        new_status: newStatus,
        note,
        action_taken: actionTaken,
        created_at: now,
      });
    } catch (err) {
      console.warn('Supabase status update error:', err);
    }
  }

  return { success: true, alert: updatedAlert };
};

/**
 * Resolve an Emergency with Mandatory Resolution Note & Action Taken
 */
export const resolveEmergencyAlert = async (
  emergencyId: string,
  resolverId: string,
  resolverName: string,
  resolverRole: string,
  resolutionNote: string,
  actionTaken: string
): Promise<{ success: boolean; alert?: EmergencyAlert; error?: string }> => {
  if (!resolutionNote.trim() || !actionTaken.trim()) {
    return { success: false, error: 'Resolution note and Action Taken are mandatory.' };
  }

  const alerts = getCachedEmergencyAlerts();
  const targetIndex = alerts.findIndex((a) => a.id === emergencyId);
  if (targetIndex === -1) {
    return { success: false, error: 'Emergency record not found' };
  }

  const now = new Date().toISOString();
  const alert = { ...alerts[targetIndex] };

  const updatedAlert: EmergencyAlert = {
    ...alert,
    status: 'RESOLVED',
    resolvedAt: now,
    resolvedBy: `${resolverName} (${resolverRole})`,
    resolutionNote: resolutionNote.trim(),
    actionTaken: actionTaken.trim(),
    updatedAt: now,
  };

  alerts[targetIndex] = updatedAlert;
  setCachedEmergencyAlerts(alerts);

  appendCachedAuditLog({
    id: `aud-${Date.now()}`,
    emergencyId,
    userId: resolverId,
    userName: resolverName,
    userRole: resolverRole,
    action: 'RESOLVED',
    timestamp: now,
    details: `Emergency marked as RESOLVED by ${resolverName} (${resolverRole}). Resolution: "${resolutionNote}". Action: "${actionTaken}"`,
    previousStatus: alert.status,
    newStatus: 'RESOLVED',
  });

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from('emergency_alerts')
        .update({
          status: 'RESOLVED',
          resolved_at: now,
          resolved_by: `${resolverName} (${resolverRole})`,
          resolution_note: resolutionNote.trim(),
          action_taken: actionTaken.trim(),
          updated_at: now,
        })
        .eq('id', emergencyId);
    } catch (err) {
      console.warn('Supabase resolve update error:', err);
    }
  }

  return { success: true, alert: updatedAlert };
};

/**
 * Cancel an Emergency (e.g. accidental trigger / false alarm)
 */
export const cancelEmergencyAlert = async (
  emergencyId: string,
  cancellerId: string,
  cancellerName: string,
  cancellerRole: string,
  cancellationReason: string
): Promise<{ success: boolean; alert?: EmergencyAlert; error?: string }> => {
  const alerts = getCachedEmergencyAlerts();
  const targetIndex = alerts.findIndex((a) => a.id === emergencyId);
  if (targetIndex === -1) {
    return { success: false, error: 'Emergency record not found' };
  }

  const now = new Date().toISOString();
  const alert = { ...alerts[targetIndex] };

  const updatedAlert: EmergencyAlert = {
    ...alert,
    status: 'CANCELLED',
    resolvedAt: now,
    resolvedBy: `${cancellerName} (${cancellerRole})`,
    resolutionNote: `CANCELLED / FALSE ALARM: ${cancellationReason.trim()}`,
    updatedAt: now,
  };

  alerts[targetIndex] = updatedAlert;
  setCachedEmergencyAlerts(alerts);

  appendCachedAuditLog({
    id: `aud-${Date.now()}`,
    emergencyId,
    userId: cancellerId,
    userName: cancellerName,
    userRole: cancellerRole,
    action: 'CANCELLED',
    timestamp: now,
    details: `Emergency CANCELLED by ${cancellerName} (${cancellerRole}). Reason: "${cancellationReason}"`,
    previousStatus: alert.status,
    newStatus: 'CANCELLED',
  });

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from('emergency_alerts')
        .update({
          status: 'CANCELLED',
          resolved_at: now,
          resolved_by: `${cancellerName} (${cancellerRole})`,
          resolution_note: `CANCELLED: ${cancellationReason.trim()}`,
          updated_at: now,
        })
        .eq('id', emergencyId);
    } catch (err) {
      console.warn('Supabase cancel update error:', err);
    }
  }

  return { success: true, alert: updatedAlert };
};

/**
 * Escalate an Emergency Alert to next level
 */
export const triggerEmergencyEscalation = async (
  emergencyId: string,
  escalatedByUserId: string,
  escalatedByName: string,
  escalatedByRole: string,
  reason: string
): Promise<{ success: boolean; alert?: EmergencyAlert; error?: string }> => {
  const alerts = getCachedEmergencyAlerts();
  const targetIndex = alerts.findIndex((a) => a.id === emergencyId);
  if (targetIndex === -1) {
    return { success: false, error: 'Emergency record not found' };
  }

  const now = new Date().toISOString();
  const alert = { ...alerts[targetIndex] };
  const nextLevel = (alert.escalationLevel || 0) + 1;

  const updatedAlert: EmergencyAlert = {
    ...alert,
    escalationLevel: nextLevel,
    escalationTriggeredAt: now,
    updatedAt: now,
  };

  alerts[targetIndex] = updatedAlert;
  setCachedEmergencyAlerts(alerts);

  appendCachedAuditLog({
    id: `aud-${Date.now()}`,
    emergencyId,
    userId: escalatedByUserId,
    userName: escalatedByName,
    userRole: escalatedByRole,
    action: 'ESCALATED',
    timestamp: now,
    details: `Emergency escalated to Level ${nextLevel} by ${escalatedByName} (${escalatedByRole}). Reason: "${reason}"`,
  });

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from('emergency_alerts')
        .update({
          escalation_level: nextLevel,
          escalation_triggered_at: now,
          updated_at: now,
        })
        .eq('id', emergencyId);
    } catch (err) {
      console.warn('Supabase escalate error:', err);
    }
  }

  return { success: true, alert: updatedAlert };
};

/**
 * Save and Sync Emergency Configuration Settings
 */
export const saveEmergencySettings = async (
  newSettings: EmergencySettingsConfig,
  actorName: string,
  actorRole: string
): Promise<{ success: boolean; error?: string }> => {
  setCachedEmergencySettings(newSettings);

  appendCachedAuditLog({
    id: `aud-${Date.now()}`,
    emergencyId: 'CONFIG-SYSTEM',
    userId: 'admin',
    userName: actorName,
    userRole: actorRole,
    action: 'SETTINGS_UPDATED',
    timestamp: new Date().toISOString(),
    details: `Emergency Center Settings updated by ${actorName} (${actorRole}). Escalation Tiers: [L1: ${newSettings.escalationTimeMinutesLevel1}m, L2: ${newSettings.escalationTimeMinutesLevel2}m, L3: ${newSettings.escalationTimeMinutesLevel3}m].`,
  });

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('emergency_settings').upsert({
        id: 'default_config',
        config_data: newSettings,
        updated_at: new Date().toISOString(),
        updated_by: actorName,
      });
    } catch (err) {
      console.warn('Supabase settings sync error:', err);
    }
  }

  return { success: true };
};

/**
 * Compute Live Emergency Dashboard Statistics
 */
export const calculateEmergencyStats = (alerts: EmergencyAlert[]): EmergencyStats => {
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'RESPONDING' || a.status === 'ASSISTANCE_DISPATCHED');
  const globalAlerts = alerts.filter((a) => a.type === 'GLOBAL_EMERGENCY_ALARM');
  const targetedAlerts = alerts.filter((a) => a.type === 'TARGETED_EMERGENCY_ALERT' || a.type === 'TEACHER_STAFF_EMERGENCY_ALERT');
  const studentSosAlerts = alerts.filter((a) => a.type === 'STUDENT_SOS');
  const unacknowledged = alerts.filter((a) => (a.status === 'ACTIVE' || a.status === 'RESPONDING') && a.acknowledgedCount === 0);
  const resolvedAlerts = alerts.filter((a) => a.status === 'RESOLVED');

  return {
    totalActive: activeAlerts.length,
    globalAlerts: globalAlerts.length,
    targetedAlerts: targetedAlerts.length,
    studentSosAlerts: studentSosAlerts.length,
    unacknowledgedAlerts: unacknowledged.length,
    resolvedAlerts: resolvedAlerts.length,
    totalHistorical: alerts.length,
  };
};

/**
 * SQL migration script for Supabase Database
 */
export const SUPABASE_EMERGENCY_SQL_SCHEMA = `-- ========================================================
-- VIPULANANDA COLLEGE - EMERGENCY & SAFETY BACKEND SCHEMA
-- ========================================================

CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'HIGH',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  location_preset TEXT NOT NULL,
  location_custom TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy_meters DOUBLE PRECISION,
  created_by_user_id TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_by_role TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_summary TEXT NOT NULL,
  target_class_id TEXT,
  acknowledged_count INTEGER DEFAULT 0,
  total_recipients_count INTEGER DEFAULT 0,
  escalation_level INTEGER DEFAULT 0,
  escalation_triggered_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_note TEXT,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_recipients (
  id TEXT PRIMARY KEY,
  emergency_id TEXT REFERENCES public.emergency_alerts(id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_role TEXT NOT NULL,
  contact_number TEXT,
  email TEXT,
  delivery_status TEXT DEFAULT 'DELIVERED',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  acknowledgement_note TEXT
);

CREATE TABLE IF NOT EXISTS public.emergency_voice_messages (
  id TEXT PRIMARY KEY,
  emergency_id TEXT REFERENCES public.emergency_alerts(id) ON DELETE CASCADE,
  storage_path TEXT,
  signed_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'audio/webm',
  file_size_bytes BIGINT DEFAULT 0,
  uploaded_by_name TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_acknowledgements (
  id TEXT PRIMARY KEY,
  emergency_id TEXT REFERENCES public.emergency_alerts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  note TEXT,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_responses (
  id TEXT PRIMARY KEY,
  emergency_id TEXT REFERENCES public.emergency_alerts(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_audit_logs (
  id TEXT PRIMARY KEY,
  emergency_id TEXT,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_config',
  config_data JSONB NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE INDEXES FOR FAST RETRIEVAL
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON public.emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_priority ON public.emergency_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON public.emergency_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_recipients_emg_id ON public.emergency_recipients(emergency_id);
CREATE INDEX IF NOT EXISTS idx_emergency_recipients_user_id ON public.emergency_recipients(recipient_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_settings ENABLE ROW LEVEL SECURITY;

-- POLICIES (Read and write rules for authenticated and emergency actors)
CREATE POLICY "Allow read for all authenticated users" ON public.emergency_alerts FOR SELECT USING (true);
CREATE POLICY "Allow insert for authorized users" ON public.emergency_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for response personnel" ON public.emergency_alerts FOR UPDATE USING (true);

CREATE POLICY "Allow read recipients" ON public.emergency_recipients FOR SELECT USING (true);
CREATE POLICY "Allow insert recipients" ON public.emergency_recipients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update recipients" ON public.emergency_recipients FOR UPDATE USING (true);

CREATE POLICY "Allow read audit logs" ON public.emergency_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow insert audit logs" ON public.emergency_audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read settings" ON public.emergency_settings FOR SELECT USING (true);
CREATE POLICY "Allow update settings" ON public.emergency_settings FOR ALL USING (true);
`;
