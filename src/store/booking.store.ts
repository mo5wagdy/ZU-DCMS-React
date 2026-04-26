import { create } from "zustand";
import type { AvailableSlotDto } from "@/types";

interface BookingState {
  selectedSlot: AvailableSlotDto | null;
  bookingType: number | null;
  complaint: string;
  setSlot: (slot: AvailableSlotDto | null) => void;
  setBookingType: (type: number) => void;
  setComplaint: (text: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedSlot: null,
  bookingType: null,
  complaint: "",
  setSlot: (slot) => set({ selectedSlot: slot }),
  setBookingType: (type) => set({ bookingType: type }),
  setComplaint: (text) => set({ complaint: text }),
  reset: () => set({ selectedSlot: null, bookingType: null, complaint: "" }),
}));
