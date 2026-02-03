import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const addressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserAddresses: builder.query({
      query: (userId) => buildEndpointPath(API_ENDPOINTS.addresses.byUser.path, { userId }),
    }),
    addAddress: builder.mutation({
      query: (payload) => {
        const formData = new FormData();
        Object.entries(payload || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });

        return {
          url: API_ENDPOINTS.addresses.add.path,
          method: API_ENDPOINTS.addresses.add.method,
          body: formData,
        };
      },
    }),
  }),
});

export const { useGetUserAddressesQuery, useAddAddressMutation } = addressApi;

export default addressApi;
