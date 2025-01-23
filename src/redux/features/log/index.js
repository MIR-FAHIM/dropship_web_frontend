import baseApi from "../../api/baseApi";

const logApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLogStatus: builder.query({
      query: () => `/log-status`,
    }),
    getAdminActivity: builder.query({
      query: () => `/adminactivities`,
    }),
    getLogStatusById: builder.query({
      query: (id) => `/log-status/${id}`,
    }),
  }),
});

export const { useGetLogStatusQuery, useGetAdminActivityQuery, useGetLogStatusByIdQuery } = logApi;
