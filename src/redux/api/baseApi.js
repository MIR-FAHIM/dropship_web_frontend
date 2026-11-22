import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getFromLocalstorage, removeFromLocalstorage } from "../../utils/localstorage.utils";
import { setAuthNotice } from "../../utils/authNotice";
import { baseUrl } from '../../../config';

const noAuthEndpoints = [
  "login",
  "register",
  "dropshipperRegister",
  "vendorRegister",
  "vendorLogin",
  "forgotPassword",
  "resetPassword",
  "addKycDocument",
  "getCarryBeeTracking",
];

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}/api`,
  prepareHeaders: (headers, { endpoint }) => {
    if (noAuthEndpoints.includes(endpoint)) {
      headers.set("Accept", "application/json");
      return headers;
    }
    const token = getFromLocalstorage("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  const errorData = result?.error?.data || result?.data;
  const isUnauthorized =
    result?.error?.status === 401 ||
    (errorData?.status === "error" && errorData?.message === "API token missing") ||
    errorData?.message === "Invalid or expired API token" ||
    errorData?.message === "Token user not found" ||
    errorData?.message === "Unauthenticated";

  const isForbiddenAdmin =
    result?.error?.status === 403 &&
    (errorData?.message === "Unauthorized: Admin access required" ||
     errorData?.message === "Your account is deactivated or banned");

  if (isUnauthorized || isForbiddenAdmin) {
    if (window.location.pathname.startsWith("/admin-panel")) {
      removeFromLocalstorage("token");
      removeFromLocalstorage("userId");
      window.location.href = "/admin-login";
      return result;
    }

    // Dropshipper / vendor / marketer panels: a token that the API rejects (expired after
    // 30 days, revoked by a password reset or by an admin, account banned) used to leave
    // pages stuck on "Error loading ...". Sign out and send them to login with a message.
    const sentToken = !noAuthEndpoints.includes(api.endpoint) && getFromLocalstorage("token");
    if (sentToken) {
      signOutToLogin(errorData?.message);
    }
    return result;
  }

  return result;
};

let signingOut = false;

/** Clear the stored login and go to the right login page (once, even if many requests fail). */
const signOutToLogin = (serverMessage) => {
  if (signingOut) return;
  signingOut = true;

  const path = window.location.pathname;
  const isVendor = path.startsWith("/vendor-panel") || path.startsWith("/vendor/");
  const loginPath = isVendor ? "/vendor-login" : "/login";
  const banned = serverMessage === "Your account is deactivated or banned";

  setAuthNotice({
    message: banned
      ? "আপনার অ্যাকাউন্ট নিষ্ক্রিয় বা ব্লক করা হয়েছে। সাহায্যের জন্য সাপোর্টে যোগাযোগ করুন।"
      : "আপনার লগইনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার লগইন করুন।",
    // After logging in again, come back to the same page (with its filters).
    from: banned || path === loginPath ? null : path + window.location.search,
  });

  ["token", "userId", "user"].forEach(removeFromLocalstorage);
  // Full page load: also clears every cached API response of the old login.
  window.location.replace(loginPath);
};

const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "AppVersion",
    "Grid",
    "Request",
    "Payment",
    "Note",
    "User",
    "Warehouse",
    "Vendor",
    "Upload",
    "Category",
    "Brand",
    "Product",
    "CarryBeeStore",
    "CarryBeeOrder",
    "CourierEvents",
    "SupportTickets",
    "OrderSettlement",
    "ResellerStoreProfile",
    "ResellerProductPage",
    "LandingPageOrder",
    "Notification",
    "Notice",
    "SocialMediaText",
    "ProductAssistantQa",
    "KycDocument",
    "Wishlist",
    "WalletTopup",
    "ResellerTransactions",
    "Transactions",
    "AdminAuth",
    "VendorInvoice",
    "Order",
    "OrderDetails",
    "OrderAdvance",
    "CarrybeePaidOrders",
    "CarrybeeWebhookEvents",
    "CarrybeeWebhookHealth",
    "DropshipperPayout",
    "FeedPost",
    "FeedPostComments",
    "PartnerStore",
    "EcommerceWebsiteLead",
    "MarketerPerformance",
    "MarketerClients",
    "MarketerInvitations",
    "MarketerRelationship",
    "AdminMarketers",
    "AdminMarketerClients",
    "PasswordLog",
    "Lead",
    "LeadTag",
    "ProductVendorChanges",
    "MarketerCommission",
  ],
  endpoints: () => ({}),
});

export default baseApi;
