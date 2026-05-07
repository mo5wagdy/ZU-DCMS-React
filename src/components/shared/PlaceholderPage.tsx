import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

export function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="container py-10 max-w-3xl">
      <Card className="p-10 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-accent/15 text-accent mx-auto mb-4">
          <Construction className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t(titleKey)}</h1>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
          {t("common.placeholderDesc1", "This page is ready to be built. API endpoints, types, and the design system are all set up.")}
          <br />
          {t("common.placeholderDesc2", "Request a specific page to build it in detail.")}
        </p>
      </Card>
    </div>
  );
}
