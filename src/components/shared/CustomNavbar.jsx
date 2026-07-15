/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Navbar, IconButton, Button } from "@material-tailwind/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { LuBell } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { setToken } from "../../redux/slices/authSlice";
import { useTranslation } from "react-i18next";
import { FaWallet } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa"; 
import { useGetCartQuery } from "../../redux/features/cart"; 
import { useGetUserBalanceQuery } from "../../redux/features/order"; 
import {
  useGetUserNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useReadUnreadNotificationMutation,
} from "../../redux/features/notification";
import { toast } from "sonner";

const navLinks = [
  { path: "/app/profile", label: "Account" },
];

function NavList() {
  return (
    <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6 bg-white text-black px-4 lg:px-0">
      {navLinks.map((item, index) => {
        return (
          <Link key={index} to={item.path} className="p-1">
            {item.label}
          </Link>
        );
      })}
    </ul>
  );
}

const getNotificationPayload = (response) => response?.data?.data || response?.data || response || {};

const getNotificationPage = (response) => {
  const payload = getNotificationPayload(response);
  const notifications = payload.notifications || payload;
  if (Array.isArray(notifications)) return { data: notifications };
  if (Array.isArray(notifications?.data)) return notifications;
  return { data: [] };
};

const getNotificationSummary = (response) => {
  const payload = getNotificationPayload(response);
  return payload.summary || { unread_count: 0 };
};

const formatNotificationTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-BD", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CustomNavbar = ({ onMenuToggle }) => {
  const userId = localStorage.getItem("userId") || 1;
  const { data: balance, errorBal, isLoadingBal } = useGetUserBalanceQuery(userId); // Fetch balance for user with ID 1
  const [cartCount, setCartCounts] = useState(0); // Initialize the cart count
  const [showBalance, setShowBalance] = useState(false); // State to track visibility of balance
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const navigate = useNavigate();


  const { data, refetch } = useGetCartQuery(userId);
  const {
    data: notificationData,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useGetUserNotificationsQuery(
    { userId, per_page: 5 },
    { skip: !userId, refetchOnMountOrArgChange: true }
  );
  const [toggleNotificationRead, { isLoading: togglingNotification }] = useReadUnreadNotificationMutation();
  const [markAllNotificationsRead, { isLoading: markingAllNotifications }] = useMarkAllNotificationsReadMutation();
  const notificationPage = getNotificationPage(notificationData);
  const notificationSummary = getNotificationSummary(notificationData);
  const latestNotifications = notificationPage.data || [];
  const unreadCount = Number(notificationSummary.unread_count || 0);

  // UseEffect to handle setting the cart count when data changes
  useEffect(() => {
    if (data) {
      setCartCounts(data?.data?.total_items || 0);
    }
  }, [data]);

  useEffect(() => {
    const handleCartUpdated = () => {
      refetch();
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [refetch]);

  useEffect(() => {
  
    console.log('Balance Loaded:', balance);
  }, [balance]);

  const handleLogout = () => {
    dispatch(setToken({ token: null }));
  };

  const handleChangeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Change language dynamically
    localStorage.setItem("language", lng); // Optionally persist language selection
  };

  const goToCart = async () => {
    await refetch(); // Refetch cart data to ensure it's up-to-date
    if ((data?.data?.total_items || 0) > 0) {
      navigate("/app/cart"); // Navigate to the cart page if cart has items
    } else {
      alert("Your cart is empty!"); // Optionally notify the user if the cart is empty
    }
  };
  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance); // Toggle balance visibility
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.id || notification.is_seen) return;
    try {
      await toggleNotificationRead({
        notificationId: notification.id,
        is_seen: true,
        user_id: Number(userId),
      }).unwrap();
      refetchNotifications();
    } catch (err) {
      toast.error(err?.data?.message || "Notification update failed");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(userId).unwrap();
      toast.success("All notifications marked as read");
      refetchNotifications();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to mark all notifications as read");
    }
  };

  return (
    <Navbar className="sticky top-0 z-[499] max-w-full rounded-none h-[60px] lg:h-[80px] bg-opacity-100 bg-white px-0 opacity-100">
      <div className="flex items-center justify-between text-blue-gray-900 h-full px-3 lg:px-4 gap-2">
        {/* Mobile hamburger button */}
        <IconButton
          variant="text"
          className="h-8 w-8 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden flex-shrink-0"
          ripple={false}
          onClick={onMenuToggle}
        >
          <Bars3Icon className="h-6 w-6" strokeWidth={2} />
        </IconButton>

        {/* Desktop nav items */}
        <div className="hidden lg:flex items-center gap-x-5">
          <NavList />
          <Button onClick={() => handleLogout()}>Logout</Button>

          {/* Balance button */}
          <Button
            onClick={toggleBalanceVisibility}
            className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 text-white font-semibold shadow-lg hover:scale-105 transform transition-all duration-200"
          >
            <FaWallet className="text-lg" />
            {isLoadingBal ? (
              <span className="text-xl">Loading balance...</span>
            ) : errorBal ? (
              <span className="text-xl text-red-500">Error fetching balance</span>
            ) : (
              <span className="text-xl">Balance</span>
            )}
          </Button>

          {showBalance && !isLoadingBal && !errorBal && (
            <div className="text-xl mt-2">
              <span>Balance: {balance?.data?.balance?.balance ?? 0} ৳</span>
            </div>
          )}
        </div>

        {/* Right side items - always visible */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Notification bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen((prev) => !prev)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              aria-label="Notifications"
            >
              <LuBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-12 z-[800] w-[min(92vw,380px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Notifications</p>
                    <p className="text-xs text-gray-500">{unreadCount} unread</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={markingAllNotifications || unreadCount === 0}
                    className="text-xs font-semibold text-blue-600 disabled:text-gray-400"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">Loading notifications...</div>
                  ) : latestNotifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">No notifications found.</div>
                  ) : (
                    latestNotifications.map((notification) => {
                      const isSeen = Boolean(notification.is_seen);
                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          disabled={togglingNotification}
                          className={`block w-full border-b border-gray-100 px-4 py-3 text-left last:border-b-0 ${
                            isSeen ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-gray-900">{notification.title || "Notification"}</p>
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">{notification.subtitle || notification.message || "-"}</p>
                              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-gray-500">
                                {notification.type && <span className="rounded bg-gray-100 px-1.5 py-0.5">Type: {notification.type}</span>}
                                {notification.module && <span className="rounded bg-gray-100 px-1.5 py-0.5">Module: {notification.module}</span>}
                                <span>{formatNotificationTime(notification.created_at)}</span>
                              </div>
                            </div>
                            {!isSeen && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen(false);
                    navigate("/app/notifications");
                  }}
                  className="block w-full border-t border-gray-100 px-4 py-3 text-center text-sm font-bold text-blue-600 hover:bg-blue-50"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>

          {/* Cart icon */}
          <div className="relative cursor-pointer" onClick={goToCart}>
            <FaShoppingCart className="text-2xl lg:text-4xl text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 block w-5 h-5 text-xs bg-red-600 text-white rounded-full text-center leading-5">
                {cartCount}
              </span>
            )}
          </div>

         
         

          {/* Language switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleChangeLanguage('en')}
              className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs lg:text-sm"
            >
              EN
            </button>
            <button
              onClick={() => handleChangeLanguage('bd')}
              className="bg-green-500 text-white px-2 py-1 rounded-md text-xs lg:text-sm"
            >
              বাং
            </button>
          </div>

          {/* Mobile logout button */}
          <Button
            onClick={() => handleLogout()}
            className="lg:hidden text-xs px-2 py-1"
            size="sm"
          >
            Logout
          </Button>
        </div>
      </div>
    </Navbar>
  );
};

export default CustomNavbar;
