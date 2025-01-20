import baseApi from "../../api/baseApi";

const overviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOverview: builder.query({
      query: () => `/dashboard-stats`,
    }),
   
   
  }),
});

export const {
  useGetAllOverviewQuery,
  
} = overviewApi;
