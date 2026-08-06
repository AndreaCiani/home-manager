export type Role = 'ADMIN' | 'MEMBER';

/** The authenticated user, as returned by /api/auth/me. */
export interface User {
  id: number;
  email: string;
  displayName: string;
  role: Role;
  familyId: number;
  familyName: string;
}

export interface FamilyMember {
  id: number;
  displayName: string;
  email: string;
  role: Role;
}

/** A family with its members; inviteCode is present only for admins. */
export interface Family {
  id: number;
  name: string;
  inviteCode: string | null;
  members: FamilyMember[];
}
