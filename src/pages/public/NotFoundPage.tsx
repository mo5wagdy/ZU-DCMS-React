import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center py-12">
      <h1 className="text-7xl font-extrabold text-primary mb-3">404</h1>
      <p className="text-muted-foreground mb-6">{t("common.notFound")}</p>
      <Button asChild>
        <Link to="/">{t("common.goHome")}</Link>
      </Button>
    </div>
  );
}
