import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Phone } from "lucide-react";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { authApi } from "@/api/auth.api";
import { IdentityType } from "@/utils/enum";

const schema = z.object({
  identityType: z.string(),
  identityNumber: z.string().trim().min(6, { message: "رقم الهوية مطلوب" }).max(20),
});
type FormVals = z.infer<typeof schema>;

const identityTypes = [
  { value: 1, labelAr: "رقم قومي", labelEn: "National ID" },
  { value: 2, labelAr: "جواز سفر", labelEn: "Passport" },
  { value: 3, labelAr: "رقم إقامة", labelEn: "Residence Permit" },
];

export default function ForgotPhone() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("ar") ? "ar" : "en";
  const [error, setError] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { identityType: "1" },
  });

  const onSubmit = async (vals: FormVals) => {
    setError(null);
    setMaskedPhone(null);
    try {
      const data = await authApi.forgotPhone(vals.identityNumber);
      setMaskedPhone(data.maskedPhoneNumber);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <AuthLayout
      title={t("auth.forgotPhone")}
      footer={
        <Link to="/auth/login" className="text-primary hover:underline">
          {t("auth.patientLogin")}
        </Link>
      }
    >
      {maskedPhone ? (
        <div className="text-center space-y-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success mx-auto">
            <Phone className="h-8 w-8" />
          </div>
          <p className="text-muted-foreground">{t("auth.recoveredPhone")}</p>
          <p dir="ltr" className="text-2xl font-bold text-primary tracking-wider">
            {maskedPhone}
          </p>
          <p className="text-xs text-muted-foreground">{t("auth.contactAdmin")}</p>
          <Button asChild className="w-full">
            <Link to="/auth/login">{t("auth.loginBtn")}</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label>{t("auth.identityType")}</Label>
            <Select
              defaultValue="1"
              onValueChange={(v) => setValue("identityType", v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {identityTypes.map((it) => (
                  <SelectItem key={it.value} value={String(it.value)}>
                    {lang === "ar" ? it.labelAr : it.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="idnum">{t("auth.identityNumber")}</Label>
            <Input
              id="idnum"
              type="text"
              dir="ltr"
              {...register("identityNumber")}
              className="mt-1"
            />
            {errors.identityNumber && (
              <p className="text-xs text-destructive mt-1">{errors.identityNumber.message}</p>
            )}
          </div>
          <ErrorMessage message={error} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            {t("common.confirm")}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
