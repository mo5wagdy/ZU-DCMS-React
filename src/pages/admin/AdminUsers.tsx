import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Users as UsersIcon, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
import { useUIStore } from "@/store/ui.store";
import { CreatableRoles } from "@/utils/roles";
import { formatDate } from "@/utils/format";
import { toEnglishDigits } from "@/utils/format";
import type { PagedResult, StaffUsersDto } from "@/types";

function SortIcon({ field, current, desc }: { field: string; current: string; desc: boolean }) {
  if (current !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  return desc ? <ArrowDown className="h-3 w-3 text-primary" /> : <ArrowUp className="h-3 w-3 text-primary" />;
}

const userSchema = z.object({
  fullName: z.string().trim().min(3, "min 3"),
  username: z.string().trim().min(3, "min 3").regex(/^[\u0600-\u06FFa-zA-Z0-9._-]+$/, "invalid"),
  email: z.string().trim().email("invalid"),
  phoneNumber: z.string().trim().min(5, "required"),
  password: z.string().min(8, "min 8"),
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
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDescending, setSortDescending] = useState(true);
  const { refreshTick } = useUIStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    adminApi
      .getUsers(
        {
          page,
          pageSize: PAGE_SIZE,
          searchTerm: search || undefined,
          sortDescending,
          sortBy,
        },
        role || undefined
      )
      .then((d) => mounted && setData(d ?? null))
      .catch((e) => mounted && setError((e as Error).message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page, search, role, reload, refreshTick, sortBy, sortDescending]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDescending(!sortDescending);
    } else {
      setSortBy(field);
      setSortDescending(true);
    }
    setPage(1);
  };

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
              useUIStore.getState().triggerRefresh();
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
          <div className="relative min-h-[400px]">
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-lg">
                <LoadingSpinner />
              </div>
            )}
            
            <ErrorMessage message={error} />
            
            {!loading && data && data.items.length === 0 && (
              <div className="py-24 text-center space-y-4 animate-in fade-in duration-500">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 border-2 border-dashed border-muted">
                  <Search className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <div className="space-y-2 max-w-xs mx-auto">
                  <h3 className="font-bold text-lg">{t("admin.noUsers")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {search || role 
                      ? t("common.noResultsFilter", "لم نجد مستخدمين يطابقون بحثك الحالي. جرب تغيير الفلتر أو كلمة البحث.") 
                      : t("admin.noUsersDescription", "لا يوجد مستخدمين مسجلين في النظام حالياً.")}
                  </p>
                </div>
              </div>
            )}

            {data && data.items.length > 0 && (
              <div className="animate-in fade-in duration-500">
                <div className="overflow-x-auto rounded-lg border border-border/50">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 text-xs text-muted-foreground border-b border-border">
                      <tr>
                        <th 
                          className="text-start py-4 px-4 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => toggleSort("fullname")}
                        >
                          <div className="flex items-center gap-1.5">
                            {t("common.name")}
                            <SortIcon field="fullname" current={sortBy} desc={sortDescending} />
                          </div>
                        </th>
                        <th className="text-start py-4 px-3 hidden md:table-cell cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("username")}>
                          <div className="flex items-center gap-1.5">
                            {t("auth.username")}
                            <SortIcon field="username" current={sortBy} desc={sortDescending} />
                          </div>
                        </th>
                        <th className="text-start py-4 px-3 hidden md:table-cell cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("email")}>
                          <div className="flex items-center gap-1.5">
                            {t("auth.email")}
                            <SortIcon field="email" current={sortBy} desc={sortDescending} />
                          </div>
                        </th>
                        <th className="text-start py-4 px-3 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("role")}>
                          <div className="flex items-center gap-1.5">
                            {t("common.role")}
                            <SortIcon field="role" current={sortBy} desc={sortDescending} />
                          </div>
                        </th>
                        <th className="text-start py-4 px-3 hidden sm:table-cell">
                          {t("admin.isActive")}
                        </th>
                        <th 
                          className="text-start py-4 px-4 hidden lg:table-cell cursor-pointer hover:text-primary transition-colors"
                          onClick={() => toggleSort("createdAt")}
                        >
                          <div className="flex items-center gap-1.5">
                            {t("admin.createdAt")}
                            <SortIcon field="createdAt" current={sortBy} desc={sortDescending} />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {data.items.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-muted/40 cursor-pointer transition-colors group"
                          onClick={() => navigate(`/admin/users/${u.id}`)}
                        >
                          <td className="py-3.5 px-4 font-medium group-hover:text-primary transition-colors">{u.fullName}</td>
                          <td className="py-3.5 px-3 hidden md:table-cell text-muted-foreground font-mono text-xs">
                            {u.username}
                          </td>
                          <td className="py-3.5 px-3 hidden md:table-cell text-muted-foreground">
                            {u.email ?? "—"}
                          </td>
                          <td className="py-3.5 px-3">
                            <Badge variant="secondary" className="font-normal">{t(`roles.${u.role}`)}</Badge>
                          </td>
                          <td className="py-3.5 px-3 hidden sm:table-cell">
                            {u.isActive ? (
                              <Badge className="bg-success/10 text-success border-success/30 hover:bg-success/20">
                                {t("status.active")}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="opacity-60">{t("status.inactive")}</Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-4 hidden lg:table-cell text-muted-foreground text-xs">
                            {u.createdAt ? formatDate(u.createdAt, i18n.language as "ar" | "en") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {data.totalPages > 1 && (
                  <div className="mt-6 flex justify-center sm:justify-end">
                    <Pagination
                      page={page}
                      totalPages={data.totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
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
          phoneNumber: toEnglishDigits(vals.phoneNumber),
          password: vals.password,
          role: vals.role,
          academicYear: showAcademicYear ? Number(toEnglishDigits(String(vals.academicYear))) : undefined,
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
        <Field id="password" label={t("auth.password")} error={errors.password?.message}>
          <Input id="password" type="password" dir="ltr" {...register("password")} />
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
