import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { History, ArrowLeft, GraduationCap, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { ListSkeleton } from "@/components/shared/Skeletons";
import { caseApi } from "@/api/case.api";
import { formatDate } from "@/utils/format";
import { useUIStore } from "@/store/ui.store";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/hooks/useAuth";
import { CaseStatus } from "@/utils/enum";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { CaseAssignmentDto } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/**
 * TA History page - displays cases previously reviewed by the TA.
 */
export default function TAHistory() {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const lang = useUIStore((s) => s.language);
  
  const { data: reviewedCases, loading: casesLoading, error: casesError } = useFetch<CaseAssignmentDto[]>(
    () => userId ? caseApi.reviewedCases(userId) : Promise.resolve([]),
    [userId]
  );

  const { data: reviewedAssignments, loading: assignmentsLoading, error: assignmentsError } = useFetch<CaseAssignmentDto[]>(
    () => userId ? caseApi.reviewedAssignments(userId) : Promise.resolve([]),
    [userId]
  );

  return (
    <div className="container py-8 max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/ta/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              {t("ta.reviewHistory")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("ta.reviewedCases")}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="assignments">
            {t("ta.assignmentApprovals", "موافقات التعيين")}
            {reviewedAssignments && reviewedAssignments.length > 0 && (
              <Badge variant="secondary" className="ms-2">
                {reviewedAssignments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            {t("ta.treatmentReviews", "مراجعات العلاج")}
            {reviewedCases && reviewedCases.length > 0 && (
              <Badge variant="secondary" className="ms-2">
                {reviewedCases.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-accent" />
                {t("ta.reviewedAssignments", "سجل التعيينات المراجعة")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentsLoading && <ListSkeleton rows={5} />}
              <ErrorMessage message={assignmentsError} />
              
              {!assignmentsLoading && reviewedAssignments && reviewedAssignments.length === 0 && (
                <div className="py-12 text-center bg-muted/20 rounded-xl border border-dashed">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-20" />
                  <p className="font-semibold text-muted-foreground">{t("ta.noAssignmentHistory", "لا يوجد سجل للتعيينات")}</p>
                </div>
              )}

              {!assignmentsLoading && reviewedAssignments && reviewedAssignments.length > 0 && (
                <div className="space-y-3">
                  {reviewedAssignments.map((c) => (
                    <AssignmentHistoryRow key={c.id} item={c} lang={lang} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-accent" />
                {t("ta.reviewedCases", "سجل الحالات المراجعة")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {casesLoading && <ListSkeleton rows={5} />}
              <ErrorMessage message={casesError} />
              
              {!casesLoading && reviewedCases && reviewedCases.length === 0 && (
                <div className="py-12 text-center bg-muted/20 rounded-xl border border-dashed">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-20" />
                  <p className="font-semibold text-muted-foreground">{t("ta.noHistory", "لا يوجد سجل")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("ta.noHistoryDesc", "لم تقم بمراجعة أي حالات بعد.")}</p>
                </div>
              )}

              {!casesLoading && reviewedCases && reviewedCases.length > 0 && (
                <div className="space-y-3">
                  {reviewedCases.map((c) => (
                    <HistoryRow key={c.id} item={c} lang={lang} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HistoryRow({ item, lang }: { item: CaseAssignmentDto; lang: "ar" | "en" }) {
  const { t } = useTranslation();
  return (
    <div className="block rounded-xl border border-border bg-card p-4 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{item.patientName}</h3>
            <Badge variant="outline" className="text-[10px]">
              {lang === 'en' ? (item.clinicNameEn || item.clinicName) : item.clinicName}
            </Badge>
            <StatusBadge type="case" value={item.status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-3 w-3" />
              <span className="truncate">{item.studentName}</span>
            </div>
            <div className="truncate">
              {lang === 'en' ? (item.diagnosisEn || item.diagnosis) : item.diagnosis}
            </div>
            <div>
              {item.sessions.length} {t("student.sessions")}
            </div>
            <div>
               {formatDate(item.assignedAt, lang)}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/ta/review/${item.id}`}>
            {t("common.details")}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function AssignmentHistoryRow({ item, lang }: { item: CaseAssignmentDto; lang: "ar" | "en" }) {
  const { t } = useTranslation();
  return (
    <div className="block rounded-xl border border-border bg-card p-4 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{item.patientName}</h3>
            <Badge variant="outline" className="text-[10px]">
              {lang === 'en' ? (item.clinicNameEn || item.clinicName) : item.clinicName}
            </Badge>
            <StatusBadge type="case" value={item.status} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="truncate">
              {t("ta.assignedBy", "تم التعيين بواسطة")}: {item.assignedByInternName}
            </div>
            <div>
               {formatDate(item.assignmentReviewedAt || item.assignedAt, lang)}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/ta/assignment/${item.id}`}>
            {t("common.details")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
