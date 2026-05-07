import { useTranslation } from "react-i18next";
import { TrendingUp, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { StatsSkeleton } from "@/components/shared/Skeletons";
import { useStudentContext } from "@/hooks/useStudentContext";
import { caseApi } from "@/api/case.api";
import { useUIStore } from "@/store/ui.store";
import { useFetch } from "@/hooks/useFetch";
import type { StudentProgressDto, StudentRequirementDto } from "@/types";

/**
 * Student term-progress view. Pulls clinic-level requirements and overall
 * completion, then renders both summary stats and per-clinic cards.
 */
export default function StudentProgress() {
  const { t } = useTranslation();
  const lang = useUIStore(s => s.language);
  const { student, term, loading: ctxLoading, error: ctxError } = useStudentContext();
  const { data: progress, loading, error } = useFetch<StudentProgressDto | null>(
    () =>
      student && term
        ? caseApi.progress(student.id, term.id)
        : Promise.resolve(null),
    [student?.id, term?.id]
  );

  if (ctxLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="container py-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("student.progress")}</h1>
          {term && <p className="text-sm text-muted-foreground">{term.name}</p>}
        </div>
      </div>

      <ErrorMessage message={error || ctxError} />

      {loading || !progress ? (
        <StatsSkeleton count={3} />
      ) : (
        <>
          {/* Overall */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t("student.totalProgress")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress.isTermComplete && (
                <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-success">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold text-sm">{t("student.termComplete")}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <Stat
                  label={t("student.completed")}
                  value={progress.totalCompleted}
                  variant="success"
                />
                <Stat
                  label={t("student.transferred")}
                  value={progress.totalTransferred}
                  variant="info"
                />
                <Stat
                  label={t("student.required")}
                  value={progress.totalRequired}
                  variant="default"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">{t("student.overall")}</span>
                  <span className="font-bold text-accent tabular-nums">
                    {Math.round(progress.overallPercentage)}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${Math.min(100, progress.overallPercentage)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per clinic */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t("student.perClinic")}</CardTitle>
            </CardHeader>
            <CardContent>
              {progress.requirements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t("common.noData")}
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {progress.requirements.map((r) => (
                    <RequirementCard key={r.id} req={r} lang={lang} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "default" | "success" | "info";
}) {
  const colors = {
    default: "bg-muted/40 text-foreground",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
  };
  return (
    <div className={`rounded-lg p-3 text-center ${colors[variant]}`}>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

function RequirementCard({ req, lang }: { req: StudentRequirementDto; lang: "ar" | "en" }) {
  const { t } = useTranslation();
  const pct = Math.min(100, req.completionPercentage);

  return (
    <div className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">
            {lang === 'en' ? (req.requirementTypeNameEn || req.requirementTypeName || req.clinicNameEn || req.clinicName) : (req.requirementTypeName || req.clinicName)}
          </h3>
          <div className="text-xs text-muted-foreground mt-0.5">
            {lang === 'en' 
              ? (req.requirementTypeNameEn ? (req.clinicNameEn || req.clinicName) : `${t("intern.priority")}: ${req.priority}`)
              : (req.requirementTypeName ? req.clinicName : `${t("intern.priority")}: ${req.priority}`)}
          </div>
        </div>
        {req.isSatisfied ? (
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/30 flex-shrink-0"
          >
            <CheckCircle2 className="h-3 w-3 me-1" />
            {t("student.satisfied")}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {Math.round(pct)}%
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm tabular-nums">
          <span className="text-muted-foreground">
            {req.completedCount} / {req.requiredCount}
          </span>
          {req.transferredCount > 0 && (
            <span className="text-info text-xs">
              +{req.transferredCount} {t("student.transferred")}
            </span>
          )}
        </div>
        <div className="h-2 rounded-full bg-border overflow-hidden">
          <div
            className={`h-full transition-all ${
              req.isSatisfied
                ? "bg-success"
                : "bg-gradient-to-r from-primary to-accent"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
