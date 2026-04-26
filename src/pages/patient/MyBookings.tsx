import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CalendarPlus, ListChecks, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/shared/Pagination";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { EmptyCard } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { useUIStore } from "@/store/ui.store";
import { patientApi } from "@/api/patient.api";
import { bookingApi } from "@/api/booking.api";
import { formatDate, formatTime } from "@/utils/format";
import { BookingStatus } from "@/utils/enum";
import { toast } from "sonner";
import type { BookingDto } from "@/types";

type FilterKey = "all" | "upcoming" | "past" | "cancelled";

const PAGE_SIZE = 8;

/**
 * Full bookings history for the logged-in patient.
 * Backend returns a paged list; filtering is client-side over the current page
 * to avoid extra API surface (no new endpoints introduced).
 */
export default function MyBookings() {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const lang = useUIStore((s) => s.language);

  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<BookingDto | null>(null);

  // Resolve patient → fetch their paged bookings.
  const patientQ = useFetch(
    () => (userId ? patientApi.byUserId(userId) : Promise.resolve(null as never)),
    [userId]
  );

  const bookingsQ = useFetch(
    () =>
      patientQ.data
        ? bookingApi.byPatient(patientQ.data.id, {
            page,
            pageSize: PAGE_SIZE,
            sortBy: "sessionDate",
            sortDescending: true,
          })
        : Promise.resolve(null as never),
    [patientQ.data?.id, page]
  );

  const filtered = useMemo(() => {
    const items = bookingsQ.data?.items ?? [];
    if (filter === "all") return items;
    const today = new Date().toISOString().slice(0, 10);
    return items.filter((b) => {
      if (filter === "cancelled") return b.status === BookingStatus.Cancelled;
      const isFuture = b.sessionDate.slice(0, 10) >= today;
      const notCancelled = b.status !== BookingStatus.Cancelled;
      return filter === "upcoming" ? isFuture && notCancelled : !isFuture;
    });
  }, [bookingsQ.data, filter]);

  return (
    <div className="container py-8 max-w-4xl space-y-4">
      <Breadcrumbs
        items={[
          { label: t("patient.dashboard"), to: "/patient/dashboard" },
          { label: t("patient.myBookings") },
        ]}
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
            <ListChecks className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("patient.myBookings")}</h1>
            <p className="text-sm text-muted-foreground">
              {bookingsQ.data?.totalCount ?? 0}
            </p>
          </div>
        </div>

        <Button asChild size="sm">
          <Link to="/booking/new">
            <CalendarPlus className="h-4 w-4 me-1" />
            {t("booking.newAppointment")}
          </Link>
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
        <TabsList className="grid grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="all">{t("booking.filter.all")}</TabsTrigger>
          <TabsTrigger value="upcoming">{t("booking.filter.upcoming")}</TabsTrigger>
          <TabsTrigger value="past">{t("booking.filter.past")}</TabsTrigger>
          <TabsTrigger value="cancelled">{t("booking.filter.cancelled")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <ErrorMessage message={patientQ.error || bookingsQ.error} />

      {(patientQ.loading || bookingsQ.loading) && <ListSkeleton rows={4} />}

      {!bookingsQ.loading && filtered.length === 0 && (
        <EmptyCard
          title={t("booking.noBookings")}
          description={t("booking.noBookingsDesc")}
          action={
            <Button asChild size="sm">
              <Link to="/booking/new">
                <CalendarPlus className="h-4 w-4 me-1" />
                {t("booking.newAppointment")}
              </Link>
            </Button>
          }
        />
      )}

      {!bookingsQ.loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((b) => (
            <BookingRow
              key={b.id}
              booking={b}
              lang={lang}
              onCancel={() => setCancelTarget(b)}
            />
          ))}
        </div>
      )}

      {bookingsQ.data && bookingsQ.data.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={bookingsQ.data.totalPages}
          onPageChange={setPage}
        />
      )}

      <CancelBookingDialog
        target={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={() => {
          setCancelTarget(null);
          bookingsQ.refetch();
        }}
      />
    </div>
  );
}

/** Single booking card row with cancel CTA when allowed. */
function BookingRow({
  booking,
  lang,
  onCancel,
}: {
  booking: BookingDto;
  lang: "ar" | "en";
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const canCancel =
    (booking.status === BookingStatus.Pending ||
      booking.status === BookingStatus.Confirmed) &&
    booking.paymentStatus === 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="font-mono bg-primary/10 text-primary border-primary/20"
              >
                {booking.bookingCode}
              </Badge>
              <Badge
                variant="outline"
                className={
                  booking.bookingType === 0
                    ? "bg-info/10 text-info border-info/20"
                    : "bg-accent/10 text-accent border-accent/20"
                }
              >
                {booking.bookingType === 0
                  ? t("booking.new")
                  : t("booking.followUp")}
              </Badge>
              <StatusBadge type="booking" value={booking.status} />
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(booking.sessionDate, lang)} ·{" "}
              {formatTime(booking.sessionStartTime)} -{" "}
              {formatTime(booking.sessionEndTime)}
            </div>
            {booking.preliminaryComplaint && (
              <>
                <Separator className="my-2" />
                <div className="text-sm text-foreground/80">
                  {booking.preliminaryComplaint}
                </div>
              </>
            )}
          </div>
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={onCancel}
            >
              {t("booking.cancelBooking")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Confirm cancellation with an optional reason. */
function CancelBookingDialog({
  target,
  onClose,
  onCancelled,
}: {
  target: BookingDto | null;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await bookingApi.cancel(target.id, reason.trim() || undefined);
      toast.success(t("booking.cancelled"));
      setReason("");
      onCancelled();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("booking.cancelConfirm")}</DialogTitle>
        </DialogHeader>
        {target && (
          <div className="text-sm text-muted-foreground">
            <span className="font-mono">{target.bookingCode}</span>
          </div>
        )}
        <div>
          <Label htmlFor="reason">{t("booking.cancelReason")}</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={submit} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            {t("booking.cancelBooking")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
