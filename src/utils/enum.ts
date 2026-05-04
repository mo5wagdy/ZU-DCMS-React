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

export const Gender = { Male: 1, Female: 2 } as const;

export const IdentityType = {
  NationalId: 1,
  Passport: 2,
  ResidencePermit: 3,
} as const;

export const BookingType = { New: 1, FollowUp: 2 } as const;

export const BookingStatus = {
  Pending: 1,
  Confirmed: 2,
  Cancelled: 3,
  Postponed: 4,
  Completed: 5,
  Delayed: 6,
} as const;

export const CaseStatus = {
  InProgress: 1,
  Completed: 2,
  Transferred: 3,
  PendingReview: 4,
  Approved: 5,
  Rejected: 6,
} as const;

export function hasFlag(value: number | string | undefined | null, flag: number | string): boolean {
  if (value === undefined || value === null) return false;
  
  if (typeof value === "string") {
    // If it's a string like "Diabetes, Hypertension", check if the flag name exists in the string
    // This happens when EF Core or Serializer converts flags to strings
    const flagKey = ChronicConditionList.find(c => c.value === flag || c.key === flag)?.key;
    if (!flagKey) return false;
    
    // Case-insensitive check for the key in the comma-separated string
    const normalizedValue = value.toLowerCase();
    const normalizedKey = flagKey.toLowerCase();
    
    return normalizedValue.split(',').map(s => s.trim()).includes(normalizedKey);
  }

  return (Number(value) & Number(flag)) !== 0;
}

export function flagsToArray(value: number, allFlags: number[]): number[] {
  return allFlags.filter((f) => hasFlag(value, f));
}

export function arrayToFlags(values: number[]): number {
  return values.reduce((acc, v) => acc | v, 0);
}

export function bookingStatusKey(status: number): string {
  const map: Record<number, string> = {
    1: "pending",
    2: "confirmed",
    3: "cancelled",
    4: "postponed",
    5: "completed",
    6: "delayed",
  };
  return map[status] ?? "pending";
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
