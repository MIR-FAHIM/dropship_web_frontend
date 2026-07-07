import baseApi from "../../api/baseApi";
import { API_ENDPOINTS } from "../../api/apiEndpoints";

const accountingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddBalanceDataUser: builder.query({
      query: (id) => `/get-balance-add-data-user/${id}`,
    }),

    getCreditTransactions: builder.query({
      query: (page = 1) => ({
        url: API_ENDPOINTS.transactions.credit.path,
        params: { page },
      }),
    }),

    getDebitTransactions: builder.query({
      query: (page = 1) => ({
        url: API_ENDPOINTS.transactions.debit.path,
        params: { page },
      }),
    }),
getResellerTransactions: builder.query({
  query: ({ page = 1, reseller_id } = {}) => ({
    url: API_ENDPOINTS.transactions.reseller.path,
    params: { page, reseller_id },
  }),
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
  }),
});

export const {
  useGetAddBalanceDataUserQuery,
  useGetCreditTransactionsQuery,
  useGetDebitTransactionsQuery,
  useGetResellerTransactionsQuery,
  useGetTransactionReportQuery,
  useAddUserBankAccountMutation,
  useGetUserBankAccountQuery,
  useGetPaymentMethodsQuery,
} = accountingApi;

export default accountingApi;
