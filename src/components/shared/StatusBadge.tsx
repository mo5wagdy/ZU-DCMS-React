import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { bookingStatusKey, caseStatusKey } from "@/utils/enum";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  confirmed: "bg-info/15 text-info border-info/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  postponed: "bg-muted text-muted-foreground border-border",
  completed: "bg-success/15 text-success border-success/30",
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  inProgress: "bg-info/15 text-info border-info/30",
  transferred: "bg-muted text-muted-foreground border-border",
  pendingReview: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/20 text-success border-success/40",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

interface Props {
  type: "booking" | "case" | "raw";
  value: number | string;
}

export function StatusBadge({ type, value }: Props) {
  const { t } = useTranslation();
  let key = "";
  if (type === "booking") key = bookingStatusKey(value as number);
  else if (type === "case") key = caseStatusKey(value as number);
  else key = String(value);

  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", statusColors[key])}>
      {t(`status.${key}`)}
    </Badge>
  );
}
