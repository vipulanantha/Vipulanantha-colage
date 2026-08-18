import { supabase, isSupabaseConfigured } from './supabase';
import {
  ParentProfile,
  ParentAccount,
  ParentStudentRelation,
  ParentWithChildren,
  Student,
} from '../types/sms';
import {
  INITIAL_PARENTS,
  INITIAL_PARENT_ACCOUNTS,
  INITIAL_PARENT_STUDENT,
  INITIAL_STUDENTS,
} from '../data/mockSmsData';
import { resilientUpsert } from './supabaseDb';

/**
 * Generates a strong random password for new parent accounts
 * (e.g. "Vp7#m2K9!x") that avoids weak defaults like 123456 or NIC numbers.
 */
export const generateSecureTempPassword = (): string => {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*';

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  const all = uppercase + lowercase + numbers + symbols;
  for (let i = 0; i < 6; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Searches Supabase and local store for an existing parent by NIC
 */
export const searchParentByNic = async (
  rawNic: string,
  localStudents: Student[] = [],
  localParents: ParentProfile[] = INITIAL_PARENTS,
  localAccounts: ParentAccount[] = INITIAL_PARENT_ACCOUNTS,
  localRelations: ParentStudentRelation[] = INITIAL_PARENT_STUDENT
): Promise<{
  found: boolean;
  parent?: ParentProfile;
  account?: ParentAccount;
  children: Student[];
}> => {
  const nic = rawNic.trim().toUpperCase();
  if (!nic || nic.length < 5) {
    return { found: false, children: [] };
  }

  // 1. Try querying Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: dbParents } = await supabase
        .from('parents')
        .select('*')
        .ilike('nic', nic)
        .limit(1);

      if (dbParents && dbParents.length > 0) {
        const p = dbParents[0];
        const parentProfile: ParentProfile = {
          id: p.id,
          nic: p.nic,
          fullName: p.full_name,
          relationship: p.relationship || 'Guardian',
          mobileNumber: p.mobile_number,
          whatsappNumber: p.whatsapp_number || p.mobile_number,
          address: p.address,
          occupation: p.occupation,
          preferredLanguage: p.preferred_language || 'Tamil',
          emergencyContact: p.emergency_contact || p.mobile_number,
          status: p.status || 'Active',
          authUserId: p.auth_user_id,
          createdAt: p.created_at,
        };

        // Fetch account info
        const { data: dbAccount } = await supabase
          .from('parent_accounts')
          .select('*')
          .eq('parent_id', p.id)
          .limit(1);

        const account: ParentAccount = dbAccount && dbAccount.length > 0
          ? {
              id: dbAccount[0].id,
              parentId: dbAccount[0].parent_id,
              username: dbAccount[0].username,
              authUserId: dbAccount[0].auth_user_id,
              mustChangePassword: dbAccount[0].must_change_password ?? true,
              isActive: dbAccount[0].is_active ?? true,
              createdAt: dbAccount[0].created_at,
            }
          : {
              id: `pa-${p.nic}`,
              parentId: p.id,
              username: `PAR${p.nic}`,
              mustChangePassword: true,
              isActive: true,
            };

        // Fetch linked children from junction table parent_student
        const { data: dbRelations } = await supabase
          .from('parent_student')
          .select('student_id')
          .eq('parent_id', p.id);

        let children: Student[] = [];
        if (dbRelations && dbRelations.length > 0) {
          const studentIds = dbRelations.map((r) => r.student_id);
          const { data: dbStudents } = await supabase
            .from('students')
            .select('*')
            .in('id', studentIds);

          if (dbStudents && dbStudents.length > 0) {
            children = dbStudents.map((s) => ({
              id: s.id,
              admissionNo: s.admission_no,
              fullName: s.full_name,
              fullNameTamil: s.full_name_tamil,
              dob: s.dob || '2010-01-01',
              gender: s.gender || 'Male',
              address: s.address || '',
              grade: s.grade || '',
              section: s.section || '',
              stream: s.stream || 'General',
              house: s.house || 'Royal Gold',
              parentName: s.parent_name || p.full_name,
              parentPhone: s.parent_phone || p.mobile_number,
              parentNic: p.nic,
              parentId: p.id,
              relationship: p.relationship,
              email: s.email || '',
              emergencyContact: s.emergency_contact || p.mobile_number,
              admissionDate: s.admission_date || '2020-01-01',
              status: s.status || 'Active',
            }));
          }
        }

        // Fallback to searching local students array if dbRelations was empty
        if (children.length === 0) {
          const mergedStudents = localStudents.length > 0 ? localStudents : INITIAL_STUDENTS;
          children = mergedStudents.filter(
            (s) => (s.parentNic && s.parentNic.toUpperCase() === nic) || s.parentId === p.id
          );
        }

        return {
          found: true,
          parent: parentProfile,
          account,
          children,
        };
      }
    } catch (e) {
      console.warn('[searchParentByNic] Supabase search error, checking local store:', e);
    }
  }

  // 2. Local Fallback Search
  const matchingParent = localParents.find((p) => p.nic.toUpperCase() === nic);
  if (matchingParent) {
    const matchingAccount = localAccounts.find((a) => a.parentId === matchingParent.id) || {
      id: `pa-${matchingParent.nic}`,
      parentId: matchingParent.id,
      username: `PAR${matchingParent.nic}`,
      mustChangePassword: true,
      isActive: true,
    };

    const mergedStudents = localStudents.length > 0 ? localStudents : INITIAL_STUDENTS;
    
    // Find children linked via parentNic, parentId or parent_student junction
    const linkedStudentIdsFromRelations = localRelations
      .filter((r) => r.parentId === matchingParent.id)
      .map((r) => r.studentId);

    const children = mergedStudents.filter(
      (s) =>
        s.parentId === matchingParent.id ||
        (s.parentNic && s.parentNic.toUpperCase() === nic) ||
        linkedStudentIdsFromRelations.includes(s.id)
    );

    return {
      found: true,
      parent: matchingParent,
      account: matchingAccount,
      children,
    };
  }

  // Also check if any local student has this parentNic recorded
  const mergedStudents = localStudents.length > 0 ? localStudents : INITIAL_STUDENTS;
  const matchStudent = mergedStudents.find((s) => s.parentNic && s.parentNic.toUpperCase() === nic);
  if (matchStudent) {
    const createdParent: ParentProfile = {
      id: matchStudent.parentId || `p-${nic}`,
      nic: nic,
      fullName: matchStudent.parentName || 'Parent / Guardian',
      relationship: matchStudent.relationship || 'Father',
      mobileNumber: matchStudent.parentPhone || '',
      whatsappNumber: matchStudent.parentPhone || '',
      address: matchStudent.address,
      status: 'Active',
    };

    const createdAccount: ParentAccount = {
      id: `pa-${nic}`,
      parentId: createdParent.id,
      username: `PAR${nic}`,
      mustChangePassword: true,
      isActive: true,
    };

    const children = mergedStudents.filter(
      (s) => s.parentNic && s.parentNic.toUpperCase() === nic
    );

    return {
      found: true,
      parent: createdParent,
      account: createdAccount,
      children,
    };
  }

  return { found: false, children: [] };
};

