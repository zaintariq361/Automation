"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES, LANGUAGE_LABELS, SupportedLanguage } from "@conviyo/shared";

const LOCALE_KEY = "conviyo_locale";

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    "nav.overview": "Overview",
    "nav.inbox": "Inbox",
    "nav.knowledgeBase": "Knowledge Base",
    "nav.catalog": "Catalog",
    "nav.analytics": "Analytics",
    "nav.integrations": "Integrations",
    "nav.team": "Team",
    "nav.signOut": "Sign out",

    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.send": "Send",
    "common.add": "Add",
    "common.delete": "Delete",
    "common.loading": "Loading…",
    "common.connect": "Connect",
    "common.testConnection": "Test connection",
    "common.continue": "Continue",
    "common.back": "Back",
    "common.finish": "Finish setup",
    "common.getStarted": "Get started",

    "landing.badge": "Built for Pakistan & Saudi Arabia",
    "landing.hero.title": "Turn WhatsApp into your best sales rep",
    "landing.hero.subtitle":
      "Conviyo answers customer questions, recommends products, and closes sales — all inside WhatsApp, Instagram, and Messenger. No app to download, no website to visit.",
    "landing.hero.ctaPrimary": "Start free trial",
    "landing.hero.ctaSecondary": "Sign in",
    "landing.usecases.title": "Built for how you actually sell",
    "landing.footer.tagline": "Conversational commerce for restaurants, retail, real estate, logistics, and services.",

    "auth.signIn": "Sign in",
    "auth.signUp": "Create your workspace",
    "auth.email": "Email",
    "auth.password": "Password",

    "onboarding.step1.title": "What kind of business do you run?",
    "onboarding.step1.subtitle": "We'll set up starter content matched to your industry — you can change everything later.",
    "onboarding.step2.title": "What language should your AI agent reply in by default?",
    "onboarding.step2.subtitle": "The agent will still automatically match whatever language a customer writes in.",
    "onboarding.step3.title": "You're all set",
    "onboarding.step3.subtitle": "We've created starter knowledge base articles and sample products for you.",

    "overview.title": "Overview",
    "overview.checklist.title": "Get set up",
    "overview.checklist.whatsapp": "Connect WhatsApp",
    "overview.checklist.products": "Add your products",
    "overview.checklist.knowledge": "Add a knowledge base article",
    "overview.checklist.team": "Invite your team",
  },
  ur: {
    "nav.overview": "جائزہ",
    "nav.inbox": "ان باکس",
    "nav.knowledgeBase": "نالج بیس",
    "nav.catalog": "کیٹلاگ",
    "nav.analytics": "تجزیات",
    "nav.integrations": "انٹیگریشنز",
    "nav.team": "ٹیم",
    "nav.signOut": "سائن آؤٹ",

    "common.save": "محفوظ کریں",
    "common.cancel": "منسوخ کریں",
    "common.send": "بھیجیں",
    "common.add": "شامل کریں",
    "common.delete": "حذف کریں",
    "common.loading": "لوڈ ہو رہا ہے…",
    "common.connect": "منسلک کریں",
    "common.testConnection": "کنکشن ٹیسٹ کریں",
    "common.continue": "جاری رکھیں",
    "common.back": "پیچھے",
    "common.finish": "سیٹ اپ مکمل کریں",
    "common.getStarted": "شروع کریں",

    "landing.badge": "پاکستان اور سعودی عرب کے لیے تیار کیا گیا",
    "landing.hero.title": "واٹس ایپ کو اپنا بہترین سیلز نمائندہ بنائیں",
    "landing.hero.subtitle":
      "Conviyo گاہکوں کے سوالات کے جواب دیتا ہے، مصنوعات تجویز کرتا ہے، اور آرڈر مکمل کرتا ہے — یہ سب واٹس ایپ، انسٹاگرام اور میسنجر کے اندر۔ کوئی ایپ ڈاؤن لوڈ کرنے کی ضرورت نہیں، کوئی ویب سائٹ دیکھنے کی ضرورت نہیں۔",
    "landing.hero.ctaPrimary": "مفت ٹرائل شروع کریں",
    "landing.hero.ctaSecondary": "سائن ان کریں",
    "landing.usecases.title": "آپ کے کاروبار کے مطابق بنایا گیا",
    "landing.footer.tagline": "ریستوران، ریٹیل، رئیل اسٹیٹ، لاجسٹکس اور سروسز کے لیے کنورسیشنل کامرس۔",

    "auth.signIn": "سائن ان",
    "auth.signUp": "اپنا ورک اسپیس بنائیں",
    "auth.email": "ای میل",
    "auth.password": "پاس ورڈ",

    "onboarding.step1.title": "آپ کا کاروبار کس نوعیت کا ہے؟",
    "onboarding.step1.subtitle": "ہم آپ کی صنعت کے مطابق ابتدائی مواد تیار کریں گے — آپ بعد میں سب کچھ تبدیل کر سکتے ہیں۔",
    "onboarding.step2.title": "آپ کا AI ایجنٹ بطور ڈیفالٹ کس زبان میں جواب دے؟",
    "onboarding.step2.subtitle": "ایجنٹ پھر بھی خودکار طور پر گاہک کی زبان میں جواب دے گا۔",
    "onboarding.step3.title": "سب کچھ تیار ہے",
    "onboarding.step3.subtitle": "ہم نے آپ کے لیے ابتدائی نالج بیس مضامین اور نمونہ مصنوعات بنا دی ہیں۔",

    "overview.title": "جائزہ",
    "overview.checklist.title": "سیٹ اپ مکمل کریں",
    "overview.checklist.whatsapp": "واٹس ایپ منسلک کریں",
    "overview.checklist.products": "اپنی مصنوعات شامل کریں",
    "overview.checklist.knowledge": "نالج بیس مضمون شامل کریں",
    "overview.checklist.team": "اپنی ٹیم کو مدعو کریں",
  },
  ar: {
    "nav.overview": "نظرة عامة",
    "nav.inbox": "صندوق الوارد",
    "nav.knowledgeBase": "قاعدة المعرفة",
    "nav.catalog": "الكتالوج",
    "nav.analytics": "التحليلات",
    "nav.integrations": "التكاملات",
    "nav.team": "الفريق",
    "nav.signOut": "تسجيل الخروج",

    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.send": "إرسال",
    "common.add": "إضافة",
    "common.delete": "حذف",
    "common.loading": "جارٍ التحميل…",
    "common.connect": "ربط",
    "common.testConnection": "اختبار الاتصال",
    "common.continue": "متابعة",
    "common.back": "رجوع",
    "common.finish": "إنهاء الإعداد",
    "common.getStarted": "ابدأ الآن",

    "landing.badge": "مصمم لباكستان والمملكة العربية السعودية",
    "landing.hero.title": "حوّل واتساب إلى أفضل مندوب مبيعات لديك",
    "landing.hero.subtitle":
      "يجيب Conviyo على أسئلة العملاء، ويقترح المنتجات، ويُتمّم عمليات البيع — كل ذلك داخل واتساب وإنستغرام وماسنجر. لا حاجة لتحميل تطبيق أو زيارة موقع إلكتروني.",
    "landing.hero.ctaPrimary": "ابدأ التجربة المجانية",
    "landing.hero.ctaSecondary": "تسجيل الدخول",
    "landing.usecases.title": "مصمم بحسب طريقة عملك",
    "landing.footer.tagline": "تجارة عبر المحادثة للمطاعم والتجزئة والعقارات والخدمات اللوجستية والخدمات.",

    "auth.signIn": "تسجيل الدخول",
    "auth.signUp": "أنشئ مساحة العمل الخاصة بك",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",

    "onboarding.step1.title": "ما نوع عملك؟",
    "onboarding.step1.subtitle": "سنقوم بإعداد محتوى ابتدائي يناسب مجال عملك — يمكنك تغيير كل شيء لاحقًا.",
    "onboarding.step2.title": "بأي لغة يرد وكيل الذكاء الاصطناعي افتراضيًا؟",
    "onboarding.step2.subtitle": "سيستمر الوكيل في مطابقة لغة العميل تلقائيًا مهما كتب.",
    "onboarding.step3.title": "كل شيء جاهز",
    "onboarding.step3.subtitle": "لقد أنشأنا لك مقالات قاعدة معرفة ابتدائية ومنتجات نموذجية.",

    "overview.title": "نظرة عامة",
    "overview.checklist.title": "أكمل الإعداد",
    "overview.checklist.whatsapp": "ربط واتساب",
    "overview.checklist.products": "أضف منتجاتك",
    "overview.checklist.knowledge": "أضف مقالة لقاعدة المعرفة",
    "overview.checklist.team": "ادعُ فريقك",
  },
};

interface I18nContextValue {
  locale: SupportedLanguage;
  setLocale: (locale: SupportedLanguage) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_KEY) as SupportedLanguage | null;
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) setLocaleState(stored);
  }, []);

  useEffect(() => {
    const dir = RTL_LANGUAGES.includes(locale) ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  function setLocale(next: SupportedLanguage) {
    window.localStorage.setItem(LOCALE_KEY, next);
    setLocaleState(next);
  }

  function t(key: string): string {
    return translations[locale][key] ?? translations.en[key] ?? key;
  }

  const dir: "ltr" | "rtl" = RTL_LANGUAGES.includes(locale) ? "rtl" : "ltr";

  return <I18nContext.Provider value={{ locale, setLocale, t, dir }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export { LANGUAGE_LABELS, SUPPORTED_LANGUAGES };
export type { SupportedLanguage };
