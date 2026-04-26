import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Users, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { studentApi } from "@/api/student.api";
import { useFetch } from "@/hooks/useFetch";
import type { PagedResult, StudentDto } from "@/types";

/**
 * Read-only student directory used by Dean / ViceDean / Professor / Admin.
 * Client-side search over the (paged) list returned from the backend.
 */
export default function ViewStudents() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { data, loading, error } = useFetch<PagedResult<StudentDto>>(
    () => studentApi.list({ page: 1, pageSize: 500, sortDescending: false }),
    []
  );
  const students = data?.items ?? null;

  const filtered = useMemo(() => {
    if (!students) return [];
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <div className="container py-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("view.students")}</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} / {students?.length ?? 0}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("view.studentSearch")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("view.studentSearch")}
              className="ps-9"
            />
          </div>

          {loading && <ListSkeleton rows={5} />}
          <ErrorMessage message={error} />

          {!loading && filtered.length === 0 && !error && (
            <EmptyState title={t("view.noStudents")} />
          )}

          {!loading && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((s) => (
                <Link
                  key={s.id}
                  to={`/view/student/${s.id}`}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{s.fullName}</div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
                      <span>{s.studentCode}</span>
                      <span>
                        {t("student.academicYear")} {s.academicYear}
                      </span>
                    </div>
                  </div>
                  {!s.isActive && (
                    <Badge variant="outline">{t("status.inactive")}</Badge>
                  )}
                  <ArrowRight className="h-4 w-4 rtl-flip text-muted-foreground group-hover:text-primary" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
