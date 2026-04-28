import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Users as UsersIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Pagination } from "@/components/shared/Pagination";
import { adminApi } from "@/api/admin.api";
import { CreatableRoles } from "@/utils/roles";
import { formatDate } from "@/utils/format";
import type { PagedResult, StaffUsersDto } from "@/types";

const userSchema = z.object({
  fullName: z.string().trim().min(3, "min 3"),
  username: z.string().trim().min(3, "min 3"),
  email: z.string().trim().email("invalid"),
  phoneNumber: z.string().trim().min(5, "required"),
  role: z.string().min(1, "required"),
  academicYear: z.coerce.number().int().min(1).max(5).optional(),
});
type UserForm = z.infer<typeof userSchema>;

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [role, setRole] = useState<string>("");
  const [data, setData] = useState<PagedResult<StaffUsersDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminApi
      .getUsers(
        {
          page,
          pageSize: PAGE_SIZE,
          searchTerm: search || undefined,
          sortDescending: true,
          sortBy: "createdAt",
        },
        role || undefined
      )
      .then((d) => mounted && setData(d ?? null))
      .catch((e) => mounted && setError((e as Error).message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page, search, role, reload]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="container py-8 max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-card">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("admin.users")}</h1>
            <p className="text-sm text-muted-foreground">{t("admin.totalUsers")}: {data?.totalCount ?? 0}</p>
          </div>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 me-1" /> {t("admin.addUser")}
            </Button>
          </DialogTrigger>
          <CreateUserDialog
            onCreated={() => {
              setOpenCreate(false);
              setReload((r) => r + 1);
            }}
          />
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("common.filter")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onSearch}
            className="grid grid-cols-1 sm:grid-cols-[1fr_220px_auto] gap-2"
          >
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("common.search")}
                className="ps-9"
              />
            </div>
            <Select
              value={role || "__all"}
              onValueChange={(v) => {
                setPage(1);
                setRole(v === "__all" ? "" : v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("admin.filterByRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">{t("admin.allRoles")}</SelectItem>
                {CreatableRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`roles.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline">
              {t("common.search")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading && <LoadingSpinner />}
          <ErrorMessage message={error} />
          {!loading && data && data.items.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">{t("admin.noUsers")}</div>
          )}
          {!loading && data && data.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="text-start py-2 px-2">{t("common.name")}</th>
                    <th className="text-start py-2 px-2 hidden md:table-cell">
                      {t("auth.username")}
                    </th>
                    <th className="text-start py-2 px-2 hidden md:table-cell">
                      {t("auth.email")}
                    </th>
                    <th className="text-start py-2 px-2">{t("common.role")}</th>
                    <th className="text-start py-2 px-2 hidden sm:table-cell">
                      {t("admin.isActive")}
                    </th>
                    <th className="text-start py-2 px-2 hidden lg:table-cell">
                      {t("admin.createdAt")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                    >
                      <td className="py-2.5 px-2 font-medium">{u.fullName}</td>
                      <td className="py-2.5 px-2 hidden md:table-cell text-muted-foreground">
                        {u.username}
                      </td>
                      <td className="py-2.5 px-2 hidden md:table-cell text-muted-foreground">
                        {u.email ?? "—"}
                      </td>
                      <td className="py-2.5 px-2">
                        <Badge variant="outline">{t(`roles.${u.role}`)}</Badge>
                      </td>
                      <td className="py-2.5 px-2 hidden sm:table-cell">
                        {u.isActive ? (
                          <Badge className="bg-success/10 text-success border-success/30">
                            {t("status.active")}
                          </Badge>
                        ) : (
                          <Badge variant="outline">{t("status.inactive")}</Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-2 hidden lg:table-cell text-muted-foreground">
                        {u.createdAt ? formatDate(u.createdAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateUserDialog({ onCreated }: { onCreated: () => void }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserForm>({ resolver: zodResolver(userSchema) });
  const [error, setError] = useState<string | null>(null);

  const role = watch("role");
  const showAcademicYear = role === "Student";

  const onSubmit = async (vals: UserForm) => {
    setError(null);
    try {
      await adminApi.createUser({
        dto: {
          username: vals.username,
          fullName: vals.fullName,
          email: vals.email,
          phoneNumber: vals.phoneNumber,
          role: vals.role,
          academicYear: showAcademicYear ? vals.academicYear : undefined,
        }
      });
      toast.success(t("admin.userCreated"));
      reset();
      onCreated();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>{t("admin.createUser")}</DialogTitle>
        <DialogDescription>{t("admin.passwordWillBeSent")}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <Field
          id="fullName"
          label={t("auth.fullName")}
          error={errors.fullName?.message}
        >
          <Input id="fullName" {...register("fullName")} />
        </Field>
        <Field
          id="username"
          label={t("auth.username")}
          error={errors.username?.message}
        >
          <Input id="username" dir="ltr" {...register("username")} />
        </Field>
        <Field id="email" label={t("auth.email")} error={errors.email?.message}>
          <Input id="email" type="email" dir="ltr" {...register("email")} />
        </Field>
        <Field id="phoneNumber" label={t("auth.phone")} error={errors.phoneNumber?.message}>
          <Input id="phoneNumber" dir="ltr" {...register("phoneNumber")} />
        </Field>
        <Field id="role" label={t("common.role")} error={errors.role?.message}>
          <Select onValueChange={(v) => setValue("role", v, { shouldValidate: true })}>
            <SelectTrigger id="role">
              <SelectValue placeholder={t("common.role")} />
            </SelectTrigger>
            <SelectContent>
              {CreatableRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {t(`roles.${r}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {showAcademicYear && (
          <Field
            id="academicYear"
            label={t("admin.academicYear")}
            hint={t("admin.academicYearHint")}
            error={errors.academicYear?.message}
          >
            <Input
              id="academicYear"
              type="number"
              min={1}
              max={5}
              {...register("academicYear")}
            />
          </Field>
        )}
        <ErrorMessage message={error} />
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            {t("admin.createUser")}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">{children}</div>
      {hint && !error && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
