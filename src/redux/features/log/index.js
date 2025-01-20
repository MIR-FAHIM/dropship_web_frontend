import baseApi from "../../api/baseApi";

const logApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLogStatus: builder.query({
      query: () => `/log-status`,
    }),
    getLogStatusById: builder.query({
      query: (id) => `/log-status/${id}`,
    }),
  }),
});

export const { useGetLogStatusQuery, useGetLogStatusByIdQuery } = logApi;
