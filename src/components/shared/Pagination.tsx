import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRTL } from "@/hooks/useRTL";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  compact?: boolean;
}

export function Pagination({ page, totalPages, onPageChange, compact }: Props) {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const Prev = isRTL ? ChevronRight : ChevronLeft;
  const Next = isRTL ? ChevronLeft : ChevronRight;

  if (totalPages <= 1) return null;
  return (
    <div className={`flex items-center justify-center gap-2 ${compact ? "py-1" : "py-4"}`}>
      <Button
        variant="outline"
        size="icon"
        className={compact ? "h-7 w-7" : "h-8 w-8"}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <Prev className="h-4 w-4" />
      </Button>
      <span className="text-xs text-muted-foreground tabular-nums px-1">
        {compact ? `${page} / ${totalPages}` : `${t("common.page")} ${page} ${t("common.of")} ${totalPages}`}
      </span>
      <Button
        variant="outline"
        size="icon"
        className={compact ? "h-7 w-7" : "h-8 w-8"}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <Next className="h-4 w-4" />
      </Button>
    </div>
  );
}
