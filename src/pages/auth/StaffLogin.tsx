import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { authApi } from "@/api/auth.api";
import { useAuth } from "@/hooks/useAuth";
import { homeForRole } from "@/utils/roles";

const schema = z.object({
  email: z.string().trim().email({ message: "بريد إلكتروني غير صحيح" }),
  password: z.string().min(6, { message: "كلمة المرور قصيرة" }),
});
type FormVals = z.infer<typeof schema>;

export default function StaffLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormVals>({ resolver: zodResolver(schema) });

  const onSubmit = async (vals: FormVals) => {
    setError(null);
    try {
      const data = await authApi.staffLogin({ dto: { email: vals.email, password: vals.password } });
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role,
        userId: (data as any).userId,
        fullName: (data as any).fullName,
      });
      toast.success(t("auth.loginSuccess"));
      navigate(data.redirectUrl || homeForRole(data.role), { replace: true });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <AuthLayout
      title={t("auth.staffLogin")}
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            {...register("email")}
            className="mt-1"
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{t(errors.email.message!)}</p>}
        </div>
        <div>
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="mt-1"
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{t(errors.password.message!)}</p>
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
