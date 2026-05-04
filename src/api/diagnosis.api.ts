import { api, call } from "./axios";
import type {
  ApiResponse,
  CaseAssignmentDto,
  DiagnosisRecordDto,
  StudentPriorityDto,
} from "@/types";

export const diagnosisApi = {
  diagnose: (cmd: {
    InternDoctorId: string;
    dto: {
      bookingId: number;
      clinicId: number;
      diagnosisTypeId: number;
      complaint: string;
      notes?: string;
    };
  }) =>
    call<DiagnosisRecordDto>(
      api.post<ApiResponse<DiagnosisRecordDto>>("/diagnosis", cmd) as any
    ),
  getByBooking: (bookingId: number) =>
    call<DiagnosisRecordDto>(
      api.get<ApiResponse<DiagnosisRecordDto>>(`/diagnosis/booking/${bookingId}`) as any
    ),
  availableStudents: (clinicId?: number, termId?: number, searchTerm?: string) =>
    call<StudentPriorityDto[]>(
      api.get<ApiResponse<StudentPriorityDto[]>>("/diagnosis/available-students", {
        params: { clinicId, termId, searchTerm },
      }) as any
    ),
  assign: (cmd: {
    InternDoctorId: string;
    dto: { diagnosisRecordId: number; studentId: number };
  }) =>
    call<CaseAssignmentDto>(
      api.post<ApiResponse<CaseAssignmentDto>>("/diagnosis/assign", cmd) as any
    ),
};
