import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { GraduationCap, Users, ClipboardList, ArrowRight, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { studentApi } from "@/api/student.api";
import { termApi } from "@/api/term.api";
import type { StudentDto, TermDto } from "@/types";

export default function ViewDashboard() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<StudentDto[] | null>(null);
  const [term, setTerm] = useState<TermDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      studentApi.list({ page: 1, pageSize: 200, sortDescending: false }),
      termApi.active(),
    ])
      .then(([s, tm]) => {
        if (!mounted) return;
        setStudents(s?.items ?? []);
        setTerm(tm ?? null);
      })
      .catch((e) => mounted && setError((e as Error).message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const activeStudents = students?.filter((x) => x.isActive).length ?? 0;

  return (
    <div className="container py-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("view.dashboard")}</h1>
          {term && (
            <p className="text-sm text-muted-foreground">
              {t("admin.activeTerm")}: <span className="font-medium">{term.name}</span>
            </p>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner fullPage />}
      <ErrorMessage message={error} />

      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat
              icon={<Users className="h-5 w-5" />}
              label={t("view.activeStudents")}
              value={activeStudents}
            />
            <Stat
              icon={<GraduationCap className="h-5 w-5" />}
              label={t("admin.totalStudents")}
              value={students?.length ?? 0}
            />
            <Stat
              icon={<ClipboardList className="h-5 w-5" />}
              label={t("admin.requiredCasesCount")}
              value={term?.requiredCasesCount ?? 0}
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("view.students")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to="/view/students"
                className="group flex items-center justify-between rounded-xl border border-border p-4 hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="font-semibold">{t("view.studentSearch")}</div>
                  <div className="text-xs text-muted-foreground">
                    {students?.length ?? 0} {t("admin.totalStudents")}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 rtl-flip text-muted-foreground group-hover:text-primary" />
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
