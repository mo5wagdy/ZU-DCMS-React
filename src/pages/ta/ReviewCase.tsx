import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NotFoundBlock } from "@/components/shared/NotFoundBlock";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { toast } from "@/hooks/use-toast";
import { caseApi } from "@/api/case.api";
import { formatDate } from "@/utils/format";
import { useUIStore } from "@/store/ui.store";
import { useAuth } from "@/hooks/useAuth";
import type { CaseAssignmentDto, CaseSessionDto } from "@/types";

export default function ReviewCase() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { caseId } = useParams<{ caseId: string }>();
  const lang = useUIStore((s) => s.language);

  const [data, setData] = useState<CaseAssignmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    let mounted = true;
    setLoading(true);
    caseApi
      .byId(Number(caseId))
      .then((c) => mounted && setData(c))
      .catch((e) => mounted && setError(e.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [caseId]);

  const handleApprove = async () => {
    if (!data) return;
    try {
      await caseApi.review({
        teachingAssistantId: userId || "",
        dto: { caseAssignmentId: data.id, isApproved: true }
      });
      toast({ title: t("ta.approvedSuccess") });
      navigate("/ta/dashboard");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
      setShowApprove(false);
    }
  };

  const handleReject = async () => {
    if (!data) return;
    const r = reason.trim();
    if (r.length < 3) {
      setReasonError(t("ta.rejectionRequired"));
      return;
    }
    setSubmitting(true);
    try {
      await caseApi.review({
        teachingAssistantId: userId || "",
        dto: {
          caseAssignmentId: data.id,
          isApproved: false,
          notes: r,
        }
      });
      toast({ title: t("ta.rejectedSuccess") });
      navigate("/ta/dashboard");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
      setShowReject(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl space-y-4">
        <ListSkeleton rows={2} />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="container py-10 max-w-3xl space-y-4">
        <ErrorMessage message={error} />
        <NotFoundBlock
          title={t("ta.reviewCase")}
          backTo="/ta/dashboard"
          backLabel={t("ta.dashboard")}
        />
      </div>
    );
  }

  const completedSessions = data.sessions.filter((s) => s.isCompleted).length;

  return (
    <div className="container py-8 max-w-4xl space-y-4">
      <Breadcrumbs
        items={[
          { label: t("ta.dashboard"), to: "/ta/dashboard" },
          { label: data.patientName },
        ]}
      />
      <Button variant="ghost" size="sm" asChild>
        <Link to="/ta/dashboard">
          <ArrowLeft className="h-4 w-4 rtl-flip" />
          {t("common.back")}
        </Link>
      </Button>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-xl flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                {t("ta.reviewCase")}
              </CardTitle>
              <h2 className="text-lg font-semibold mt-2">{data.patientName}</h2>
              <div className="mt-2">
                <StatusBadge type="case" value={data.status} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-success text-success-foreground hover:bg-success/90"
                onClick={() => setShowApprove(true)}
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("ta.approve")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => setShowReject(true)}
              >
                <XCircle className="h-4 w-4" />
                {t("ta.reject")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Field label={t("student.clinic")} value={data.clinicName} />
            <Field label={t("student.diagnosis")} value={data.diagnosis} />
            <Field
              label={t("ta.student")}
              value={data.assignedByInternName}
            />
            <Field
              label={t("ta.totalSessions")}
              value={String(data.sessions.length)}
            />
            <Field
              label={t("ta.completedSessions")}
              value={String(completedSessions)}
            />
            <Field
              label={t("student.assignedAt")}
              value={formatDate(data.assignedAt, lang)}
            />
          </div>
          {data.notes && (
            <div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">
              <div className="text-xs text-muted-foreground mb-1">{t("intern.notes")}</div>
              <div>{data.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            {t("student.sessionsHistory")} ({data.sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              {t("student.noSessions")}
            </p>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {data.sessions.map((s, i) => (
                <SessionRow key={s.id} session={s} index={i + 1} lang={lang} />
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Approve confirmation */}
      <AlertDialog open={showApprove} onOpenChange={setShowApprove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("ta.approve")}</AlertDialogTitle>
            <AlertDialogDescription>{t("ta.approveConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={submitting}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              {submitting ? <LoadingSpinner /> : t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog with reason */}
      <Dialog open={showReject} onOpenChange={(o) => { setShowReject(o); if (!o) { setReason(""); setReasonError(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ta.reject")}</DialogTitle>
            <DialogDescription>{t("ta.rejectConfirm")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">
              {t("ta.rejectionReason")} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError("");
              }}
              placeholder={t("ta.rejectionReasonHint")}
              maxLength={1000}
            />
            {reasonError && <p className="text-xs text-destructive">{reasonError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(false)} disabled={submitting}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={submitting}
            >
              {submitting ? <LoadingSpinner /> : t("ta.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}

function SessionRow({
  session,
  index,
  lang,
}: {
  session: CaseSessionDto;
  index: number;
  lang: "ar" | "en";
}) {
  const { t } = useTranslation();
  return (
    <AccordionItem value={String(session.id)} className="border rounded-lg px-3">
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0">
            {index}
          </div>
          <div className="flex-1 min-w-0 text-start">
            <div className="font-medium text-sm">{formatDate(session.sessionDate, lang)}</div>
            <div className="text-xs text-muted-foreground">
              {session.proceduresNames.length} {t("student.procedures")}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {session.isCompleted && (
              <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px]">
                <CheckCircle2 className="h-3 w-3 me-1" />
                {t("student.completed")}
              </Badge>
            )}
            {session.hasFollowUp && (
              <Badge variant="outline" className="bg-info/10 text-info border-info/30 text-[10px]">
                <RotateCw className="h-3 w-3 me-1" />
                {t("student.hasFollowUp")}
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-3 pt-1 space-y-2">
        <div>
          <div className="text-xs text-muted-foreground mb-1">{t("student.procedures")}</div>
          {session.proceduresNames.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("student.noProcedures")}</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {session.proceduresNames.map((p, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {session.notes && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">{t("intern.notes")}</div>
            <p className="text-sm bg-muted/40 rounded-md p-2">{session.notes}</p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
