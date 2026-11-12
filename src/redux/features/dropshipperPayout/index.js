import baseApi from "../../api/baseApi";

// Dropshipper payout invoices: one invoice pays a dropshipper's profit for many orders.
const dropshipperPayoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Admin: a dropshipper's unpaid-profit orders, each payable or not (with reason).
    getPayableOrders: builder.query({
      query: (dropshipperId) => ({
        url: "/dropshipper-payouts/payable-orders",
        params: { dropshipper_id: dropshipperId },
      }),
      providesTags: ["DropshipperPayout"],
      keepUnusedDataFor: 0,
    }),

    // Admin: all invoices. Dropshipper: their own.
    listPayoutInvoices: builder.query({
      query: (params = {}) => ({ url: "/dropshipper-payouts", params }),
      providesTags: ["DropshipperPayout"],
    }),

    getPayoutInvoice: builder.query({
      query: (id) => `/dropshipper-payouts/${id}`,
      providesTags: (result, error, id) => [{ type: "DropshipperPayout", id }],
    }),

    createPayoutInvoice: builder.mutation({
      query: (body) => ({ url: "/dropshipper-payouts", method: "POST", body }),
      invalidatesTags: ["DropshipperPayout", "ResellerTransactions", "Order", "OrderSettlement"],
    }),

    payPayoutInvoice: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/dropshipper-payouts/${id}/pay`, method: "POST", body }),
      invalidatesTags: ["DropshipperPayout", "ResellerTransactions", "Order", "OrderSettlement"],
    }),

    cancelPayoutInvoice: builder.mutation({
      query: ({ id, reason }) => ({ url: `/dropshipper-payouts/${id}/cancel`, method: "POST", body: { reason } }),
      invalidatesTags: ["DropshipperPayout"],
    }),
  }),
});

export const {
  useGetPayableOrdersQuery,
  useListPayoutInvoicesQuery,
  useGetPayoutInvoiceQuery,
  useCreatePayoutInvoiceMutation,
  usePayPayoutInvoiceMutation,
  useCancelPayoutInvoiceMutation,
} = dropshipperPayoutApi;

export default dropshipperPayoutApi;
