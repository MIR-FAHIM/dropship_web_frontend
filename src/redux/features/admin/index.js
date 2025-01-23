import baseApi from "../../api/baseApi";

const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAdmin: builder.query({
      query: () => `/admin/list`,
    }),
  }),
});

export const { useGetAllAdminQuery } = adminApi;
