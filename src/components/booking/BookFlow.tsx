import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, Loader2, Printer } from "lucide-react";
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
import { useFetch } from "@/hooks/useFetch";
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
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    if (!ticketRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }
    const dir = document.documentElement.dir || "ltr";
    const fontFamily = dir === "rtl" ? "Cairo, system-ui, sans-serif" : "Inter, system-ui, sans-serif";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${dir}">
      <head>
        <meta charset="utf-8" />
        <title>${t("booking.yourCode")}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: ${fontFamily}; padding: 32px; color: #1E293B; }
          .ticket { border: 2px dashed #1B3A6B44; border-radius: 12px; padding: 32px; text-align: center; max-width: 600px; margin: auto; }
          .header h1 { color: #1B3A6B; font-size: 20px; margin-bottom: 4px; }
          .header p { color: #64748B; font-size: 13px; margin-bottom: 20px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #F1F5F9; border-radius: 10px; padding: 20px; margin-bottom: 24px; text-align: ${dir === "rtl" ? "right" : "left"}; }
          .info-grid .label { font-size: 11px; color: #64748B; margin-bottom: 4px; }
          .info-grid .value { font-size: 14px; font-weight: 600; color: #1E293B; }
          .info-grid .value.primary { color: #1B3A6B; }
          .code-label { font-size: 13px; color: #64748B; margin-bottom: 8px; }
          .code { font-size: 36px; font-weight: 900; color: #1B3A6B; letter-spacing: 4px; font-family: monospace; margin-bottom: 8px; direction: ltr; }
          .keep { font-size: 11px; color: #64748B; }
          @media print { body { padding: 0; } .ticket { border: 2px dashed #ccc; } }
        </style>
      </head>
      <body>
        ${ticketRef.current.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  }, [t, createdBooking]);

  const patientQ = useFetch(
    () => (userId ? patientApi.byUserId(userId) : Promise.resolve(null as never)),
    [userId]
  );

  const bookingsQ = useFetch(
    () => patientQ.data ? bookingApi.byPatient(patientQ.data.id, { page: 1, pageSize: 10, sortBy: "sessionDate", sortDescending: true }) : Promise.resolve(null as never),
    [patientQ.data?.id]
  );

  const hasActiveBooking = useMemo(() => {
    if (!bookingsQ.data) return false;
    return bookingsQ.data.items.some(b => b.status === 1 || b.status === 2 || b.status === 6);
  }, [bookingsQ.data]);

  useEffect(() => {
    sessionApi
      .availableSlots(bookingType)
      .then((data) => {
        const today = new Date().toISOString().split("T")[0];
        const nowTime = new Date().toTimeString().slice(0, 5) + ":00";
        const valid = data.filter(s => {
          const sDate = s.date.split("T")[0];
          if (sDate < today) return false;
          if (sDate === today && s.endTime <= nowTime) return false;
          return true;
        });
        setSlots(valid);
      })
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
    // __ Check if session has ended __ //
    const nowTime = new Date().toTimeString().slice(0, 5) + ":00";
    const today = new Date().toISOString().split("T")[0];
    const sDate = selected!.date.split("T")[0];
    if (sDate < today || (sDate === today && selected!.endTime <= nowTime)) {
       setError(t("booking.sessionEnded", "عذراً، لقد انتهى وقت هذا الميعاد حالياً. يرجى العودة للخطوة الأولى واختيار ميعاد آخر."));
       setStep(1);
       setLoading(true); // Force re-fetch of slots
       sessionApi.availableSlots(bookingType)
         .then(data => {
            const valid = data.filter(s => {
              const sd = s.date.split("T")[0];
              if (sd < today) return false;
              if (sd === today && s.endTime <= nowTime) return false;
              return true;
            });
            setSlots(valid);
         })
         .finally(() => setLoading(false));
       return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const patient = await patientApi.byUserId(userId || "");
      const data = await bookingApi.create({
        PatientId: patient.id,
        dto: {
          bookingType,
          preferredDate: selected!.date,
          preferredTimeSlot: formatTime(selected!.startTime),
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

      {/* Block if patient already has an active booking */}
      {patientQ.data?.hasActiveBooking && step !== 4 && (
        <Card className="p-6 mb-6 bg-destructive/10 text-destructive border-destructive/20">
          <h2 className="font-bold text-lg mb-2">{t("booking.activeBookingTitle", "تنبيه: يوجد حجز نشط")}</h2>
          <p>{t("booking.activeBookingDesc", "لا يمكنك حجز موعد جديد حالياً لأن لديك حجز قيد الانتظار أو أنت قيد العلاج في عيادة أخرى. يرجى إتمام حجزك الحالي أو إلغائه أولاً.")}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/patient/dashboard")}>
            {t("common.home")}
          </Button>
        </Card>
      )}

      {/* Block if booking type doesn't match patient state */}
      {!patientQ.data?.hasActiveBooking && step !== 4 && (
        <>
          {bookingType === 1 && patientQ.data?.hasActiveCase && (
            <Card className="p-6 mb-6 bg-info/10 text-info border-info/20">
              <h2 className="font-bold text-lg mb-2">{t("booking.activeCaseTitle", "تنبيه: لديك حالة متابعة")}</h2>
              <p>{t("booking.activeCaseDesc", "لديك حالة علاجية قائمة بالفعل. يرجى استخدام خيار 'حجز متابعة' بدلاً من حجز موعد جديد لتكملة علاجك.")}</p>
              <Button variant="outline" className="mt-4 border-info/30 text-info hover:bg-info/10" onClick={() => navigate("/booking/followup")}>
                {t("booking.followUpAppointment")}
              </Button>
            </Card>
          )}

          {bookingType === 2 && !patientQ.data?.hasActiveCase && (
            <Card className="p-6 mb-6 bg-info/10 text-info border-info/20">
              <h2 className="font-bold text-lg mb-2">{t("booking.noActiveCaseTitle", "تنبيه: لا توجد حالات متابعة")}</h2>
              <p>{t("booking.noActiveCaseDesc", "ليس لديك حالات علاجية قائمة حالياً تتطلب متابعة. يرجى حجز موعد جديد للفحص.")}</p>
              <Button variant="outline" className="mt-4 border-info/30 text-info hover:bg-info/10" onClick={() => navigate("/booking/new")}>
                {t("booking.newAppointment")}
              </Button>
            </Card>
          )}
        </>
      )}

      {step === 1 && !patientQ.data?.hasActiveBooking && (
        (bookingType === 1 ? !patientQ.data?.hasActiveCase : patientQ.data?.hasActiveCase) && (
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
        ))}

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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          
          {/* Printable Ticket Area */}
          <Card className="print-only border-2 border-dashed border-primary/30 p-8 text-center relative overflow-hidden">
            <div ref={ticketRef} className="ticket">
              <div className="header">
                <h1 className="text-2xl font-black text-primary">{t("app.name")}</h1>
                <p className="text-sm text-muted-foreground">{t("app.faculty")}</p>
              </div>

              <div className="info-grid bg-secondary/40 rounded-xl p-6 mb-6 space-y-4 text-start border border-border/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{t("booking.patientName")}</div>
                    <div className="font-semibold text-foreground">{createdBooking.patientName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{t("booking.clinic")}</div>
                    <div className="font-semibold text-primary">
                      {bookingType === 1 ? t("booking.diagnosisClinic") : (createdBooking.clinicName || "-")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{t("booking.appointmentTime")}</div>
                    <div className="font-semibold text-foreground">
                      {formatDate(createdBooking.sessionDate, lang)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{t("booking.time")}</div>
                    <div className="font-semibold text-foreground">
                      {formatSessionRange(createdBooking.sessionStartTime, createdBooking.sessionEndTime, lang)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="code-label text-sm text-muted-foreground mb-2">{t("booking.yourCode")}</div>
              <div className="code text-5xl font-black text-primary tracking-widest font-mono mb-2" dir="ltr">
                {createdBooking.bookingCode}
              </div>
              <div className="keep text-xs text-muted-foreground mb-8 print:mb-0">
                {t("booking.keepCode")}
              </div>
            </div>
          </Card>

          {/* Non-printable Actions and Alerts */}
          <div className="no-print space-y-4">
            <div className="bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20 rounded-lg p-4 text-sm leading-relaxed font-semibold shadow-sm">
              {t("booking.screenshotAlert")}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="flex-1 text-base h-12"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
                {t("booking.printTicket")}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 h-12"
                onClick={() => navigate("/patient/dashboard")}
              >
                {t("common.home")}
              </Button>
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
}
