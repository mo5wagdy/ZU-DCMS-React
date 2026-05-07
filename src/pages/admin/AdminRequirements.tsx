import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ListChecks, Save, Loader2, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Pagination } from "@/components/shared/Pagination";
import { adminApi } from "@/api/admin.api";
import { studentApi } from "@/api/student.api";
import { termApi } from "@/api/term.api";
import { lookupApi } from "@/api/lookup.api";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import type { StudentDto, TermDto, StudentRequirementDto, ClinicDto } from "@/types";
// Removed lookupApi import as per user instruction


export default function AdminRequirements() {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const { refreshTick } = useUIStore();
  
  const [mode, setMode] = useState<"individual" | "yearly">("individual");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);

  const [students, setStudents] = useState<StudentDto[]>([]);
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [term, setTerm] = useState<TermDto | null>(null);
  const [clinics, setClinics] = useState<ClinicDto[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [saving, setSaving] = useState(false);

  // load term + clinics
  useEffect(() => {
    termApi.active().then(setTerm).catch(e => setError(e.message));
    lookupApi.getClinics().then(cls => setClinics(cls.filter(c => c.id !== 1 && c.isActive)));
  }, [refreshTick]);

  // load students based on search
  useEffect(() => {
    if (mode !== "individual") return;
    let mounted = true;
    setLoadingStudents(true);
    studentApi
      .list({ 
        page: studentPage, 
        pageSize: 15, 
        sortDescending: false, 
        searchTerm: debouncedSearch || undefined 
      })
      .then((s) => {
        if (!mounted) return;
        setStudents(s?.items ?? []);
        setStudentTotalPages(s?.totalPages ?? 1);
      })
      .catch((e) => mounted && setError((e as Error).message))
      .finally(() => {
        if (mounted) {
          setLoadingStudents(false);
          setLoadingInit(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [debouncedSearch, studentPage, refreshTick, mode]);

  // load individual requirements
  useEffect(() => {
    if (mode !== "individual" || !selectedStudent || !term) return;
    let mounted = true;
    setLoadingReqs(true);
    setCounts({});
    adminApi
      .getStudentRequirements(selectedStudent.id, term.id)
      .then((d) => {
        if (!mounted) return;
        const list = d ?? [];
        const byName: Record<string, number> = {};
        for (const c of clinics) byName[c.name] = c.id;
        const seeded: Record<number, number> = {};
        for (const r of list) {
          const id = byName[r.clinicName];
          if (id) seeded[id] = r.requiredCount;
        }
        setCounts(seeded);
      })
      .catch((e) => mounted && toast.error((e as Error).message))
      .finally(() => mounted && setLoadingReqs(false));
    return () => {
      mounted = false;
    };
  }, [selectedStudent, term, clinics, mode]);

  // Reset when switching modes
  useEffect(() => {
    setCounts({});
    if (mode === "individual") setSelectedYear(null);
    else setSelectedStudent(null);
  }, [mode]);

  const save = async () => {
    if (!term) return;
    setSaving(true);
    try {
      const requirements = clinics
        .map((c) => ({ clinicId: c.id, requiredCount: counts[c.id] ?? 0 }))
        .filter((r) => r.requiredCount >= 0); // Include 0 to allow clearing

      if (mode === "individual" && selectedStudent) {
        await adminApi.setStudentRequirements({
          adminId: userId || "",
          studentId: selectedStudent.id,
          termId: term.id,
          requirements: requirements.filter(r => r.requiredCount > 0),
        });
        toast.success(t("admin.requirementsUpdated"));
      } else if (mode === "yearly" && selectedYear) {
        await adminApi.setTermRequirements({
          adminId: userId || "",
          academicYear: selectedYear,
          termId: term.id,
          requirements: requirements.filter(r => r.requiredCount > 0),
        });
        toast.success(t("admin.termRequirementsUpdated", "تم تحديث متطلبات الترم بنجاح"));
      }
      useUIStore.getState().triggerRefresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const filteredClinics = useMemo(() => {
    const year = mode === "individual" ? selectedStudent?.academicYear : selectedYear;
    if (!year) return clinics;
    return clinics.filter(c => year >= c.minAcademicYear && year <= c.maxAcademicYear);
  }, [clinics, mode, selectedStudent, selectedYear]);

  return (
    <div className="container py-8 max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
            <ListChecks className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("admin.requirements")}</h1>
            {term && (
              <p className="text-sm text-muted-foreground">
                {t("admin.activeTerm")}: <span className="font-medium text-foreground">{term.name}</span>
              </p>
            )}
          </div>
        </div>

        <div className="inline-flex p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setMode("individual")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              mode === "individual" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("admin.individualMode", "طلاب")}
          </button>
          <button
            onClick={() => setMode("yearly")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              mode === "yearly" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("admin.termMode", "متطلبات الترم")}
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Sidebar */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {mode === "individual" ? t("admin.selectStudent") : t("admin.selectAcademicYear", "اختر السنة الدراسية")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mode === "individual" ? (
              <>
                <div className="relative">
                  <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setStudentPage(1);
                    }}
                    placeholder={t("common.search")}
                    className="ps-9"
                  />
                </div>
                <div className="max-h-[480px] overflow-y-auto -mx-2 px-2 space-y-1">
                  {loadingStudents ? (
                    <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary/40" /></div>
                  ) : students.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-6 text-center">{t("view.noStudents")}</div>
                  ) : (
                    students.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedStudent(s)}
                        className={`w-full text-start rounded-lg p-2.5 text-sm transition-colors ${
                          selectedStudent?.id === s.id ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted/50 border border-transparent"
                        }`}
                      >
                        <div className="font-medium truncate">{s.fullName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {s.studentCode} • {t("student.academicYear")} {s.academicYear}
                        </div>
                      </button>
                    ))
                  )}
                </div>
                {studentTotalPages > 1 && (
                  <div className="pt-2 border-t border-border/50">
                    <Pagination page={studentPage} totalPages={studentTotalPages} onPageChange={setStudentPage} compact />
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-1">
                {[4, 5].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setSelectedYear(y)}
                    className={`w-full text-start rounded-lg p-3 text-sm transition-colors flex items-center justify-between ${
                      selectedYear === y ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    <span className="font-medium">{t("student.academicYear")} {y}</span>
                    <ArrowRight className="h-4 w-4 rtl-flip opacity-40" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              {mode === "individual" 
                ? (selectedStudent ? selectedStudent.fullName : t("admin.selectStudentFirst"))
                : (selectedYear ? `${t("student.academicYear")} ${selectedYear}` : t("admin.selectYearFirst", "اختر السنة الدراسية"))}
              {mode === "yearly" && selectedYear && (
                <Badge variant="outline" className="font-normal text-[10px]">
                  {t("admin.bulkApply", "تحديث جماعي")}
                </Badge>
              )}
            </CardTitle>
            {(selectedStudent || selectedYear) && (
              <Button size="sm" onClick={save} disabled={saving || !term}>
                {saving ? <Loader2 className="h-4 w-4 me-1 animate-spin" /> : <Save className="h-4 w-4 me-1" />}
                {t("admin.updateRequirements")}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!(selectedStudent || selectedYear) ? (
              <div className="py-20 text-center">
                <div className="grid h-12 w-12 mx-auto place-items-center rounded-full bg-muted text-muted-foreground mb-3">
                  <ListChecks className="h-6 w-6 opacity-40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {mode === "individual" ? t("admin.selectStudentFirst") : t("admin.selectYearFirst", "يرجى اختيار السنة الدراسية للبدء")}
                </p>
              </div>
            ) : (
              <>
                {loadingReqs ? (
                  <LoadingSpinner />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredClinics.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
                        {t("admin.noClinicsForYear", "لا توجد عيادات متاحة لهذه السنة")}
                      </div>
                    ) : (
                      filteredClinics.map((c) => (
                        <div
                          key={c.id}
                          className="group rounded-xl border border-border p-4 flex items-center justify-between gap-4 hover:border-primary/30 transition-all hover:shadow-sm"
                        >
                          <div className="min-w-0">
                            <Label htmlFor={`c-${c.id}`} className="font-semibold block truncate cursor-pointer leading-relaxed pb-0.5">
                              {c.name}
                            </Label>
                            <span className="text-[10px] text-muted-foreground">{c.code}</span>
                          </div>
                          <div className="flex items-center bg-muted/30 rounded-lg p-1 border border-border/50">
                            <button
                              type="button"
                              onClick={() => setCounts(s => ({ ...s, [c.id]: Math.max(0, (s[c.id] || 0) - 1) }))}
                              className="h-8 w-8 flex items-center justify-center rounded hover:bg-background transition-colors text-lg"
                            >
                              −
                            </button>
                            <Input
                              id={`c-${c.id}`}
                              type="number"
                              min={0}
                              className="w-14 h-8 border-0 bg-transparent text-center focus-visible:ring-0 font-bold tabular-nums p-0"
                              value={counts[c.id] ?? 0}
                              onChange={(e) =>
                                setCounts((s) => ({
                                  ...s,
                                  [c.id]: Math.max(0, Number(e.target.value) || 0),
                                }))
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setCounts(s => ({ ...s, [c.id]: (s[c.id] || 0) + 1 }))}
                              className="h-8 w-8 flex items-center justify-center rounded hover:bg-background transition-colors text-lg"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