/**
 * Workflow to handle student enrollment while reusing or creating a parent profile & account
 */
export const createOrLinkParentForStudent = async (
  studentInput: Omit<Student, 'id'>,
  parentInput: {
    nic: string;
    fullName: string;
    relationship: string;
    mobileNumber: string;
    whatsappNumber: string;
    address?: string;
    occupation?: string;
    preferredLanguage?: string;
    emergencyContact?: string;
  },
  existingParentObj?: ParentProfile | null
): Promise<{
  ok: boolean;
  isNewParent: boolean;
  tempPassword?: string;
  parent: ParentProfile;
  account: ParentAccount;
  student: Student;
  children: Student[];
  error?: string;
}> => {
  const cleanNic = parentInput.nic.trim().toUpperCase();
  const studentId = `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Step 1: Search if parent already exists
  const searchResult = await searchParentByNic(cleanNic);
  let parent: ParentProfile;
  let account: ParentAccount;
  let isNewParent = false;
  let tempPassword: string | undefined = undefined;

  if (existingParentObj) {
    parent = existingParentObj;
    account = searchResult.account || {
      id: `pa-${cleanNic}`,
      parentId: parent.id,
      username: `PAR${cleanNic}`,
      mustChangePassword: false,
      isActive: true,
    };
  } else if (searchResult.found && searchResult.parent) {
    // REUSE EXISTING PARENT - DO NOT CREATE NEW USERNAME, ACCOUNT, OR PASSWORD!
    parent = searchResult.parent;
    account = searchResult.account || {
      id: `pa-${cleanNic}`,
      parentId: parent.id,
      username: `PAR${cleanNic}`,
      mustChangePassword: false,
      isActive: true,
    };
  } else {
    // CREATE NEW PARENT ACCOUNT
    isNewParent = true;
    const parentId = `p-${cleanNic}`;
    const username = `PAR${cleanNic}`;
    tempPassword = generateSecureTempPassword();

    parent = {
      id: parentId,
      nic: cleanNic,
      fullName: parentInput.fullName.trim(),
      relationship: parentInput.relationship || 'Father',
      mobileNumber: parentInput.mobileNumber.trim(),
      whatsappNumber: parentInput.whatsappNumber.trim() || parentInput.mobileNumber.trim(),
      address: parentInput.address?.trim() || studentInput.address,
      occupation: parentInput.occupation?.trim() || studentInput.parentOccupation,
      preferredLanguage: (parentInput.preferredLanguage as any) || 'Tamil',
      emergencyContact: parentInput.emergencyContact?.trim() || parentInput.mobileNumber.trim(),
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    account = {
      id: `pa-${cleanNic}`,
      parentId: parentId,
      username,
      mustChangePassword: true,
      isActive: true,
      tempPassword,
      createdAt: new Date().toISOString(),
    };

    // Persist Parent and Parent Account to Supabase
    if (isSupabaseConfigured && supabase) {
      await resilientUpsert('parents', {
        id: parent.id,
        nic: parent.nic,
        full_name: parent.fullName,
        relationship: parent.relationship,
        mobile_number: parent.mobileNumber,
        whatsapp_number: parent.whatsappNumber,
        address: parent.address,
        occupation: parent.occupation,
        preferred_language: parent.preferredLanguage,
        emergency_contact: parent.emergencyContact,
        status: parent.status,
      });

      await resilientUpsert('parent_accounts', {
        id: account.id,
        parent_id: account.parentId,
        username: account.username,
        must_change_password: true,
        is_active: true,
      });

      // Try creating Supabase Auth identity under the hood using synthetic email
      try {
        const syntheticEmail = `${account.username.toLowerCase()}@parent.vipulanantha.edu.lk`;
        const { data: authData } = await supabase.auth.signUp({
          email: syntheticEmail,
          password: tempPassword,
          options: {
            data: {
              username: account.username,
              parent_id: parent.id,
              full_name: parent.fullName,
              role: 'parent',
            },
          },
        });

        if (authData?.user) {
          parent.authUserId = authData.user.id;
          account.authUserId = authData.user.id;
          await resilientUpsert('parents', { id: parent.id, auth_user_id: authData.user.id });
          await resilientUpsert('parent_accounts', { id: account.id, auth_user_id: authData.user.id });
        }
      } catch (authErr) {
        console.warn('[createOrLinkParentForStudent] Auth identity creation notice:', authErr);
      }
    }
  }

  // Step 2: Create new Student record linked to this Parent
  const newStudent: Student = {
    ...studentInput,
    id: studentId,
    parentName: parent.fullName,
    parentPhone: parent.mobileNumber,
    parentNic: parent.nic,
    parentId: parent.id,
    relationship: parent.relationship,
  };

  // Persist Student to Supabase
  if (isSupabaseConfigured && supabase) {
    await resilientUpsert('students', newStudent);

    // Create Junction table record parent_student
    const relationRecord = {
      id: `ps-${parent.id}-${studentId}`,
      parent_id: parent.id,
      student_id: studentId,
      relationship: parent.relationship || 'Guardian',
      is_primary_guardian: true,
    };

    await resilientUpsert('parent_student', relationRecord);
  }

  const allChildren = [...(searchResult.children || []), newStudent];

  return {
    ok: true,
    isNewParent,
    tempPassword,
    parent,
    account,
    student: newStudent,
    children: allChildren,
  };
};

/**
 * Formats official WhatsApp message for Parent Portal login details
 */
export const formatParentWhatsAppMessage = (
  parentName: string,
  username: string,
  tempPassword?: string,
  schoolName: string = 'VIPULANANTHA COLLEGE COLOMBO'
): string => {
  return `Dear Parent (${parentName}),

*${schoolName}*

Your Parent Portal account has been configured.

*Portal Username:* ${username}
${tempPassword ? `*Temporary Password:* ${tempPassword}` : `*Password:* (Use your existing password)`}

Please use these credentials to access the Parent Portal at:
https://vipulanantha.edu.lk/parent-portal

For security, please change your temporary password upon your first login.

Thank you.
- Administration, Vipulanantha College Colombo`;
};
