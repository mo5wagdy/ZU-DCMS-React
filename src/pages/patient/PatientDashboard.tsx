import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CalendarPlus, RotateCw, User, ListChecks, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyCard } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { patientApi } from "@/api/patient.api";
import { bookingApi } from "@/api/booking.api";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import { useFetch } from "@/hooks/useFetch";
import { formatDate, formatTime12h, formatSessionRange } from "@/utils/format";
import { BookingStatus, BookingType } from "@/utils/enum";
import { toast } from "sonner";
import { useState } from "react";

/**
 * Patient landing page.
 *
 * Composes: profile summary + 3 quick action cards + recent bookings preview.
 * Uses `useFetch` to chain patient → bookings without manual cancellation
 * boilerplate.
 */
export default function PatientDashboard() {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const lang = useUIStore((s) => s.language);

  const patientQ = useFetch(
    () => (userId ? patientApi.byUserId(userId) : Promise.resolve(null as never)),
    [userId]
  );

  const bookingsQ = useFetch(
    () =>
      patientQ.data
        ? bookingApi.byPatient(patientQ.data.id, {
            page: 1,
            pageSize: 5,
            sortDescending: true,
            sortBy: "sessionDate",
          })
        : Promise.resolve(null as never),
    [patientQ.data?.id]
  );

  // Local optimistic patch when a booking is cancelled inline.
  const [overrides, setOverrides] = useState<Record<number, number>>({});

  const cancelBooking = async (id: number) => {
    if (!confirm(t("booking.cancelConfirm") as string)) return;
    try {
      await bookingApi.cancel({ bookingId: id, patientId: patientQ.data?.id || 0 });
      setOverrides((s) => ({ ...s, [id]: BookingStatus.Cancelled }));
      useUIStore.getState().triggerRefresh();
      toast.success(t("booking.cancelled"));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const loading = patientQ.loading || bookingsQ.loading;
  const items = bookingsQ.data?.items ?? [];

  return (
    <div className="container py-8 max-w-5xl">
      <ErrorMessage message={patientQ.error || bookingsQ.error} />

      {patientQ.data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
            <div>
              <p className="text-sm text-muted-foreground">{t("landing.welcome")}</p>
              <h1 className="text-3xl font-bold text-foreground">
                {patientQ.data.fullName}
              </h1>
              <Badge
                variant="outline"
                className="mt-2 bg-accent/10 border-accent/30 text-accent font-mono"
              >
                {t("patient.patientCode")}: {patientQ.data.patientCode}
              </Badge>
            </div>
          </div>
        </motion.div>
      )}

      {/* Booking Block Alert */}
      {patientQ.data && (patientQ.data.hasActiveBooking || patientQ.data.hasActiveCase) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-4 text-accent"
        >
          <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-sm">
              {patientQ.data.hasActiveBooking ? t("booking.activeBookingTitle") : t("booking.activeCaseTitle")}
            </p>
            <p className="text-xs opacity-80 mt-0.5">
              {patientQ.data.hasActiveBooking ? t("booking.activeBookingDesc") : t("booking.activeCaseDesc")}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {patientQ.data && !patientQ.data.hasActiveBooking && !patientQ.data.hasActiveCase && (
          <>
            <QuickAction
              to="/booking/new"
              icon={<CalendarPlus className="h-5 w-5" />}
              title={t("landing.bookNew")}
              desc={t("landing.bookNewDesc")}
              accent="primary"
            />
            {bookingsQ.data && bookingsQ.data.totalCount > 0 && (
              <QuickAction
                to="/booking/followup"
                icon={<RotateCw className="h-5 w-5" />}
                title={t("landing.followUp")}
                desc={t("landing.followUpDesc")}
                accent="gold"
              />
            )}
          </>
        )}
        <QuickAction
          to="/patient/profile"
          icon={<User className="h-5 w-5" />}
          title={t("patient.profile")}
          desc={t("patient.personalInfo")}
          accent="secondary"
        />
      </div>

      {/* Recent bookings */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{t("booking.recentBookings")}</h2>
        <Button asChild variant="link" size="sm" className="text-primary">
          <Link to="/patient/bookings">
            <ListChecks className="h-4 w-4 me-1" />
            {t("booking.viewAll")}
          </Link>
        </Button>
      </div>

      {loading && <ListSkeleton rows={3} />}

      {!loading && items.length === 0 && (
        <EmptyCard
          title={t("booking.noBookings")}
          description={t("booking.noBookingsDesc")}
          action={
            !patientQ.data?.hasActiveBooking && !patientQ.data?.hasActiveCase && (
              <Button asChild size="sm">
                <Link to="/booking/new">
                  <CalendarPlus className="h-4 w-4 me-1" />
                  {t("booking.newAppointment")}
                </Link>
              </Button>
            )
          }
        />
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((b) => {
            const status = overrides[b.id] ?? b.status;
            const canCancel =
              status === BookingStatus.Pending ||
              status === BookingStatus.Confirmed ||
              status === BookingStatus.Delayed;
            return (
              <Card key={b.id} className="p-5 card-hover">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className="font-mono bg-primary/10 text-primary border-primary/20"
                        variant="outline"
                      >
                        {b.bookingCode}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          b.bookingType === BookingType.New
                            ? "bg-info/10 text-info border-info/20"
                            : "bg-accent/10 text-accent border-accent/20"
                        }
                      >
                        {b.bookingType === BookingType.New
                          ? t("booking.new")
                          : t("booking.followUp")}
                      </Badge>
                      <StatusBadge type="booking" value={status} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(b.sessionDate, lang)} ·{" "}
                      {formatSessionRange(b.sessionStartTime, b.sessionEndTime, lang)}
                    </div>
                    {b.preliminaryComplaint && (
                      <>
                        <Separator className="my-2" />
                        <div className="text-sm text-foreground/80">
                          {b.preliminaryComplaint}
                        </div>
                      </>
                    )}
                  </div>
                  {canCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => cancelBooking(b.id)}
                    >
                      {t("booking.cancelBooking")}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Single quick-action tile for the dashboard hero grid. */
function QuickAction({
  to,
  icon,
  title,
  desc,
  accent,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: "primary" | "gold" | "secondary";
}) {
  const wrap =
    accent === "primary"
      ? "bg-gradient-hero text-primary-foreground"
      : accent === "gold"
        ? "bg-gradient-gold text-accent-foreground"
        : "bg-secondary text-primary";
  const border =
    accent === "gold" ? "hover:border-accent/30" : "hover:border-primary/30";
  return (
    <Link to={to}>
      <Card className={`card-hover p-5 cursor-pointer border-2 h-full ${border}`}>
        <div className={`grid h-11 w-11 place-items-center rounded-xl mb-3 ${wrap}`}>
          {icon}
        </div>
        <div className="font-bold">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{desc}</div>
      </Card>
    </Link>
  );
}
