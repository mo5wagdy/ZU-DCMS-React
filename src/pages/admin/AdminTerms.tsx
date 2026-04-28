import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarDays, Plus, Loader2, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ListSkeleton } from "@/components/shared/Skeletons";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/hooks/useAuth";
import { adminApi } from "@/api/admin.api";
import { formatDate } from "@/utils/format";
import type { TermDto } from "@/types";

const termSchema = z.object({
  name: z.string().trim().min(2, "min 2"),
  startDate: z.string().min(1, "required"),
  endDate: z.string().min(1, "required"),
  requiredCasesCount: z.coerce.number().int().min(1, "min 1"),
});
type TermForm = z.infer<typeof termSchema>;

/**
 * Admin → academic terms.
 * Lists all terms, lets admin create / edit / activate them.
 */
export default function AdminTerms() {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const termsQ = useFetch<TermDto[]>(() => adminApi.getTerms().then((d) => d ?? []), []);

  const [openCreate, setOpenCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<TermDto | null>(null);
  const [activateTarget, setActivateTarget] = useState<TermDto | null>(null);

  const handleActivate = async () => {
    if (!activateTarget) return;
    try {
      await adminApi.setActiveTerm({ termId: activateTarget.id, adminId: userId || "" });
      toast.success(t("admin.termActivated"));
      setActivateTarget(null);
      termsQ.refetch();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="container py-8 max-w-5xl space-y-4">
      <Breadcrumbs
        items={[
          { label: t("admin.dashboard"), to: "/admin/dashboard" },
          { label: t("admin.terms") },
        ]}
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("admin.terms")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("admin.totalTerms")}: {termsQ.data?.length ?? 0}
            </p>
          </div>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 me-1" />
              {t("admin.createTerm")}
            </Button>
          </DialogTrigger>
          <TermFormDialog
            mode="create"
            onSaved={() => {
              setOpenCreate(false);
              termsQ.refetch();
            }}
          />
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("admin.terms")}</CardTitle>
        </CardHeader>
        <CardContent>
          {termsQ.loading && <ListSkeleton rows={3} />}
          <ErrorMessage message={termsQ.error} />
          {!termsQ.loading && termsQ.data?.length === 0 && (
            <EmptyState title={t("admin.noTerms")} />
          )}
          {!termsQ.loading && termsQ.data && termsQ.data.length > 0 && (
            <div className="space-y-3">
              {termsQ.data.map((term) => (
                <TermRow
                  key={term.id}
                  term={term}
                  onEdit={() => setEditTarget(term)}
                  onActivate={() => setActivateTarget(term)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog (controlled) */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        {editTarget && (
          <TermFormDialog
            mode="edit"
            initial={editTarget}
            onSaved={() => {
              setEditTarget(null);
              termsQ.refetch();
            }}
          />
        )}
      </Dialog>

      {/* Activate confirmation */}
      <AlertDialog
        open={!!activateTarget}
        onOpenChange={(o) => !o && setActivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.activate")}</AlertDialogTitle>
            <AlertDialogDescription>{activateTarget?.name}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate}>
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Single term row with edit + activate actions. */
function TermRow({
  term,
  onEdit,
  onActivate,
}: {
  term: TermDto;
  onEdit: () => void;
  onActivate: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold">{term.name}</h3>
          {term.isActive && (
            <Badge className="bg-success/10 text-success border-success/30">
              <CheckCircle2 className="h-3 w-3 me-1" />
              {t("status.active")}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <span>
            {formatDate(term.startDate)} → {formatDate(term.endDate)}
          </span>
          <span>
            {t("admin.requiredCasesCount")}: {term.requiredCasesCount}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Pencil className="h-4 w-4 me-1" />
          {t("admin.edit")}
        </Button>
        {!term.isActive && (
          <Button size="sm" variant="outline" onClick={onActivate}>
            {t("admin.activate")}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Reusable create/edit dialog for terms.
 * Uses adminApi.createTerm or adminApi.updateTerm depending on mode.
 */
function TermFormDialog({
  mode,
  initial,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: TermDto;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TermForm>({
    resolver: zodResolver(termSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          startDate: initial.startDate?.slice(0, 10),
          endDate: initial.endDate?.slice(0, 10),
          requiredCasesCount: initial.requiredCasesCount,
        }
      : undefined,
  });

  const onSubmit = async (vals: TermForm) => {
    setError(null);
    if (new Date(vals.endDate) <= new Date(vals.startDate)) {
      setError(t("admin.endDate") + " > " + t("admin.startDate"));
      return;
    }
    try {
      if (mode === "create") {
        await adminApi.createTerm({
          adminId: userId || "",
          dto: {
            name: vals.name,
            startDate: vals.startDate,
            endDate: vals.endDate,
            requiredCasesCount: vals.requiredCasesCount,
          }
        });
        toast.success(t("admin.termCreated"));
      } else if (initial) {
        await adminApi.updateTerm({
          termId: initial.id,
          adminId: userId || "",
          dto: {
            name: vals.name,
            startDate: vals.startDate,
            endDate: vals.endDate,
            requiredCasesCount: vals.requiredCasesCount,
          }
        });
        toast.success(t("admin.termUpdated"));
      }
      reset();
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {mode === "create" ? t("admin.createTerm") : t("admin.editTerm")}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <div>
          <Label htmlFor="name">{t("admin.termName")}</Label>
          <Input id="name" className="mt-1" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startDate">{t("admin.startDate")}</Label>
            <Input
              id="startDate"
              type="date"
              className="mt-1"
              {...register("startDate")}
            />
            {errors.startDate && (
              <p className="text-xs text-destructive mt-1">
                {errors.startDate.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="endDate">{t("admin.endDate")}</Label>
            <Input id="endDate" type="date" className="mt-1" {...register("endDate")} />
            {errors.endDate && (
              <p className="text-xs text-destructive mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="requiredCasesCount">{t("admin.requiredCasesCount")}</Label>
          <Input
            id="requiredCasesCount"
            type="number"
            min={1}
            className="mt-1"
            {...register("requiredCasesCount")}
          />
          {errors.requiredCasesCount && (
            <p className="text-xs text-destructive mt-1">
              {errors.requiredCasesCount.message}
            </p>
          )}
        </div>
        <ErrorMessage message={error} />
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            {mode === "create" ? t("admin.createTerm") : t("common.save")}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
