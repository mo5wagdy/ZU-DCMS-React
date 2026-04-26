import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Stethoscope, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { sessionApi } from "@/api/session.api";
import { ChronicConditionList, hasFlag } from "@/utils/enum";
import { useFetch } from "@/hooks/useFetch";
import type { BookingForDiagnosisDto } from "@/types";

/**
 * Lists every booking inside a clinical session so the intern can pick
 * a patient to diagnose. Read-only view; the actual diagnosis happens
 * on /intern/diagnose/:bookingId.
 */
export default function SessionPatients() {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const id = Number(sessionId);

  // Backend missing patients endpoint
  const { data: patients, loading, error } = useFetch<BookingForDiagnosisDto[]>(
    () => Promise.resolve([]),
    [id]
  );

  return (
    <div className="container py-8 max-w-5xl">
      <Breadcrumbs
        items={[
          { label: t("intern.dashboard"), to: "/intern/dashboard" },
          { label: t("intern.sessionPatients") },
        ]}
      />

      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/intern/dashboard">
            <ArrowLeft className="h-4 w-4 rtl-flip" />
            {t("common.back")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t("intern.sessionPatients")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <ListSkeleton rows={3} />}
          <ErrorMessage message={error} />
          {!loading && patients && patients.length === 0 && (
            <EmptyState title={t("intern.noPatients")} />
          )}
          {!loading && patients && patients.length > 0 && (
            <div className="space-y-3">
              {patients.map((p) => (
                <PatientRow key={p.bookingId} patient={p} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// One booking row with chronic-condition flags and diagnose CTA
function PatientRow({ patient }: { patient: BookingForDiagnosisDto }) {
  const { t } = useTranslation();
  const conditions = ChronicConditionList.filter((c) =>
    hasFlag(patient.conditions, c.value)
  );

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold text-base truncate">{patient.patientName}</h3>
            {patient.isAssigned ? (
              <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/15">
                <CheckCircle2 className="h-3 w-3 me-1" />
                {t("intern.diagnosed")}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                {t("intern.notDiagnosed")}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              {t("intern.age")}: <span className="text-foreground font-medium">{patient.patientAge}</span>
            </span>
            <span>
              {t("intern.gender")}:{" "}
              <span className="text-foreground font-medium">
                {t(`gender.${patient.patientGender}`)}
              </span>
            </span>
          </div>

          {conditions.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              {conditions.map((c) => (
                <Badge
                  key={c.value}
                  variant="outline"
                  className="bg-warning/10 text-warning border-warning/30 text-[11px]"
                >
                  {t(`conditions.${c.key}`)}
                </Badge>
              ))}
            </div>
          )}

          {patient.preliminaryComplaint && (
            <p className="mt-2 text-sm text-foreground/80 line-clamp-2">
              <span className="text-muted-foreground">{t("intern.preliminaryComplaint")}: </span>
              {patient.preliminaryComplaint}
            </p>
          )}
        </div>

        <div className="md:flex-shrink-0">
          <Button asChild size="sm" disabled={patient.isAssigned}>
            <Link to={`/intern/diagnose/${patient.bookingId}`}>
              <Stethoscope className="h-4 w-4" />
              {t("intern.diagnose")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
