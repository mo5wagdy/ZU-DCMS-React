import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users, ArrowRight, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { sessionApi } from "@/api/session.api";
import { formatDate, formatTime12h } from "@/utils/format";
import { useUIStore } from "@/store/ui.store";
import { useFetch } from "@/hooks/useFetch";
import type { SessionDto } from "@/types";

/**
 * Intern landing page — lists today's sessions with capacity stats
 * and entry-points into the per-session patient list.
 */
export default function InternDashboard() {
  const { t } = useTranslation();
  const lang = useUIStore((s) => s.language);
  const { data: sessions, loading, error } = useFetch<SessionDto[]>(
    () => sessionApi.getToday(),
    []
  );

  const { data: recentSessions, loading: loadingRecent } = useFetch<SessionDto[]>(
    () => sessionApi.getRecent(7),
    []
  );

  const nowTime = new Date().toTimeString().slice(0, 5) + ":00";
  const todayStr = new Date();
  
  const activeTodaySessions = sessions || [];

  const otherSessions = recentSessions?.filter(s => new Date(s.date).toDateString() !== todayStr.toDateString()) || [];

  return (
    <div className="container py-8 max-w-6xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("intern.dashboard")}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(todayStr, lang)}
          </p>
        </div>
      </div>

      <Card className="card-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            {t("intern.todaySessions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <ListSkeleton rows={2} />}
          <ErrorMessage message={error} />
          {!loading && activeTodaySessions && activeTodaySessions.length === 0 && (
            <EmptyState title={t("intern.noSessionsToday")} />
          )}
          {!loading && activeTodaySessions && activeTodaySessions.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {activeTodaySessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {otherSessions.length > 0 && (
        <Card className="card-hover border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {t("intern.recentSessions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 opacity-80 hover:opacity-100 transition-opacity">
              {otherSessions.map((s) => (
                <SessionCard key={s.id} session={s} showDate />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Single session capacity tile + CTA
function SessionCard({ session, showDate = false }: { session: SessionDto; showDate?: boolean }) {
  const { t } = useTranslation();
  const lang = useUIStore((s) => s.language);
  const newPct =
    session.maxNewPatients > 0
      ? (session.currentNewCount / session.maxNewPatients) * 100
      : 0;
  const fuPct =
    session.maxFollowUpPatients > 0
      ? (session.currentFollowUpCount / session.maxFollowUpPatients) * 100
      : 0;

  return (
    <Card className="border-border/60 hover:border-primary/30 transition-colors">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {showDate && (
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                {formatDate(new Date(session.date), lang)}
              </div>
            )}
            <div className="flex items-center gap-2 font-semibold text-primary">
              <Clock className="h-4 w-4" />
              {formatTime12h(session.startTime, lang)} - {formatTime12h(session.endTime, lang)}
            </div>
          </div>
          {session.isFull && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
              {t("booking.full")}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <CapacityStat
            label={t("intern.newCount")}
            current={session.currentNewCount}
            max={session.maxNewPatients}
            pct={newPct}
          />
          <CapacityStat
            label={t("intern.followUpCount")}
            current={session.currentFollowUpCount}
            max={session.maxFollowUpPatients}
            pct={fuPct}
          />
        </div>

        <Button asChild className="w-full" size="sm">
          <Link to={`/intern/session/${session.id}`}>
            <Users className="h-4 w-4" />
            {t("intern.viewPatients")}
            <ArrowRight className="h-4 w-4 rtl-flip" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Single capacity meter (current / max + bar)
function CapacityStat({
  label,
  current,
  max,
  pct,
}: {
  label: string;
  current: number;
  max: number;
  pct: number;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold tabular-nums">
        {current}
        <span className="text-sm font-normal text-muted-foreground"> / {max}</span>
      </div>
      <div className="h-1.5 mt-2 rounded-full bg-border overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
