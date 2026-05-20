import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const vendorCarryBeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addVendorCarryBeeCredential: builder.mutation({
      query: (body) => ({
        url: API_ENDPOINTS.vendorCarryBeeCredentials.add.path,
        method: API_ENDPOINTS.vendorCarryBeeCredentials.add.method,
        body,
      }),
      invalidatesTags: ["VendorCarryBee"],
    }),

    listVendorCarryBeeCredentials: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.vendorCarryBeeCredentials.list.path,
        params,
      }),
      providesTags: ["VendorCarryBee"],
    }),

    getVendorCarryBeeCredentialDetails: builder.query({
      query: (id) =>
        buildEndpointPath(API_ENDPOINTS.vendorCarryBeeCredentials.details.path, { id }),
      providesTags: ["VendorCarryBee"],
    }),

    updateVendorCarryBeeCredential: builder.mutation({
      query: ({ id, ...body }) => ({
        url: buildEndpointPath(API_ENDPOINTS.vendorCarryBeeCredentials.update.path, { id }),
        method: API_ENDPOINTS.vendorCarryBeeCredentials.update.method,
        body,
      }),
      invalidatesTags: ["VendorCarryBee"],
    }),

    deleteVendorCarryBeeCredential: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.vendorCarryBeeCredentials.delete.path, { id }),
        method: API_ENDPOINTS.vendorCarryBeeCredentials.delete.method,
      }),
      invalidatesTags: ["VendorCarryBee"],
    }),
  }),
});

export const {
  useAddVendorCarryBeeCredentialMutation,
  useListVendorCarryBeeCredentialsQuery,
  useGetVendorCarryBeeCredentialDetailsQuery,
  useUpdateVendorCarryBeeCredentialMutation,
  useDeleteVendorCarryBeeCredentialMutation,
} = vendorCarryBeeApi;

export default vendorCarryBeeApi;
