import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export function formatDate(date: string | Date, lang: "ar" | "en" = "ar"): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "d MMMM yyyy", { locale: lang === "ar" ? ar : enUS });
  } catch {
    return String(date);
  }
}

export function formatTime(time: string): string {
  // "09:00:00" -> "09:00"
  if (!time) return "";
  return time.slice(0, 5);
}

export function formatPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
