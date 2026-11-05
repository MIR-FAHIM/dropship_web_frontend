import baseApi from "../../api/baseApi";
import { API_ENDPOINTS } from "../../api/apiEndpoints";

const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({


    getAdminDashboardReport: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.dashboard.adminDashboardReport.path,
        params: params || undefined,
      }),
    }),

    getCashflowDashboard: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.dashboard.cashflowDashboard.path,
        params: params || undefined,
      }),
    }),

    getProductClicksMonthwiseReport: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.productClicks.monthwiseReport.path,
        params,
      }),
    }),

    getProductClicksDaywiseReport: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.productClicks.daywiseReport.path,
        params,
      }),
    }),

    getProductClicksLast7DaysReport: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.productClicks.last7DaysReport.path,
        params,
      }),
    }),

    getProductClicksLeaderboard: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.productClicks.leaderboard.path,
        params,
      }),
    }),
  }),
});

export const {
  useGetAdminDashboardReportQuery,
  useGetCashflowDashboardQuery,
  useGetProductClicksMonthwiseReportQuery,
  useGetProductClicksDaywiseReportQuery,
  useGetProductClicksLast7DaysReportQuery,
  useGetProductClicksLeaderboardQuery,
} = reportApi;

export default reportApi;
