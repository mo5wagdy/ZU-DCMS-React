import { api, call } from "./axios";
import type {
  ApiResponse,
  PagedRequest,
  PagedResult,
  PatientDto,
  UpdateProfileCommand,
} from "@/types";

export const patientApi = {
  list: (paged: PagedRequest) =>
    call<PagedResult<PatientDto>>(
      api.get<ApiResponse<PagedResult<PatientDto>>>("/patients", { params: paged }) as any
    ),
  byId: (id: number) =>
    call<PatientDto>(api.get<ApiResponse<PatientDto>>(`/patients/${id}`) as any),
  byUserId: (userId: string) =>
    call<PatientDto>(
      api.get<ApiResponse<PatientDto>>(`/patients/user/${userId}`) as any
    ),
  updateProfile: (cmd: UpdateProfileCommand) =>
    call<PatientDto>(
      api.put<ApiResponse<PatientDto>>("/patients/profile", cmd) as any
    ),
};
