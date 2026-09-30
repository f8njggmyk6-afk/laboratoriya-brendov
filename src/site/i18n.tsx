import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";
type LanguageContextValue = { lang: Lang; setLang: (lang: Lang) => void; t: (ru: string, en: string) => string };

const LanguageContext = createContext<LanguageContextValue>({ lang: "ru", setLang: () => {}, t: (ru) => ru });

const detectLanguage = (): Lang => {
  if (typeof window === "undefined") return "ru";
  const saved = window.localStorage.getItem("lb-language");
  if (saved === "ru" || saved === "en") return saved;
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const prefersRussian = languages.some((value) => {
    const code = value.toLowerCase();
    return code.startsWith("ru") || code.startsWith("be") || code.startsWith("uk") || code.startsWith("kk") || code.startsWith("ky") || code.startsWith("uz") || code.startsWith("tg") || code.startsWith("hy") || code.startsWith("az");
  });
  return prefersRussian ? "ru" : "en";
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  useEffect(() => { setLangState(detectLanguage()); }, []);
  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem("lb-language", next);
    document.documentElement.lang = next;
  };
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const value = useMemo(() => ({ lang, setLang, t: (ru: string, en: string) => lang === "en" ? en : ru }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
