import baseApi from "../../api/baseApi";

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrder: builder.query({
      query: () => `/orders`,
    }),
    getOrderDetailsById: builder.query({
      query: (id) => `/orders/${id}`,
    }),
  }),
});

export const { useGetAllOrderQuery, useGetOrderDetailsByIdQuery } = orderApi;
