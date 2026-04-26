import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ClipboardCheck, ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { caseApi } from "@/api/case.api";
import { formatDate } from "@/utils/format";
import { useUIStore } from "@/store/ui.store";
import { useFetch } from "@/hooks/useFetch";
import type { CaseAssignmentDto } from "@/types";

/**
 * TA dashboard — single source of truth for cases awaiting review.
 * Loading + error + empty states are unified via shared components.
 */
export default function TADashboard() {
  const { t } = useTranslation();
  const lang = useUIStore((s) => s.language);
  const { data: cases, loading, error } = useFetch<CaseAssignmentDto[]>(
    () => caseApi.pendingReviews(),
    []
  );

  return (
    <div className="container py-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
          <ClipboardCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("ta.dashboard")}</h1>
          <p className="text-sm text-muted-foreground">{t("ta.pendingReviews")}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-accent" />
              {t("ta.pendingReviews")}
            </span>
            {cases && (
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                {cases.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <ListSkeleton rows={3} />}
          <ErrorMessage message={error} />
          {!loading && cases && cases.length === 0 && (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-3" />
              <p className="font-semibold">{t("ta.noPending")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("ta.noPendingDesc")}</p>
            </div>
          )}
          {!loading && cases && cases.length > 0 && (
            <div className="space-y-3">
              {cases.map((c) => (
                <CaseRow key={c.id} item={c} lang={lang} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Single pending-case summary row
function CaseRow({ item, lang }: { item: CaseAssignmentDto; lang: "ar" | "en" }) {
  const { t } = useTranslation();
  const completedSessions = item.sessions.filter((s) => s.isCompleted).length;
  return (
    <Link
      to={`/ta/review/${item.id}`}
      className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{item.patientName}</h3>
            <Badge variant="outline" className="text-xs">
              {item.clinicName}
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <Field
              icon={<GraduationCap className="h-3 w-3" />}
              label={t("ta.student")}
              value={item.assignedByInternName}
            />
            <Field label={t("student.diagnosis")} value={item.diagnosis} />
            <Field label={t("ta.totalSessions")} value={String(item.sessions.length)} />
            <Field label={t("ta.completedSessions")} value={String(completedSessions)} />
          </div>
        </div>
        <Button size="sm" variant="outline" className="md:flex-shrink-0">
          {t("ta.review")}
          <ArrowRight className="h-4 w-4 rtl-flip" />
        </Button>
      </div>
    </Link>
  );
}

// Tiny labelled value used inside the row grid
function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}
