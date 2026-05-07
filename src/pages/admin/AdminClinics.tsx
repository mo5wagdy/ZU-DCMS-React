import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { useUIStore } from "@/store/ui.store";
import { adminApi } from "@/api/admin.api";
import type { ClinicDto } from "@/types";

export default function AdminClinics() {
  const { t } = useTranslation();
  const { refreshTick } = useUIStore();
  const [data, setData] = useState<ClinicDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminApi
      .getClinics()
      .then((d) => mounted && setData(d ?? []))
      .catch((e) => mounted && setError((e as Error).message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [refreshTick]);

  return (
    <div className="container py-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("admin.clinics")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.totalClinics")}: {data?.length ?? 0}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("admin.clinics")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <LoadingSpinner />}
          <ErrorMessage message={error} />
          {!loading && data && data.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {t("admin.noClinics")}
            </div>
          )}
          {!loading && data && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold leading-relaxed pb-0.5">{c.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {c.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
