import baseApi from "../../api/baseApi";
import { API_ENDPOINTS } from "../../api/apiEndpoints";

const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({


    getAdminDashboardReport: builder.query({
      query: () => API_ENDPOINTS.dashboard.adminDashboardReport.path,
    }),
  }),
});

export const {
  useGetAdminDashboardReportQuery,
} = reportApi;

export default reportApi;
