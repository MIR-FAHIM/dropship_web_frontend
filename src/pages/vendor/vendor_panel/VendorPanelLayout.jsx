import { useState } from "react";
import PropTypes from "prop-types";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { getOrdersSection, HISTORY_PATH } from "../../../utils/vendorOrderHistory.utils";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronDown,
  History,
  Menu,
  LogOut,
  Store,
  Tag,
  X,
  ShieldCheck,
} from "lucide-react";

const vendorMenuLinks = [
  {
    path: "/vendor-panel",
    label: "ড্যাশবোর্ড",
    icon: <LayoutDashboard className="w-5 h-5" />,
    end: true,
  },
  {
    path: "/vendor-panel/products",
    label: "পণ্য সমূহ",
    icon: <Package className="w-5 h-5" />,
  },
  {
    label: "Orders",
    icon: <ClipboardList className="w-5 h-5" />,
    children: [
      { id: "history", path: "/vendor-panel/orders", label: "Order History", icon: <History className="w-4 h-4 shrink-0" /> },
      { id: "product-history", path: HISTORY_PATH, label: "Product-Wise Order History", icon: <Package className="w-4 h-4 shrink-0" /> },
    ],
  },
  {
    path: "/vendor-panel/accounting",
    label: "হিসাব-নিকাশ",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    path: "/vendor-panel/bank-account",
    label: "Bank Account",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    path: "/vendor-panel/brands",
    label: "ব্র্যান্ড",
    icon: <Tag className="w-5 h-5" />,
  },
  {
    path: "/vendor-panel/kyc",
    label: "KYC Verification",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    path: "/vendor-panel/settings",
    label: "সেটিংস",
    icon: <Settings className="w-5 h-5" />,
  },
];

const VendorPanelLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const ordersSection = getOrdersSection(pathname);
  const [ordersMenu, setOrdersMenu] = useState({ path: pathname, open: Boolean(ordersSection) });
  const ordersExpanded = ordersMenu.path === pathname ? ordersMenu.open : Boolean(ordersSection);

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-yellow-400" />
          {(sidebarOpen || isMobile) && (
            <span className="text-lg font-bold text-white">ResellerBrain</span>
          )}
        </div>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Vendor Badge */}
      {(sidebarOpen || isMobile) && (
        <div className="px-4 py-3 border-b border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Supplier প্যানেল</p>
        </div>
      )}

      {/* Menu Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {vendorMenuLinks.map((item) => item.children ? (
          <div key={item.label}>
            <button
              type="button"
              title="Orders"
              aria-label="Orders"
              aria-expanded={ordersExpanded && (sidebarOpen || isMobile)}
              aria-controls={isMobile ? "mobile-orders-menu" : "desktop-orders-menu"}
              onClick={() => {
                if (!sidebarOpen && !isMobile) {
                  setSidebarOpen(true);
                  setOrdersMenu({ path: pathname, open: true });
                } else setOrdersMenu({ path: pathname, open: !ordersExpanded });
              }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${ordersSection ? "bg-blue-600/20 text-blue-300" : "text-gray-300 hover:bg-gray-700 hover:text-white"} ${!sidebarOpen && !isMobile ? "justify-center" : ""}`}
            >
              {item.icon}
              {(sidebarOpen || isMobile) && <><span className="flex-1 text-left">{item.label}</span><ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${ordersExpanded ? "rotate-180" : ""}`} /></>}
            </button>
            {(sidebarOpen || isMobile) && ordersExpanded && (
              <div id={isMobile ? "mobile-orders-menu" : "desktop-orders-menu"} className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                {item.children.map((child) => (
                  <NavLink key={child.path} to={child.path} end onClick={() => isMobile && setMobileOpen(false)}
                    className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${ordersSection === child.id ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}>
                    {child.icon}<span className="min-w-0 break-words">{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ) : (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              } ${!sidebarOpen && !isMobile ? "justify-center" : ""}`
            }
          >
            {item.icon}
            {(sidebarOpen || isMobile) && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={() => navigate("/vendor-login")}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors ${
            !sidebarOpen && !isMobile ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5" />
          {(sidebarOpen || isMobile) && <span>লগআউট</span>}
        </button>
      </div>
    </div>
  );

  SidebarContent.propTypes = { isMobile: PropTypes.bool };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-gray-900 transition-all duration-300 ${
          sidebarOpen ? "w-60" : "w-[72px]"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 h-full bg-gray-900">
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop collapse button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform duration-300 ${
                  !sidebarOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <h2 className="text-base font-semibold text-gray-800">Supplier ড্যাশবোর্ড</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              V
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorPanelLayout;
