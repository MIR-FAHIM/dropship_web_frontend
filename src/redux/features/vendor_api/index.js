
import baseApi from "../../api/baseApi";
import { API_ENDPOINTS, buildEndpointPath } from "../../api/apiEndpoints";

const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    vendorRegister: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.vendors.register.path,
        method: API_ENDPOINTS.vendors.register.method,
        body: data,
      }),
    }),

        loginAsVendor: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.auth.loginAsVendor.path,
        method: API_ENDPOINTS.auth.loginAsVendor.method,
        body: data,
      }),
    }),
    vendorLogin: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.auth.login.path,
        method: API_ENDPOINTS.auth.login.method,
        body: data,
      }),
    }),
    getVendorProfile: builder.query({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.vendors.profile.path, { id }),
        method: API_ENDPOINTS.vendors.profile.method,
      }),
      providesTags: ["Vendor"],
    }),
    getVendorList: builder.query({
      query: () => ({
        url: API_ENDPOINTS.vendors.list.path,
        method: API_ENDPOINTS.vendors.list.method,
      }),
      providesTags: ["Vendor"],
    }),
    getVendorProducts: builder.query({
      query: ({ vendorId, page = 1 }) => ({
        url: buildEndpointPath(API_ENDPOINTS.vendors.products.path, { vendorId }),
        params: { page },
      }),
      providesTags: ["Product"],
    }),
    vendorIsActive: builder.mutation({
      query: ({ id, data }) => ({
        url: buildEndpointPath(API_ENDPOINTS.vendors.isActive.path, { id }),
        method: API_ENDPOINTS.vendors.isActive.method,
        body: data,
      }),
      invalidatesTags: ["Vendor"],
    }),
  }),
});

export const {
  useVendorRegisterMutation,
  useVendorLoginMutation,
  useGetVendorProfileQuery,
  useGetVendorListQuery,
  useGetVendorProductsQuery,
  useVendorIsActiveMutation,
  useLoginAsVendorMutation,
} = vendorApi;

export default vendorApi;
