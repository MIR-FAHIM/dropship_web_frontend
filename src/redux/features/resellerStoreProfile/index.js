import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const resellerStoreProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addResellerStoreProfile: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.resellerStoreProfiles.add.path,
        method: API_ENDPOINTS.resellerStoreProfiles.add.method,
        body: payload,
      }),
      invalidatesTags: ["ResellerStoreProfile"],
    }),

    updateResellerStoreProfile: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.resellerStoreProfiles.update.path, { id }),
        method: API_ENDPOINTS.resellerStoreProfiles.update.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "ResellerStoreProfile",
        { type: "ResellerStoreProfile", id },
      ],
    }),

    getResellerStoreProfileByReseller: builder.query({
      query: (resellerId) => ({
        url: buildEndpointPath(API_ENDPOINTS.resellerStoreProfiles.byReseller.path, { resellerId }),
        method: API_ENDPOINTS.resellerStoreProfiles.byReseller.method,
      }),
      providesTags: ["ResellerStoreProfile"],
    }),

    getResellerStoreProfileDetails: builder.query({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.resellerStoreProfiles.details.path, { id }),
        method: API_ENDPOINTS.resellerStoreProfiles.details.method,
      }),
      providesTags: (result, error, id) => [{ type: "ResellerStoreProfile", id }],
    }),
  }),
});

export const {
  useAddResellerStoreProfileMutation,
  useUpdateResellerStoreProfileMutation,
  useGetResellerStoreProfileByResellerQuery,
  useGetResellerStoreProfileDetailsQuery,
} = resellerStoreProfileApi;

export default resellerStoreProfileApi;
