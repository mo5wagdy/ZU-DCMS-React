import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Plus,
  Send,
  CheckCircle2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NotFoundBlock } from "@/components/shared/NotFoundBlock";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { toast } from "@/hooks/use-toast";
import { caseApi } from "@/api/case.api";
import { useStudentContext } from "@/hooks/useStudentContext";


import { CaseStatus } from "@/utils/enum";
import { formatDate } from "@/utils/format";
import { useUIStore } from "@/store/ui.store";
import type { CaseAssignmentDto, CaseSessionDto, ProcedureDto } from "@/types";

export default function CaseDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { student, term } = useStudentContext();
  const { language: lang, refreshTick } = useUIStore();
  const [data, setData] = useState<CaseAssignmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const c = await caseApi.byId(Number(id));
      setData(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, refreshTick]);

  const handleSubmit = async () => {
    try {
      await caseApi.submit({
        studentId: student?.id || 0,
        caseAssignmentId: data.id,
      });
      toast({ title: t("student.submittedSuccess") });
      useUIStore.getState().triggerRefresh();
      setShowSubmit(false);
      load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
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
          title={t("student.caseDetail")}
          backTo="/student/cases"
          backLabel={t("student.myCases")}
        />
      </div>
    );
  }

  const canEdit = data.status === CaseStatus.InProgress;
  const canSubmit = data.status === CaseStatus.InProgress && data.sessions.length > 0;

  return (
    <div className="container py-8 max-w-4xl space-y-4">
      <Breadcrumbs
        items={[
          { label: t("student.myCases"), to: "/student/cases" },
          { label: data.patientName },
        ]}
      />
      <Button variant="ghost" size="sm" asChild>
        <Link to="/student/cases">
          <ArrowLeft className="h-4 w-4 rtl-flip" />
          {t("common.back")}
        </Link>
      </Button>

      {/* Case header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-xl flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                {data.patientName}
              </CardTitle>
              <div className="mt-2">
                <StatusBadge type="case" value={data.status} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <Button size="sm" onClick={() => setShowAdd(true)}>
                  <Plus className="h-4 w-4" />
                  {t("student.addSession")}
                </Button>
              )}
              {canSubmit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-accent/40 text-accent hover:bg-accent/10"
                  onClick={() => setShowSubmit(true)}
                >
                  <Send className="h-4 w-4" />
                  {t("student.submitForReview")}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={t("student.clinic")} value={data.clinicName} />
            <Field label={t("student.diagnosis")} value={data.diagnosis} />
            <Field label={t("student.assignedBy")} value={data.assignedByInternName} />
            <Field label={t("student.assignedAt")} value={formatDate(data.assignedAt, lang)} />
          </div>
          {data.notes && (
            <div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">
              <div className="text-xs text-muted-foreground mb-1">{t("intern.notes")}</div>
              <div>{data.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions history */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            {t("student.sessionsHistory")} ({data.sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("student.noSessions")}
            </p>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {data.sessions.map((s, i) => (
                <SessionAccordion key={s.id} session={s} index={i + 1} lang={lang} />
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Add session dialog */}
      <AddSessionDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        caseAssignment={data}
        onSuccess={load}
      />

      {/* Submit confirmation */}
      <AlertDialog open={showSubmit} onOpenChange={setShowSubmit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("student.submitForReview")}</AlertDialogTitle>
            <AlertDialogDescription>{t("student.submitConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={submitting}>
              {submitting ? <LoadingSpinner /> : t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function SessionAccordion({
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

function AddSessionDialog({
  open,
  onOpenChange,
  caseAssignment,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  caseAssignment: CaseAssignmentDto;
  onSuccess: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { student, term } = useStudentContext();
  const [procedures, setProcedures] = useState<ProcedureDto[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasFollowUp, setHasFollowUp] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProcs, setLoadingProcs] = useState(false);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    setLoadingProcs(true);
    setError(null);

    import("@/api/lookup.api").then(({ lookupApi }) => {
      lookupApi.getProcedures(caseAssignment.clinicId)
        .then((data) => {
          if (isMounted) setProcedures(data ?? []);
        })
        .catch((e) => {
          if (isMounted) setError(e.message);
        })
        .finally(() => {
          if (isMounted) setLoadingProcs(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [open, caseAssignment.clinicId]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSelected([]);
      setIsCompleted(false);
      setHasFollowUp(false);
      setNotes("");
      setError(null);
    }
  }, [open]);

  const toggle = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleSave = async () => {
    if (selected.length === 0) {
      setError(t("student.atLeastOneProcedure"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await caseApi.addProgress({
        studentId: student?.id || 0,
        termId: term?.id || 0,
        dto: {
          caseAssignmentId: caseAssignment.id,
          procedureIds: selected,
          isCompleted,
          hasFollowUp: isCompleted ? false : hasFollowUp,
          notes: notes.trim() || undefined,
        }
      });
      toast({ title: t("student.sessionAdded") });
      useUIStore.getState().triggerRefresh();
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("student.addSession")}</DialogTitle>
          <DialogDescription>{caseAssignment.clinicName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ErrorMessage message={error} />

          <div className="space-y-2">
            <Label>
              {t("student.selectProcedures")} <span className="text-destructive">*</span>
            </Label>
            {loadingProcs ? (
              <LoadingSpinner />
            ) : procedures.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
            ) : (
              <div className="rounded-md border max-h-48 overflow-y-auto p-2 space-y-1">
                {procedures.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 rounded p-2 hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selected.includes(p.id)}
                      onCheckedChange={() => toggle(p.id)}
                    />
                    <span className="text-sm">{p.nameAr}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="completed" className="cursor-pointer">
              {t("student.isCompleted")}
            </Label>
            <Switch id="completed" checked={isCompleted} onCheckedChange={setIsCompleted} />
          </div>

          {!isCompleted && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="followup" className="cursor-pointer">
                {t("student.hasFollowUp")}
              </Label>
              <Switch id="followup" checked={hasFollowUp} onCheckedChange={setHasFollowUp} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">{t("intern.notes")}</Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              placeholder={t("intern.notesHint")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={submitting || selected.length === 0}>
            {submitting ? <LoadingSpinner /> : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
