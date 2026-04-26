import { useTranslation } from "react-i18next";
import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Reusable empty-state block. Use for "no data" placeholders across lists.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={cn("py-12 text-center", className)}>
      <div className="grid h-12 w-12 mx-auto place-items-center rounded-full bg-muted text-muted-foreground mb-3">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <p className="font-semibold">{title ?? t("common.noData")}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Empty state wrapped in a card — convenience wrapper for full-width sections.
 */
export function EmptyCard(props: React.ComponentProps<typeof EmptyState>) {
  return (
    <Card>
      <EmptyState {...props} />
    </Card>
  );
}
