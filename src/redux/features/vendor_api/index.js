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
  }),
});

export const {
  useVendorRegisterMutation,
  useVendorLoginMutation,
  useGetVendorProfileQuery,
  useGetVendorListQuery,
} = vendorApi;

export default vendorApi;
