import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

function useHomePath() {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) return "/";
  const map: Record<string, string> = {
    patient: "/patient/dashboard",
    interndoctor: "/intern/dashboard",
    student: "/student/dashboard",
    teachingassistant: "/ta/dashboard",
    admin: "/admin/dashboard",
    dean: "/view/dashboard",
    vicedean: "/view/dashboard",
    professor: "/view/dashboard",
  };
  return map[role?.toLowerCase() ?? ""] ?? "/";
}

export default function NotFoundPage() {
  const { t } = useTranslation();
  const homePath = useHomePath();
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center py-12">
      <h1 className="text-7xl font-extrabold text-primary mb-3">404</h1>
      <p className="text-muted-foreground mb-6">{t("common.notFound")}</p>
      <Button asChild>
        <Link to={homePath}>{t("common.goHome")}</Link>
      </Button>
    </div>
  );
}
