import { api, call } from "./axios";
import type {
  ApiResponse,
  BookingDto,
  CreateBookingCommand,
  PagedRequest,
  PagedResult,
} from "@/types";

export const bookingApi = {
  create: (cmd: CreateBookingCommand) =>
    call<BookingDto>(api.post<ApiResponse<BookingDto>>("/bookings", cmd) as any),
  cancel: (cmd: { bookingId: number; patientId: number }) =>
    call<void>(api.put<ApiResponse<void>>("/bookings/cancel", cmd) as any),
  postpone: (cmd: { bookingId: number; reason: string; adminId: string }) =>
    call<string>(
      api.put<ApiResponse<string>>("/bookings/postpone", cmd) as any
    ),
  byPatient: (patientId: number, paged: PagedRequest) =>
    call<PagedResult<BookingDto>>(
      api.get<ApiResponse<PagedResult<BookingDto>>>("/bookings/patient", {
        params: { patientId, ...paged },
      }) as any
    ),
};
