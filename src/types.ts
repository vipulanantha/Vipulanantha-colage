export type PortalRole = 'staff' | 'student' | 'parent' | 'admin';

export interface UserSession {
  username: string;
  name: string;
  role: PortalRole;
  roleTitle: string;
  departmentOrGrade: string;
  avatarInitials: string;
  lastLogin: string;
}

export interface DemoCredential {
  role: PortalRole;
  label: string;
  badge: string;
  username: string;
  roleTitle: string;
  departmentOrGrade: string;
}
