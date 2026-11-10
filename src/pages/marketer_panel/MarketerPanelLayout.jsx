import { useLayoutEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { BadgeCheck, Layers, LayoutDashboard, LogOut, Mail, Users } from "lucide-react";
import { toast } from "sonner";
import { logout } from "../../redux/slices/authSlice";
import { getFromLocalstorage, removeFromLocalstorage } from "../../utils/localstorage.utils";
import { workspacePath } from "./partnerWorkspaceData";

const links = [
  { to: workspacePath, end: true, label: "Overview", icon: LayoutDashboard },
  { to: `${workspacePath}/clients`, label: "My Clients", mobile: "Clients", icon: Users },
  { to: `${workspacePath}/invitations`, label: "Referrals & Invitations", mobile: "Referrals", icon: Mail },
  { to: `${workspacePath}/profile`, label: "Profile & Access", mobile: "Profile", icon: BadgeCheck },
];

export default function MarketerPanelLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mainRef = useRef(null);
  const user = getFromLocalstorage("user");
  const { pathname, hash } = location;
  const client = new URLSearchParams(location.search).get("client");
  const current = links.find(link => link.end ? pathname === link.to : pathname.startsWith(link.to));
  const initials = user?.name?.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "RB";

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
    ["token", "userId", "user"].forEach(key => removeFromLocalstorage(key));
    toast.success("Signed out.");
    navigate("/login", { replace: true });
  };

  return <div className="flex h-dvh min-w-0 overflow-hidden bg-[#eff0ff] text-slate-900">
    <aside className="hidden w-56 shrink-0 flex-col bg-gradient-to-b from-[#24164d] to-[#18142f] text-white md:flex lg:w-60">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white"><Layers size={21} aria-hidden="true" /></span>
        <div><p className="font-bold">ResellerBrain</p><p className="text-xs text-violet-200">Partner Workspace</p></div>
      </div>
      <nav aria-label="Partner Workspace" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-xs font-bold uppercase tracking-widest text-violet-300">Workspace</p>
        {links.map(({ to, end, label, icon: Icon }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${isActive ? "bg-violet-700 text-white" : "text-violet-100 hover:bg-white/10"}`}>
          <Icon size={18} className="shrink-0" aria-hidden="true" />{label}
        </NavLink>)}
      </nav>
      <div className="flex shrink-0 items-center gap-2 border-t border-white/10 p-3">
        <NavLink to={`${workspacePath}/profile`} className="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-2 hover:bg-white/10">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-400/25 text-xs font-bold">{initials}</span>
          <span className="min-w-0"><strong className="block truncate text-sm">{user?.name || "Partner"}</strong><span className="block truncate text-xs text-violet-200">{user?.business_name || "Partner account"}</span></span>
        </NavLink>
        <button type="button" onClick={handleLogout} aria-label="Sign out" className="grid size-11 shrink-0 place-items-center rounded-lg text-violet-200 hover:bg-white/10"><LogOut size={18} aria-hidden="true" /></button>
      </div>
    </aside>

    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-violet-200/70 bg-[#f7f4ff] px-4 sm:px-6">
        <p className="flex items-center gap-2 text-sm font-bold text-violet-950"><Layers size={17} className="shrink-0 text-violet-700 md:hidden" aria-hidden="true" /> Partner Workspace <span className="hidden font-normal text-violet-800 sm:inline">/ {current?.label || "Overview"}</span></p>
        <button type="button" onClick={handleLogout} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-violet-800 hover:bg-violet-100 md:hidden"><LogOut size={16} aria-hidden="true" /> Sign out</button>
      </header>
      <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[radial-gradient(ellipse_at_top_right,#e6deff,transparent_60%)]">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
      <nav aria-label="Partner Workspace" className="grid shrink-0 grid-cols-4 gap-1 border-t border-violet-950 bg-[#24164d] px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden">
        {links.map(({ to, end, label, mobile, icon: Icon }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${isActive ? "bg-violet-700 text-white" : "text-violet-100 hover:bg-white/10"}`}>
          <Icon size={18} aria-hidden="true" />{mobile || label}
        </NavLink>)}
      </nav>
    </div>
  </div>;
}
