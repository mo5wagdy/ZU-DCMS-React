import { create } from "zustand";
import i18n from "@/i18n";

interface UIState {
  language: "ar" | "en";
  isRTL: boolean;
  setLanguage: (lang: "ar" | "en") => void;
}

export const useUIStore = create<UIState>((set) => ({
  language: (i18n.language as "ar" | "en") || "ar",
  isRTL: (i18n.language || "ar") === "ar",
  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang, isRTL: lang === "ar" });
  },
}));
