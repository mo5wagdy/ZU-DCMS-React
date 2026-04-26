import { api, call } from "./axios";
import type { ApiResponse, TermDto } from "@/types";

export const termApi = {
  /** Returns the currently active term. */
  active: async () => {
    const res = await call<TermDto[]>(api.get<ApiResponse<TermDto[]>>("/admin/terms") as any);
    const activeTerm = res.find((t) => t.isActive);
    if (!activeTerm) throw new Error("No active term found");
    return activeTerm;
  },
  list: () =>
    call<TermDto[]>(api.get<ApiResponse<TermDto[]>>("/admin/terms") as any),
};
