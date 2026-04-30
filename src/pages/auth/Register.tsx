import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { authApi } from "@/api/auth.api";
import { useAuth } from "@/hooks/useAuth";
import { ChronicConditionList, Gender, IdentityType, arrayToFlags } from "@/utils/enum";
import { useRTL } from "@/hooks/useRTL";
import { Country, State } from "country-state-city";

const ARABIC_MAPPING: Record<string, string> = {
  "Egypt": "مصر",
  "Al Daqahliyah": "الدقهلية",
  "Al Bahr al Ahmar": "البحر الأحمر",
  "Al Buhayrah": "البحيرة",
  "Al Fayyum": "الفيوم",
  "Al Gharbiyah": "الغربية",
  "Al Iskandariyah": "الإسكندرية",
  "Al Isma'iliyah": "الإسماعيلية",
  "Al Jizah": "الجيزة",
  "Al Minufiyah": "المنوفية",
  "Al Minya": "المنيا",
  "Al Qahirah": "القاهرة",
  "Al Qalyubiyah": "القليوبية",
  "Al Wadi al Jadid": "الوادي الجديد",
  "As Suways": "السويس",
  "Ash Sharqiyah": "الشرقية",
  "Aswan": "أسوان",
  "Asyut": "أسيوط",
  "Bani Suwayf": "بني سويف",
  "Bur Sa'id": "بورسعيد",
  "Dumyat": "دمياط",
  "Janub Sina'": "جنوب سيناء",
  "Kafr ash Shaykh": "كفر الشيخ",
  "Matruh": "مطروح",
  "Qina": "قنا",
  "Shimal Sina'": "شمال سيناء",
  "Suhaj": "سوهاج",
  "Luxor": "الأقصر",
};

const schema = z
  .object({
    fullName: z.string().trim().min(3, { message: "الاسم قصير" }).max(100),
    username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/, { message: "اسم المستخدم غير صالح" }),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{10,15}$/, { message: "رقم تليفون غير صحيح" }),
    identityType: z.coerce.number(),
    identityNumber: z.string().trim().min(6).max(20),
    dateOfBirth: z.string().refine((d) => {
      const dt = new Date(d);
      const age = (Date.now() - dt.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 1 && age <= 120;
    }, { message: "تاريخ ميلاد غير صحيح" }),
    gender: z.coerce.number(),
    address: z.string().trim().refine((v) => !v || v.includes(","), {
      message: "الصيغة: الدولة,المحافظة",
    }).optional().or(z.literal("")),
    email: z.string().trim().email().optional().or(z.literal("")),
    chronicConditions: z.array(z.number()).default([]),
    otherConditions: z.string().max(500).optional().or(z.literal("")),
  });
