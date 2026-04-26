import { api, call } from "./axios";
import type { ApiResponse, ClinicDto, DiagnosisTypeDto } from "@/types";

export const lookupApi = {
  getClinics: () =>
    call<ClinicDto[]>(api.get<ApiResponse<ClinicDto[]>>("/lookups/clinics") as any),
    
  getDiagnosisTypes: (clinicId?: number) =>
    call<DiagnosisTypeDto[]>(
      api.get<ApiResponse<DiagnosisTypeDto[]>>("/lookups/diagnosis-types", {
        params: { clinicId },
      }) as any
    ),
};
