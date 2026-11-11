import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkoutOrder: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.orders.checkout.path,
        method: API_ENDPOINTS.orders.checkout.method,
        body: payload,
      }),
    }),
    listOrdersByUser: builder.query({
      query: ({ userId, page }) => ({
        url: buildEndpointPath(API_ENDPOINTS.orders.listByUser.path, { userId }),
        params: page ? { page } : undefined,
      }),
    }),
    vendorOrders: builder.query({
      query: ({ vendorId, page }) => ({
        url: buildEndpointPath(API_ENDPOINTS.orders.vendorOrders.path, { vendorId }),
        params: page ? { page } : undefined,
      }),
    }),

    listAllOrders: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.orders.allOrders.path,
        params: params || undefined,
      }),
      providesTags: ["Order"],
    }),

    getOrderStatusSummary: builder.query({
      query: () => API_ENDPOINTS.orders.statusSummary.path,
    }),

    listCompletedOrders: builder.query({
      query: () => API_ENDPOINTS.orders.completed.path,
    }),

    listCompletedOrdersByUser: builder.query({
      query: (userId) =>
        buildEndpointPath(API_ENDPOINTS.orders.completedByUser.path, { userId }),
    }),

    getOrderDetails: builder.query({
      query: (id) => buildEndpointPath(API_ENDPOINTS.orders.details.path, { id }),
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, status_id, note, changed_by, override_reason, completion_confirmed }) => {
        const formData = new FormData();
        formData.append("status_id", status_id);
        if (note) formData.append("note", note);
        if (changed_by) formData.append("changed_by", changed_by);
        // Admin-only reason for a change the status rules would otherwise block.
        if (override_reason) formData.append("override_reason", override_reason);
        // Admin confirmed the completion checklist (required to set Completed).
        if (completion_confirmed) formData.append("completion_confirmed", "1");
        return {
          url: buildEndpointPath(API_ENDPOINTS.orders.updateStatus.path, { id }),
          method: API_ENDPOINTS.orders.updateStatus.method,
          body: formData,
        };
      },
    }),

    updateOrderItemStatus: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.orders.updateItemStatus.path, { id }),
        method: API_ENDPOINTS.orders.updateItemStatus.method,
        body: payload,
      }),
    }),
    updateOrderInfo: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.orders.update.path, { id }),
        method: API_ENDPOINTS.orders.update.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => result ? [
        { type: "OrderSettlement", id: `breakdown-${id}` },
        { type: "Grid", id: "VendorOrderHistory" },
        "CarryBeeOrder",
      ] : [],
    }),
    orderReplacementProducts: builder.query({
      query: ({ search, page }) => ({
        url: API_ENDPOINTS.orders.replacementProducts.path,
        params: { search, page },
      }),
    }),
    createContactUs: builder.mutation({
      query: (orderData) => ({
        url: "https://hrmapi.biswasandbrothers.com/api/add-contact-us",
        method: "POST",
           headers: {
      token: 'prefix_67e12b036e3f06.63889147',
      'Content-Type': 'application/json'
    },
        body: orderData
      }),
    }),

    // Inside your redux query definition
    getUserBalance: builder.query({
      query: (id) => `/users/getBalance/${id}`,
      providesTags: ["ResellerTransactions"],
    }),

    checkAdvanceRequirement: builder.query({
      query: (userId) => ({
        url: API_ENDPOINTS.orders.checkAdvanceRequirement.path,
        params: userId ? { user_id: userId } : undefined,
      }),
      providesTags: ["OrderAdvance"],
    }),

    payAdvance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: buildEndpointPath(API_ENDPOINTS.orders.payAdvance.path, { id }),
        method: API_ENDPOINTS.orders.payAdvance.method,
        body,
      }),
      invalidatesTags: ["OrderAdvance", "OrderDetails"],
    }),

    approveAdvance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: buildEndpointPath(API_ENDPOINTS.orders.approveAdvance.path, { id }),
        method: API_ENDPOINTS.orders.approveAdvance.method,
        body,
      }),
      invalidatesTags: ["OrderAdvance", "OrderDetails", "ResellerTransactions"],
    }),

    rejectAdvance: builder.mutation({
      query: ({ id, reason, reverse_approval }) => ({
        url: buildEndpointPath(API_ENDPOINTS.orders.rejectAdvance.path, { id }),
        method: API_ENDPOINTS.orders.rejectAdvance.method,
        body: { reason, reverse_approval },
      }),
      invalidatesTags: ["OrderAdvance", "OrderDetails", "ResellerTransactions"],
    }),

    getDropshipperPayoutReview: builder.query({
      query: (userId) => `/users/${userId}/payout-review`,
      providesTags: ["ResellerTransactions"],
      keepUnusedDataFor: 0,
    }),

    getOrderCompletionCheck: builder.query({
      query: (id) => `/orders/${id}/completion-check`,
      keepUnusedDataFor: 0,
    }),

    getOrderCourierEvents: builder.query({
      query: (id) => `/orders/${id}/courier-events`,
      providesTags: (result, error, id) => [{ type: "CourierEvents", id }],
    }),

    approveCourierReview: builder.mutation({
      query: ({ id, note }) => ({
        url: `/orders/${id}/courier-review/approve`,
        method: "POST",
        body: { note },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "CourierEvents", id },
        { type: "OrderSettlement", id: `breakdown-${id}` },
      ],
    }),

    updateOrderAdminNote: builder.mutation({
      query: ({ id, admin_note }) => ({
        url: buildEndpointPath(API_ENDPOINTS.orders.updateAdminNote.path, { id }),
        method: API_ENDPOINTS.orders.updateAdminNote.method,
        body: { admin_note },
      }),
    }),
  }),
});

export const {
  useGetUserBalanceQuery,
  useCheckoutOrderMutation,
  useCreateContactUsMutation,
  useListOrdersByUserQuery,
  useListAllOrdersQuery,
  useGetOrderStatusSummaryQuery,
  useListCompletedOrdersQuery,
  useListCompletedOrdersByUserQuery,
  useGetOrderDetailsQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderItemStatusMutation,
  useUpdateOrderInfoMutation,
  useOrderReplacementProductsQuery,
  useVendorOrdersQuery,
  useCheckAdvanceRequirementQuery,
  usePayAdvanceMutation,
  useApproveAdvanceMutation,
  useRejectAdvanceMutation,
  useUpdateOrderAdminNoteMutation,
  useGetDropshipperPayoutReviewQuery,
  useGetOrderCompletionCheckQuery,
  useGetOrderCourierEventsQuery,
  useApproveCourierReviewMutation,
} = orderApi;

export default orderApi;
