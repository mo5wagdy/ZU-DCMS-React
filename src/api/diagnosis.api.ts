import { api, call } from "./axios";
import type {
  ApiResponse,
  CaseAssignmentDto,
  DiagnosisRecordDto,
  StudentPriorityDto,
} from "@/types";

export const diagnosisApi = {
  diagnose: (cmd: {
    bookingId: number;
    clinicId: number;
    diagnosisTypeId: number;
    complaint: string;
    notes?: string;
  }) =>
    call<DiagnosisRecordDto>(
      api.post<ApiResponse<DiagnosisRecordDto>>("/diagnosis", cmd) as any
    ),
  availableStudents: (clinicId?: number, termId?: number) =>
    call<StudentPriorityDto[]>(
      api.get<ApiResponse<StudentPriorityDto[]>>("/diagnosis/available-students", {
        params: { clinicId, termId },
      }) as any
    ),
  assign: (cmd: { diagnosisId: number; studentId: number }) =>
    call<CaseAssignmentDto>(
      api.post<ApiResponse<CaseAssignmentDto>>("/diagnosis/assign", cmd) as any
    ),
};
