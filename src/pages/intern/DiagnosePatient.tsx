import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Stethoscope,
  CheckCircle2,
  UserPlus,
  Award,
  AlertCircle,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { diagnosisApi } from "@/api/diagnosis.api";
import { lookupApi } from "@/api/lookup.api";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import type { DiagnosisRecordDto, StudentPriorityDto, ClinicDto, DiagnosisTypeDto } from "@/types";


const schema = z.object({
  clinicId: z.coerce.number({ invalid_type_error: "required" }).int().positive(),
  diagnosisTypeId: z.coerce.number({ invalid_type_error: "required" }).int().positive(),
  complaint: z
    .string()
    .trim()
    .min(3, { message: "min" })
    .max(1000, { message: "max" }),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function DiagnosePatient() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { bookingId } = useParams<{ bookingId: string }>();

  const [clinics, setClinics] = useState<ClinicDto[]>([]);
  const [diagnosisTypes, setDiagnosisTypes] = useState<DiagnosisTypeDto[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisRecordDto | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { clinicId: 0, diagnosisTypeId: 0, complaint: "", notes: "" },
  });
  const clinicId = form.watch("clinicId");

  // Load clinics
  useEffect(() => {
    lookupApi.getClinics().then(setClinics).catch(e => toast({ title: e.message, variant: "destructive" }));
  }, [toast]);

  // Check if diagnosis already exists
  useEffect(() => {
    if (!bookingId) return;
    diagnosisApi.getByBooking(Number(bookingId))
      .then(data => {
        if (data) {
          setDiagnosis(data);
          // Pre-fill form just in case (though we show assignment panel)
          form.reset({
            clinicId: data.clinicId,
            diagnosisTypeId: 0, // We don't have the ID in the DTO yet, but assignment panel only needs clinicId
            complaint: data.complaint,
            notes: data.notes || ""
          });
        }
      })
      .catch(() => {
        // Not found is fine, means we need to create it
      });
  }, [bookingId, form]);

  // Load diagnosis types when clinic changes
  useEffect(() => {
    if (!clinicId) {
      setDiagnosisTypes([]);
      return;
    }
    setLoadingTypes(true);
    form.setValue("diagnosisTypeId", 0);
    lookupApi.getDiagnosisTypes(clinicId)
      .then(setDiagnosisTypes)
      .finally(() => setLoadingTypes(false));
  }, [clinicId, form]);

  const onSubmit = async (values: FormValues) => {
    if (!bookingId) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await diagnosisApi.diagnose({
        InternDoctorId: userId || "",
        dto: {
          bookingId: Number(bookingId),
          clinicId: values.clinicId,
          diagnosisTypeId: values.diagnosisTypeId,
          complaint: values.complaint,
          notes: values.notes || undefined,
        }
      });
      setDiagnosis(result);
      toast({ title: t("intern.diagnosisSaved") });
      useUIStore.getState().triggerRefresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/intern/dashboard">
            <ArrowLeft className="h-4 w-4 rtl-flip" />
            {t("common.back")}
          </Link>
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-6">
        <StepBadge active={!diagnosis} done={!!diagnosis} number={1} label={t("intern.step1")} />
        <div className="h-px flex-1 bg-border" />
        <StepBadge active={!!diagnosis} done={false} number={2} label={t("intern.step2")} />
      </div>

      {!diagnosis ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              {t("intern.diagnosePatient")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorMessage message={error} />
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Clinic */}
              <div className="space-y-1.5">
                <Label htmlFor="clinic">
                  {t("intern.selectClinic")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={clinicId ? String(clinicId) : ""}
                  onValueChange={(v) => form.setValue("clinicId", Number(v), { shouldValidate: true })}
                >
                  <SelectTrigger id="clinic">
                    <SelectValue placeholder={t("intern.selectClinic")} />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.filter(c => c.id !== 1).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.clinicId && (
                  <p className="text-xs text-destructive">{t("common.required")}</p>
                )}
              </div>

              {/* Diagnosis type */}
              <div className="space-y-1.5">
                <Label htmlFor="dtype">
                  {t("intern.diagnosisType")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  disabled={!clinicId || loadingTypes}
                  value={form.watch("diagnosisTypeId") ? String(form.watch("diagnosisTypeId")) : ""}
                  onValueChange={(v) =>
                    form.setValue("diagnosisTypeId", Number(v), { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="dtype">
                    <SelectValue placeholder={t("intern.selectDiagnosisType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {diagnosisTypes.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {i18n.language === "en" ? d.nameEn : d.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.diagnosisTypeId && (
                  <p className="text-xs text-destructive">{t("common.required")}</p>
                )}
              </div>

              {/* Complaint */}
              <div className="space-y-1.5">
                <Label htmlFor="complaint">
                  {t("intern.patientComplaint")} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="complaint"
                  rows={4}
                  placeholder={t("intern.patientComplaintHint")}
                  maxLength={1000}
                  {...form.register("complaint")}
                />
                {form.formState.errors.complaint && (
                  <p className="text-xs text-destructive">
                    {t("common.required")} (3-1000)
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">{t("intern.notes")}</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder={t("intern.notesHint")}
                  maxLength={1000}
                  {...form.register("notes")}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" disabled={submitting} className="min-w-[160px]">
                  {submitting ? <LoadingSpinner /> : t("intern.saveDiagnosis")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <AssignStudentPanel
          diagnosis={diagnosis}
          onDone={() => navigate("/intern/dashboard")}
        />
      )}
    </div>
  );
}

function StepBadge({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition-colors ${
          done
            ? "bg-success text-success-foreground"
            : active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : number}
      </div>
      <span
        className={`text-sm font-medium ${
          active || done ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function AssignStudentPanel({
  diagnosis,
  onDone,
}: {
  diagnosis: DiagnosisRecordDto;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const { refreshTick } = useUIStore();
  const [students, setStudents] = useState<StudentPriorityDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Simple debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    diagnosisApi
      .availableStudents(diagnosis.clinicId, undefined, debouncedSearch || undefined)
      .then((data) => setStudents(data ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshTick, debouncedSearch]);

  const handleAssign = async (studentId: number) => {
    setAssigning(studentId);
    setError(null);
    try {
      await diagnosisApi.assign({
        InternDoctorId: userId || "",
        dto: { diagnosisRecordId: diagnosis.id, studentId }
      });
      toast({ title: t("intern.assignSuccess") });
      useUIStore.getState().triggerRefresh();
      onDone();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast({ title: msg, variant: "destructive" });
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-foreground">
                {diagnosis.isAssigned ? t("intern.assigned") : t("intern.diagnosisSaved")}
              </div>
              <div className="text-muted-foreground">
                {diagnosis.clinicName} — {diagnosis.diagnosisTypeName}
              </div>
            </div>
          </div>
          {diagnosis.isAssigned && (
            <div className="text-end">
              <div className="text-xs text-muted-foreground">{t("intern.assignedTo")}</div>
              <div className="text-sm font-bold text-success">{diagnosis.studentName}</div>
              <div className="text-[10px] font-mono opacity-60">{diagnosis.studentCode}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {!diagnosis.isAssigned ? (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-accent" />
              {t("intern.availableStudents")}
            </CardTitle>
            <div className="relative w-full max-w-[240px]">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.search")}
                className="ps-9 h-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ErrorMessage message={error} />
            {loading && <LoadingSpinner fullPage />}
            {!loading && students && students.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">{t("intern.noStudentsAvailable")}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={onDone}>
                  {t("intern.skipAssign")}
                </Button>
              </div>
            )}
            {!loading && students && students.length > 0 && (
              <div className="space-y-3">
                {students.map((s) => (
                  <StudentCard
                    key={s.studentId}
                    student={s}
                    onAssign={handleAssign}
                    loading={assigning === s.studentId}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-center pt-4">
          <Button onClick={onDone} className="min-w-[200px]">
            {t("common.back")}
          </Button>
        </div>
      )}
    </div>
  );
}

function StudentCard({
  student,
  onAssign,
  loading,
}: {
  student: StudentPriorityDto;
  onAssign: (id: number) => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-border p-4 hover:border-primary/40 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h4 className="font-semibold">{student.fullName}</h4>
            <Badge variant="outline" className="text-xs">
              {student.studentCode}
            </Badge>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              {student.academicYear} {t("intern.year")}
            </Badge>
            {student.isComplete && (
              <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                {t("intern.fullyBooked")}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Stat
              label={t("intern.completedCases")}
              value={`${student.completedCases}/${student.requiredCases}`}
            />
            <Stat label={t("intern.activeCases")} value={String(student.activeCasesInClinic)} />
            <Stat
              label={t("intern.priority")}
              value={String(student.priority)}
              icon={<Award className="h-3 w-3 text-accent" />}
            />
            <Stat
              label={t("intern.progress")}
              value={`${Math.round(student.progressPercentage)}%`}
            />
          </div>

          <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${Math.min(100, student.progressPercentage)}%` }}
            />
          </div>
        </div>

        <div className="md:flex-shrink-0">
          <Button
            size="sm"
            onClick={() => onAssign(student.studentId)}
            disabled={loading || !student.isAvailable}
          >
            {loading ? <LoadingSpinner /> : <UserPlus className="h-4 w-4" />}
            {t("intern.assign")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}
