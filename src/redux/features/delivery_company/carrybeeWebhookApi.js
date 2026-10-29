import baseApi from "../../api/baseApi";

const carrybeeWebhookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnacknowledgedPaidOrders: builder.query({
      query: () => ({
        url: "/delivery-companies/carrybee/unacknowledged-paid-orders",
        method: "GET",
      }),
      providesTags: ["CarrybeePaidOrders"],
    }),

    acknowledgePaidOrder: builder.mutation({
      query: (eventId) => ({
        url: `/delivery-companies/carrybee/acknowledge-paid-order/${eventId}`,
        method: "POST",
      }),
      invalidatesTags: ["CarrybeePaidOrders", "CarrybeeWebhookEvents"],
    }),

    testCarrybeeWebhook: builder.mutation({
      query: (payload) => ({
        url: "/delivery-companies/carrybee/test-webhook",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["CarrybeePaidOrders", "CarrybeeWebhookEvents"],
    }),

    getCarrybeeWebhookEvents: builder.query({
      query: (params = {}) => ({
        url: "/delivery-companies/carrybee/webhook-events",
        method: "GET",
        params,
      }),
      providesTags: ["CarrybeeWebhookEvents"],
    }),

    manualCarrybeeOrderPayment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/delivery-companies/carrybee/manual-order-payment/${id}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CarrybeePaidOrders", "CarrybeeWebhookEvents", "Order", "OrderDetails"],
    }),
  }),
});

export const {
  useGetUnacknowledgedPaidOrdersQuery,
  useAcknowledgePaidOrderMutation,
  useTestCarrybeeWebhookMutation,
  useGetCarrybeeWebhookEventsQuery,
  useManualCarrybeeOrderPaymentMutation,
} = carrybeeWebhookApi;

export default carrybeeWebhookApi;
