/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Partner Portal preferences (same as the demo): Dark/Light theme and Bangla/English,
 * saved in localStorage as rb_partner_theme and rb_partner_lang. Dark styles apply only
 * inside the partner panel (Tailwind darkMode: "class" on the panel wrapper).
 */
const PrefsContext = createContext({ theme: "light", lang: "bn", toggleTheme: () => {}, toggleLang: () => {}, t: (en) => en });

const read = (key, fallback, allowed) => {
  try {
    const v = window.localStorage.getItem(key);
    return allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // private mode / blocked storage: keep it for this visit only
  }
};

export function PartnerPrefsProvider({ children }) {
  const [theme, setTheme] = useState(() => read("rb_partner_theme", "light", ["light", "dark"]));
  const [lang, setLang] = useState(() => read("rb_partner_lang", "bn", ["bn", "en"]));

  useEffect(() => write("rb_partner_theme", theme), [theme]);
  useEffect(() => write("rb_partner_lang", lang), [lang]);

  const value = useMemo(() => ({
    theme,
    lang,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    toggleLang: () => setLang((l) => (l === "bn" ? "en" : "bn")),
    /** t("English text", "বাংলা লেখা") */
    t: (en, bn) => (lang === "bn" && bn ? bn : en),
  }), [theme, lang]);

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export const usePartnerPrefs = () => useContext(PrefsContext);

/** Bangla digits for amounts/counts when the panel is in Bangla. */
export const useNumber = () => {
  const { lang } = usePartnerPrefs();
  return (value, { money = false, decimals = 0 } = {}) => {
    const n = Number(value || 0);
    const text = n.toLocaleString(lang === "bn" ? "bn-BD" : "en-BD", { minimumFractionDigits: 0, maximumFractionDigits: decimals || (money ? 2 : 0) });
    return money ? `৳ ${text}` : text;
  };
};
