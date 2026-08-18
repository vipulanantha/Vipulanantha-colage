import { supabase, isSupabaseConfigured } from './supabase';
import { StaffMember } from '../types/sms';
import { INITIAL_STAFF } from '../data/mockSmsData';
import { resilientUpsert } from './supabaseDb';

/**
 * Service for Centralized Teacher Management
 * Uses Supabase 'teachers' table as the single source of truth.
 */

export const fetchTeachersFromSupabase = async (): Promise<StaffMember[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return INITIAL_STAFF;
  }

  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('full_name', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Could not fetch teachers from Supabase, falling back to initial staff data:', error?.message);
      return INITIAL_STAFF;
    }

    return data.map((t) => ({
      id: t.id,
      employeeId: t.employee_id || t.employeeId,
      fullName: t.full_name || t.fullName,
      firstName: t.first_name || t.firstName,
      lastName: t.last_name || t.lastName,
      displayName: t.display_name || t.displayName,
      photoUrl: t.photo_url || t.photoUrl,
      gender: t.gender || 'Male',
      dob: t.date_of_birth || t.dob,
      nic: t.nic || '',
      phone: t.phone || '',
      whatsappNumber: t.whatsapp_number || t.whatsappNumber || t.phone,
      email: t.email || '',
      address: t.address || '',
      qualifications: t.qualifications || t.qualification || 'B.Ed / Degree',
      specialization: t.specialization || t.department || 'General',
      joinDate: t.join_date || t.joining_date || t.joinDate || '2020-01-01',
      employmentType: t.employment_type || t.employmentType || 'Permanent',
      status: t.status || 'Active',
      role: t.role || 'Teacher',
      department: t.department || 'Academic',
      subjectsTaught: t.subjects_taught || t.subjectsTaught || [],
      assignedClasses: t.assigned_classes || t.assignedClasses || [],
      attendanceStatus: t.attendance_status || t.attendanceStatus || 'Present',
      leaveBalance: t.leave_balance || t.leaveBalance || { casual: 14, medical: 21, duty: 5 },
      createdAt: t.created_at || t.createdAt,
      updatedAt: t.updated_at || t.updatedAt,
    }));
  } catch (err) {
    console.error('Error fetching teachers from Supabase:', err);
    return INITIAL_STAFF;
  }
};

export const saveTeacherToSupabase = async (teacher: StaffMember): Promise<{ ok: boolean; error?: string }> => {
  const payload = {
    id: teacher.id,
    employee_id: teacher.employeeId,
    full_name: teacher.fullName,
    first_name: teacher.firstName || teacher.fullName.split(' ')[0],
    last_name: teacher.lastName || teacher.fullName.split(' ').slice(1).join(' '),
    display_name: teacher.displayName || teacher.fullName,
    photo_url: teacher.photoUrl || '',
    gender: teacher.gender || 'Male',
    date_of_birth: teacher.dob || '1985-01-01',
    nic: teacher.nic || '',
    phone: teacher.phone || '',
    whatsapp_number: teacher.whatsappNumber || teacher.phone || '',
    email: teacher.email || '',
    address: teacher.address || '',
    qualifications: teacher.qualifications || '',
    specialization: teacher.specialization || teacher.department || '',
    join_date: teacher.joinDate || '2020-01-01',
    employment_type: teacher.employmentType || 'Permanent',
    status: teacher.status || 'Active',
    role: teacher.role || 'Teacher',
    department: teacher.department || 'Academic',
    subjects_taught: teacher.subjectsTaught || [],
    assigned_classes: teacher.assignedClasses || [],
    attendance_status: teacher.attendanceStatus || 'Present',
    leave_balance: teacher.leaveBalance || { casual: 14, medical: 21, duty: 5 },
    updated_at: new Date().toISOString(),
  };

  const result = await resilientUpsert('teachers', payload);
  return result;
};

export const getTeacherDisplayName = (teacherId: string, teachersList: StaffMember[]): string => {
  if (!teacherId) return 'Not Assigned';
  const found = teachersList.find(
    (t) => t.id === teacherId || t.employeeId === teacherId || t.fullName === teacherId
  );
  if (!found) return teacherId;
  return `${found.fullName} (${found.employeeId})`;
};

// ====================================================================
// RELATIONAL CLASS TEACHER ASSIGNMENTS & PERMISSIONS
// ====================================================================

