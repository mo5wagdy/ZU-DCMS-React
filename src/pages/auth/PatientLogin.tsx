import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { authApi } from "@/api/auth.api";
import { useAuth } from "@/hooks/useAuth";
import { homeForRole } from "@/utils/roles";
import { toEnglishDigits } from "@/utils/format";

const schema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, { message: "رقم الهاتف غير صحيح" }),
  identityNumber: z.string().trim().min(6, { message: "رقم الهوية مطلوب" }).max(20),
});
type FormVals = z.infer<typeof schema>;

export default function PatientLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showId, setShowId] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormVals>({ resolver: zodResolver(schema) });

  const onSubmit = async (vals: FormVals) => {
    setError(null);
    try {
      const data = await authApi.login({ 
        dto: { 
          phoneNumber: toEnglishDigits(vals.phoneNumber), 
          identityNumber: toEnglishDigits(vals.identityNumber) 
        } 
      });
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role,
        userId: (data as any).userId,
        fullName: (data as any).fullName,
      });
      toast.success(t("auth.loginSuccess"));
      const redirect = params.get("redirect") || data.redirectUrl || homeForRole(data.role);
      navigate(redirect, { replace: true });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <AuthLayout
      title={t("auth.patientLogin")}
      footer={
        <div className="space-y-2">
          <div>
            <Link
              to="/auth/forgot-phone"
              className="text-primary hover:underline font-medium"
            >
              {t("auth.forgotPhone")}
            </Link>
          </div>
          <div className="text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link to="/auth/register" className="text-primary hover:underline font-semibold">
              {t("auth.registerNow")}
            </Link>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="phone">{t("auth.phone")}</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            dir="ltr"
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
            {...register("phoneNumber")}
            className="mt-1"
          />
          {errors.phoneNumber && (
            <p className="text-xs text-destructive mt-1">{t(errors.phoneNumber.message!)}</p>
          )}
        </div>
        <div>
          <Label htmlFor="identity">{t("auth.identityPasswordHint")}</Label>
          <div className="relative mt-1">
            <Input
              id="identity"
              type={showId ? "text" : "password"}
              autoComplete="current-password"
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
          {errors.identityNumber && (
            <p className="text-xs text-destructive mt-1">{t(errors.identityNumber.message!)}</p>
          )}
        </div>
        <ErrorMessage message={error} />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
          {t("auth.loginBtn")}
        </Button>
      </form>
    </AuthLayout>
  );
}
