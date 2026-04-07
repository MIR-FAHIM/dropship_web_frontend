import baseApi from "../../api/baseApi";
import API_ENDPOINTS from "../../api/apiEndpoints";

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (userInfo) => ({
        url: "/admin/login",
        method: "POST",
        body: userInfo,
      }),
    }),
    
    buttonClick: builder.mutation({
      query: (data) => ({
        url: "/click-button-visit",
        method: "POST",
        body: {'button_name': data,}
      }),
    }),
    addContact: builder.mutation({
      query: (data) => ({
        url: "/add-queries",
        method: "POST",
        body: data
      }),
    }),
    getDropshippers: builder.query({
      query: (page = 1) => ({
        url: `${API_ENDPOINTS.users.dropshippers.path}?page=${page}`,
        method: API_ENDPOINTS.users.dropshippers.method,
      }),
      providesTags: ["User"],
    }),
  }),
  
});

export const {

  useLoginMutation,
  useButtonClickMutation,
  useAddContactMutation,
  useGetDropshippersQuery,
 
} = userApi;

export default userApi;


