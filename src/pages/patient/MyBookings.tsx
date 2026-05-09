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
import { formatDate, formatTime12h, formatSessionRange } from "@/utils/format";
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
  const { language: lang, refreshTick } = useUIStore();

  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<BookingDto | null>(null);
  const [overrides, setOverrides] = useState<Record<number, number>>({});

  // Resolve patient → fetch their paged bookings.
  const patientQ = useFetch(
    () => (userId ? patientApi.byUserId(userId) : Promise.resolve(null as never)),
    [userId, refreshTick]
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
    [patientQ.data?.id, page, refreshTick]
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

        {!patientQ.data?.hasActiveBooking && (
          <Button asChild size="sm">
            <Link to={patientQ.data?.hasActiveCase ? "/booking/followup" : "/booking/new"}>
              <CalendarPlus className="h-4 w-4 me-1" />
              {patientQ.data?.hasActiveCase ? t("booking.followUp") : t("booking.newAppointment")}
            </Link>
          </Button>
        )}
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
            !patientQ.data?.hasActiveBooking && (
              <Button asChild size="sm">
                <Link to={patientQ.data?.hasActiveCase ? "/booking/followup" : "/booking/new"}>
                  <CalendarPlus className="h-4 w-4 me-1" />
                  {patientQ.data?.hasActiveCase ? t("booking.followUp") : t("booking.newAppointment")}
                </Link>
              </Button>
            )
          }
        />
      )}

      {!bookingsQ.loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((b) => (
            <BookingRow
              key={b.id}
              booking={b}
              statusOverride={overrides[b.id]}
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
        patientId={patientQ.data?.id || 0}
        onClose={() => setCancelTarget(null)}
        onCancelled={(id) => {
          setOverrides(prev => ({ ...prev, [id]: BookingStatus.Cancelled }));
          setCancelTarget(null);
          bookingsQ.refetch();
          useUIStore.getState().triggerRefresh();
        }}
      />
    </div>
  );
}

/** Single booking card row with cancel CTA when allowed. */
function BookingRow({
  booking,
  statusOverride,
  lang,
  onCancel,
}: {
  booking: BookingDto;
  statusOverride?: number;
  lang: "ar" | "en";
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const status = statusOverride ?? booking.status;
  const canCancel =
    (status === BookingStatus.Pending ||
      status === BookingStatus.Confirmed ||
      status === BookingStatus.Delayed) &&
    !booking.hasDiagnosisRecord;

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
                  booking.bookingType === 1
                    ? "bg-info/10 text-info border-info/20"
                    : "bg-accent/10 text-accent border-accent/20"
                }
              >
                {booking.bookingType === 1
                  ? t("booking.new")
                  : t("booking.followUp")}
              </Badge>
              <StatusBadge type="booking" value={status} />
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(booking.sessionDate, lang)} ·{" "}
              {formatSessionRange(booking.sessionStartTime, booking.sessionEndTime, lang)}
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
  patientId,
  onClose,
  onCancelled,
}: {
  target: BookingDto | null;
  patientId: number;
  onClose: () => void;
  onCancelled: (id: number) => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const targetId = target?.id; // Capture ID locally

  const submit = async () => {
    if (!targetId) return;
    setBusy(true);
    try {
      await bookingApi.cancel({ bookingId: targetId, patientId });
      toast.success(t("booking.cancelled"));
      onCancelled(targetId);
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
        <div className="py-4">
          <p className="text-sm">{t("booking.cancelConfirm")}</p>
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
