import { cloneElement, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomNavbar from "./components/shared/CustomNavbar";

import { PiReceipt, PiUsers } from "react-icons/pi";
import { HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import { IoCalendarOutline, IoCloseOutline } from "react-icons/io5";
import { LuArchive } from "react-icons/lu";
import { MdOutlineWarehouse } from "react-icons/md";
import { Bell, ChevronDown, Heart, HomeIcon, Megaphone, PanelLeftClose, PanelLeftOpen, Store } from "lucide-react";
import logo from "../src/assets/jayga-logo.png";
import sLogo from "../src/assets/jayga-logo-without-label.png";

const menuSections = [
  {
    title: "Browse",
    items: [
      {
        path: "/app/dashboard-new",
        label: "Home",
        icon: <HomeIcon />,
      },
      {
        path: "/app/all-product-category",
        label: "All Products",
        icon: <LuArchive />,
      },
      {
        path: "/app/items/category",
        label: "All Categories",
        icon: <LuArchive />,
      },
      {
        path: "/app/favproducts",
        label: "Favourite Product",
        icon: <Heart />,
      },
      {
        path: "/app/post",
        label: "Facebook Content",
        icon: <MdOutlineWarehouse />,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        path: "/app/order",
        label: "Order List",
        icon: <HiOutlineClipboardDocumentCheck />,
      },
      {
        path: "/app/saleandprofit",
        label: "Sales & Profit",
        icon: <IoCalendarOutline />,
      },
      {
        path: "/app/billing",
        label: "Transactions",
        icon: <PiReceipt />,
        children: [
          {
            path: "/app/billing/payments",
            label: "Payments",
          },
        ],
      },
      {
        path: "/app/withdraw",
        label: "Withdraw",
        icon: <PiReceipt />,
        children: [
          {
            path: "/app/add-payment-account",
            label: "Add Payment Account",
          },
          {
            path: "/app/withdraw",
            label: "Withdraw",
          },
        ],
      },
    ],
  },
  {
    title: "Store & Support",
    items: [
      {
        path: "/app/store-profile",
        label: "My Store",
        icon: <Store />,
      },
      {
        path: "/app/notifications",
        label: "Notifications",
        icon: <Bell />,
      },
      {
        path: "/app/notices",
        label: "Notice Board",
        icon: <Megaphone />,
      },
      {
        path: "/app/users",
        label: "Support Ticket",
        icon: <PiUsers />,
      },
    ],
  },
];

const allMenuItems = menuSections.flatMap((section) => section.items);

const isPathActive = (pathname, item) => {
  if (pathname === item.path) return true;
  return item.children?.some((child) => pathname === child.path || pathname.startsWith(`${child.path}/`));
};

const MenuIcon = ({ icon, className = "" }) =>
  cloneElement(icon, {
    className: `h-5 w-5 shrink-0 ${className}`,
  });

const App = () => {
  const [isCollapse, setCollapse] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { t } = useTranslation();
  const location = useLocation();

  const activeParent = useMemo(
    () => allMenuItems.find((item) => isPathActive(location.pathname, item)),
    [location.pathname]
  );

  const closeMobileSidebar = () => setMobileOpen(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const activeWithChildren = allMenuItems.find((item) => item.children?.length && isPathActive(location.pathname, item));
    if (activeWithChildren) {
      setExpandedMenus((prev) => ({ ...prev, [activeWithChildren.label]: true }));
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleExpandedMenu = (label) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderMenuItem = (item, { collapsed = false, onNavClick } = {}) => {
    const active = isPathActive(location.pathname, item);
    const expanded = Boolean(expandedMenus[item.label] || active);

    if (collapsed) {
      return (
        <NavLink
          key={item.label}
          to={item.path}
          title={t(item.label)}
          className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition ${
            active ? "bg-[#CDEFE1] text-[#085041] shadow-sm ring-1 ring-[#9DDDC5]" : "text-[#085041]/70 hover:bg-[#DDF4EA] hover:text-[#085041]"
          }`}
        >
          <MenuIcon icon={item.icon} />
          <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg group-hover:block">
            {t(item.label)}
          </span>
        </NavLink>
      );
    }

    if (item.children?.length) {
      return (
        <div key={item.label} className="space-y-1">
          <button
            type="button"
            onClick={() => toggleExpandedMenu(item.label)}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${
              active ? "bg-[#CDEFE1] text-[#085041] shadow-sm ring-1 ring-[#9DDDC5]" : "text-[#085041]/75 hover:bg-[#DDF4EA] hover:text-[#085041]"
            }`}
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-[#BDEAD8] text-[#085041]" : "bg-[#DDF4EA] text-[#085041]/65"}`}>
              <MenuIcon icon={item.icon} />
            </span>
            <span className="min-w-0 flex-1 truncate">{t(item.label)}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>

          {expanded && (
            <div className="ml-[30px] border-l border-[#BDEAD8] py-1 pl-4">
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    `mb-1 block rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive ? "bg-[#CDEFE1] text-[#085041] shadow-sm ring-1 ring-[#9DDDC5]" : "text-[#085041]/65 hover:bg-[#DDF4EA] hover:text-[#085041]"
                    }`
                  }
                >
                  {t(child.label)}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.label}
        to={item.path}
        onClick={onNavClick}
        className={({ isActive }) => {
          const activeState = isActive || active;
          return `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
            activeState ? "bg-[#CDEFE1] text-[#085041] shadow-sm ring-1 ring-[#9DDDC5]" : "text-[#085041]/75 hover:bg-[#DDF4EA] hover:text-[#085041]"
          }`;
        }}
      >
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-[#BDEAD8] text-[#085041]" : "bg-[#DDF4EA] text-[#085041]/65"}`}>
          <MenuIcon icon={item.icon} />
        </span>
        <span className="min-w-0 flex-1 truncate">{t(item.label)}</span>
      </NavLink>
    );
  };

  const renderSidebarNavigation = ({ collapsed = false, onNavClick } = {}) => (
    <nav className={`${collapsed ? "flex flex-col items-center gap-2 px-3" : "space-y-5 px-4"}`}>
      {menuSections.map((section) => (
        <div key={section.title} className={collapsed ? "flex flex-col items-center gap-2" : ""}>
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#085041]/45">
              {section.title}
            </p>
          )}
          <div className={collapsed ? "flex flex-col items-center gap-2" : "space-y-1.5"}>
            {section.items.map((item) => renderMenuItem(item, { collapsed, onNavClick }))}
          </div>
        </div>
      ))}
    </nav>
  );

  const SidebarBrand = ({ collapsed = false, mobile = false }) => (
    <div className={`flex h-20 items-center border-b border-[#BDEAD8] bg-[#DDF4EA] px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
      <div className={`flex min-w-0 items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        <img src={collapsed ? sLogo : logo} alt="ResellerBrain" className={`${collapsed ? "h-10 w-10 object-contain" : "h-10 max-w-[160px] object-contain"}`} />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[#085041]">Reseller Panel</p>
            <p className="truncate text-xs text-[#085041]/65">Manage products and orders</p>
          </div>
        )}
      </div>
      {mobile && (
        <button
          type="button"
          onClick={closeMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#CDEFE1] text-[#085041] hover:bg-[#BDEAD8]"
          aria-label="Close menu"
        >
          <IoCloseOutline className="h-6 w-6" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[600] bg-slate-950/50 backdrop-blur-[2px] lg:hidden"
          onClick={closeMobileSidebar}
          aria-label="Close menu backdrop"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[700] flex w-[88vw] max-w-[340px] flex-col overflow-hidden rounded-r-[28px] border-r border-[#BDEAD8] bg-[#E1F5EE] shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarBrand mobile />
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#E1F5EE] py-5">
          {renderSidebarNavigation({ onNavClick: closeMobileSidebar })}
        </div>
        <div className="border-t border-[#BDEAD8] bg-[#DDF4EA] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#085041]/50">Current section</p>
          <p className="mt-1 truncate text-sm font-black text-[#085041]">{activeParent ? t(activeParent.label) : t("welcome")}</p>
        </div>
      </aside>

      <div className="flex min-h-screen bg-slate-100">
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#BDEAD8] bg-[#E1F5EE] shadow-[8px_0_30px_rgba(15,23,42,0.04)] transition-all duration-300 lg:flex ${
            isCollapse ? "w-[88px]" : "w-[288px]"
          }`}
        >
          <SidebarBrand collapsed={isCollapse} />
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#E1F5EE] py-5">
            {renderSidebarNavigation({ collapsed: isCollapse })}
          </div>
          <div className={`${isCollapse ? "px-3" : "px-4"} border-t border-[#BDEAD8] bg-[#DDF4EA] py-4`}>
            <button
              type="button"
              onClick={() => setCollapse((prev) => !prev)}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-[#9DDDC5] bg-[#CDEFE1] px-3 py-2.5 text-sm font-bold text-[#085041] shadow-sm transition hover:border-[#1D9E75]/40 hover:bg-[#BDEAD8] ${
                isCollapse ? "h-11" : ""
              }`}
              aria-label={isCollapse ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapse ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              {!isCollapse && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <CustomNavbar onMenuToggle={() => setMobileOpen((prev) => !prev)} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="m-3 rounded-2xl bg-white p-0 shadow-sm sm:m-5">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default App;
