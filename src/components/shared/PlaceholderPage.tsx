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
        <p className="text-muted-foreground text-sm">
          هذه الصفحة جاهزة للبناء. الـ API endpoints والـ types والـ design system كلها جاهزة.
          اطلب صفحة محددة لبنائها بالتفصيل.
        </p>
      </Card>
    </div>
  );
}
