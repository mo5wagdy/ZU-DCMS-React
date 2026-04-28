export const ChronicConditions = {
  Diabetes: 1,
  Hypertension: 2,
  HeartDisease: 4,
  BleedingDisorder: 8,
  Pregnant: 16,
  AntibioticAllergy: 32,
  KidneyDisease: 64,
} as const;

export const ChronicConditionList = [
  { value: 1, key: "diabetes" },
  { value: 2, key: "hypertension" },
  { value: 4, key: "heartDisease" },
  { value: 8, key: "bleedingDisorder" },
  { value: 16, key: "pregnant", femaleOnly: true },
  { value: 32, key: "antibioticAllergy" },
  { value: 64, key: "kidneyDisease" },
];

export const Gender = { Male: 0, Female: 1 } as const;

export const IdentityType = {
  NationalId: 0,
  Passport: 1,
  ResidencePermit: 2,
} as const;

export const BookingType = { New: 0, FollowUp: 1 } as const;

export const BookingStatus = {
  Pending: 0,
  Confirmed: 1,
  Cancelled: 2,
  Postponed: 3,
  Completed: 4,
} as const;

export const CaseStatus = {
  InProgress: 1,
  Completed: 2,
  Transferred: 3,
  PendingReview: 4,
  Approved: 5,
  Rejected: 6,
} as const;

export function hasFlag(value: number, flag: number): boolean {
  return (value & flag) !== 0;
}

export function flagsToArray(value: number, allFlags: number[]): number[] {
  return allFlags.filter((f) => hasFlag(value, f));
}

export function arrayToFlags(values: number[]): number {
  return values.reduce((acc, v) => acc | v, 0);
}

export function bookingStatusKey(status: number): string {
  return ["pending", "confirmed", "cancelled", "postponed", "completed"][status] ?? "pending";
}

export function caseStatusKey(status: number): string {
  const map: Record<number, string> = {
    1: "inProgress",
    2: "completed",
    3: "transferred",
    4: "pendingReview",
    5: "approved",
    6: "rejected"
  };
  return map[status] ?? "inProgress";
}
