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
      query: (page = 1, reseller_id = 0) => ({
        url: API_ENDPOINTS.transactions.reseller.path,
        params: { page, reseller_id },
      }),
    }),

    getTransactionReport: builder.query({
      query: () => API_ENDPOINTS.transactions.report.path,
    }),
  }),
});

export const {
  useGetAddBalanceDataUserQuery,
  useGetCreditTransactionsQuery,
  useGetDebitTransactionsQuery,
  useGetResellerTransactionsQuery,
  useGetTransactionReportQuery,
} = accountingApi;

export default accountingApi;
