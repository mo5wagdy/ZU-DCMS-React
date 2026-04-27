import { api, call } from "./axios";
import type { ApiResponse, ClinicDto, DiagnosisTypeDto, ProcedureDto } from "@/types";

export const lookupApi = {
  getClinics: () =>
    call<ClinicDto[]>(api.get<ApiResponse<ClinicDto[]>>("/lookups/clinics") as any),
    
  getDiagnosisTypes: (clinicId?: number) =>
    call<DiagnosisTypeDto[]>(
      api.get<ApiResponse<DiagnosisTypeDto[]>>("/diagnosis/types", {
        params: { clinicId },
      }) as any
    ),
    
  getProcedures: (clinicId?: number) =>
    call<ProcedureDto[]>(
      api.get<ApiResponse<ProcedureDto[]>>("/diagnosis/procedures", {
        params: { clinicId },
      }) as any
    ),
};
