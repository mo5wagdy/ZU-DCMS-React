import { useUIStore } from "@/store/ui.store";

export function useRTL() {
  return useUIStore((s) => s.isRTL);
}
