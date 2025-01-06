import baseApi from "../../api/baseApi";

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrder: builder.query({
      query: () => `/orders`,
    }),
  }),
});

export const { useGetAllOrderQuery } = orderApi;