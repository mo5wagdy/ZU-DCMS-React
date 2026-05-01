import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, GraduationCap, CheckCircle2, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { NotFoundBlock } from "@/components/shared/NotFoundBlock";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { studentApi } from "@/api/student.api";
import { termApi } from "@/api/term.api";
import { caseApi } from "@/api/case.api";
import { useUIStore } from "@/store/ui.store";
import type { StudentDto, StudentProgressDto } from "@/types";

/**
 * Read-only deep dive into a single student's term progress.
 * Aggregates 3 backend calls (student, active term, progress) under one
 * loading state to keep the UI predictable.
 */
export default function ViewStudentDetail() {
  const { t } = useTranslation();
  const { refreshTick } = useUIStore();
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);

  const [student, setStudent] = useState<StudentDto | null>(null);
  const [progress, setProgress] = useState<StudentProgressDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [s, term] = await Promise.all([
          studentApi.byId(studentId),
          termApi.active(),
        ]);
        if (!mounted) return;
        setStudent(s ?? null);
        if (s && term) {
          const prog = await caseApi.progress(s.id, term.id);
          if (mounted) setProgress(prog ?? null);
        }
      } catch (e) {
        if (mounted) setError((e as Error).message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [studentId, refreshTick]);

  return (
    <div className="container py-8 max-w-4xl space-y-6">
      <Breadcrumbs
        items={[
          { label: t("view.students"), to: "/view/students" },
          { label: student?.fullName ?? t("view.studentDetail") },
        ]}
      />

      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/view/students">
          <ArrowLeft className="h-4 w-4 me-1 rtl-flip" />
          {t("view.students")}
        </Link>
      </Button>

      {loading && <ListSkeleton rows={3} />}
      <ErrorMessage message={error} />

      {!loading && !error && !student && (
        <NotFoundBlock
          title={t("view.studentDetail")}
          backTo="/view/students"
          backLabel={t("view.students")}
        />
      )}

      {!loading && student && (
        <>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{student.fullName}</h1>
              <p className="text-sm text-muted-foreground">
                {student.studentCode} • {t("student.academicYear")} {student.academicYear}
              </p>
            </div>
          </div>

          {progress && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{t("student.totalProgress")}</span>
                    {progress.isTermComplete && (
                      <Badge className="bg-success/10 text-success border-success/30">
                        <Trophy className="h-3 w-3 me-1" />
                        {t("status.complete")}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("student.overall")}</span>
                    <span className="font-semibold">
                      {progress.totalCompleted} / {progress.totalRequired}
                    </span>
                  </div>
                  <Progress value={progress.overallPercentage} />
                  <div className="grid grid-cols-3 gap-3 text-center pt-2">
                    <Mini label={t("student.completed")} value={progress.totalCompleted} />
                    <Mini label={t("student.transferred")} value={progress.totalTransferred} />
                    <Mini label={t("student.required")} value={progress.totalRequired} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t("student.perClinic")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {progress.requirements.length === 0 && (
                    <div className="text-sm text-muted-foreground py-6 text-center">
                      {t("common.noData")}
                    </div>
                  )}
                  <div className="space-y-3">
                    {progress.requirements.map((r) => (
                      <div key={r.id} className="rounded-lg border border-border p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{r.clinicName}</span>
                            {r.isSatisfied && (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {r.completedCount} / {r.requiredCount}
                          </span>
                        </div>
                        <Progress value={r.completionPercentage} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

// Tiny stat tile for the totals row
function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold mt-0.5">{value}</div>
    </div>
  );
}
