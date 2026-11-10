import { useEffect, useState } from "react";
import AdminNotification from "./notification/AdminNotification";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useGetUserDetailsQuery } from "../../redux/features/user";
import { useCheckAdminQuery } from "../../redux/features/auth";
import { logout } from "../../redux/slices/authSlice";
import { getFromLocalstorage, removeFromLocalstorage } from "../../utils/localstorage.utils";
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
  Trophy,
  MousePointerClick,
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
  PlusCircle,
  ArrowLeftRight,
  CreditCard,
  Receipt,
  Activity,
  BookOpen,
  UserPlus,
  Globe,
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
    label: "Orders",
    icon: <ClipboardList className="w-5 h-5" />,
    children: [
      {
        path: "/admin-panel/orders",
        label: "Order History",
        icon: <ClipboardList className="w-4 h-4" />,
        end: true,
      },
      {
        path: "/admin-panel/orders/group-history",
        label: "Group-Wise Order History",
        icon: <Package className="w-4 h-4" />,
      },
    ],
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
    path: "/admin-panel/kyc-documents",
    label: "KYC ভেরিফিকেশন",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    label: "ড্রপশিপার",
    icon: <Truck className="w-5 h-5" />,
    children: [
      {
        path: "/admin-panel/dropshippers",
        label: "সকল ড্রপশিপার",
        icon: <Users className="w-4 h-4" />,
        end: true,
      },
      {
        path: "/admin-panel/dropshippers/leaderboard",
        label: "Dropshipper Leaderboard",
        icon: <Trophy className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/dropshippers/click-leaderboard",
        label: "Product Click Leaderboard",
        icon: <MousePointerClick className="w-4 h-4 shrink-0" />,
        requiresAdminRole: true,
      },
    ],
  },
  {
    path: "/admin-panel/marketers",
    label: "মার্কেটার (Marketers)",
    icon: <Megaphone className="w-5 h-5" />,
  },
  {
    path: "/admin-panel/employees",
    label: "টিমমেট",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "অ্যাকাউন্টস (Accounts)",
    icon: <Wallet className="w-5 h-5" />,
    children: [
      {
        path: "/admin-panel/cashflow",
        label: "ক্যাশফ্লো রিপোর্ট",
        icon: <Wallet className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/accounting",
        label: "হিসাব-নিকাশ",
        icon: <Wallet className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/transactions",
        label: "সকল লেনদেন",
        icon: <ArrowLeftRight className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/all-withdraw-requests",
        label: "উইথড্র রিকোয়েস্ট",
        icon: <CreditCard className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/wallet-topups",
        label: "ওয়ালেট রিচার্জ",
        icon: <PlusCircle className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/reseller-advance-payment-history",
        label: "Reseller Advance Payment History",
        icon: <Receipt className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/settlement-orders",
        label: "সেটেলমেন্ট অর্ডার",
        icon: <Receipt className="w-4 h-4" />,
      },
      {
        path: "/admin-panel/vendor-invoices",
        label: "ভেন্ডর ইনভয়েস",
        icon: <Receipt className="w-4 h-4" />,
      },
    ],
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
      {
        path: "/admin-panel/delivery/webhook-tester",
        label: "CarryBee Webhook টেস্ট",
        icon: <Activity className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "লিড (Lead)",
    icon: <UserPlus className="w-5 h-5" />,
    children: [
      {
        path: "/admin-panel/leads/ecommerce",
        label: "ইকমার্স লিড",
        icon: <Globe className="w-4 h-4" />,
      },
    ],
  },
  {
    path: "/admin-panel/documentation",
    label: "ডকুমেন্টেশন",
    icon: <BookOpen className="w-5 h-5" />,
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
  const dispatch = useDispatch();

  const handleLogout = () => {
    removeFromLocalstorage("token");
    removeFromLocalstorage("userId");
    dispatch(logout());
    toast.success("লগআউট সফল হয়েছে");
    navigate("/admin-login", { replace: true });
  };

  const userId = getFromLocalstorage("userId");
  const { data: userDetailsData } = useGetUserDetailsQuery(userId, { skip: !userId });
  const currentUser = userDetailsData?.data || userDetailsData?.user || null;
  const { data: adminCheck } = useCheckAdminQuery();
  const verifiedAdmin = adminCheck?.data;
  const canViewProductClickLeaderboard = Boolean(
    adminCheck?.status === "success" && verifiedAdmin?.is_admin &&
    [verifiedAdmin.user_type, verifiedAdmin.role].some((role) =>
      ["admin", "superadmin"].includes(String(role ?? "").toLowerCase())
    )
  );
  const canViewMenuItem = (item) => !item.requiresAdminRole || canViewProductClickLeaderboard;

  const isProductManager = currentUser?.role === "product manager";
  const menuLinks = isProductManager ? productManagerMenuLinks : adminMenuLinks;

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const activeGroup = menuLinks.find((item) =>
    item.children?.some(
      (child) => canViewMenuItem(child) &&
        (location.pathname === child.path || location.pathname.startsWith(`${child.path}/`))
    )
  )?.label;

  // Keep the group open after navigating away so links below it stay in place.
  useEffect(() => {
    if (activeGroup) {
      setExpandedMenus((prev) => prev[activeGroup] ? prev : { ...prev, [activeGroup]: true });
    }
  }, [activeGroup]);

  // Render into the existing sidebar tree so route changes keep the same scroll container.
  const renderSidebar = (isMobile = false) => (
    <div className="flex h-full min-h-0 flex-col">
      {/* Logo */}
      <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-gray-700">
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
        <div className="shrink-0 px-4 py-3 border-b border-gray-700">
          <p className="text-xs text-red-400 uppercase tracking-wide font-semibold">অ্যাডমিন প্যানেল</p>
        </div>
      )}

      {/* Menu Links */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2 py-4">
        {menuLinks.map((item) =>
          item.children ? (
            <div key={item.label}>
              <button
                onClick={() => item.label !== activeGroup && toggleMenu(item.label)}
                aria-expanded={(sidebarOpen || isMobile) && Boolean(expandedMenus[item.label] || item.label === activeGroup)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
                  item.label === activeGroup
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
                        expandedMenus[item.label] || item.label === activeGroup ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>
              {(sidebarOpen || isMobile) &&
                (expandedMenus[item.label] || item.label === activeGroup) && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                    {item.children.filter(canViewMenuItem).map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        end={child.end}
                        onClick={() => isMobile && setMobileOpen(false)}
                        className={({ isActive }) => {
                          const isOrderDetailsMatch =
                            child.path === "/admin-panel/orders" &&
                            location.pathname.startsWith("/admin-panel/orders/") &&
                            !location.pathname.startsWith("/admin-panel/orders/group-history");
                          const isChildHighlight = isActive || isOrderDetailsMatch;

                          return `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isChildHighlight
                              ? "bg-red-600 text-white"
                              : "text-gray-400 hover:bg-gray-700 hover:text-white"
                          }`;
                        }}
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
      <div className="shrink-0 p-3 border-t border-gray-700">
        <button
          onClick={handleLogout}
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
        {renderSidebar()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? "" : "hidden"}`}>
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
        <aside className="relative w-64 h-full bg-gray-900">
          {renderSidebar(true)}
        </aside>
      </div>

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
          <Outlet context={{ canViewProductClickLeaderboard }} />
        </main>
      </div>
    </div>
  );
};

export default AdminPanelLayout;
