import { api, call } from "./axios";
import type {
  AddSessionProgressCommand,
  ApiResponse,
  CaseAssignmentDto,
  CaseSessionDto,
  StudentProgressDto,
  ReviewCaseDto,
} from "@/types";

export const caseApi = {
  addProgress: (cmd: AddSessionProgressCommand) =>
    call<CaseSessionDto>(
      api.post<ApiResponse<CaseSessionDto>>("/cases/progress", cmd) as any
    ),
  submit: (caseAssignmentId: number) =>
    call<string>(
      api.post<ApiResponse<string>>("/cases/submit", { caseAssignmentId }) as any
    ),
  progress: (studentId: number, termId: number) =>
    call<StudentProgressDto>(
      api.get<ApiResponse<StudentProgressDto>>("/cases/progress", {
        params: { studentId, termId },
      }) as any
    ),
  review: (cmd: { caseAssignmentId: number; status: string; notes?: string }) =>
    call<string>(
      api.post<ApiResponse<string>>("/cases/review", cmd) as any
    ),
  pendingReviews: () =>
    call<CaseAssignmentDto[]>(
      api.get<ApiResponse<CaseAssignmentDto[]>>("/cases/pending-reviews") as any
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
};
