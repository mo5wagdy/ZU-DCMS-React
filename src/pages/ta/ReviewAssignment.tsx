import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardCheck, ArrowRight, UserCheck, AlertTriangle, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { caseApi } from "@/api/case.api";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { useFetch } from "@/hooks/useFetch";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";

export default function ReviewAssignment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const lang = useUIStore((s) => s.language);
  const userId = useAuthStore((s) => s.userId);

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: assignment, loading, error } = useFetch(
    async () => {
      if (!id) throw new Error("No ID provided");
      return await caseApi.byId(Number(id));
    },
    [id]
  );

  const handleAction = async (action: "Approve" | "Escalate" | "Transfer") => {
    if (!id || !userId) return;
    
    if ((action === "Escalate" || action === "Transfer") && !notes.trim()) {
      toast.error(t("ta.notesRequiredForRejection", "يرجى كتابة سبب الرفض أو التحويل"));
      return;
    }

    setSubmitting(true);
    try {
      await caseApi.reviewAssignment({
        taUserId: userId,
        dto: {
          caseAssignmentId: Number(id),
          action,
          notes: notes.trim(),
        },
      });
      
      toast.success(t("ta.assignmentReviewedSuccess", "تمت مراجعة التعيين بنجاح"));
      navigate("/ta");
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error || !assignment) return (
    <div className="m-8">
      <ErrorMessage message={error || "Not found"} />
    </div>
  );

  return (
    <div className="container py-8 max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowRight className="h-5 w-5 rtl-flip" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{t("ta.reviewAssignment", "مراجعة التعيين المبدئي")}</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 border-b border-border pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            {t("ta.assignmentDetails", "تفاصيل التعيين")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">{t("student.patientName")}</p>
              <p className="font-semibold text-lg">{assignment.patientName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("student.clinic")}</p>
              <Badge variant="outline" className="mt-1">
                {lang === 'en' ? (assignment.clinicNameEn || assignment.clinicName) : assignment.clinicName}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("ta.student")}</p>
              <p className="font-medium">{assignment.studentName}</p>
              <p className="text-xs text-muted-foreground">{assignment.studentCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("student.diagnosis")}</p>
              <p className="font-medium">{lang === 'en' ? (assignment.diagnosisEn || assignment.diagnosis) : assignment.diagnosis}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("ta.assignedBy", "تم التعيين بواسطة")}</p>
              <p className="font-medium">{assignment.assignedByInternName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("ta.assignedAt", "تاريخ التعيين")}</p>
              <p className="font-medium">{formatDate(assignment.assignedAt, lang)}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="font-medium">{t("ta.reviewNotes", "ملاحظات المراجعة (إلزامية في حالة الرفض أو التحويل)")}</h3>
            <Textarea
              placeholder={t("ta.writeReviewNotes", "اكتب ملاحظاتك هنا...")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              className="flex-1"
              variant="default"
              onClick={() => handleAction("Approve")}
              disabled={submitting}
            >
              <ClipboardCheck className="h-4 w-4 me-2" />
              {t("ta.approveAssignment", "الموافقة وبدء العلاج")}
            </Button>
            
            <Button
              className="flex-1"
              variant="destructive"
              onClick={() => handleAction("Escalate")}
              disabled={submitting}
            >
              <AlertTriangle className="h-4 w-4 me-2" />
              {t("ta.escalateToSpecialist", "تصعيد لعيادة متخصصة")}
            </Button>
            
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => handleAction("Transfer")}
              disabled={submitting}
            >
              <RefreshCcw className="h-4 w-4 me-2" />
              {t("ta.transferToIntern", "إرجاع لعيادة الامتياز")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
