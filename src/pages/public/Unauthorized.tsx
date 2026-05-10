import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldX } from "lucide-react";
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

export default function Unauthorized() {
  const { t } = useTranslation();
  const homePath = useHomePath();
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center py-12">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-destructive/10 text-destructive mb-6">
        <ShieldX className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold mb-2">403 — {t("common.unauthorized")}</h1>
      <p className="text-muted-foreground mb-6">{t("common.unauthorizedMsg")}</p>
      <Button asChild>
        <Link to={homePath}>{t("common.goHome")}</Link>
      </Button>
    </div>
  );
}
