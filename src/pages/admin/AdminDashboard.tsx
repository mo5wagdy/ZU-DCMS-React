import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Users,
  CalendarDays,
  Settings2,
  ListChecks,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { adminApi } from "@/api/admin.api";
import type { SystemConfigDto, TermDto } from "@/types";

interface Stats {
  configs: SystemConfigDto[] | null;
  terms: TermDto[] | null;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats>({ configs: null, terms: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([adminApi.getConfigs(), adminApi.getTerms()])
      .then(([configs, terms]) => {
        if (!mounted) return;
        setStats({ configs: configs ?? [], terms: terms ?? [] });
      })
      .catch((e) => mounted && setError((e as Error).message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const activeTerm = stats.terms?.find((x) => x.isActive);

  const cards = [
    {
      to: "/admin/users",
      icon: Users,
      titleKey: "admin.users",
      descKey: "admin.activeUsers",
    },
    {
      to: "/admin/terms",
      icon: CalendarDays,
      titleKey: "admin.terms",
      descKey: "admin.activeTerm",
    },
    {
      to: "/admin/configs",
      icon: Settings2,
      titleKey: "admin.configs",
      descKey: "admin.configsCount",
    },
    {
      to: "/admin/requirements",
      icon: ListChecks,
      titleKey: "admin.requirements",
      descKey: "admin.updateRequirements",
    },
  ];

  return (
    <div className="container py-8 max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("admin.dashboard")}</h1>
          <p className="text-sm text-muted-foreground">{t("app.name")}</p>
        </div>
      </div>

      {loading && <LoadingSpinner fullPage />}
      <ErrorMessage message={error} />

      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title={t("admin.activeTerm")}
              value={activeTerm?.name ?? "—"}
              hint={
                activeTerm
                  ? `${activeTerm.startDate?.slice(0, 10)} → ${activeTerm.endDate?.slice(0, 10)}`
                  : undefined
              }
            />
            <StatCard
              title={t("admin.totalTerms")}
              value={String(stats.terms?.length ?? 0)}
            />
            <StatCard
              title={t("admin.configsCount")}
              value={String(stats.configs?.length ?? 0)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{t(c.titleKey)}</div>
                      <div className="text-xs text-muted-foreground">{t(c.descKey)}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 rtl-flip text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold truncate">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1 truncate">{hint}</div>}
      </CardContent>
    </Card>
  );
}
