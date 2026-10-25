import baseApi from "../../api/baseApi";
import API_ENDPOINTS from "../../api/apiEndpoints";
import { historyRequestParams, isHistoryEnvelope } from "../../../utils/vendorOrderHistory.utils";
import {
  adminHistoryRequestParams,
  isAdminHistoryEnvelope,
} from "../../../utils/adminOrderHistory.utils";

const adminHistoryTag = { type: "Grid", id: "AdminOrderHistory" };
const historyTag = { type: "Grid", id: "VendorOrderHistory" };
const orderHistoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminGroupOrderHistory: builder.query({
      query: (args = {}) => ({
        url: API_ENDPOINTS.orders.adminGroupOrderHistory.path,
        method: API_ENDPOINTS.orders.adminGroupOrderHistory.method,
        params: { ...adminHistoryRequestParams(args), group_by: "vendor_product" },
        validateStatus: (response, body) =>
          response.ok &&
          isAdminHistoryEnvelope(body, "groups") &&
          (!args.product_id || isAdminHistoryEnvelope(body, "orders")),
      }),
      providesTags: [adminHistoryTag],
    }),
    getAdminGroupOrderHistoryOrders: builder.query({
      query: (args = {}) => ({
        url: API_ENDPOINTS.orders.adminGroupOrderHistoryOrders.path,
        method: API_ENDPOINTS.orders.adminGroupOrderHistoryOrders.method,
        params: adminHistoryRequestParams(args),
        validateStatus: (response, body) => response.ok && isAdminHistoryEnvelope(body, "orders"),
      }),
      providesTags: [adminHistoryTag],
    }),
    getVendorProductOrderHistory: builder.query({
      query: (args = {}) => ({
        url: API_ENDPOINTS.orders.vendorProductHistory.path,
        method: API_ENDPOINTS.orders.vendorProductHistory.method,
        params: historyRequestParams(args),
        validateStatus: (response, body) => response.ok && isHistoryEnvelope(body, "groups") && (!args.product_id || isHistoryEnvelope(body, "orders")),
      }),
      providesTags: [historyTag],
    }),
    getVendorProductOrderHistoryOrders: builder.query({
      query: (args = {}) => ({
        url: API_ENDPOINTS.orders.vendorProductHistoryOrders.path,
        method: API_ENDPOINTS.orders.vendorProductHistoryOrders.method,
        params: historyRequestParams(args),
        validateStatus: (response, body) => response.ok && isHistoryEnvelope(body, "orders"),
      }),
      providesTags: [historyTag],
    }),
  }),
});

export const {
  useGetVendorProductOrderHistoryQuery,
  useGetVendorProductOrderHistoryOrdersQuery,
  useGetAdminGroupOrderHistoryQuery,
  useGetAdminGroupOrderHistoryOrdersQuery,
} = orderHistoryApi;
export const refreshVendorOrderHistory = () => orderHistoryApi.util.invalidateTags([historyTag]);
export const refreshAdminOrderHistory = () => orderHistoryApi.util.invalidateTags([adminHistoryTag]);
