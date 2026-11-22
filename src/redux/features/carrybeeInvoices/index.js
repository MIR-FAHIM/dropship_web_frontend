import baseApi from "../../api/baseApi";

// Admin → CarryBee Invoices: every CarryBee invoice of the platform account and of each
// vendor's own CarryBee account, grouped per account with sums.
// Plus "Match payouts with CarryBee" (reconcile): CarryBee's final invoice lines are the truth per order.
const carrybeeInvoicesApi = baseApi.enhanceEndpoints({ addTagTypes: ["CarrybeeReconcile"] }).injectEndpoints({
  endpoints: (builder) => ({
    // params: from, to (YYYY-MM-DD), receivable_status (all|paid|unpaid), refresh (1 = skip the 10-min cache)
    getAllCarrybeeInvoices: builder.query({
      query: (params = {}) => ({ url: "/delivery-companies/carrybee/all-invoices", params }),
      keepUnusedDataFor: 300,
    }),

    /* ---------- reconcile (account = "platform" | "vendor-{id}") ---------- */
    getCarrybeeReconcile: builder.query({
      query: (account) => ({ url: `/delivery-companies/carrybee/reconcile/${account}` }),
      providesTags: ["CarrybeeReconcile"],
    }),
    syncCarrybeeReconcile: builder.mutation({
      query: ({ account, refresh = false }) => ({
        url: `/delivery-companies/carrybee/reconcile/${account}/sync`,
        method: "POST",
        body: { refresh },
      }),
      invalidatesTags: ["CarrybeeReconcile"],
    }),
    // payer: "vendor" | "admin" | "dropshipper" | null
    setReturnPenaltyPayer: builder.mutation({
      query: ({ orderId, payer, note }) => ({
        url: `/delivery-companies/carrybee/reconcile/orders/${orderId}/penalty`,
        method: "POST",
        body: { payer, note },
      }),
      invalidatesTags: ["CarrybeeReconcile"],
    }),
    resolvePayoutFlag: builder.mutation({
      query: ({ id, note }) => ({ url: `/delivery-companies/carrybee/reconcile/flags/${id}/resolve`, method: "POST", body: { note } }),
      invalidatesTags: ["CarrybeeReconcile"],
    }),
    reissueVendorInvoice: builder.mutation({
      query: (invoiceId) => ({ url: `/order-settlements/vendor-invoices/${invoiceId}/reissue`, method: "POST" }),
      invalidatesTags: ["CarrybeeReconcile"],
    }),
  }),
});

export const {
  useGetAllCarrybeeInvoicesQuery,
  useLazyGetAllCarrybeeInvoicesQuery,
  useGetCarrybeeReconcileQuery,
  useSyncCarrybeeReconcileMutation,
  useSetReturnPenaltyPayerMutation,
  useResolvePayoutFlagMutation,
  useReissueVendorInvoiceMutation,
} = carrybeeInvoicesApi;
