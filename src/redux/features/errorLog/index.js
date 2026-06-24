import baseApi from "../../api/baseApi";
import API_ENDPOINTS from "../../api/apiEndpoints";

const errorLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductCreateErrorLogs: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.errorLogs.productCreate.path,
        params,
      }),
    }),

    getLoginErrorLogs: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.errorLogs.login.path,
        params,
      }),
    }),

    getRegistrationErrorLogs: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.errorLogs.register.path,
        params,
      }),
    }),

    getOrderErrorLogs: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.errorLogs.order.path,
        params,
      }),
    }),

    getOverallErrorLogsReport: builder.query({
      query: () => ({
        url: API_ENDPOINTS.errorLogs.overallReport.path,
      }),
    }),
  }),
});

export const {
  useGetProductCreateErrorLogsQuery,
  useGetLoginErrorLogsQuery,
  useGetRegistrationErrorLogsQuery,
  useGetOrderErrorLogsQuery,
  useGetOverallErrorLogsReportQuery,
} = errorLogApi;

export default errorLogApi;