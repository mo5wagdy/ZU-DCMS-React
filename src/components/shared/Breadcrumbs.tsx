import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  /** Display label (already translated). */
  label: string;
  /** Target href; omit for the current page. */
  to?: string;
}

/**
 * Lightweight breadcrumb trail for inner pages.
 *
 * Auto-prepends a Home link, RTL-aware via the `rtl-flip` chevron utility
 * already configured in the design system.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-xs text-muted-foreground mb-4"
    >
      <Link to="/" className="flex items-center gap-1 hover:text-foreground">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only">{t("common.home")}</span>
      </Link>
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 rtl-flip opacity-50" />
          {c.to ? (
            <Link to={c.to} className="hover:text-foreground">
              {c.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
