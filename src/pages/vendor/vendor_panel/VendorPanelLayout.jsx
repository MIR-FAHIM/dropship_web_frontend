import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Wallet,
  Settings,
  ChevronLeft,
  Menu,
  LogOut,
  Store,
  X,
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
    path: "/vendor-panel/orders",
    label: "অর্ডার",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    path: "/vendor-panel/accounting",
    label: "হিসাব-নিকাশ",
    icon: <Wallet className="w-5 h-5" />,
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
          <p className="text-xs text-gray-400 uppercase tracking-wide">ভেন্ডর প্যানেল</p>
        </div>
      )}

      {/* Menu Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {vendorMenuLinks.map((item) => (
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
      <div className="flex-1 flex flex-col overflow-hidden">
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
            <h2 className="text-base font-semibold text-gray-800">ভেন্ডর ড্যাশবোর্ড</h2>
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
