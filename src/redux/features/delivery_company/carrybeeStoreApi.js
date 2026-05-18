import baseApi from "../../api/baseApi";
import { API_ENDPOINTS, buildEndpointPath } from "../../api/apiEndpoints";

const carrybeeStoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCities: builder.query({
      query: () => API_ENDPOINTS.deliveryCompanies.carrybeeCities.path,
    }),

    getZones: builder.query({
      query: ({ companyId, cityId }) =>
        buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeZones.path, { companyId, cityId }),
    }),

    getAreas: builder.query({
      query: ({ companyId, cityId, zoneId }) =>
        buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeAreas.path, { companyId, cityId, zoneId }),
    }),

    listCarryBeeStores: builder.query({
      query: (companyId) =>
        buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeStores.path, { companyId }),
      providesTags: ["CarryBeeStore"],
    }),

    createCarryBeeStore: builder.mutation({
      query: ({ companyId, ...body }) => ({
        url: buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeStoreCreate.path, { companyId }),
        method: API_ENDPOINTS.deliveryCompanies.carrybeeStoreCreate.method,
        body,
      }),
      invalidatesTags: ["CarryBeeStore"],
    }),

    createCarryBeeOrder: builder.mutation({
      query: ({ companyId, ...body }) => ({
        url: buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeOrderCreate.path, { companyId }),
        method: API_ENDPOINTS.deliveryCompanies.carrybeeOrderCreate.method,
        body,
      }),
      invalidatesTags: ["CarryBeeOrder"],
    }),
    carrybeeOrderDraftCreate: builder.mutation({
      query: ({ ...body }) => ({
        url: buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeOrderDraftCreate.path),
        method: API_ENDPOINTS.deliveryCompanies.carrybeeOrderDraftCreate.method,
        body,
      }),
      invalidatesTags: ["CarryBeeOrder"],
    }),

    cancelCarryBeeOrder: builder.mutation({
      query: ({ companyId, consignmentId }) => ({
        url: buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeOrderCancel.path, { companyId, consignmentId }),
        method: API_ENDPOINTS.deliveryCompanies.carrybeeOrderCancel.method,
      }),
      invalidatesTags: ["CarryBeeOrder"],
    }),

    getCarryBeeOrderDetails: builder.query({
      query: ({ companyId, consignmentId }) =>
        buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeOrderDetails.path, { companyId, consignmentId }),
      providesTags: ["CarryBeeOrder"],
    }),

    getCarryBeeAreaDetails: builder.mutation({
      query: ({ companyId, query }) => ({
        url: buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeAreaDetails.path, { companyId }),
        method: API_ENDPOINTS.deliveryCompanies.carrybeeAreaDetails.method,
        body: { query },
      }),
    }),
  }),
});

export const {
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
  useListCarryBeeStoresQuery,
  useCreateCarryBeeStoreMutation,
  useCreateCarryBeeOrderMutation,
  useCarrybeeOrderDraftCreateMutation,
  useCancelCarryBeeOrderMutation,
  useGetCarryBeeOrderDetailsQuery,
  useLazyGetCarryBeeOrderDetailsQuery,
  useGetCarryBeeAreaDetailsMutation,
} = carrybeeStoreApi;

export default carrybeeStoreApi;

