import { api, call } from "./axios";
import type {
  ApiResponse,
  AuthDto,
  ForgotPhoneResponseDto,
  LoginCommand,
  RegisterPatientCommand,
  StaffLoginCommand,
} from "@/types";

export const authApi = {
  login: (cmd: LoginCommand) =>
    call<AuthDto>(api.post<ApiResponse<AuthDto>>("/auth/login", cmd) as any),
  staffLogin: (cmd: StaffLoginCommand) =>
    call<AuthDto>(api.post<ApiResponse<AuthDto>>("/auth/staff-login", cmd) as any),
  register: (cmd: RegisterPatientCommand) =>
    call<AuthDto>(api.post<ApiResponse<AuthDto>>("/auth/register", cmd) as any),
  forgotPhone: (nationalId: string) =>
    call<ForgotPhoneResponseDto>(
      api.get<ApiResponse<ForgotPhoneResponseDto>>("/auth/forgot-phone", {
        params: { nationalId },
      }) as any
    ),
  logout: (refreshToken: string) =>
    call<string>(api.post<ApiResponse<string>>("/auth/logout", { refreshToken }) as any),
  refreshToken: (refreshToken: string) =>
    call<AuthDto>(api.post<ApiResponse<AuthDto>>("/auth/refresh", { refreshToken }) as any),
};
