import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getFromLocalstorage, removeFromLocalstorage } from "../../utils/localstorage.utils";
import { baseUrl } from '../../../config';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}/api`,
  prepareHeaders: (headers, { endpoint }) => {
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
    }
    return result;
  }

  return result;
};

const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
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
    "CarrybeePaidOrders",
    "CarrybeeWebhookEvents",
  ],
  endpoints: () => ({}),
});

export default baseApi;
