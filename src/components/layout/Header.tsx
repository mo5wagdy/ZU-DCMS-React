import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { homeForRole } from "@/utils/roles";

interface HeaderProps {
  showSidebarTrigger?: boolean;
}

export function Header({ showSidebarTrigger = false }: HeaderProps) {
  const { t } = useTranslation();
  const { isAuthenticated, role, fullName, clearAuth } = useAuth();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const homeUrl = homeForRole(role);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {showSidebarTrigger && <SidebarTrigger />}
          <Link to={homeUrl} className="flex items-center gap-3 group min-w-0">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-primary-foreground font-bold text-sm shadow-card shrink-0">
              ZU
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="text-sm font-bold leading-tight text-foreground truncate">
                {t("app.name")}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {t("app.faculty")}
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[140px] truncate">
                    {fullName || t(`roles.${role}`)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="text-xs text-muted-foreground">
                    {t(`roles.${role}`)}
                  </div>
                  <div className="font-semibold">{fullName}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 me-2" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link to="/auth/login">{t("landing.login")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
