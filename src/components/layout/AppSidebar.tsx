import { useTranslation } from "react-i18next";
import {
  Home,
  User,
  Calendar,
  Stethoscope,
  ClipboardList,
  GraduationCap,
  ListTodo,
  TrendingUp,
  ClipboardCheck,
  Users,
  CalendarDays,
  Settings2,
  ListChecks,
  ShieldCheck,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { patientApi } from "@/api/patient.api";

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

function itemsForRole(role: string | null): NavItem[] {
  const normalizedRole = role?.toLowerCase() || "";
  switch (normalizedRole) {
    case "patient":
      return [
        { to: "/patient/dashboard", labelKey: "patient.dashboard", icon: Home },
        { to: "/patient/bookings", labelKey: "patient.myBookings", icon: ClipboardList },
        { to: "/patient/profile", labelKey: "patient.profile", icon: User },
        { to: "/booking/new", labelKey: "booking.newAppointment", icon: Calendar },
        { to: "/booking/followup", labelKey: "booking.followUp", icon: Calendar },
      ];
    case "interndoctor":
      return [
        { to: "/intern/dashboard", labelKey: "intern.dashboard", icon: Home },
      ];
    case "student":
      return [
        { to: "/student/dashboard", labelKey: "student.dashboard", icon: Home },
        { to: "/student/cases", labelKey: "student.myCases", icon: ClipboardList },
        { to: "/student/progress", labelKey: "student.progress", icon: TrendingUp },
      ];
    case "teachingassistant":
      return [
        { to: "/ta/dashboard", labelKey: "ta.dashboard", icon: ClipboardCheck },
      ];
    case "admin":
      return [
        { to: "/admin/dashboard", labelKey: "admin.dashboard", icon: ShieldCheck },
        { to: "/admin/users", labelKey: "admin.users", icon: Users },
        { to: "/admin/terms", labelKey: "admin.terms", icon: CalendarDays },
        { to: "/admin/configs", labelKey: "admin.configs", icon: Settings2 },
        {
          to: "/admin/requirements",
          labelKey: "admin.requirements",
          icon: ListChecks,
        },
        { to: "/admin/clinics", labelKey: "admin.clinics", icon: Stethoscope },
        // Admins can also see view-only pages
        { to: "/view/students", labelKey: "view.students", icon: GraduationCap },
      ];
    case "dean":
    case "vicedean":
    case "professor":
      return [
        { to: "/view/dashboard", labelKey: "view.dashboard", icon: BarChart3 },
        { to: "/view/students", labelKey: "view.students", icon: GraduationCap },
      ];
    default:
      return [];
  }
}

export function AppSidebar() {
  const { t } = useTranslation();
  const { role, userId } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const patientQ = useFetch(
    () => (role?.toLowerCase() === "patient" && userId ? patientApi.byUserId(userId) : Promise.resolve(null as never)),
    [userId, role]
  );

  const canBook = !patientQ.data?.hasActiveBooking && !patientQ.data?.hasActiveCase;

  const rawItems = itemsForRole(role);
  const items = rawItems.filter(item => {
    if (item.to === "/booking/new" || item.to === "/booking/followup") {
      return canBook;
    }
    return true;
  });

  if (items.length === 0) return null;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel>
              {role ? t(`roles.${role}`) : ""}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <NavLink
                      to={item.to}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{t(item.labelKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
