import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useStudentContext } from "@/hooks/useStudentContext";
import { caseApi } from "@/api/case.api";
import { CaseStatus } from "@/utils/enum";
import { formatDate } from "@/utils/format";
import { useUIStore } from "@/store/ui.store";
import { useFetch } from "@/hooks/useFetch";
import type { CaseAssignmentDto } from "@/types";

type Filter = "all" | "active" | "completed";

/**
 * Student-facing case list. Fetches once per student id, then filters
 * client-side (active / completed / all) with a free-text search box.
 */
export default function MyCases() {
  const { t } = useTranslation();
  const lang = useUIStore((s) => s.language);
  const { student, loading: ctxLoading, error: ctxError } = useStudentContext();
  const [filter, setFilter] = useState<Filter>("active");
  const [search, setSearch] = useState("");

  const { data: cases, loading, error } = useFetch<CaseAssignmentDto[]>(
    async () => {
      if (!student?.id) return [];
      return await caseApi.studentCases(student.id);
    },
    [student?.id]
  );

  const filtered = useMemo(() => {
    if (!cases) return [];
    let list = cases;
    if (filter === "active") {
      list = list.filter(
        (c) => c.status === CaseStatus.Assigned || c.status === CaseStatus.InProgress
      );
    } else if (filter === "completed") {
      list = list.filter((c) => c.status === CaseStatus.Completed);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.patientName.toLowerCase().includes(q) ||
          c.clinicName.toLowerCase().includes(q) ||
          c.diagnosis.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cases, filter, search]);

  if (ctxLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <ClipboardList className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold">{t("student.myCases")}</h1>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList>
                <TabsTrigger value="active">{t("student.active")}</TabsTrigger>
                <TabsTrigger value="completed">{t("student.completedTab")}</TabsTrigger>
                <TabsTrigger value="all">{t("student.all")}</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.search")}
                className="ps-9"
              />
            </div>
          </div>
          <CardTitle className="sr-only">{t("student.myCases")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorMessage message={error || ctxError} />
          {loading && <ListSkeleton rows={3} />}
          {!loading && cases && filtered.length === 0 && (
            <EmptyState title={t("common.noData")} />
          )}
          {!loading && cases && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((c) => (
                <CaseRow key={c.id} item={c} lang={lang} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Row summary linking to the full case detail
function CaseRow({ item, lang }: { item: CaseAssignmentDto; lang: "ar" | "en" }) {
  const { t } = useTranslation();
  return (
    <Link
      to={`/student/case/${item.id}`}
      className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold">{item.patientName}</h3>
            <StatusBadge type="case" value={item.status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <Field label={t("student.clinic")} value={item.clinicName} />
            <Field label={t("student.diagnosis")} value={item.diagnosis} />
            <Field
              label={t("student.sessionsCount")}
              value={String(item.sessions.length)}
            />
            <Field label={t("student.assignedAt")} value={formatDate(item.assignedAt, lang)} />
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground rtl-flip flex-shrink-0 self-center" />
      </div>
    </Link>
  );
}

// Tiny labelled cell used inside the row grid
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}
