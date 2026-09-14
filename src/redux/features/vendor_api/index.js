
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
    getVendorId: builder.query({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.vendors.getVendorId.path, { id }),
        method: API_ENDPOINTS.vendors.getVendorId.method,
      }),
      providesTags: ["Vendor"],
    }),
    getVendorDashboardReport: builder.query({
      query: (vendorId) => ({
        url: buildEndpointPath(API_ENDPOINTS.vendors.dashboardReport.path, { vendorId }),
        method: API_ENDPOINTS.vendors.dashboardReport.method,
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
    addKycDocument: builder.mutation({
      query: (formData) => ({
        url: API_ENDPOINTS.documentsKyc.add.path,
        method: API_ENDPOINTS.documentsKyc.add.method,
        body: formData,
      }),
      invalidatesTags: ["Upload"],
    }),
    getKycDocumentsByUser: builder.query({
      query: (userId) => ({
        url: buildEndpointPath(API_ENDPOINTS.documentsKyc.byUser.path, { userId }),
        method: API_ENDPOINTS.documentsKyc.byUser.method,
      }),
      providesTags: ["Upload"],
    }),
    updateKycDocument: builder.mutation({
      query: ({ id, formData }) => ({
        url: buildEndpointPath(API_ENDPOINTS.documentsKyc.update.path, { id }),
        method: API_ENDPOINTS.documentsKyc.update.method,
        body: formData,
      }),
      invalidatesTags: ["Upload"],
    }),
  }),
});

export const {
  useVendorRegisterMutation,
  useVendorLoginMutation,
  useGetVendorProfileQuery,
  useGetVendorIdQuery,
  useGetVendorListQuery,
  useGetVendorProductsQuery,
  useGetVendorDashboardReportQuery,
  useVendorIsActiveMutation,
  useLoginAsVendorMutation,
  useAddKycDocumentMutation,
  useGetKycDocumentsByUserQuery,
  useUpdateKycDocumentMutation,
} = vendorApi;

export default vendorApi;