import {
  ClassTeacherAssignment,
  SubstituteAssignment,
  AssignmentAuditLog,
  SchoolClass,
} from '../types/sms';
import {
  INITIAL_CLASS_TEACHER_ASSIGNMENTS,
  INITIAL_SUBSTITUTE_ASSIGNMENTS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockSmsData';

/**
 * Fetch all active and historic Class Teacher Assignments from Supabase
 */
export const fetchClassTeacherAssignmentsFromSupabase = async (): Promise<ClassTeacherAssignment[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return INITIAL_CLASS_TEACHER_ASSIGNMENTS;
  }

  try {
    const { data, error } = await supabase
      .from('class_teacher_assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_CLASS_TEACHER_ASSIGNMENTS;
    }

    return data.map((d) => ({
      id: d.id,
      classId: d.class_id,
      teacherId: d.teacher_id,
      academicYearId: d.academic_year_id || '2026',
      isActive: Boolean(d.is_active),
      assignedDate: d.assigned_date || d.created_at,
      endDate: d.end_date || undefined,
      createdBy: d.created_by || 'admin',
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  } catch (e) {
    console.error('Error fetching class teacher assignments from Supabase:', e);
    return INITIAL_CLASS_TEACHER_ASSIGNMENTS;
  }
};

/**
 * Save / Update Class Teacher Assignments for a specific Teacher and Academic Year
 * Ensures:
 * 1. For each class checked, any PREVIOUS active teacher assignment for that class is ENDED (is_active = false, end_date = now)
 * 2. Unchecked classes previously assigned to this teacher are DEACTIVATED
 * 3. Logs actions to class_assignment_audit_logs table
 */
export const saveClassTeacherAssignmentsToSupabase = async (
  teacherId: string,
  selectedClassIds: string[],
  academicYearId: string = '2026',
  actorId: string = 'admin'
): Promise<{ ok: boolean; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: true };
  }

  try {
    const now = new Date().toISOString();

    // 1. Get all current active assignments for this academic year
    const { data: currentAssignments } = await supabase
      .from('class_teacher_assignments')
      .select('*')
      .eq('academic_year_id', academicYearId)
      .eq('is_active', true);

    const activeList = currentAssignments || [];

    // A. For selected classes: if another teacher is assigned, end that assignment first
    for (const classId of selectedClassIds) {
      const existing = activeList.find((a) => a.class_id === classId && a.is_active);
      if (existing && existing.teacher_id !== teacherId) {
        // End/deactivate previous assignment
        await supabase
          .from('class_teacher_assignments')
          .update({
            is_active: false,
            end_date: now,
            updated_at: now,
          })
          .eq('id', existing.id);

        // Audit Log for REPLACE / REMOVE
        await supabase.from('class_assignment_audit_logs').insert({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          user_id: actorId,
          action: 'REPLACE',
          teacher_id: existing.teacher_id,
          class_id: classId,
          academic_year_id: academicYearId,
          details: `Replaced teacher ${existing.teacher_id} with ${teacherId} for class ${classId}`,
          created_at: now,
        });
      }

      // If not already assigned to this teacher, insert new active assignment
      if (!existing || existing.teacher_id !== teacherId) {
        const newAssignmentId = `cta-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        await supabase.from('class_teacher_assignments').insert({
          id: newAssignmentId,
          class_id: classId,
          teacher_id: teacherId,
          academic_year_id: academicYearId,
          is_active: true,
          assigned_date: now,
          created_by: actorId,
          created_at: now,
          updated_at: now,
        });

        // Audit Log for ASSIGN
        await supabase.from('class_assignment_audit_logs').insert({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          user_id: actorId,
          action: 'ASSIGN',
          teacher_id: teacherId,
          class_id: classId,
          academic_year_id: academicYearId,
          details: `Assigned teacher ${teacherId} to class ${classId} (${academicYearId})`,
          created_at: now,
        });
      }
    }

    // B. For classes previously assigned to THIS teacher but now UNCHECKED: deactivate them
    const teacherPrevious = activeList.filter((a) => a.teacher_id === teacherId);
    for (const prev of teacherPrevious) {
      if (!selectedClassIds.includes(prev.class_id)) {
        await supabase
          .from('class_teacher_assignments')
          .update({
            is_active: false,
            end_date: now,
            updated_at: now,
          })
          .eq('id', prev.id);

        // Audit Log for REMOVE
        await supabase.from('class_assignment_audit_logs').insert({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          user_id: actorId,
          action: 'REMOVE',
          teacher_id: teacherId,
          class_id: prev.class_id,
          academic_year_id: academicYearId,
          details: `Removed teacher ${teacherId} from class ${prev.class_id}`,
          created_at: now,
        });
      }
    }

    return { ok: true };
  } catch (err: any) {
    console.error('Error saving class teacher assignments to Supabase:', err);
    return { ok: false, error: err.message || 'Failed to save assignments' };
  }
};

/**
 * Fetch Substitute Teacher Assignments
 */
export const fetchSubstituteAssignmentsFromSupabase = async (): Promise<SubstituteAssignment[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return INITIAL_SUBSTITUTE_ASSIGNMENTS;
  }

  try {
    const { data } = await supabase
      .from('attendance_substitute_assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!data) return INITIAL_SUBSTITUTE_ASSIGNMENTS;

    return data.map((d) => ({
      id: d.id,
      teacherId: d.teacher_id,
      classId: d.class_id,
      date: d.date,
      periodId: d.period_id,
      reason: d.reason,
      assignedBy: d.assigned_by,
      createdAt: d.created_at,
    }));
  } catch (e) {
    return INITIAL_SUBSTITUTE_ASSIGNMENTS;
  }
};

/**
 * Save a Substitute Teacher Assignment
 */
export const saveSubstituteAssignmentToSupabase = async (
  substitute: Omit<SubstituteAssignment, 'id' | 'createdAt'>
): Promise<{ ok: boolean; error?: string }> => {
  const newSub: SubstituteAssignment = {
    ...substitute,
    id: `sub-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const payload = {
    id: newSub.id,
    teacher_id: newSub.teacherId,
    class_id: newSub.classId,
    date: newSub.date,
    period_id: newSub.periodId || 'Full Day',
    reason: newSub.reason || 'Class Teacher Absent',
    assigned_by: newSub.assignedBy || 'admin',
    created_at: newSub.createdAt,
  };

  const result = await resilientUpsert('attendance_substitute_assignments', payload);
  return result;
};

/**
 * Fetch Audit Logs
 */
export const fetchAssignmentAuditLogsFromSupabase = async (): Promise<AssignmentAuditLog[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return INITIAL_AUDIT_LOGS;
  }

  try {
    const { data } = await supabase
      .from('class_assignment_audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!data) return INITIAL_AUDIT_LOGS;

    return data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      action: d.action,
      teacherId: d.teacher_id,
      classId: d.class_id,
      academicYearId: d.academic_year_id,
      details: d.details,
      createdAt: d.created_at,
    }));
  } catch (e) {
    return INITIAL_AUDIT_LOGS;
  }
};
