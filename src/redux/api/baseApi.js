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
  if (
    errorData?.status === "error" &&
    errorData?.message === "API token missing"
  ) {
    removeFromLocalstorage("token");
    removeFromLocalstorage("userId");

    // ✅ Only redirect to admin-login if user is in admin panel
    if (window.location.pathname.startsWith("/admin-panel")) {
      window.location.href = "/admin-login";
    }

    return result;
  }

  return result;
};

const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Grid", "Request", "Payment", "Note", "User", "Warehouse", "Vendor", "Upload", "Category", "Brand", "Product", "CarryBeeStore", "CarryBeeOrder", "SupportTickets", "OrderSettlement", "ResellerStoreProfile", "ResellerProductPage", "LandingPageOrder", "Notification", "Notice"],
  endpoints: () => ({}),
});

export default baseApi;
