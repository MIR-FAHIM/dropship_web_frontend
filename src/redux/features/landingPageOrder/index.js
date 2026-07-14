import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const landingPageOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addLandingPageOrder: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.landingPageOrders.add.path,
        method: API_ENDPOINTS.landingPageOrders.add.method,
        body: payload,
      }),
      invalidatesTags: ["LandingPageOrder"],
    }),

    createLandingPageOrder: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.landingPageOrders.create.path,
        method: API_ENDPOINTS.landingPageOrders.create.method,
        body: payload,
      }),
      invalidatesTags: ["LandingPageOrder"],
    }),

    listLandingPageOrders: builder.query({
      query: ({ reseller_id, status, tracking_code } = {}) => ({
        url: API_ENDPOINTS.landingPageOrders.list.path,
        params: { reseller_id, status, tracking_code },
      }),
      providesTags: ["LandingPageOrder"],
    }),

    getLandingPageOrderDetails: builder.query({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.landingPageOrders.details.path, { id }),
        method: API_ENDPOINTS.landingPageOrders.details.method,
      }),
      providesTags: (result, error, id) => [{ type: "LandingPageOrder", id }],
    }),

    updateLandingPageOrder: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.landingPageOrders.update.path, { id }),
        method: API_ENDPOINTS.landingPageOrders.update.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "LandingPageOrder",
        { type: "LandingPageOrder", id },
      ],
    }),

    deleteLandingPageOrder: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.landingPageOrders.delete.path, { id }),
        method: API_ENDPOINTS.landingPageOrders.delete.method,
      }),
      invalidatesTags: ["LandingPageOrder"],
    }),

    passLandingPageOrderToResellerBrain: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.landingPageOrders.passToResellerBrain.path, { id }),
        method: API_ENDPOINTS.landingPageOrders.passToResellerBrain.method,
      }),
      invalidatesTags: (result, error, id) => [
        "LandingPageOrder",
        { type: "LandingPageOrder", id },
      ],
    }),
  }),
});

export const {
  useAddLandingPageOrderMutation,
  useCreateLandingPageOrderMutation,
  useListLandingPageOrdersQuery,
  useGetLandingPageOrderDetailsQuery,
  useUpdateLandingPageOrderMutation,
  useDeleteLandingPageOrderMutation,
  usePassLandingPageOrderToResellerBrainMutation,
} = landingPageOrderApi;

export default landingPageOrderApi;
