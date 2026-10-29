import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const orderSettlementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listOrderSettlements: builder.query({
      query: (page = 1) => ({
        url: API_ENDPOINTS.orderSettlements.list.path,
        method: API_ENDPOINTS.orderSettlements.list.method,
        params: { page },
      }),
      providesTags: ["OrderSettlement"],
    }),

    getOrderSettlementByOrder: builder.query({
      query: (orderId) => ({
        url: buildEndpointPath(API_ENDPOINTS.orderSettlements.byOrder.path, {
          orderId,
        }),
        method: API_ENDPOINTS.orderSettlements.byOrder.method,
      }),
      providesTags: (result, error, orderId) => [
        "OrderSettlement",
        { type: "OrderSettlement", id: orderId },
      ],
    }),

    settleNowOrderSettlement: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.orderSettlements.settleNow.path, {
          id,
        }),
        method: API_ENDPOINTS.orderSettlements.settleNow.method,
      }),
      invalidatesTags: ["OrderSettlement"],
    }),

    addSettledTrxIdOrderSettlement: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(
          API_ENDPOINTS.orderSettlements.addSettledTrxId.path,
          { id }
        ),
        method: API_ENDPOINTS.orderSettlements.addSettledTrxId.method,
        body: payload,
      }),
      invalidatesTags: ["OrderSettlement"],
    }),

    getOrderBreakdown: builder.query({
      query: (orderId) => ({
        url: buildEndpointPath(API_ENDPOINTS.orderSettlements.breakdown.path, {
          orderId,
        }),
        method: API_ENDPOINTS.orderSettlements.breakdown.method,
      }),
      providesTags: (result, error, orderId) => [
        "OrderSettlement",
        { type: "OrderSettlement", id: `breakdown-${orderId}` },
      ],
    }),

    updateOrderBreakdown: builder.mutation({
      query: ({ orderId, ...payload }) => ({
        url: buildEndpointPath(
          API_ENDPOINTS.orderSettlements.updateBreakdown.path,
          { orderId }
        ),
        method: API_ENDPOINTS.orderSettlements.updateBreakdown.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        "OrderSettlement",
        { type: "OrderSettlement", id: orderId },
        { type: "OrderSettlement", id: `breakdown-${orderId}` },
      ],
    }),

    disburseResellerProfit: builder.mutation({
      query: ({ orderId, ...payload }) => ({
        url: buildEndpointPath(
          API_ENDPOINTS.orderSettlements.disburseResellerProfit.path,
          { orderId }
        ),
        method: API_ENDPOINTS.orderSettlements.disburseResellerProfit.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        "OrderSettlement",
        "ResellerTransactions",
        "Transactions",
        { type: "OrderSettlement", id: orderId },
        { type: "OrderSettlement", id: `breakdown-${orderId}` },
      ],
    }),

    createVendorInvoice: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.orderSettlements.createVendorInvoice.path,
        method: API_ENDPOINTS.orderSettlements.createVendorInvoice.method,
        body: payload,
      }),
      invalidatesTags: ["OrderSettlement", "VendorInvoice", "Transactions"],
    }),

    listVendorInvoices: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.orderSettlements.listVendorInvoices.path,
        method: API_ENDPOINTS.orderSettlements.listVendorInvoices.method,
        params,
      }),
      providesTags: ["VendorInvoice"],
    }),

    getVendorInvoiceDetails: builder.query({
      query: (id) => ({
        url: buildEndpointPath(
          API_ENDPOINTS.orderSettlements.vendorInvoiceDetails.path,
          { id }
        ),
        method: API_ENDPOINTS.orderSettlements.vendorInvoiceDetails.method,
      }),
      providesTags: (result, error, id) => [{ type: "VendorInvoice", id }],
    }),

    payVendorInvoice: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(
          API_ENDPOINTS.orderSettlements.payVendorInvoice.path,
          { id }
        ),
        method: API_ENDPOINTS.orderSettlements.payVendorInvoice.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "VendorInvoice",
        { type: "VendorInvoice", id },
        "OrderSettlement",
        "Transactions",
      ],
    }),

    approveVendorInvoice: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(
          API_ENDPOINTS.orderSettlements.approveVendorInvoice.path,
          { id }
        ),
        method: API_ENDPOINTS.orderSettlements.approveVendorInvoice.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "VendorInvoice",
        { type: "VendorInvoice", id },
        "OrderSettlement",
        "Transactions",
      ],
    }),

    rejectVendorInvoice: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(
          API_ENDPOINTS.orderSettlements.rejectVendorInvoice.path,
          { id }
        ),
        method: API_ENDPOINTS.orderSettlements.rejectVendorInvoice.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "VendorInvoice",
        { type: "VendorInvoice", id },
      ],
    }),

    getAdminPaymentAccounts: builder.query({
      query: () => ({
        url: API_ENDPOINTS.orderSettlements.adminPaymentAccounts.path,
        method: API_ENDPOINTS.orderSettlements.adminPaymentAccounts.method,
      }),
    }),
  }),
});

export const {
  useListOrderSettlementsQuery,
  useGetOrderSettlementByOrderQuery,
  useSettleNowOrderSettlementMutation,
  useAddSettledTrxIdOrderSettlementMutation,
  useGetOrderBreakdownQuery,
  useUpdateOrderBreakdownMutation,
  useDisburseResellerProfitMutation,
  useCreateVendorInvoiceMutation,
  useListVendorInvoicesQuery,
  useGetVendorInvoiceDetailsQuery,
  usePayVendorInvoiceMutation,
  useApproveVendorInvoiceMutation,
  useRejectVendorInvoiceMutation,
  useGetAdminPaymentAccountsQuery,
} = orderSettlementApi;

export default orderSettlementApi;
