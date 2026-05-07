import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, User as UserIcon, Calendar, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { NotFoundBlock } from "@/components/shared/NotFoundBlock";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { useFetch } from "@/hooks/useFetch";
import { adminApi } from "@/api/admin.api";
import { formatDate } from "@/utils/format";

/**
 * Admin → user details (read-only).
 *
 * Backend currently exposes user mutations as create + role assignment only;
 * we surface what the API provides so admins can audit a record without
 * needing a new endpoint.
 */
export default function AdminUserDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const userQ = useFetch(
    () => (id ? adminApi.getUser(id) : Promise.resolve(null as never)),
    [id]
  );

  return (
    <div className="container py-8 max-w-3xl space-y-4">
      <Breadcrumbs
        items={[
          { label: t("admin.dashboard"), to: "/admin/dashboard" },
          { label: t("admin.users"), to: "/admin/users" },
          { label: t("admin.userDetails") },
        ]}
      />

      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/admin/users">
          <ArrowLeft className="h-4 w-4 me-1 rtl-flip" />
          {t("admin.users")}
        </Link>
      </Button>

      {userQ.loading && <LoadingSpinner fullPage />}
      <ErrorMessage message={userQ.error} />

      {!userQ.loading && !userQ.error && !userQ.data && (
        <NotFoundBlock backTo="/admin/users" backLabel={t("admin.users")} />
      )}

      {userQ.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
                <UserIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-bold truncate">{userQ.data.fullName}</div>
                <div className="text-xs text-muted-foreground font-normal">
                  @{userQ.data.username}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                {t(`roles.${userQ.data.role}`)}
              </Badge>
              {userQ.data.isActive ? (
                <Badge className="bg-success/10 text-success border-success/30">
                  {t("status.active")}
                </Badge>
              ) : (
                <Badge variant="outline">{t("status.inactive")}</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                icon={<Mail className="h-4 w-4" />}
                label={t("auth.email")}
                value={userQ.data.email ?? "—"}
              />
              <Field
                icon={<Calendar className="h-4 w-4" />}
                label={t("admin.createdAt")}
                value={
                  userQ.data.createdAt ? formatDate(userQ.data.createdAt, i18n.language as "ar" | "en") : "—"
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Single labelled read-only field. */
function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-0.5">
        {icon}
        {label}
      </div>
      <div className="font-medium truncate" dir="auto">
        {value}
      </div>
    </div>
  );
}
