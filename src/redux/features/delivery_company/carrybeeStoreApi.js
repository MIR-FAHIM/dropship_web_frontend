import baseApi from "../../api/baseApi";
import { API_ENDPOINTS, buildEndpointPath } from "../../api/apiEndpoints";

const carrybeeStoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCities: builder.query({
      query: () => API_ENDPOINTS.deliveryCompanies.carrybeeCities.path,
    }),

    getZones: builder.query({
      query: ({ vendorId, cityId }) =>
        buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeZones.path, { vendorId, cityId }),
    }),

    getAreas: builder.query({
      query: ({ vendorId, cityId, zoneId }) =>
        buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeAreas.path, { vendorId, cityId, zoneId }),
    }),

    listCarryBeeStores: builder.query({
      query: (vendorId) =>
        buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeStores.path, { vendorId }),
      providesTags: ["CarryBeeStore"],
    }),

    createCarryBeeStore: builder.mutation({
      query: ({ vendorId, ...body }) => ({
        url: buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeStoreCreate.path, { vendorId }),
        method: API_ENDPOINTS.deliveryCompanies.carrybeeStoreCreate.method,
        body,
      }),
      invalidatesTags: ["CarryBeeStore"],
    }),

    createCarryBeeOrder: builder.mutation({
      query: ({ vendorId, ...body }) => ({
        url: buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeOrderCreate.path, { vendorId }),
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
      query: ({ vendorId, consignmentId }) => ({
        url: buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeOrderCancel.path, { vendorId, consignmentId }),
        method: API_ENDPOINTS.deliveryCompanies.carrybeeOrderCancel.method,
      }),
      invalidatesTags: ["CarryBeeOrder"],
    }),

    getCarryBeeOrderDetails: builder.query({
      query: ({ vendorId, consignmentId }) =>
        buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeOrderDetails.path, { vendorId, consignmentId }),
      providesTags: ["CarryBeeOrder"],
    }),

    getCarryBeeAreaDetails: builder.mutation({
      query: ({ vendorId, query }) => ({
        url: buildEndpointPath(API_ENDPOINTS.deliveryCompanies.carrybeeAreaDetails.path, { vendorId }),
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

