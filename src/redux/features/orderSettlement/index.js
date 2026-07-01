import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const orderSettlementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listOrderSettlements: builder.query({
      query: (page = 1) => ({
        url: API_ENDPOINTS.orderSettlements.list.path,
        method: API_ENDPOINTS.orderSettlements.list.method,
        params: { page },
      }),
      providesTags: ["OrderSettlement"],
    }),

    getOrderSettlementByOrder: builder.query({
      query: (orderId) => ({
        url: buildEndpointPath(API_ENDPOINTS.orderSettlements.byOrder.path, {
          orderId,
        }),
        method: API_ENDPOINTS.orderSettlements.byOrder.method,
      }),
      providesTags: (result, error, orderId) => [
        "OrderSettlement",
        { type: "OrderSettlement", id: orderId },
      ],
    }),

    settleNowOrderSettlement: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.orderSettlements.settleNow.path, {
          id,
        }),
        method: API_ENDPOINTS.orderSettlements.settleNow.method,
      }),
      invalidatesTags: ["OrderSettlement"],
    }),

    addSettledTrxIdOrderSettlement: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(
          API_ENDPOINTS.orderSettlements.addSettledTrxId.path,
          { id }
        ),
        method: API_ENDPOINTS.orderSettlements.addSettledTrxId.method,
        body: payload,
      }),
      invalidatesTags: ["OrderSettlement"],
    }),
  }),
});

export const {
  useListOrderSettlementsQuery,
  useGetOrderSettlementByOrderQuery,
  useSettleNowOrderSettlementMutation,
  useAddSettledTrxIdOrderSettlementMutation,
} = orderSettlementApi;

export default orderSettlementApi;
