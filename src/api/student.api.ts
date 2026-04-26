import { api, call } from "./axios";
import type {
  ApiResponse,
  PagedRequest,
  PagedResult,
  StudentDto,
  StudentRequirementDto,
} from "@/types";

export const studentApi = {
  list: (paged: PagedRequest) =>
    call<PagedResult<StudentDto>>(
      api.get<ApiResponse<PagedResult<StudentDto>>>("/students", { params: paged }) as any
    ),
  byId: (studentId: number) =>
    call<StudentDto>(
      api.get<ApiResponse<StudentDto>>(`/students/${studentId}`) as any
    ),
  byUserId: (userId: string) =>
    call<StudentDto>(
      api.get<ApiResponse<StudentDto>>(`/students/user/${userId}`) as any
    ),
  requirements: (studentId: number, termId: number) =>
    call<StudentRequirementDto[]>(
      api.get<ApiResponse<StudentRequirementDto[]>>("/students/requirements", {
        params: { studentId, termId },
      }) as any
    ),
};
