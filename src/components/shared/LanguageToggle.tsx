import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui.store";

export function LanguageToggle() {
  const { language, setLanguage } = useUIStore();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="gap-2"
      aria-label="Toggle language"
    >
      <Globe className="h-4 w-4" />
      <span className="font-semibold">{language === "ar" ? "EN" : "عربي"}</span>
    </Button>
  );
}
