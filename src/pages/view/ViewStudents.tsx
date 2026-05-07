import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Users, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { studentApi } from "@/api/student.api";
import { useUIStore } from "@/store/ui.store";
import type { PagedResult, StudentDto } from "@/types";

export default function ViewStudents() {
  const { t } = useTranslation();
  const { refreshTick } = useUIStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [academicYear, setAcademicYear] = useState<string>("all");
  const [data, setData] = useState<PagedResult<StudentDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    studentApi
      .list({ 
        page, 
        pageSize: 15, 
        sortDescending: false, 
        searchTerm: search || undefined,
        academicYear: academicYear === "all" ? undefined : Number(academicYear)
      } as any)
      .then((d) => mounted && setData(d ?? null))
      .catch((e) => mounted && setError((e as Error).message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page, search, academicYear, refreshTick]);

  // Reactive search reset
  useEffect(() => {
    if (searchInput.trim() === "" && search !== "") {
      setSearch("");
      setPage(1);
    }
  }, [searchInput, search]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const students = data?.items ?? [];

  return (
    <div className="container py-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("view.students")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.totalUsers")}: {data?.totalCount ?? 0}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("view.studentSearch")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2 mb-6">
            <form onSubmit={onSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("view.studentSearch")}
                  className="ps-9"
                />
              </div>
              <Button type="submit" variant="outline">
                {t("common.search")}
              </Button>
            </form>
            
            <div className="flex items-center gap-2">
              <select
                value={academicYear}
                onChange={(e) => {
                  setAcademicYear(e.target.value);
                  setPage(1);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-w-[140px]"
              >
                <option value="all">{t("student.allYears")}</option>
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    {t("student.academicYear")} {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && <ListSkeleton rows={5} />}
          <ErrorMessage message={error} />

          {!loading && students.length === 0 && !error && (
            <EmptyState 
              title={(search || academicYear !== "all") ? t("common.noResultsFilter") : t("view.noStudents")} 
              description={academicYear !== "all" ? t("student.noStudentsForYear", { year: academicYear }) : undefined}
            />
          )}

          {!loading && students.length > 0 && (
            <div className="space-y-2">
              {students.map((s) => (
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

          {data && data.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