type FormVals = z.infer<typeof schema>;

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const isRTL = useRTL();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCountryIso, setSelectedCountryIso] = useState<string>("EG");
  const [selectedStateIso, setSelectedStateIso] = useState<string>("");
  const [showId, setShowId] = useState(false);

  const Prev = isRTL ? ArrowRight : ArrowLeft;
  const Next = isRTL ? ArrowLeft : ArrowRight;

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: {
      identityType: 0,
      gender: 0,
      chronicConditions: [],
    },
    mode: "onTouched",
  });

  const gender = watch("gender");
  const conditions = watch("chronicConditions") || [];

  const goNext = async () => {
    const fields: (keyof FormVals)[][] = [
      [],
      ["fullName", "username", "phoneNumber", "identityType", "identityNumber", "dateOfBirth", "gender"],
      ["address", "email"],
      ["chronicConditions", "otherConditions"],
    ];
    const ok = await trigger(fields[step]);
    if (ok) setStep((s) => Math.min(3, s + 1));
  };

  const onSubmit = async (vals: FormVals) => {
    setError(null);
    try {
      const data = await authApi.register({
        dto: {
          fullName: vals.fullName,
          username: vals.username,
          phoneNumber: vals.phoneNumber,
          identityType: vals.identityType,
          identityNumber: vals.identityNumber,
          dateOfBirth: new Date(vals.dateOfBirth).toISOString(),
          gender: vals.gender,
          address: vals.address || undefined,
          email: vals.email || undefined,
          chronicConditions: arrayToFlags(vals.chronicConditions),
          otherConditions: vals.otherConditions || undefined,
        }
      });
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role,
        userId: (data as any).userId,
        fullName: vals.fullName,
      });
      toast.success(t("auth.registerSuccess"));
      navigate(data.redirectUrl || "/patient/dashboard", { replace: true });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <AuthLayout
      title={t("auth.register")}
      subtitle={`${t("auth.step")} ${step} / 3`}
      footer={
        <span className="text-muted-foreground">
          {t("auth.haveAccount")}{" "}
          <Link to="/auth/login" className="text-primary hover:underline font-semibold">
            {t("auth.loginNow")}
          </Link>
        </span>
      }
    >
      <Progress value={(step / 3) * 100} className="mb-6 h-1.5" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-foreground">{t("auth.basicInfo")}</h3>
            <div>
              <Label>{t("auth.fullName")}</Label>
              <Input className="mt-1" {...register("fullName")} />
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label>{t("auth.username")}</Label>
              <Input className="mt-1" dir="ltr" {...register("username")} />
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <Label>{t("auth.phone")}</Label>
              <Input className="mt-1" dir="ltr" type="tel" placeholder="01XXXXXXXXX" {...register("phoneNumber")} />
              {errors.phoneNumber && <p className="text-xs text-destructive mt-1">{errors.phoneNumber.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("auth.identityType")}</Label>
                <Controller
                  control={control}
                  name="identityType"
                  render={({ field }) => (
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={String(IdentityType.NationalId)}>{t("identityType.1")}</SelectItem>
                        <SelectItem value={String(IdentityType.Passport)}>{t("identityType.2")}</SelectItem>
                        <SelectItem value={String(IdentityType.ResidencePermit)}>{t("identityType.3")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label>{t("auth.identityNumber")}</Label>
                <div className="relative mt-1">
                  <Input
                    dir="ltr"
                    type={showId ? "text" : "password"}
                    {...register("identityNumber")}
                    className="pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowId(!showId)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {watch("identityType") === IdentityType.NationalId && (
                  <p className="text-[10px] text-accent mt-1">يجب إدخال 14 رقم صحيح</p>
                )}
              </div>
            </div>
            {errors.identityNumber && <p className="text-xs text-destructive">{errors.identityNumber.message}</p>}
            <p className="text-[11px] text-muted-foreground">{t("auth.willBeUsedAsPassword")}</p>

            <div>
              <Label>{t("auth.dateOfBirth")}</Label>
              <Input className="mt-1" type="date" {...register("dateOfBirth")} />
              {errors.dateOfBirth && <p className="text-xs text-destructive mt-1">{errors.dateOfBirth.message}</p>}
            </div>
            <div>
              <Label>{t("auth.gender")}</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <RadioGroup
                    className="flex gap-4 mt-2"
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value={String(Gender.Male)} id="g-m" />
                      <span>{t("gender.1")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value={String(Gender.Female)} id="g-f" />
                      <span>{t("gender.2")}</span>
                    </label>
                  </RadioGroup>
                )}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-foreground">{t("auth.additionalInfo")}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{t("auth.country")}</Label>
                <Select
                  value={selectedCountryIso}
                  onValueChange={(iso) => {
                    setSelectedCountryIso(iso);
                    setSelectedStateIso("");
                    const c = Country.getCountryByCode(iso);
                    if (c) setValue("address", `${c.name},`, { shouldValidate: true });
                    else setValue("address", "", { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="mt-1"><SelectValue placeholder="..." /></SelectTrigger>
                  <SelectContent>
                    {Country.getAllCountries().map((c) => (
                      <SelectItem key={c.isoCode} value={c.isoCode}>
                        {ARABIC_MAPPING[c.name] || c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("auth.governorate")}</Label>
                <Select
                  value={selectedStateIso}
                  onValueChange={(iso) => {
                    setSelectedStateIso(iso);
                    const c = Country.getCountryByCode(selectedCountryIso);
                    const s = State.getStateByCodeAndCountry(iso, selectedCountryIso);
                    if (c && s) {
                      setValue("address", `${c.name},${s.name}`, { shouldValidate: true });
                    }
                  }}
                  disabled={!selectedCountryIso}
                >
                  <SelectTrigger className="mt-1"><SelectValue placeholder="..." /></SelectTrigger>
                  <SelectContent>
                    {selectedCountryIso && State.getStatesOfCountry(selectedCountryIso).map((s) => (
                      <SelectItem key={s.isoCode} value={s.isoCode}>
                        {ARABIC_MAPPING[s.name] || s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
            <div>
              <Label>{t("auth.email")} <span className="text-muted-foreground text-xs">({t("common.optional")})</span></Label>
              <Input className="mt-1" type="email" dir="ltr" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-foreground">{t("auth.healthStatus")}</h3>
            <div>
              <Label>{t("auth.chronicConditions")}</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {ChronicConditionList.filter((c) => !c.femaleOnly || gender === Gender.Female).map((c) => (
                  <label
                    key={c.value}
                    className="flex items-center gap-2 rounded-md border border-border p-2 cursor-pointer hover:bg-accent/5"
                  >
                    <Checkbox
                      checked={conditions.includes(c.value)}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...conditions, c.value]
                          : conditions.filter((v) => v !== c.value);
                        setValue("chronicConditions", next);
                      }}
                    />
                    <span className="text-sm">{t(`conditions.${c.key}`)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>{t("auth.otherConditions")} <span className="text-muted-foreground text-xs">({t("common.optional")})</span></Label>
              <Textarea className="mt-1" rows={3} maxLength={500} {...register("otherConditions")} />
            </div>
          </div>
        )}

        <ErrorMessage message={error} />

        <div className="flex justify-between pt-2 gap-3">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              <Prev className="h-4 w-4 me-1" /> {t("common.previous")}
            </Button>
          ) : <span />}

          {step < 3 ? (
            <Button type="button" onClick={goNext}>
              {t("common.next")} <Next className="h-4 w-4 ms-1" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t("auth.registerBtn")}
            </Button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
