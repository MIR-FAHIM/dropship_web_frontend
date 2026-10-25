import baseApi from "../../api/baseApi";
import { API_ENDPOINTS } from "../../api/apiEndpoints";

const accountingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddBalanceDataUser: builder.query({
      query: (id) => `/get-balance-add-data-user/${id}`,
    }),

    getAllTransactions: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.transactions.all.path,
        params,
      }),
      providesTags: ["Transactions"],
    }),

    getCreditTransactions: builder.query({
      query: (page = 1) => ({
        url: API_ENDPOINTS.transactions.credit.path,
        params: { page },
      }),
      providesTags: ["Transactions"],
    }),

    getDebitTransactions: builder.query({
      query: (page = 1) => ({
        url: API_ENDPOINTS.transactions.debit.path,
        params: { page },
      }),
      providesTags: ["Transactions"],
    }),

    getResellerTransactions: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.transactions.reseller.path,
        params: typeof params === "object" ? params : { page: params },
      }),
      providesTags: ["ResellerTransactions"],
    }),
    getTransactionReport: builder.query({
      query: () => API_ENDPOINTS.transactions.report.path,
    }),
    addUserBankAccount: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.bankAccounts.addUserBankAccount.path,
        method: API_ENDPOINTS.bankAccounts.addUserBankAccount.method,
        body: data,
      }),
    }),
    getUserBankAccount: builder.query({
      query: (userId) => ({
        url: API_ENDPOINTS.bankAccounts.getUserBankAccount.path.replace('{userId}', userId),
        method: API_ENDPOINTS.bankAccounts.getUserBankAccount.method,
      }),
    }),
    getPaymentMethods: builder.query({
      query: () => ({
        url: API_ENDPOINTS.bankAccounts.getPaymentMethods.path,
        method: API_ENDPOINTS.bankAccounts.getPaymentMethods.method,
      }),
    }),

    requestWalletTopup: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.wallet.topup.path,
        method: API_ENDPOINTS.wallet.topup.method,
        body: data,
      }),
      invalidatesTags: ["WalletTopup", "ResellerTransactions"],
    }),

    getMyWalletTopups: builder.query({
      query: ({ page = 1, status } = {}) => ({
        url: API_ENDPOINTS.wallet.myHistory.path,
        params: { page, status },
      }),
      providesTags: ["WalletTopup"],
    }),

    getAllWalletTopups: builder.query({
      query: ({ page = 1, status, search } = {}) => ({
        url: API_ENDPOINTS.wallet.allTopups.path,
        params: { page, status, search },
      }),
      providesTags: ["WalletTopup"],
    }),

    approveWalletTopup: builder.mutation({
      query: ({ id, admin_note }) => ({
        url: API_ENDPOINTS.wallet.approveTopup.path.replace("{id}", id),
        method: API_ENDPOINTS.wallet.approveTopup.method,
        body: { admin_note },
      }),
      invalidatesTags: ["WalletTopup", "ResellerTransactions"],
    }),

    rejectWalletTopup: builder.mutation({
      query: ({ id, reason }) => ({
        url: API_ENDPOINTS.wallet.rejectTopup.path.replace("{id}", id),
        method: API_ENDPOINTS.wallet.rejectTopup.method,
        body: { reason },
      }),
      invalidatesTags: ["WalletTopup"],
    }),
  }),
});

export const {
  useGetAddBalanceDataUserQuery,
  useGetAllTransactionsQuery,
  useGetCreditTransactionsQuery,
  useGetDebitTransactionsQuery,
  useGetResellerTransactionsQuery,
  useGetTransactionReportQuery,
  useAddUserBankAccountMutation,
  useGetUserBankAccountQuery,
  useGetPaymentMethodsQuery,
  useRequestWalletTopupMutation,
  useGetMyWalletTopupsQuery,
  useGetAllWalletTopupsQuery,
  useApproveWalletTopupMutation,
  useRejectWalletTopupMutation,
} = accountingApi;

export default accountingApi;
