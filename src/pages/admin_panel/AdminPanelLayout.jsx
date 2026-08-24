/* eslint-disable react/prop-types */
import { useState } from "react";
import AdminNotification from "./notification/AdminNotification";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useGetUserDetailsQuery } from "../../redux/features/user";
import { getFromLocalstorage } from "../../utils/localstorage.utils";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronDown,
  Menu,
  LogOut,
  X,
  ShieldCheck,
  Store,
  Users,
  Truck,
  FolderTree,
  Tag,
  SlidersHorizontal,
  ImageIcon,
  ListChecks,
  Bell,
  Building2,
  TicketCheck,
  AlertTriangle,
  CheckCircle2,
  Megaphone,
} from "lucide-react";

const adminMenuLinks = [
  {
    path: "/admin-panel",
    label: "ড্যাশবোর্ড",
    icon: <LayoutDashboard className="w-5 h-5" />,
    end: true,
  },
  {
    label: "পণ্য সমূহ",
    icon: <Package className="w-5 h-5" />,
    children: [
      {
        path: "/admin-panel/products",
        label: "সকল পণ্য",
        icon: <Package className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/categories",
        label: "ক্যাটাগরি",
        icon: <FolderTree className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/brands",
        label: "ব্র্যান্ড",
        icon: <Tag className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/attributes",
        label: "অ্যাট্রিবিউট",
        icon: <SlidersHorizontal className="w-4 h-4" />,
      },

            {
        path: "/admin-panel/products/price-update-logs",
        label: "Price Update Logs",
        icon: <ListChecks className="w-4 h-4" />,
      },
    ],
  },
  {
    path: "/admin-panel/media",
    label: "মিডিয়া",
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/orders",
    label: "অর্ডার",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/settlement-orders",
    label: "Settlement Orders",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/vendors",
    label: "সক্রিয় ভেন্ডর",
    icon: <Store className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/vendors/inactive",
    label: "নিষ্ক্রিয় ভেন্ডর",
    icon: <Store className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/dropshippers",
    label: "ড্রপশিপার",
    icon: <Truck className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/employees",
    label: "টিমমেট",
    icon: <Users className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/all-withdraw-requests",
    label: "All Withdraw Requests",
    icon: <Users className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/accounting",
    label: "হিসাব-নিকাশ",
    icon: <Wallet className="w-5 h-5" />,
  },
   {
    label: "Reports and Analytics",
    icon: <Truck className="w-5 h-5" />,
    children: [
      {
        path: "/admin-panel/product/clicks",
        label: "Product Clicks Report",
        icon: <Building2 className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/reports/login-success",
        label: "Login Success",
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
    ],
  },
  {
    path: "/admin-panel/support-tickets",
    label: "Support Tickets",
    icon: <TicketCheck className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/notices",
    label: "Notice Management",
    icon: <Megaphone className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/error-logs",
    label: "Error Log",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/tasks",
    label: "টাস্ক",
    icon: <ListChecks className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/settings",
    label: "সেটিংস",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/my-business-info",
    label: "My Business Info",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    label: "ডেলিভারি",
    icon: <Truck className="w-5 h-5" />,
    children: [
      {
        path: "/admin-panel/delivery/companies",
        label: "কোম্পানি",
        icon: <Building2 className="w-4 h-4" />,
      },
    ],
  },
];

const productManagerMenuLinks = [
  {
    label: "পণ্য সমূহ",
    icon: <Package className="w-5 h-5" />,
    children: [
      {
        path: "/admin-panel/products",
        label: "সকল পণ্য",
        icon: <Package className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/categories",
        label: "ক্যাটাগরি",
        icon: <FolderTree className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/brands",
        label: "ব্র্যান্ড",
        icon: <Tag className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/attributes",
        label: "অ্যাট্রিবিউট",
        icon: <SlidersHorizontal className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/products/price-update-logs",
        label: "Price Update Logs",
        icon: <ListChecks className="w-4 h-4" />,
      },
    ],
  },
  {
    path: "/admin-panel/media",
    label: "মিডিয়া",
    icon: <ImageIcon className="w-5 h-5" />,
  },
];

const AdminPanelLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userId = getFromLocalstorage("userId");
  const { data: userDetailsData } = useGetUserDetailsQuery(userId, { skip: !userId });
  const currentUser = userDetailsData?.data || userDetailsData?.user || null;

  const isProductManager = currentUser?.role === "product manager";
  const menuLinks = isProductManager ? productManagerMenuLinks : adminMenuLinks;

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isChildActive = (children) => {
    return children?.some((child) => location.pathname === child.path);
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-red-400" />
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

      {/* Admin Badge */}
      {(sidebarOpen || isMobile) && (
        <div className="px-4 py-3 border-b border-gray-700">
          <p className="text-xs text-red-400 uppercase tracking-wide font-semibold">অ্যাডমিন প্যানেল</p>
        </div>
      )}

      {/* Menu Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuLinks.map((item) =>
          item.children ? (
            <div key={item.label}>
              <button
                onClick={() => toggleMenu(item.label)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
                  isChildActive(item.children)
                    ? "bg-red-600/20 text-red-400"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                } ${!sidebarOpen && !isMobile ? "justify-center" : ""}`}
              >
                {item.icon}
                {(sidebarOpen || isMobile) && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedMenus[item.label] || isChildActive(item.children) ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>
              {(sidebarOpen || isMobile) &&
                (expandedMenus[item.label] || isChildActive(item.children)) && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={() => isMobile && setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-red-600 text-white"
                              : "text-gray-400 hover:bg-gray-700 hover:text-white"
                          }`
                        }
                      >
                        {child.icon}
                        <span>{child.label}</span>
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
                    ? "bg-red-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                } ${!sidebarOpen && !isMobile ? "justify-center" : ""}`
              }
            >
              {item.icon}
              {(sidebarOpen || isMobile) && <span>{item.label}</span>}
            </NavLink>
          )
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={() => navigate("/admin-login")}
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
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
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
            <h2 className="text-base font-semibold text-gray-800">অ্যাডমিন ড্যাশবোর্ড</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Icon */}
            <button
              type="button"
              className="relative focus:outline-none"
              aria-label="Notifications"
              onClick={() => setNotificationOpen(true)}
            >
              <Bell className="w-6 h-6 text-gray-500 hover:text-red-600 transition-colors" />
              {/* Example notification dot, can be conditionally rendered */}
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
            </button>
            {/* Notification Modal */}
            {notificationOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
                    onClick={() => setNotificationOpen(false)}
                    aria-label="Close notification modal"
                  >
                    &times;
                  </button>
                  <div className="p-4">
                    <AdminNotification />
                  </div>
                </div>
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
              A
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

export default AdminPanelLayout;
