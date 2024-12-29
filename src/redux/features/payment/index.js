import baseApi from "../../api/baseApi";

const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPayment: builder.query({
      query: () => `/payments`,
    }),
    getPaymentById: builder.query({
      query: (id) => `/payments/${id}`,
    }),
    advancePayment: builder.mutation({
      query: (paymentInfo) => ({
        url: "/payments",
        method: "POST",
        body: paymentInfo,
      }),
      invalidatesTags: ["Request"],
    }),
  }),
});

export const {
  useGetAllPaymentQuery,
  useGetPaymentByIdQuery,
  useAdvancePaymentMutation,
} = paymentApi;
