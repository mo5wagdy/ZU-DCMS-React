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
  cancel: (bookingId: number, reason?: string) =>
    call<string>(
      api.put<ApiResponse<string>>("/bookings/cancel", { bookingId, reason }) as any
    ),
  postpone: (bookingId: number, newDate: string, newTimeSlot: string) =>
    call<string>(
      api.put<ApiResponse<string>>("/bookings/postpone", {
        bookingId,
        newDate,
        newTimeSlot,
      }) as any
    ),
  byPatient: (patientId: number, paged: PagedRequest) =>
    call<PagedResult<BookingDto>>(
      api.get<ApiResponse<PagedResult<BookingDto>>>("/bookings/patient", {
        params: { patientId, ...paged },
      }) as any
    ),
};
