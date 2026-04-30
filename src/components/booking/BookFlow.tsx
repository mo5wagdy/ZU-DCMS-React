import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { sessionApi } from "@/api/session.api";
import { bookingApi } from "@/api/booking.api";
import { patientApi } from "@/api/patient.api";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import { formatDate, formatTime, formatTime12h, formatSessionRange } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { AvailableSlotDto, BookingDto } from "@/types";
import { toast } from "sonner";

interface Props {
  bookingType: 1 | 2; // New or FollowUp
}

export function BookFlow({ bookingType }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { language: lang, triggerRefresh } = useUIStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [slots, setSlots] = useState<AvailableSlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AvailableSlotDto | null>(null);
  const [complaint, setComplaint] = useState("");
  const [createdBooking, setCreatedBooking] = useState<BookingDto | null>(null);

  useEffect(() => {
    sessionApi
      .availableSlots(bookingType)
      .then(setSlots)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [bookingType]);

  const grouped = useMemo(() => {
    const map = new Map<string, AvailableSlotDto[]>();
    for (const s of slots) {
      const key = s.date.split("T")[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries());
  }, [slots]);

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const patient = await patientApi.byUserId(userId || "");
      const data = await bookingApi.create({
        PatientId: patient.id,
        dto: {
          bookingType,
          preferredDate: selected.date,
          preferredTimeSlot: formatTime(selected.startTime),
          preliminaryComplaint: complaint || undefined,
        }
      });
      setCreatedBooking(data);
      triggerRefresh();
      setStep(4);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20">
          {bookingType === 1 ? t("booking.new") : t("booking.followUp")}
        </Badge>
        <h1 className="text-2xl font-bold">
          {bookingType === 1 ? t("booking.newAppointment") : t("booking.followUpAppointment")}
        </h1>
      </div>

      <Progress value={(step / 4) * 100} className="h-1.5 mb-6" />
      <ErrorMessage message={error} />

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <h2 className="font-bold flex items-center gap-2"><Calendar className="h-5 w-5" /> {t("booking.selectSlot")}</h2>
          {grouped.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">{t("common.noData")}</Card>
          ) : (
            grouped.map(([date, daySlots]) => (
              <Card key={date} className="p-4">
                <div className="font-bold text-primary mb-3">{formatDate(date, lang)}</div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {daySlots.map((s) => {
                    const available = bookingType === 1 ? s.availableNewSlots : s.availableFollowUpSlots;
                    const isFull = !s.isAvailable || available <= 0;
                    return (
                      <button
                        key={s.sessionId}
                        type="button"
                        disabled={isFull}
                        onClick={() => { setSelected(s); setStep(2); }}
                        className={cn(
                          "rounded-lg border-2 p-3 text-start transition-all",
                          isFull
                            ? "border-border bg-muted/40 opacity-60 cursor-not-allowed"
                            : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Clock className="h-4 w-4 text-primary" />
                          <span dir="ltr">{formatSessionRange(s.startTime, s.endTime, lang)}</span>
                        </div>
                        {isFull ? (
                          <Badge variant="outline" className="mt-2 bg-destructive/10 text-destructive border-destructive/20">
                            {t("booking.full")}
                          </Badge>
                        ) : (
                          <div className="text-xs text-muted-foreground mt-1">
                            {available} {t("booking.available")}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>
            ))
          )}
        </motion.div>
      )}

      {step === 2 && selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <Card className="p-5 bg-secondary/30">
            <div className="text-xs text-muted-foreground mb-1">{t("booking.selectSlot")}</div>
            <div className="font-bold">{formatDate(selected.date, lang)}</div>
            <div className="text-sm">{formatSessionRange(selected.startTime, selected.endTime, lang)}</div>
          </Card>
          <div>
            <label className="block text-sm font-semibold mb-2">{t("booking.complaint")}</label>
            <Textarea
              rows={5}
              maxLength={500}
              placeholder={t("booking.complaintHint") as string}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">{complaint.length} / 500</p>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>{t("common.previous")}</Button>
            <Button onClick={() => setStep(3)}>{t("common.next")}</Button>
          </div>
        </motion.div>
      )}

      {step === 3 && selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <Card className="p-6 space-y-3">
            <h2 className="font-bold">{t("booking.confirmation")}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-muted-foreground">{t("booking.type")}</div><div className="font-semibold">{bookingType === 1 ? t("booking.new") : t("booking.followUp")}</div></div>
              <div><div className="text-muted-foreground">{t("booking.date")}</div><div className="font-semibold">{formatDate(selected.date, lang)}</div></div>
              <div className="col-span-2"><div className="text-muted-foreground">{t("booking.time")}</div><div className="font-semibold">{formatSessionRange(selected.startTime, selected.endTime, lang)}</div></div>
              {complaint && <div className="col-span-2"><div className="text-muted-foreground">{t("booking.complaint")}</div><div className="text-sm">{complaint}</div></div>}
            </div>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>{t("common.previous")}</Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t("booking.confirm")}
            </Button>
          </div>
        </motion.div>
      )}

      {step === 4 && createdBooking && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-10 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-success/10 text-success mx-auto mb-5">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("booking.success")}</h2>
            <p className="text-muted-foreground mb-6">{t("booking.keepCode")}</p>
            
            {createdBooking.clinicName && (
              <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm text-muted-foreground mb-1">{t("booking.clinic")}</div>
                <div className="text-lg font-bold text-primary">{createdBooking.clinicName}</div>
              </div>
            )}

            <div className="text-sm text-muted-foreground mb-1">{t("booking.yourCode")}</div>
            <div className="text-4xl font-extrabold text-primary tracking-wider font-mono mb-8" dir="ltr">{createdBooking.bookingCode}</div>
            <Button onClick={() => navigate("/patient/dashboard")}>{t("common.home")}</Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
