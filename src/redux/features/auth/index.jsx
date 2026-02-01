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
    // Mutation for creating a main category
    register: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data
      }),
    }),





  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,


} = authApi;

export default authApi;


