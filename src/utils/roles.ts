/**
 * Central role constants + helpers used across nav, redirects, and guards.
 */
export const Roles = {
  Patient: "Patient",
  InternDoctor: "InternDoctor",
  Student: "Student",
  TeachingAssistant: "TeachingAssistant",
  Admin: "Admin",
  Dean: "Dean",
  ViceDean: "ViceDean",
  Professor: "Professor",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const StaffRoles: Role[] = [
  Roles.InternDoctor,
  Roles.TeachingAssistant,
  Roles.Admin,
  Roles.Dean,
  Roles.ViceDean,
  Roles.Professor,
];

export const ViewOnlyRoles: Role[] = [Roles.Dean, Roles.ViceDean, Roles.Professor];

/** Default landing page after a successful login, by role. */
export const roleHomeMap: Record<string, string> = {
  Patient: "/patient/dashboard",
  InternDoctor: "/intern/dashboard",
  Student: "/student/dashboard",
  TeachingAssistant: "/ta/dashboard",
  Admin: "/admin/dashboard",
  Dean: "/view/dashboard",
  ViceDean: "/view/dashboard",
  Professor: "/view/dashboard",
};

export function homeForRole(role?: string | null): string {
  if (!role) return "/";
  return roleHomeMap[role] ?? "/";
}

/** Roles that can be created from the Admin "Add user" form. */
export const CreatableRoles: Role[] = [
  Roles.Admin,
  Roles.Dean,
  Roles.ViceDean,
  Roles.Professor,
  Roles.InternDoctor,
  Roles.TeachingAssistant,
  Roles.Student,
];
