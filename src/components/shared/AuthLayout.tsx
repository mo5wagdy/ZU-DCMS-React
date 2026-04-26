import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRTL } from "@/hooks/useRTL";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  const { t } = useTranslation();
  const isRTL = useRTL();
  return (
    <div className="container max-w-md py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
      >
        <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
        {t("common.home")}
      </Link>
      <Card className="p-8 shadow-elevated border-border/60">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {children}
        {footer && (
          <div className="mt-6 pt-6 border-t border-border text-center text-sm">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}
