import { useLayoutEffect, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { logout } from "../../redux/slices/authSlice";
import { getFromLocalstorage, removeFromLocalstorage } from "../../utils/localstorage.utils";
import { workspacePath } from "./partnerWorkspaceData";
import { PartnerPrefsProvider, usePartnerPrefs } from "./partnerPrefs";

const RB_LOGO = "https://apidropship.resellerbrain.com/storage/app/public/all/1776237215_YeclKITg.png";

// Tab bar for Partner Portal:
// Active tab uses rich brand teal with white text so it stands out crisply on white and dark backgrounds.
// Tabs without a page yet are shown as "Soon".
const tabs = [
  { to: workspacePath, end: true, icon: "📊", en: "Overview", bn: "ওভারভিউ" },
  { to: `${workspacePath}/clients`, icon: "👥", en: "My Clients", bn: "আমার ক্লায়েন্ট" },
  { to: `${workspacePath}/invitations`, icon: "✉️", en: "Referrals", bn: "রেফারেল" },
  { to: `${workspacePath}/earnings`, icon: "💸", en: "Earnings", bn: "আয়" },
  { to: `${workspacePath}/pitch`, icon: "🧮", en: "Client Pitch Calculator", bn: "পিচ ক্যালকুলেটর" },
  { to: `${workspacePath}/sourcing`, icon: "📦", en: "Product Sourcing Request", bn: "প্রোডাক্ট সোর্সিং" },
  { to: `${workspacePath}/tours`, icon: "✈️", en: "Tour Milestones", bn: "ট্যুর মাইলস্টোন" },
  { to: `${workspacePath}/winning`, icon: "🔥", en: "Winning Products", bn: "উইনিং প্রোডাক্ট" },
  { to: `${workspacePath}/profile`, icon: "👤", en: "Profile", bn: "প্রোফাইল" },
];

const pill = "px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95";

function PanelShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mainRef = useRef(null);
  const { theme, toggleTheme, toggleLang, lang, t } = usePartnerPrefs();
  const user = getFromLocalstorage("user");
  const { pathname, hash } = location;
  const client = new URLSearchParams(location.search).get("client");
  const initials = (user?.name || "RB").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  useLayoutEffect(() => {
    if (hash === "#invite-client") {
      const form = mainRef.current?.querySelector("#invite-client");
      form?.scrollIntoView({ block: "start" });
      form?.querySelector("input")?.focus({ preventScroll: true });
    } else if (hash === "#invitation-history") {
      const history = mainRef.current?.querySelector("#invitation-history");
      history?.scrollIntoView({ block: "start" });
      history?.focus({ preventScroll: true });
    } else {
      mainRef.current?.scrollTo({ top: 0 });
    }
  }, [pathname, hash, client]);

  // Phones: the tab bar scrolls sideways — keep the active tab in view so the marketer sees where they are.
  const tabsRef = useRef(null);
  useLayoutEffect(() => {
    const bar = tabsRef.current;
    const active = bar?.querySelector('[aria-current="page"]');
    if (bar && active) {
      bar.scrollTo({ left: active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2 });
    }
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    ["token", "userId", "user"].forEach((key) => removeFromLocalstorage(key));
    toast.success(t("Signed out.", "সাইন আউট হয়েছে।"));
    navigate("/login", { replace: true });
  };

  return (
    // .dark on this wrapper (not <html>) keeps dark mode inside the partner panel.
    <div className={`${theme === "dark" ? "dark" : ""} h-dvh`} lang={lang}>
      <div className="font-partner flex h-dvh min-w-0 flex-col overflow-hidden bg-slate-50 text-slate-900 transition-colors selection:bg-teal-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
        <header className="z-40 shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          {/* Colour strip */}
          <div aria-hidden="true" className="h-1 bg-gradient-to-r from-teal-500 via-emerald-400 via-50% to-amber-400" />
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
            <Link to={workspacePath} className="group flex shrink-0 items-center gap-2.5 text-left">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700">
                <img src={RB_LOGO} alt="Reseller Brain" className="h-full w-full object-contain" />
              </span>
              <span>
                <span className="block text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-lg">Reseller <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent dark:from-teal-400 dark:to-emerald-300">Brain</span></span>
                <span className="-mt-1 hidden text-[10px] font-semibold text-slate-500 dark:text-slate-400 sm:block">{t("Partner Portal", "পার্টনার পোর্টাল")}</span>
              </span>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button type="button" onClick={toggleTheme} className={pill} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
                <span className="hidden md:inline">{theme === "dark" ? t("Light", "লাইট") : t("Dark", "ডার্ক")}</span>
              </button>
              <button type="button" onClick={toggleLang} className={pill} aria-label="Change language">
                <span aria-hidden="true">🌐</span>
                {/* Short on phones so the Logout button fits */}
                <span className="sm:hidden">{lang === "bn" ? "EN" : "বাং"}</span>
                <span className="hidden sm:inline">{lang === "bn" ? "English" : "বাংলা"}</span>
              </button>
              <Link to={`${workspacePath}/profile`} className="hidden items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-[11px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">{initials}</span>
                <span className="flex flex-col text-left">
                  <span className="max-w-[9rem] truncate text-xs font-bold leading-tight text-slate-900 dark:text-white">{user?.name || t("Partner", "পার্টনার")}</span>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">{t("Partner", "পার্টনার")}</span>
                </span>
              </Link>
              <button type="button" onClick={handleLogout} className="rounded-xl border border-rose-200/70 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-600 transition-all hover:bg-rose-100 active:scale-95 cursor-pointer dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-400 dark:hover:bg-rose-900/60">
                {t("Logout", "লগআউট")}
              </button>
            </div>
          </div>
          {/* Sub-navigation tabs */}
          <nav aria-label="Partner Portal" className="border-t border-slate-100 dark:border-slate-800">
            <div ref={tabsRef} className="relative mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
              {tabs.map((tab) => tab.soon ? (
                <span key={tab.en} title={t("Coming soon", "শিগগিরই আসছে")}
                  className="inline-flex cursor-not-allowed items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{t(tab.en, tab.bn)}</span>
                  <span className="rounded bg-slate-100 px-1 text-[9px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">{t("Soon", "শিগগিরই")}</span>
                </span>
              ) : (
                <NavLink key={tab.to} to={tab.to} end={tab.end}
                  className={({ isActive }) => `inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 cursor-pointer ${
                    isActive
                      ? "bg-teal-600 text-white dark:bg-teal-600 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                  }`}>
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{t(tab.en, tab.bn)}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </header>

        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="partner-fade-in mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8" key={pathname}><Outlet /></div>
        </main>
      </div>
    </div>
  );
}

export default function MarketerPanelLayout() {
  return <PartnerPrefsProvider><PanelShell /></PartnerPrefsProvider>;
}
