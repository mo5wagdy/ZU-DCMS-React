import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  const { t } = useTranslation();
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center py-12">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-destructive/10 text-destructive mb-6">
        <ShieldX className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold mb-2">403 — {t("common.unauthorized")}</h1>
      <p className="text-muted-foreground mb-6">{t("common.unauthorizedMsg")}</p>
      <Button asChild>
        <Link to="/">{t("common.goHome")}</Link>
      </Button>
    </div>
  );
}
