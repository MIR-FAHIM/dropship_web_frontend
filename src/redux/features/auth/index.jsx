import baseApi from "../../api/baseApi";
import API_ENDPOINTS from "../../api/apiEndpoints";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.auth.login.path,
        method: API_ENDPOINTS.auth.login.method,
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
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.auth.forgotPassword.path,
        method: API_ENDPOINTS.auth.forgotPassword.method,
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.auth.resetPassword.path,
        method: API_ENDPOINTS.auth.resetPassword.method,
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
    }),
    dropshipperRegister: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.users.dropshipperRegister.path,
        method: API_ENDPOINTS.users.dropshipperRegister.method,
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLoginAsVendorMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRegisterMutation,
  useDropshipperRegisterMutation,
} = authApi;

export default authApi;


