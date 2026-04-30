import { useTranslation } from "react-i18next";
import {
  Users, CalendarCheck, CalendarPlus, RotateCw,
  Clock, XCircle, Stethoscope, CheckCircle2,
  BookOpen, GraduationCap, BarChart3, Link
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { adminApi } from "@/api/admin.api";
import { termApi } from "@/api/term.api";
import { useFetch } from "@/hooks/useFetch";
import type { DailyMetricsDto } from "@/types";

// __ ViewDashboard: Read-only daily overview for Dean, Vice-Dean, and Professors __ //
export default function ViewDashboard() {
  const { t } = useTranslation();

  // __ Fetch daily metrics and active term in parallel __ //
  const metricsQ = useFetch(() => adminApi.getDailyMetrics(), []);
  const termQ = useFetch(() => termApi.active(), []);

  const loading = metricsQ.loading || termQ.loading;
  const error = metricsQ.error || termQ.error;
  const m = metricsQ.data;

  return (
    <div className="container py-8 max-w-5xl space-y-8">

      {/* __ Page Header __ */}
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("view.dashboard")}</h1>
          {termQ.data && (
            <p className="text-sm text-muted-foreground">
              {t("admin.activeTerm")}: <span className="font-semibold text-foreground">{termQ.data.name}</span>
            </p>
          )}
        </div>
      </div>

      <ErrorMessage message={error} />
      {loading && <LoadingSpinner fullPage />}

      {!loading && m && (
        <>
          {/* __ Section 1: Today's Patients & Bookings __ */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {t("view.todayActivity")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<Users className="h-5 w-5" />}
                label={t("view.todayNewPatients")}
                value={m.todayNewPatientsCount}
                color="primary"
              />
              <StatCard
                icon={<CalendarCheck className="h-5 w-5" />}
                label={t("view.todayBookings")}
                value={m.todayBookingsCount}
                color="info"
              />
              <StatCard
                icon={<BookOpen className="h-5 w-5" />}
                label={t("view.activeSessions")}
                value={m.activeSessionsCount}
                color="accent"
              />
            </div>
          </section>

          <Separator />

          {/* __ Section 2: Booking Breakdown __ */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {t("view.bookingBreakdown")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                icon={<CalendarPlus className="h-5 w-5" />}
                label={t("view.newBookings")}
                value={m.todayNewBookingsCount}
                color="primary"
              />
              <StatCard
                icon={<RotateCw className="h-5 w-5" />}
                label={t("view.followUpBookings")}
                value={m.todayFollowUpBookingsCount}
                color="info"
              />
              <StatCard
                icon={<Clock className="h-5 w-5" />}
                label={t("view.pendingBookings")}
                value={m.pendingBookingsCount}
                color="warning"
              />
              <StatCard
                icon={<XCircle className="h-5 w-5" />}
                label={t("view.cancelledBookings")}
                value={m.cancelledBookingsCount}
                color="destructive"
              />
            </div>
          </section>

          <Separator />

          {/* __ Section 3: Clinical Case Status __ */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {t("view.caseStatus")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<Stethoscope className="h-5 w-5" />}
                label={t("view.inProgressCases")}
                value={m.inProgressCasesCount}
                color="info"
              />
              <StatCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                label={t("view.completedToday")}
                value={m.completedCasesCount}
                color="success"
              />
              <StatCard
                icon={<GraduationCap className="h-5 w-5" />}
                label={t("view.activeStudents")}
                value={m.totalActiveStudents}
                color="accent"
              />
            </div>
          </section>

          <Separator />

          {/* __ Section 4: Quick Links __ */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {t("view.quickLinks")}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <QuickLink to="/view/students" label={t("view.studentSearch")} desc={`${m.totalActiveStudents} ${t("view.activeStudents")}`} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// __ Reusable stat card with color variants __ //
type StatColor = "primary" | "info" | "accent" | "warning" | "destructive" | "success";

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: StatColor;
}) {
  const colorMap: Record<StatColor, string> = {
    primary:     "bg-primary/10 text-primary",
    info:        "bg-info/10 text-info",
    accent:      "bg-accent/10 text-accent",
    warning:     "bg-amber-500/10 text-amber-500",
    destructive: "bg-destructive/10 text-destructive",
    success:     "bg-emerald-500/10 text-emerald-500",
  };
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground leading-tight">{label}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
          </div>
          <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg ${colorMap[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// __ Quick navigation link card __ //
function QuickLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <a
      href={to}
      className="group flex items-center justify-between rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-accent/5 transition-colors"
    >
      <div>
        <div className="font-semibold text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
    </a>
  );
}
