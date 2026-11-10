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

    getDropshipperProductClickLeaderboard: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.productClicks.dropshipperLeaderboard.path,
        params,
      }),
    }),

    getHomeProductLeaderboard: builder.query({
      query: () => API_ENDPOINTS.productClicks.homeLeaderboard.path,
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
  useGetDropshipperProductClickLeaderboardQuery,
  useGetHomeProductLeaderboardQuery,
} = reportApi;

export default reportApi;
