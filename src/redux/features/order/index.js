import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkoutOrder: builder.mutation({
      query: (payload) => {
        const formData = new FormData();
        Object.entries(payload || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });

        return {
          url: API_ENDPOINTS.orders.checkout.path,
          method: API_ENDPOINTS.orders.checkout.method,
          body: formData,
        };
      },
    }),
    listOrdersByUser: builder.query({
      query: ({ userId, page }) => ({
        url: buildEndpointPath(API_ENDPOINTS.orders.listByUser.path, { userId }),
        params: page ? { page } : undefined,
      }),
    }),

    listAllOrders: builder.query({
      query: () => API_ENDPOINTS.orders.allOrders.path,
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
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.orders.updateStatus.path, { id }),
        method: API_ENDPOINTS.orders.updateStatus.method,
        body: payload,
      }),
    }),

    updateOrderItemStatus: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.orders.updateItemStatus.path, { id }),
        method: API_ENDPOINTS.orders.updateItemStatus.method,
        body: payload,
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
      query: (id) => `/getBalance/${id}`,
    }),
  }),
});

export const {
  useGetUserBalanceQuery,
  useCheckoutOrderMutation,
  useCreateContactUsMutation,
  useListOrdersByUserQuery,
  useListAllOrdersQuery,
  useListCompletedOrdersQuery,
  useListCompletedOrdersByUserQuery,
  useGetOrderDetailsQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderItemStatusMutation,

} = orderApi;

export default orderApi;
