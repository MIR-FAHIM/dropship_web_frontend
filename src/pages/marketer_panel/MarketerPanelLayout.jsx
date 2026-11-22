import { useLayoutEffect, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { logout } from "../../redux/slices/authSlice";
import { removeFromLocalstorage } from "../../utils/localstorage.utils";
import { workspacePath } from "./partnerWorkspaceData";
import { PartnerPrefsProvider, usePartnerPrefs } from "./partnerPrefs";

const RB_LOGO = "https://apidropship.resellerbrain.com/storage/app/public/all/1776237215_YeclKITg.png";

// Tab bar from the Partner Portal demo. Tabs without a page yet are shown as "Soon".
const tabs = [
  { to: workspacePath, end: true, icon: "📊", en: "Overview", bn: "ওভারভিউ" },
  { to: `${workspacePath}/clients`, icon: "👥", en: "My Clients", bn: "আমার ক্লায়েন্ট" },
  { to: `${workspacePath}/invitations`, icon: "✉️", en: "Referrals", bn: "রেফারেল" },
  { soon: true, icon: "🧮", en: "Client Pitch Calculator", bn: "পিচ ক্যালকুলেটর" },
  { soon: true, icon: "📦", en: "Product Sourcing Request", bn: "প্রোডাক্ট সোর্সিং" },
  { soon: true, icon: "✈️", en: "Tour Milestones", bn: "ট্যুর মাইলস্টোন" },
  { soon: true, icon: "🔥", en: "Winning Products", bn: "উইনিং প্রোডাক্ট" },
  { to: `${workspacePath}/profile`, icon: "👤", en: "Profile", bn: "প্রোফাইল" },
];

const pill = "px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors";

function PanelShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mainRef = useRef(null);
  const { theme, toggleTheme, toggleLang, lang, t } = usePartnerPrefs();
  const { pathname, hash } = location;
  const client = new URLSearchParams(location.search).get("client");
  // Pages with dark styles; the older pages stay light until they are redone in the demo style.
  const darkReady = pathname === workspacePath || pathname === `${workspacePath}/`;

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

  const handleLogout = () => {
    dispatch(logout());
    ["token", "userId", "user"].forEach((key) => removeFromLocalstorage(key));
    toast.success(t("Signed out.", "সাইন আউট হয়েছে।"));
    navigate("/login", { replace: true });
  };

  return (
    // .dark here (not on <html>) keeps dark mode inside the partner panel only.
    <div className={`${theme === "dark" && darkReady ? "dark" : ""} h-dvh`} lang={lang}>
      <div className="flex h-dvh min-w-0 flex-col overflow-hidden bg-slate-50 font-[Inter,'Hind_Siliguri',sans-serif] text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        {/* Top navigation bar */}
        <header className="z-40 shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
            <Link to={workspacePath} className="group flex shrink-0 items-center gap-2.5 text-left">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700">
                <img src={RB_LOGO} alt="Reseller Brain" className="h-full w-full object-contain" />
              </span>
              <span>
                <span className="block text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-lg">Reseller <span className="text-teal-600 dark:text-teal-400">Brain</span></span>
                <span className="-mt-1 hidden text-[10px] font-semibold text-slate-500 dark:text-slate-400 sm:block">{t("Partner Portal", "পার্টনার পোর্টাল")}</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleTheme} className={pill} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
                <span className="hidden md:inline">{theme === "dark" ? t("Light", "লাইট") : t("Dark", "ডার্ক")}</span>
              </button>
              <button type="button" onClick={toggleLang} className={pill} aria-label="Change language">
                <span aria-hidden="true">🌐</span><span>{lang === "bn" ? "English" : "বাংলা"}</span>
              </button>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-red-600 dark:text-slate-200 sm:text-sm">
                <LogOut size={15} aria-hidden="true" /><span className="hidden sm:inline">{t("Logout", "লগআউট")}</span>
              </button>
            </div>
          </div>
          {/* Sub-navigation tabs */}
          <nav aria-label="Partner Portal" className="border-t border-slate-100 dark:border-slate-800">
            <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
              {tabs.map((tab) => tab.soon ? (
                <span key={tab.en} title={t("Coming soon", "শিগগিরই আসছে")}
                  className="inline-flex cursor-not-allowed items-center gap-1 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                  {tab.icon} {t(tab.en, tab.bn)}
                  <span className="rounded bg-slate-100 px-1 text-[9px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">{t("Soon", "শিগগিরই")}</span>
                </span>
              ) : (
                <NavLink key={tab.to} to={tab.to} end={tab.end}
                  className={({ isActive }) => `whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${isActive ? "bg-slate-900 text-white dark:bg-teal-600" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
                  {tab.icon} {t(tab.en, tab.bn)}
                </NavLink>
              ))}
            </div>
          </nav>
        </header>

        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}

export default function MarketerPanelLayout() {
  return <PartnerPrefsProvider><PanelShell /></PartnerPrefsProvider>;
}
