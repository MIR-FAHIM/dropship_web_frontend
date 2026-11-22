import baseApi from "../../api/baseApi";

// Partner Portal phase 1: marketer commission (marketer panel + admin).
const marketerCommissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------- marketer panel ---------- */
    getMarketerOverview: builder.query({
      query: () => ({ url: "/marketer/overview" }),
      providesTags: ["MarketerCommission"],
    }),
    getMyCommissions: builder.query({
      query: (params = {}) => ({ url: "/marketer/commissions", params }),
      providesTags: ["MarketerCommission"],
    }),
    getMyCommissionPayouts: builder.query({
      query: (params = {}) => ({ url: "/marketer/commission-payouts", params }),
      providesTags: ["MarketerCommission"],
    }),

    /* ---------- admin ---------- */
    getAdminMarketerCommissions: builder.query({
      query: () => ({ url: "/admin/marketers/commissions" }),
      providesTags: ["MarketerCommission"],
    }),
    getAdminMarketerCommissionLines: builder.query({
      query: ({ id, ...params }) => ({ url: `/admin/marketers/${id}/commissions`, params }),
      providesTags: ["MarketerCommission"],
    }),
    getAdminCommissionPayouts: builder.query({
      query: (params = {}) => ({ url: "/admin/marketers/commission-payouts", params }),
      providesTags: ["MarketerCommission"],
    }),
    setMarketerCommissionRate: builder.mutation({
      query: ({ id, rate }) => ({ url: `/admin/marketers/${id}/commission-rate`, method: "PATCH", body: { rate } }),
      invalidatesTags: ["MarketerCommission"],
    }),
    createCommissionPayout: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/marketers/${id}/commission-payouts`, method: "POST", body }),
      invalidatesTags: ["MarketerCommission"],
    }),
    payCommissionPayout: builder.mutation({
      query: ({ invoiceId, ...body }) => ({ url: `/admin/marketers/commission-payouts/${invoiceId}/pay`, method: "POST", body }),
      invalidatesTags: ["MarketerCommission"],
    }),
    cancelCommissionPayout: builder.mutation({
      query: ({ invoiceId, reason }) => ({ url: `/admin/marketers/commission-payouts/${invoiceId}/cancel`, method: "POST", body: { reason } }),
      invalidatesTags: ["MarketerCommission"],
    }),
  }),
});

export const {
  useGetMarketerOverviewQuery,
  useGetMyCommissionsQuery,
  useGetMyCommissionPayoutsQuery,
  useGetAdminMarketerCommissionsQuery,
  useGetAdminMarketerCommissionLinesQuery,
  useLazyGetAdminMarketerCommissionLinesQuery,
  useGetAdminCommissionPayoutsQuery,
  useSetMarketerCommissionRateMutation,
  useCreateCommissionPayoutMutation,
  usePayCommissionPayoutMutation,
  useCancelCommissionPayoutMutation,
} = marketerCommissionApi;

export default marketerCommissionApi;
