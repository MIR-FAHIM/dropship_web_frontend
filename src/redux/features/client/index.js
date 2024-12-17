import baseApi from "../../api/baseApi";

const clientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllClient: builder.query({
      query: () => `/users`,
    }),
    getClientById: builder.query({
      query: (id) => `/user/${id}`,
    }),
  }),
});

export const { useGetAllClientQuery, useGetClientByIdQuery } = clientApi;
