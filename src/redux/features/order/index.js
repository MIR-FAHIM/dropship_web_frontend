import baseApi from "../../api/baseApi";

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrder: builder.query({
      query: () => `/orders`,
      providesTags: ["Order"],
    }),
    getOrderDetailsById: builder.query({
      query: (id) => `/orders/${id}`,
    }),
    getInvoiceAmount: builder.query({
      query: ({ startDate, endDate, id }) =>
        `/invoice-calculate-amount?start=${startDate}&end=${endDate}&order_list_id=5${id}`,
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderInfo, id }) => ({
        url: `/orders/status/${id}`,
        method: "PUT",
        body: orderInfo,
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetAllOrderQuery,
  useGetOrderDetailsByIdQuery,
  useUpdateOrderStatusMutation,
  useGetInvoiceAmountQuery,
} = orderApi;
