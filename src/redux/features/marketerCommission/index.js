import baseApi from "../../api/baseApi";

// Partner Portal phase 1: marketer commission (marketer panel + admin).
const marketerCommissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------- marketer panel ---------- */
    // params: { period: "7d" | "30d" | "90d" | "all" }
    getMarketerOverview: builder.query({
      query: (params = {}) => ({ url: "/marketer/overview", params }),
      providesTags: ["MarketerCommission"],
    }),
    // F3: dropshipper joins a marketer with their public referral code (RB-…)
    previewMarketerReferral: builder.mutation({
      query: (body) => ({ url: "/marketer-client/referral/preview", method: "POST", body }),
    }),
    acceptMarketerReferral: builder.mutation({
      query: (body) => ({ url: "/marketer-client/referral/accept", method: "POST", body }),
      invalidatesTags: ["MarketerRelationship"],
    }),
    getMyCommissions: builder.query({
      query: (params = {}) => ({ url: "/marketer/commissions", params }),
      providesTags: ["MarketerCommission"],
    }),
    getMyCommissionPayouts: builder.query({
      query: (params = {}) => ({ url: "/marketer/commission-payouts", params }),
      providesTags: ["MarketerCommission"],
    }),
    getMyCommissionPayout: builder.query({
      query: (invoiceId) => ({ url: `/marketer/commission-payouts/${invoiceId}` }),
      providesTags: ["MarketerCommission"],
    }),
    // F2: where the marketer wants to be paid
    getMyPaymentAccounts: builder.query({
      query: () => ({ url: "/marketer/payment-accounts" }),
      providesTags: ["MarketerCommission"],
    }),
    addMyPaymentAccount: builder.mutation({
      query: (body) => ({ url: "/marketer/payment-accounts", method: "POST", body }),
      invalidatesTags: ["MarketerCommission"],
    }),
    deleteMyPaymentAccount: builder.mutation({
      query: (id) => ({ url: `/marketer/payment-accounts/${id}`, method: "DELETE" }),
      invalidatesTags: ["MarketerCommission"],
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
    getAdminCommissionPayout: builder.query({
      query: (invoiceId) => ({ url: `/admin/marketers/commission-payouts/${invoiceId}` }),
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
  usePreviewMarketerReferralMutation,
  useAcceptMarketerReferralMutation,
  useGetMyCommissionsQuery,
  useGetMyCommissionPayoutsQuery,
  useGetMyCommissionPayoutQuery,
  useGetMyPaymentAccountsQuery,
  useAddMyPaymentAccountMutation,
  useDeleteMyPaymentAccountMutation,
  useGetAdminCommissionPayoutQuery,
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
