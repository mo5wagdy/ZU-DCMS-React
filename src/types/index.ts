// ============= Common =============
export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  errors: string[];
}

export interface PagedRequest {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDescending: boolean;
  searchTerm?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ============= Admin / Dashboard =============
export interface DailyMetricsDto {
  todayNewPatientsCount: number;
  todayBookingsCount: number;
  todayNewBookingsCount: number;
  todayFollowUpBookingsCount: number;
  pendingBookingsCount: number;
  cancelledBookingsCount: number;
  inProgressCasesCount: number;
  completedCasesCount: number;
  activeSessionsCount: number;
  totalActiveStudents: number;
}

// ============= Auth =============
export interface AuthDto {
  accessToken: string;
  refreshToken: string;
  role: string;
  redirectUrl: string;
  userId?: string;
  fullName?: string;
}

export interface RegisterPatientDto {
  fullName: string;
  parentName?: string;
  phoneNumber: string;
  identityType: number;
  identityNumber: string;
  dateOfBirth: string;
  gender: number;
  chronicConditions: number;
  otherConditions?: string;
  address?: string;
  email?: string;
}

export interface RegisterPatientCommand {
  dto: RegisterPatientDto;
}

export interface LoginCommand {
  dto:{
  phoneNumber: string;
  identityNumber: string;}
}

export interface StaffLoginDto {
  email: string;
  password: string;
}

export interface StaffLoginCommand {
  dto: StaffLoginDto;
}

export interface ForgotPhoneResponseDto {
  maskedPhoneNumber: string;
}

// ============= Patient =============
export interface PatientDto {
  id: number;
  patientCode: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  identityNumber: string;
  identityType: number;
  dateOfBirth: string;
  age: number;
  gender: number;
  chronicConditions: number;
  otherConditions?: string;
  address?: string;
  isActive: boolean;
  hasActiveBooking: boolean;
  hasActiveCase: boolean;
}

export interface UpdatePatientDto {
  username?: string;
  phoneNumber?: string;
  email?: string;
  chronicConditions?: number;
  otherConditions?: string;
  address?: string;
}

export interface UpdateProfileCommand {
  id: number;
  dto: UpdatePatientDto;
}

// ============= Booking =============
export interface BookingDto {
  id: number;
  bookingCode: string;
  patientName: string;
  bookingType: number;
  status: number;
  preliminaryComplaint?: string;
  sessionDate: string;
  sessionStartTime: string;
  sessionEndTime: string;
  clinicName?: string;
}

export interface CreateBookingDto {
  bookingType: number;
  preferredDate: string;
  preferredTimeSlot: string;
  preliminaryComplaint?: string;
}

export interface CreateBookingCommand {
  PatientId: number;
  dto: CreateBookingDto;
}

export interface AvailableSlotDto {
  sessionId: number;
  date: string;
  startTime: string;
  endTime: string;
  availableNewSlots: number;
  availableFollowUpSlots: number;
  isAvailable: boolean;
}

// ============= Session =============
export interface SessionDto {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  maxNewPatients: number;
  maxFollowUpPatients: number;
  currentNewCount: number;
  currentFollowUpCount: number;
  isFull: boolean;
  isNewFull: boolean;
  isFollowUpFull: boolean;
}

// ============= Diagnosis =============
export interface DiagnosisRecordDto {
  id: number;
  patientName: string;
  internDoctorName: string;
  clinicName: string;
  clinicNameEn?: string;       // English clinic name
  clinicId: number;
  diagnosisTypeName: string;
  diagnosisTypeNameEn?: string; // English diagnosis type name
  complaint: string;
  notes?: string;
  diagnosedAt: string;
  isAssigned: boolean;
  studentName?: string;
  studentCode?: string;
}

export interface DiagnosisTypeDto {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
}

export interface ProcedureDto {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
}

export interface BookingForDiagnosisDto {
  bookingId: number;
  patientName: string;
  patientAge: number;
  patientGender: number;
  patientCode: string;
  phoneNumber: string;
  conditions: number;
  otherConditions?: string;
  preliminaryComplaint?: string;
  isDiagnosed: boolean;
  isAssigned: boolean;
  status: number;
  studentName?: string;
  studentCode?: string;
}

export interface StudentPriorityDto {
  studentId: number;
  fullName: string;
  studentCode: string;
  academicYear: number;
  completedCases: number;
  requiredCases: number;
  progressPercentage: number;
  activeCasesInClinic: number;
  isAvailable: boolean;
  availabilityStatus: string;
  priority: number;
  isComplete: boolean;
}

// ============= Case =============
export interface CaseAssignmentDto {
  id: number;
  patientName: string;
  clinicId: number;
  clinicName: string;      // Arabic
  clinicNameEn: string;    // English
  diagnosis: string;       // Arabic
  diagnosisEn: string;     // English
  studentId: number;
  studentName: string;
  studentCode: string;
  assignedByInternName: string;
  notes?: string;
  status: number;
  assignedAt: string;
  assignmentReviewedAt?: string;
  sessions: CaseSessionDto[];
}

export interface CaseSessionDto {
  id: number;
  proceduresNames: string[];     // Arabic
  proceduresNamesEn: string[];   // English
  isCompleted: boolean;
  hasFollowUp: boolean;
  notes?: string;
  sessionDate: string;
}

export interface AddCaseSessionDto {
  caseAssignmentId: number;
  procedureIds: number[];
  isCompleted: boolean;
  hasFollowUp: boolean;
  notes?: string;
}

export interface AddSessionProgressCommand {
  studentId: number;
  termId: number;
  dto: AddCaseSessionDto;
}

export interface ReviewCaseDto {
  caseAssignmentId: number;
  isApproved: boolean;
  notes?: string;
}

export interface ReviewAssignmentDto {
  caseAssignmentId: number;
  action: string;
  notes?: string;
}

// ============= Student =============
export interface StudentDto {
  id: number;
  applicationUserId: string;
  studentCode: string;
  fullName: string;
  academicYear: number;
  isActive: boolean;
}

export interface StudentRequirementDto {
  id: number;
  clinicName: string;
  clinicNameEn: string;
  requirementTypeName: string;
  requirementTypeNameEn: string;
  requiredCount: number;
  completedCount: number;
  transferredCount: number;
  isSatisfied: boolean;
  priority: number;
  completionPercentage: number;
}

export interface StudentProgressDto {
  studentId: number;
  fullName: string;
  studentCode: string;
  totalRequired: number;
  totalCompleted: number;
  totalTransferred: number;
  isTermComplete: boolean;
  overallPercentage: number;
  requirements: StudentRequirementDto[];
}

// ============= Admin =============
export interface StaffUsersDto {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserDto {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  academicYear?: number;
}

export interface CreateUserCommand {
  dto: CreateUserDto;
}

export interface TermDto {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  requiredCasesCount: number;
}

export interface SystemConfigDto {
  key: string;
  value: string;
  description?: string;
}

export interface ClinicDto {
  id: number;
  name: string;
  code: string;
  minAcademicYear: number;
  maxAcademicYear: number;
  isActive: boolean;
}
