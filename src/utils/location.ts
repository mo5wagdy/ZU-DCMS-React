export const ARABIC_MAPPING: Record<string, string> = {
  "Egypt": "مصر",
  "Al Daqahliyah": "الدقهلية",
  "Al Bahr al Ahmar": "البحر الأحمر",
  "Al Buhayrah": "البحيرة",
  "Al Fayyum": "الفيوم",
  "Al Gharbiyah": "الغربية",
  "Al Iskandariyah": "الإسكندرية",
  "Al Isma'iliyah": "الإسماعيلية",
  "Al Jizah": "الجيزة",
  "Al Minufiyah": "المنوفية",
  "Al Minya": "المنيا",
  "Al Qahirah": "القاهرة",
  "Al Qalyubiyah": "القليوبية",
  "Al Wadi al Jadid": "الوادي الجديد",
  "As Suways": "السويس",
  "Ash Sharqiyah": "الشرقية",
  "Aswan": "أسوان",
  "Asyut": "أسيوط",
  "Bani Suwayf": "بني سويف",
  "Bur Sa'id": "بورسعيد",
  "Dumyat": "دمياط",
  "Janub Sina'": "جنوب سيناء",
  "Kafr ash Shaykh": "كفر الشيخ",
  "Matruh": "مطروح",
  "Qina": "قنا",
  "Shimal Sina'": "شمال سيناء",
  "Suhaj": "سوهاج",
  "Luxor": "الأقصر",
};

export const getLocalizedName = (name: string, lang: string) => {
  if (lang === "ar") return ARABIC_MAPPING[name] || name;
  return name;
};
