import { api, call } from "./axios";
import type { ApiResponse, TermDto } from "@/types";

export const termApi = {
  /** Returns the currently active term. */
  active: () =>
    call<TermDto>(api.get<ApiResponse<TermDto>>("/lookups/active-term") as any),
  list: () =>
    call<TermDto[]>(api.get<ApiResponse<TermDto[]>>("/admin/terms") as any),
};
