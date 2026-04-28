import { api, call } from "./axios";
import type {
  ApiResponse,
  CreateUserCommand,
  PagedRequest,
  PagedResult,
  StaffUsersDto,
  StudentRequirementDto,
  SystemConfigDto,
   TermDto,
  ClinicDto,
} from "@/types";

export const adminApi = {
  // Configs
  getConfigs: () =>
    call<SystemConfigDto[]>(
      api.get<ApiResponse<SystemConfigDto[]>>("/admin/configs") as any
    ),
  updateConfig: (cmd: { key: string; value: string; adminId: string }) =>
    call<string>(api.put<ApiResponse<string>>("/admin/configs", cmd) as any),

  // Clinics
  getClinics: () =>
    call<ClinicDto[]>(api.get<ApiResponse<ClinicDto[]>>("/admin/clinics") as any),

  // Terms
  getTerms: () =>
    call<TermDto[]>(api.get<ApiResponse<TermDto[]>>("/admin/terms") as any),
  getTerm: (termId: number) =>
    call<TermDto>(api.get<ApiResponse<TermDto>>(`/admin/terms/${termId}`) as any),
  createTerm: (cmd: {
    adminId: string;
    dto: {
      name: string;
      startDate: string;
      endDate: string;
      requiredCasesCount: number;
    };
  }) => call<TermDto>(api.post<ApiResponse<TermDto>>("/admin/terms", cmd) as any),
  updateTerm: (cmd: {
    termId: number;
    adminId: string;
    dto: Omit<TermDto, "id" | "isActive">;
  }) =>
    call<TermDto>(api.put<ApiResponse<TermDto>>("/admin/terms", cmd) as any),
  setActiveTerm: (cmd: { termId: number; adminId: string }) =>
    call<string>(
      api.put<ApiResponse<string>>("/admin/terms/set-active", cmd) as any
    ),

  // Users
  getUsers: (paged: PagedRequest, role?: string) =>
    call<PagedResult<StaffUsersDto>>(
      api.get<ApiResponse<PagedResult<StaffUsersDto>>>("/admin/users", {
        params: { ...paged, role },
      }) as any
    ),
  getUser: (userId: string) =>
    call<StaffUsersDto>(
      api.get<ApiResponse<StaffUsersDto>>(`/admin/users/${userId}`) as any
    ),
  createUser: (cmd: CreateUserCommand) =>
    call<StaffUsersDto>(
      api.post<ApiResponse<StaffUsersDto>>("/admin/users", cmd) as any
    ),

  // Student requirements
  getStudentRequirements: (studentId: number, termId: number) =>
    call<StudentRequirementDto[]>(
      api.get<ApiResponse<StudentRequirementDto[]>>(
        `/admin/students/${studentId}/requirements/term/${termId}`
      ) as any
    ),
  setStudentRequirements: (cmd: {
    adminId: string;
    studentId: number;
    termId: number;
    requirements: { clinicId: number; requiredCount: number }[];
  }) =>
    call<string>(
      api.put<ApiResponse<string>>("/admin/student-requirements", cmd) as any
    ),
};
