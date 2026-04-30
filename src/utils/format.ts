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
  if (!time) return "";
  return time.slice(0, 5);
}

export function formatTime12h(time: string, lang: "ar" | "en" = "ar"): string {
  if (!time) return "";
  try {
    const parts = time.split(":");
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? (lang === "ar" ? "م" : "PM") : (lang === "ar" ? "ص" : "AM");
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  } catch {
    return time.slice(0, 5);
  }
}

export function formatSessionRange(startTime: string, endTime: string, lang: "ar" | "en" = "ar"): string {
  if (!startTime || !endTime) return "";
  const start = formatTime12h(startTime, lang);
  const end = formatTime12h(endTime, lang);
  if (lang === "ar") {
    return `من ${start} إلى ${end}`;
  }
  return `${start} – ${end}`;
}

export function formatPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
