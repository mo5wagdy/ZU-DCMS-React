import { api, call } from "./axios";
import type {
  ApiResponse,
  AvailableSlotDto,
  BookingForDiagnosisDto,
  SessionDto,
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
  generate: (startDate: string, endDate: string) =>
    call<SessionDto[]>(
      api.post<ApiResponse<SessionDto[]>>("/sessions/generate", {
        startDate,
        endDate,
      }) as any
    ),
};
