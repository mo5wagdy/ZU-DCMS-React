import { api, call } from "./axios";
import type {
  AddSessionProgressCommand,
  ApiResponse,
  CaseAssignmentDto,
  CaseSessionDto,
  StudentProgressDto,
  ReviewCaseDto,
  ReviewAssignmentDto,
} from "@/types";

export const caseApi = {
  addProgress: (cmd: AddSessionProgressCommand) =>
    call<CaseSessionDto>(
      api.post<ApiResponse<CaseSessionDto>>("/cases/progress", cmd) as any
    ),
  submit: (cmd: { studentId: number; caseAssignmentId: number }) =>
    call<string>(
      api.post<ApiResponse<string>>("/cases/submit", cmd) as any
    ),
  progress: (studentId: number, termId: number) =>
    call<StudentProgressDto>(
      api.get<ApiResponse<StudentProgressDto>>("/cases/progress", {
        params: { studentId, termId },
      }) as any
    ),
  review: (cmd: { teachingAssistantId: string; dto: ReviewCaseDto }) =>
    call<string>(
      api.post<ApiResponse<string>>("/cases/review", cmd) as any
    ),
  pendingReviews: () =>
    call<CaseAssignmentDto[]>(
      api.get<ApiResponse<CaseAssignmentDto[]>>("/cases/pending-reviews") as any
    ),
  pendingAssignments: () =>
    call<CaseAssignmentDto[]>(
      api.get<ApiResponse<CaseAssignmentDto[]>>("/cases/pending-assignments") as any
    ),
  reviewAssignment: (cmd: { taUserId: string; dto: ReviewAssignmentDto }) =>
    call<string>(
      api.post<ApiResponse<string>>("/cases/assignment-review", cmd) as any
    ),
  byId: (caseAssignmentId: number) =>
    call<CaseAssignmentDto>(
      api.get<ApiResponse<CaseAssignmentDto>>(`/cases/${caseAssignmentId}`) as any
    ),
  studentCases: (studentId: number) =>
    call<CaseAssignmentDto[]>(
      api.get<ApiResponse<CaseAssignmentDto[]>>(`/cases/student/${studentId}`) as any
    ),
  getReviews: (caseAssignmentId: number) =>
    call<ReviewCaseDto[]>(
      api.get<ApiResponse<ReviewCaseDto[]>>("/cases/reviews", {
        params: { caseAssignmentId },
      }) as any
    ),
  getTodayPatients: (userId: string) =>
    call<CaseAssignmentDto[]>(
      api.get<ApiResponse<CaseAssignmentDto[]>>("/cases/today-patients", {
        params: { userId },
      }) as any
    ),
  reviewedCases: (taUserId: string) =>
    call<CaseAssignmentDto[]>(
      api.get<ApiResponse<CaseAssignmentDto[]>>(`/cases/reviewed-by/${taUserId}`) as any
    ),
  reviewedAssignments: (taUserId: string) =>
    call<CaseAssignmentDto[]>(
      api.get<ApiResponse<CaseAssignmentDto[]>>(`/cases/reviewed-assignments/${taUserId}`) as any
    ),
};
