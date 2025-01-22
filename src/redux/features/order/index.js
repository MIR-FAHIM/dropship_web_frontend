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
    getInvoiceDetailsByPaymentId: builder.query({
      query: (id) => `/show-invoice/${id}`,
    }),
    getInvoiceAmount: builder.query({
      query: ({ startDate, endDate, id }) => {
        return `/invoice-calculate-amount?start=${startDate}&end=${endDate}&order_list_id=${id}`;
      },
    }),
    createInvoice: builder.mutation({
      query: (invoiceData) => ({
        url: `/invoice`,
        method: "POST",
        body: invoiceData,
      }),
    }),
    itemDispatchRequest: builder.mutation({
      query: (dispatchData) => ({
        url: `/items/delivery/request`,
        method: "POST",
        body: dispatchData,
      }),
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
  useItemDispatchRequestMutation,
  useCreateInvoiceMutation,
 
  useGetInvoiceDetailsByPaymentIdQuery,
} = orderApi;
