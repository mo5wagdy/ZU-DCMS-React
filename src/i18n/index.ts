import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ar from "./ar.json";
import en from "./en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: "ar",
    supportedLngs: ["ar", "en"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "zudcms_lang",
    },
  });

// Apply dir on load + change
const applyDir = (lng: string) => {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  document.title = lng === "ar" ? "عيادات الأسنان - جامعة الزقازيق | ZU-DCMS" : "Dental Clinics - Zagazig University | ZU-DCMS";
};
applyDir(i18n.language || "ar");
i18n.on("languageChanged", applyDir);

export default i18n;
