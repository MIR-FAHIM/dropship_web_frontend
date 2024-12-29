import baseApi from "../../api/baseApi";

const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPayment: builder.query({
      query: () => `/payments`,
    }),
    getPaymentById: builder.query({
      query: (id) => `/payments/${id}`,
    }),
  }),
});

export const { useGetAllPaymentQuery, useGetPaymentByIdQuery } = paymentApi;
