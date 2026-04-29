import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ListChecks, Save, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { adminApi } from "@/api/admin.api";
import { studentApi } from "@/api/student.api";
import { termApi } from "@/api/term.api";
import { lookupApi } from "@/api/lookup.api";
import { useAuth } from "@/hooks/useAuth";
import type { StudentDto, TermDto, StudentRequirementDto, ClinicDto } from "@/types";
// Removed lookupApi import as per user instruction


export default function AdminRequirements() {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [term, setTerm] = useState<TermDto | null>(null);
  const [clinics, setClinics] = useState<ClinicDto[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);

  const [reqs, setReqs] = useState<StudentRequirementDto[] | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [saving, setSaving] = useState(false);

  // bootstrap: students + active term + clinics
  useEffect(() => {
    let mounted = true;
    setLoadingInit(true);
    Promise.all([
      studentApi.list({ page: 1, pageSize: 200, sortDescending: false }),
      termApi.active(),
      lookupApi.getClinics(),
    ])
      .then(([s, tm, cls]) => {
        if (!mounted) return;
        setStudents(s?.items ?? []);
        setTerm(tm ?? null);
        // Filter out Diagnosis Clinic (ID 1)
        setClinics(cls.filter(c => c.id !== 1 && c.isActive));
      })
      .catch((e) => mounted && setError((e as Error).message))
      .finally(() => mounted && setLoadingInit(false));
    return () => {
      mounted = false;
    };
  }, []);

  // load requirements when student selected
  useEffect(() => {
    if (!selectedStudent || !term) return;
    let mounted = true;
    setLoadingReqs(true);
    setReqs(null);
    adminApi
      .getStudentRequirements(selectedStudent.id, term.id)
      .then((d) => {
        if (!mounted) return;
        const list = d ?? [];
        setReqs(list);
        // seed counts: try to map by clinic name → id from clinics list
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
  }, [selectedStudent, term, clinics]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q)
    );
  }, [students, search]);

  const save = async () => {
    if (!selectedStudent || !term) return;
    setSaving(true);
    try {
      const requirements = clinics
        .map((c) => ({ clinicId: c.id, requiredCount: counts[c.id] ?? 0 }))
        .filter((r) => r.requiredCount > 0);
      await adminApi.setStudentRequirements({
        adminId: userId || "",
        studentId: selectedStudent.id,
        termId: term.id,
        requirements,
      });
      toast.success(t("admin.requirementsUpdated"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-8 max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
          <ListChecks className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("admin.requirements")}</h1>
          {term && (
            <p className="text-sm text-muted-foreground">
              {t("admin.activeTerm")}: <span className="font-medium">{term.name}</span>
            </p>
          )}
        </div>
      </div>

      {loadingInit && <LoadingSpinner fullPage />}
      <ErrorMessage message={error} />

      {!loadingInit && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* Students list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("admin.selectStudent")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("common.search")}
                  className="ps-9"
                />
              </div>
              <div className="max-h-[480px] overflow-y-auto -mx-2 px-2 space-y-1">
                {filteredStudents.length === 0 && (
                  <div className="text-sm text-muted-foreground py-6 text-center">
                    {t("view.noStudents")}
                  </div>
                )}
                {filteredStudents.map((s) => {
                  const active = selectedStudent?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStudent(s)}
                      className={`w-full text-start rounded-lg p-2.5 text-sm transition-colors ${
                        active
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "hover:bg-muted/50 border border-transparent"
                      }`}
                    >
                      <div className="font-medium truncate">{s.fullName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {s.studentCode} • {t("student.academicYear")} {s.academicYear}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Requirements editor */}
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base">
                {selectedStudent ? selectedStudent.fullName : t("admin.requirements")}
              </CardTitle>
              {selectedStudent && (
                <Button size="sm" onClick={save} disabled={saving || !term}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 me-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 me-1" />
                  )}
                  {t("admin.updateRequirements")}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!selectedStudent && (
                <div className="py-12 text-center text-muted-foreground">
                  {t("admin.selectStudentFirst")}
                </div>
              )}
              {selectedStudent && loadingReqs && <LoadingSpinner />}
              {selectedStudent && !loadingReqs && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clinics
                    .filter(c => selectedStudent.academicYear >= (c as any).minAcademicYear && selectedStudent.academicYear <= (c as any).maxAcademicYear)
                    .map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border border-border p-3 flex items-center justify-between gap-3"
                    >
                      <Label htmlFor={`c-${c.id}`} className="font-medium truncate">
                        {c.name}
                      </Label>
                      <Input
                        id={`c-${c.id}`}
                        type="number"
                        min={0}
                        className="w-20 text-center"
                        value={counts[c.id] ?? 0}
                        onChange={(e) =>
                          setCounts((s) => ({
                            ...s,
                            [c.id]: Math.max(0, Number(e.target.value) || 0),
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
