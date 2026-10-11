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
      query: (args = {}) => {
        let params = {};
        if (typeof args === "number" || typeof args === "string") {
          params = { page: Number(args) || 1 };
        } else if (typeof args === "object" && args !== null) {
          params = { ...args };
        }
        const cleanedParams = {};
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            cleanedParams[key] = val;
          }
        });

        return {
          url: API_ENDPOINTS.users.dropshippers.path,
          method: API_ENDPOINTS.users.dropshippers.method,
          params: cleanedParams,
        };
      },
      providesTags: ["User"],
    }),
    getUserDetails: builder.query({
      query: (id) => `/users/details/${id}`,
    }),
    getAdminList: builder.query({
      query: (page = 1) => ({
        url: `${API_ENDPOINTS.users.adminList.path}?page=${page}`,
        method: API_ENDPOINTS.users.adminList.method,
      }),
      providesTags: ["User"],
    }),

    userBan: builder.mutation({
      query: (id) => ({
        url: API_ENDPOINTS.users.ban.path.replace('{id}', id),
        method: API_ENDPOINTS.users.ban.method,
      }),
      invalidatesTags: ["User"],
    }),

    userUnban: builder.mutation({
      query: (id) => ({
        url: API_ENDPOINTS.users.unban.path.replace('{id}', id),
        method: API_ENDPOINTS.users.unban.method,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});


export const {
  useLoginMutation,
  useButtonClickMutation,
  useAddContactMutation,
  useGetUserDetailsQuery,
  useGetAdminListQuery,
  useGetDropshippersQuery,
  useUserBanMutation,
  useUserUnbanMutation,
} = userApi;

export default userApi;


