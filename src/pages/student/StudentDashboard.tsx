import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useStudentContext } from "@/hooks/useStudentContext";
import { useUIStore } from "@/store/ui.store";
import { caseApi } from "@/api/case.api";
import { CaseStatus } from "@/utils/enum";
import type { CaseAssignmentDto, StudentProgressDto } from "@/types";

export default function StudentDashboard() {
  const { t } = useTranslation();
  const { refreshTick, language: lang } = useUIStore();
  const { student, term, loading, error } = useStudentContext();
  const [cases, setCases] = useState<CaseAssignmentDto[] | null>(null);
  const [todayQueue, setTodayQueue] = useState<CaseAssignmentDto[] | null>(null);
  const [progress, setProgress] = useState<StudentProgressDto | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    if (!student || !term) return;
    let mounted = true;
    
    // Fetch active cases, today's queue, and progress
    Promise.all([
      caseApi.studentCases(student.id),
      caseApi.getTodayPatients(student.applicationUserId),
      caseApi.progress(student.id, term.id)
    ])
      .then(([cs, tq, pr]) => {
        if (!mounted) return;
        setCases(cs ?? []);
        setTodayQueue(tq ?? []);
        setProgress(pr);
      })
      .catch((e) => mounted && setDataError(e.message));
    return () => {
      mounted = false;
    };
  }, [student, term, refreshTick]);

  if (loading) return <LoadingSpinner fullPage />;
  if (error || !student) {
    return (
      <div className="container py-10 max-w-3xl">
        <ErrorMessage message={error || t("common.error")} />
      </div>
    );
  }

  const activeCases = (cases ?? []).filter(
    (c) => c.status === CaseStatus.InProgress
  );

  return (
    <div className="container py-8 max-w-6xl space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{student.fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline">{student.studentCode}</Badge>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {student.academicYear} {t("intern.year")}
              </Badge>
              {term && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                  {term.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/student/cases">
              <ClipboardList className="h-4 w-4" />
              {t("student.myCases")}
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/student/progress">
              <TrendingUp className="h-4 w-4" />
              {t("student.progress")}
            </Link>
          </Button>
        </div>
      </div>

      <ErrorMessage message={dataError} />

      {/* Progress summary */}
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            {t("student.totalProgress")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!progress ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              {progress.isTermComplete && (
                <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-success">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold text-sm">{t("student.termComplete")}</span>
                </div>
              )}
              <div>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <div className="text-3xl font-bold tabular-nums">
                      {progress.totalCompleted}
                      <span className="text-base font-normal text-muted-foreground">
                        {" "}
                        / {progress.totalRequired}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t("student.overall")}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-accent tabular-nums">
                    {Math.round(progress.overallPercentage)}%
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${Math.min(100, progress.overallPercentage)}%` }}
                  />
                </div>
              </div>

              {/* Quick clinic breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {progress.requirements.slice(0, 6).map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-border/60 bg-muted/30 p-2.5"
                  >
                    <div className="text-xs text-muted-foreground truncate">
                      {r.clinicName}
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {r.completedCount}/{r.requiredCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Queue */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            {t("student.todayQueue")} ({todayQueue?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!todayQueue ? (
            <LoadingSpinner />
          ) : todayQueue.length === 0 ? (
            <div className="py-6 text-center bg-background/50 rounded-lg border border-dashed border-border">
              <p className="text-sm text-muted-foreground">{t("student.noQueueToday")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayQueue.map((c) => (
                <Link
                  key={c.id}
                  to={`/student/case/${c.id}`}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border shadow-sm hover:border-primary transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {c.patientName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold group-hover:text-primary transition-colors">{c.patientName}</div>
                      <div className="text-xs text-muted-foreground">{lang === 'en' ? (c.clinicNameEn || c.clinicName) : c.clinicName} • {lang === 'en' ? (c.diagnosisEn || c.diagnosis) : c.diagnosis}</div>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-full">
                    {t("student.startSession")}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active cases */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            {t("intern.activeCases")} ({activeCases.length})
          </CardTitle>
          {activeCases.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/student/cases">
                {t("common.view")} <ArrowRight className="h-4 w-4 rtl-flip" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!cases ? (
            <LoadingSpinner />
          ) : activeCases.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{t("student.noCases")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("student.noCasesDesc")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeCases.slice(0, 5).map((c) => (
                <CaseRowCompact key={c.id} item={c} lang={lang} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CaseRowCompact({ item, lang }: { item: CaseAssignmentDto; lang: "ar" | "en" }) {
  const { t } = useTranslation();
  return (
    <Link
      to={`/student/case/${item.id}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/40 hover:bg-muted/30 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{item.patientName}</span>
          <StatusBadge type="case" value={item.status} />
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {lang === 'en' ? (item.clinicNameEn || item.clinicName) : item.clinicName} • {lang === 'en' ? (item.diagnosisEn || item.diagnosis) : item.diagnosis} • {item.sessions.length} {t("student.session")}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground rtl-flip flex-shrink-0" />
    </Link>
  );
}
