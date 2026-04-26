import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * 404-style block for entity detail pages where the requested ID is missing.
 *
 * Different from the route-level NotFoundPage: this lives inside a layout
 * and lets the user keep navigating without a hard reset.
 */
export function NotFoundBlock({
  title,
  description,
  backTo = "/",
  backLabel,
}: {
  title?: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
}) {
  const { t } = useTranslation();
  return (
    <Card className="p-10 text-center max-w-lg mx-auto">
      <div className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-muted text-muted-foreground mb-4">
        <FileQuestion className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold mb-1">{title ?? t("common.notFound")}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      <Button asChild variant="outline" size="sm">
        <Link to={backTo}>{backLabel ?? t("common.goHome")}</Link>
      </Button>
    </Card>
  );
}
