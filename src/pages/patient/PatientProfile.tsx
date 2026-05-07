import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { patientApi } from "@/api/patient.api";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/store/ui.store";
import { formatDate } from "@/utils/format";
import { ChronicConditionList, Gender, arrayToFlags, flagsToArray } from "@/utils/enum";
import type { PatientDto } from "@/types";
import { Country, State } from "country-state-city";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLocalizedName } from "@/utils/location";

export default function PatientProfile() {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const { language: lang, refreshTick } = useUIStore();
  const [patient, setPatient] = useState<PatientDto | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [selectedCountryIso, setSelectedCountryIso] = useState<string>("");
  const [selectedStateIso, setSelectedStateIso] = useState<string>("");
  const [conditions, setConditions] = useState<number[]>([]);
  const [otherConditions, setOtherConditions] = useState("");

  const allFlags = ChronicConditionList.map((c) => c.value);

  useEffect(() => {
    if (!userId) return;
    patientApi
      .byUserId(userId)
      .then((p) => {
        setPatient(p);
        setPhoneNumber(p.phoneNumber);
        setEmail(p.email || "");
        const addr = p.address || "";
        setAddress(addr);
        const [cName, sName] = addr.split(",");
        if (cName) {
          const c = Country.getAllCountries().find(x => x.name === cName);
          if (c) {
            setSelectedCountryIso(c.isoCode);
            if (sName) {
              const s = State.getStatesOfCountry(c.isoCode).find(x => x.name === sName);
              if (s) setSelectedStateIso(s.isoCode);
            }
          }
        }
        setConditions(flagsToArray(p.chronicConditions, allFlags));
        setOtherConditions(p.otherConditions || "");
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshTick]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await patientApi.updateProfile({
        id: patient.id,
        dto: {
          phoneNumber,
          email: email || undefined,
          address: address || undefined,
          chronicConditions: arrayToFlags(conditions),
          otherConditions: otherConditions || undefined,
        }
      });
      setPatient(updated);
      setEditing(false);
      useUIStore.getState().triggerRefresh();
      toast.success(t("common.save"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!patient) return <ErrorMessage message="Not found" />;

  const showFemaleOnly = patient.gender === Gender.Female;

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("patient.profile")}</h1>
        {!editing ? (
          <Button onClick={() => setEditing(true)} variant="outline">
            <Edit2 className="h-4 w-4 me-2" /> {t("common.edit")}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              <X className="h-4 w-4 me-2" /> {t("common.cancel")}
            </Button>
            <Button onClick={save} disabled={saving}>
              <Save className="h-4 w-4 me-2" /> {t("common.save")}
            </Button>
          </div>
        )}
      </div>

      <ErrorMessage message={error} />

      <Card className="p-6 space-y-5">
        {/* Read-only personal */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">
            {t("patient.personalInfo")}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">{t("auth.fullName")}</div>
              <div className="font-semibold">{patient.fullName}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t("patient.patientCode")}</div>
              <Badge variant="outline" className="font-mono">{patient.patientCode}</Badge>
            </div>
            <div>
              <div className="text-muted-foreground">{t("auth.dateOfBirth")}</div>
              <div className="font-semibold">{formatDate(patient.dateOfBirth, lang)} ({patient.age} {t("patient.year")})</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t("auth.gender")}</div>
              <div className="font-semibold">{t(`gender.${patient.gender}`)}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">
            {t("patient.contactInfo")}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t("auth.phone")}</Label>
              {editing ? (
                <Input className="mt-1" dir="ltr" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              ) : (
                <div className="mt-1 font-semibold text-start text-foreground">
                  <span dir="ltr">{patient.phoneNumber}</span>
                </div>
              )}
            </div>
            <div>
              <Label>{t("auth.email")}</Label>
              {editing ? (
                <Input className="mt-1" dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              ) : (
                <div className="mt-1 font-semibold text-start text-foreground">
                  <span dir="ltr">{patient.email || "—"}</span>
                </div>
              )}
            </div>
            <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{t("auth.country", "الدولة")}</Label>
                {editing ? (
                  <Select
                    value={selectedCountryIso}
                    onValueChange={(iso) => {
                      setSelectedCountryIso(iso);
                      setSelectedStateIso("");
                      const c = Country.getCountryByCode(iso);
                      if (c) setAddress(`${c.name},`);
                      else setAddress("");
                    }}
                  >
                    <SelectTrigger className="mt-1"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      {Country.getAllCountries().map((c) => (
                        <SelectItem key={c.isoCode} value={c.isoCode}>
                          {getLocalizedName(c.name, lang.startsWith("ar") ? "ar" : "en")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1 font-semibold">
                    {patient.address ? getLocalizedName(patient.address.split(',')[0], lang.startsWith("ar") ? "ar" : "en") : "—"}
                  </div>
                )}
              </div>
              <div>
                <Label>{t("auth.governorate", "المحافظة")}</Label>
                {editing ? (
                  <Select
                    value={selectedStateIso}
                    onValueChange={(iso) => {
                      setSelectedStateIso(iso);
                      const c = Country.getCountryByCode(selectedCountryIso);
                      const s = State.getStateByCodeAndCountry(iso, selectedCountryIso);
                      if (c && s) {
                        setAddress(`${c.name},${s.name}`);
                      }
                    }}
                    disabled={!selectedCountryIso}
                  >
                    <SelectTrigger className="mt-1"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      {selectedCountryIso && State.getStatesOfCountry(selectedCountryIso).map((s) => (
                        <SelectItem key={s.isoCode} value={s.isoCode}>
                          {getLocalizedName(s.name, lang.startsWith("ar") ? "ar" : "en")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1 font-semibold">
                    {patient.address && patient.address.split(',')[1] ? getLocalizedName(patient.address.split(',')[1], lang.startsWith("ar") ? "ar" : "en") : "—"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Medical */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">
            {t("patient.medicalInfo")}
          </h3>
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {ChronicConditionList.filter((c) => !c.femaleOnly || showFemaleOnly).map((c) => (
                  <label key={c.value} className="flex items-center gap-2 rounded-md border border-border p-2 cursor-pointer hover:bg-accent/5">
                    <Checkbox
                      checked={conditions.includes(c.value)}
                      onCheckedChange={(checked) => {
                        setConditions((prev) =>
                          checked ? [...prev, c.value] : prev.filter((v) => v !== c.value)
                        );
                      }}
                    />
                    <span className="text-sm">{t(`conditions.${c.key}`)}</span>
                  </label>
                ))}
              </div>
              <div>
                <Label>{t("auth.otherConditions")}</Label>
                <Textarea className="mt-1" rows={3} value={otherConditions} onChange={(e) => setOtherConditions(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {flagsToArray(patient.chronicConditions, allFlags).map((v) => {
                  const c = ChronicConditionList.find((x) => x.value === v)!;
                  return <Badge key={v} variant="secondary">{t(`conditions.${c.key}`)}</Badge>;
                })}
                {patient.chronicConditions === 0 && (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
              {patient.otherConditions && (
                <p className="text-sm text-muted-foreground">{patient.otherConditions}</p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
