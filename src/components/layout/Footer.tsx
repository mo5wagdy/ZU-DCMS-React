import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-card/40 mt-auto">
      <div className="container py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("app.name")} · {t("app.faculty")}
      </div>
    </footer>
  );
}
