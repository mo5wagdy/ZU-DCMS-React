import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Settings2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { adminApi } from "@/api/admin.api";
import type { SystemConfigDto } from "@/types";

export default function AdminConfigs() {
  const { t, i18n } = useTranslation();
  const [configs, setConfigs] = useState<SystemConfigDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminApi
      .getConfigs()
      .then((d) => {
        if (!mounted) return;
        setConfigs(d ?? []);
        setEdits({});
      })
      .catch((e) => mounted && setError((e as Error).message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [reload]);

  const labelFor = (key: string) => {
    const k = `admin.configKey.${key}`;
    const translated = t(k);
    return translated === k ? key : translated;
  };

  const save = async (key: string) => {
    const value = edits[key];
    if (value == null) return;
    setSavingKey(key);
    try {
      await adminApi.updateConfig({ key, value });
      toast.success(t("admin.configUpdated"));
      setReload((r) => r + 1);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="container py-8 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
          <Settings2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("admin.configs")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.configsCount")}: {configs?.length ?? 0}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("admin.configs")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <LoadingSpinner />}
          <ErrorMessage message={error} />
          {!loading && configs && configs.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">{t("admin.noConfigs")}</div>
          )}
          {!loading && configs && configs.length > 0 && (
            <div className="space-y-4">
              {configs.map((c) => {
                const dirty = edits[c.key] != null && edits[c.key] !== c.value;
                return (
                  <div
                    key={c.key}
                    className="rounded-xl border border-border p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className="font-semibold">{labelFor(c.key)}</div>
                        <div className="text-[11px] text-muted-foreground font-mono" dir="ltr">
                          {c.key}
                        </div>
                      </div>
                    </div>
                    {c.description && (
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                    )}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`v-${c.key}`} className="sr-only">
                          {t("admin.value")}
                        </Label>
                        <Input
                          id={`v-${c.key}`}
                          dir="ltr"
                          value={edits[c.key] ?? c.value}
                          onChange={(e) =>
                            setEdits((s) => ({ ...s, [c.key]: e.target.value }))
                          }
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => save(c.key)}
                        disabled={!dirty || savingKey === c.key}
                      >
                        {savingKey === c.key ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
