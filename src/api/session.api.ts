import { api, call } from "./axios";
import type {
  ApiResponse,
  AvailableSlotDto,
  BookingForDiagnosisDto,
  SessionDto,
  PagedResult,
} from "@/types";

export const sessionApi = {
  availableSlots: (bookingType: number) =>
    call<AvailableSlotDto[]>(
      api.get<ApiResponse<AvailableSlotDto[]>>("/sessions/available-slots", {
        params: { bookingType },
      }) as any
    ),
  find: (date: string, timeSlot: string) =>
    call<SessionDto>(
      api.get<ApiResponse<SessionDto>>("/sessions/find", {
        params: { date, timeSlot },
      }) as any
    ),
  checkAvailability: (date: string, timeSlot: string, bookingType: number) =>
    call<boolean>(
      api.get<ApiResponse<boolean>>("/sessions/check-availability", {
        params: { date, timeSlot, bookingType },
      }) as any
    ),
  generate: (startDate: string, daysCount: number = 1) =>
    call<SessionDto[]>(
      api.post<ApiResponse<SessionDto[]>>("/sessions/generate", {
        startDate,
        daysCount,
      }) as any
    ),
  patients: (sessionId: number, InternDoctorId: string, page: number = 1) =>
    call<PagedResult<BookingForDiagnosisDto>>(
      api.get<ApiResponse<PagedResult<BookingForDiagnosisDto>>>("/sessions/patients", {
        params: { sessionId, InternDoctorId, page },
      }) as any
    ),
  getToday: () =>
    call<SessionDto[]>(api.get<ApiResponse<SessionDto[]>>("/sessions/today") as any),
  getRecent: (days: number = 7) =>
    call<SessionDto[]>(
      api.get<ApiResponse<SessionDto[]>>("/sessions/recent", {
        params: { days },
      }) as any
    ),
};
