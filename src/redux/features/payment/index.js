import baseApi from "../../api/baseApi";

const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPayment: builder.query({
      query: () => `/payments`,
      providesTags: ["Payment"],
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
    updatePaymentStatus: builder.mutation({
      query: ({ paymentInfo, id }) => ({
        url: `/payment/status/${id}`,
        method: "PUT",
        body: paymentInfo,
      }),
      invalidatesTags: ["Payment"],
    }),
  }),
});

export const {
  useGetAllPaymentQuery,
  useGetPaymentByIdQuery,
  useAdvancePaymentMutation,
  useUpdatePaymentStatusMutation,
} = paymentApi;
