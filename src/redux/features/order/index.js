import baseApi from "../../api/baseApi";

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrder: builder.query({
      query: () => `/orders`,
      providesTags: ["Order"],
    }),
    getRequestedDeliveryItem: builder.query({
      query: (id) => `/item-delivery-requests/${id}`,
      
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
    updateItemDeliveryStatus: builder.mutation({
      query: ({id }) => ({
        url: `/item-delivery-requests/status/${id}`,
        method: "PUT",
        body:{ "status":"1"},
      }),
     
    }),
  }),
});

export const {
  useGetAllOrderQuery,
  useGetOrderDetailsByIdQuery,
  useGetRequestedDeliveryItemQuery,
  useUpdateOrderStatusMutation,
  useGetInvoiceAmountQuery,
  useItemDispatchRequestMutation,
  useCreateInvoiceMutation,
  useUpdateItemDeliveryStatusMutation,
 
  useGetInvoiceDetailsByPaymentIdQuery,
} = orderApi;
