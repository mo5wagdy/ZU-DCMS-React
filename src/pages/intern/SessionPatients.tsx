import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Stethoscope, User, AlertTriangle, CheckCircle2, Info, Phone, CreditCard, Activity, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Pagination } from "@/components/shared/Pagination";
import { sessionApi } from "@/api/session.api";
import { ChronicConditionList, hasFlag, BookingStatus } from "@/utils/enum";
import { useFetch } from "@/hooks/useFetch";
import { useAuthStore } from "@/store/auth.store";
import type { BookingForDiagnosisDto, PagedResult } from "@/types";

/**
 * Lists patients assigned to a specific session for diagnosis.
 * Interns use this to pick patients to diagnose.
 */
export default function SessionPatients() {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const internId = useAuthStore((s) => s.userId);
  const [page, setPage] = useState(1);

  const { data, loading, error } = useFetch<PagedResult<BookingForDiagnosisDto>>(
    () => sessionApi.patients(Number(sessionId), internId || "", page),
    [sessionId, internId, page]
  );

  return (
    <div className="container py-8 max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { label: t("intern.dashboard"), to: "/intern/dashboard" },
          { label: t("intern.sessionPatients") },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link to="/intern/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t("intern.sessionPatients")}</h1>
          </div>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <ListSkeleton rows={5} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title={t("intern.noPatients")}
          description={t("intern.noPatientsDesc")}
          icon={<User className="h-12 w-12 opacity-20" />}
        />
      ) : (
        <>
          <div className="grid gap-4">
            {data.items.map((patient) => (
              <PatientRow key={patient.bookingId} patient={patient} />
            ))}
          </div>
          {data.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

function PatientRow({ patient }: { patient: BookingForDiagnosisDto }) {
  const { t } = useTranslation();
  const conditions = ChronicConditionList.filter((c) =>
    hasFlag(patient.conditions, c.value)
  );

  const isCancelled = patient.status === BookingStatus.Cancelled;

  return (
    <Card className={`overflow-hidden card-hover ${isCancelled ? "opacity-60 bg-muted/20" : ""}`}>
      <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-lg ${isCancelled ? "line-through text-muted-foreground" : ""}`}>
              {patient.patientName}
            </h3>
            {isCancelled ? (
              <Badge variant="destructive" className="bg-destructive/15 text-destructive border-destructive/30">
                {t("status.cancelled")}
              </Badge>
            ) : patient.isAssigned ? (
              <div className="flex flex-col gap-1">
                <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/15 w-fit">
                  <CheckCircle2 className="h-3 w-3 me-1" />
                  {t("intern.assigned")}
                </Badge>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 px-1">
                  <UserPlus className="h-3 w-3" />
                  <span className="font-medium text-foreground">{patient.studentName}</span>
                  <span className="opacity-50">|</span>
                  <span className="font-mono">{patient.studentCode}</span>
                </div>
              </div>
            ) : patient.isDiagnosed ? (
              <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
                <Stethoscope className="h-3 w-3 me-1" />
                {t("intern.diagnosed")}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-muted text-muted-foreground">
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
                  className="bg-warning/10 text-warning border-warning/30 text-[10px] h-5"
                >
                  {t(`conditions.${c.key}`)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="md:flex-shrink-0 flex items-center gap-2">
          <PatientDetailsDialog patient={patient} />
          {patient.isAssigned ? (
            <Button asChild size="sm" variant="outline" disabled={isCancelled}>
              <Link
                to={isCancelled ? "#" : `/intern/diagnose/${patient.bookingId}`}
                className={isCancelled ? "pointer-events-none" : ""}
              >
                <Info className="h-4 w-4" />
                {t("common.details")}
              </Link>
            </Button>
          ) : patient.isDiagnosed ? (
            <Button asChild size="sm" variant="default" disabled={isCancelled}>
              <Link
                to={isCancelled ? "#" : `/intern/diagnose/${patient.bookingId}`}
                className={isCancelled ? "pointer-events-none" : ""}
              >
                <UserPlus className="h-4 w-4" />
                {t("intern.assignStudent")}
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              disabled={isCancelled}
              variant={isCancelled ? "outline" : "default"}
            >
              <Link
                to={isCancelled ? "#" : `/intern/diagnose/${patient.bookingId}`}
                className={isCancelled ? "pointer-events-none" : ""}
              >
                <Stethoscope className="h-4 w-4" />
                {t("intern.diagnose")}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PatientDetailsDialog({ patient }: { patient: BookingForDiagnosisDto }) {
  const { t } = useTranslation();
  const conditions = ChronicConditionList.filter((c) =>
    hasFlag(patient.conditions, c.value)
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 w-9 p-0">
          <Info className="h-4 w-4" />
          <span className="sr-only">{t("common.details")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative px-8 pt-6">
          <DialogTitle className="flex items-center gap-3 text-start leading-tight">
            <User className="h-6 w-6 text-primary shrink-0" />
            <span className="truncate text-xl">{patient.patientName}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 px-6 pb-8 pt-2">
          <div className="space-y-3">
            <DetailRow 
              icon={<Activity className="h-4 w-4" />} 
              label={t("intern.age")} 
              value={`${patient.patientAge} ${t("patient.year")}`} 
            />
            <DetailRow 
              icon={<User className="h-4 w-4" />} 
              label={t("auth.gender")} 
              value={t(`gender.${patient.patientGender}`)} 
            />
            <DetailRow 
              icon={<CreditCard className="h-4 w-4" />} 
              label={t("patient.patientCode")} 
              value={patient.patientCode} 
              isMono 
            />
            <DetailRow 
              icon={<Phone className="h-4 w-4" />} 
              label={t("auth.phone")} 
              value={patient.phoneNumber} 
              isLtr 
            />
          </div>

          <Separator className="opacity-50" />

          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-4 w-4 text-warning" />
              {t("auth.healthStatus")}
            </h4>
            {conditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {conditions.map((c) => (
                  <Badge
                    key={c.value}
                    variant="outline"
                    className="bg-warning/10 text-warning border-warning/30 px-2 py-0.5"
                  >
                    {t(`conditions.${c.key}`)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic px-1">
                {t("common.noChronicConditions") || "لا توجد أمراض مزمنة مسجلة"}
              </p>
            )}
          </div>

          {patient.otherConditions && (
            <div className="space-y-1">
              <h5 className="text-xs font-semibold text-muted-foreground">{t("auth.otherConditions")}</h5>
              <p className="text-sm border rounded-lg p-2 bg-muted/30">{patient.otherConditions}</p>
            </div>
          )}

          {patient.preliminaryComplaint && (
            <div className="space-y-1">
              <h5 className="text-xs font-semibold text-muted-foreground">{t("intern.preliminaryComplaint")}</h5>
              <p className="text-sm border rounded-lg p-2 bg-primary/5 italic">"{patient.preliminaryComplaint}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ 
  icon, 
  label, 
  value, 
  isMono = false, 
  isLtr = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  isMono?: boolean; 
  isLtr?: boolean; 
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`font-semibold truncate ${isMono ? "font-mono" : ""}`} dir={isLtr ? "ltr" : undefined}>
        {value}
      </div>
    </div>
  );
}
