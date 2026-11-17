import baseApi from "../../api/baseApi";
import API_ENDPOINTS from "../../api/apiEndpoints";

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // No "login" here: features/auth owns it (POST /auth/login). Endpoint names are
    // shared across baseApi, so a second "login" would replace it depending on import order.
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
    getDropshipperLeaderboard: builder.query({
      query: (page = 1) => ({
        url: API_ENDPOINTS.users.dropshipperLeaderboard.path,
        params: { page },
      }),
      providesTags: ["User", "Order"],
    }),
    getUserDetails: builder.query({
      query: (id) => `/users/details/${id}`,
      // Refreshes after "Convert to lead", ban/unban, profile edits.
      providesTags: ["User"],
    }),
    getAdminList: builder.query({
      query: (page = 1) => ({
        url: `${API_ENDPOINTS.users.adminList.path}?page=${page}`,
        method: API_ENDPOINTS.users.adminList.method,
      }),
      providesTags: ["User"],
    }),

    editUserProfile: builder.mutation({
      query: ({ id, ...body }) => ({
        url: "/users/edituserprofile/" + id,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
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

    // Ban (true) or reactivate (false) an admin employee: { id, banned }
    setEmployeeStatus: builder.mutation({
      query: ({ id, banned }) => ({
        url: `/users/${id}/employee-status`,
        method: "PATCH",
        body: { banned },
      }),
      invalidatesTags: ["User"],
    }),

    // Logged-in user changes their own password: { current_password, password, password_confirmation }
    changeOwnPassword: builder.mutation({
      query: (body) => ({
        url: API_ENDPOINTS.users.changePassword.path,
        method: API_ENDPOINTS.users.changePassword.method,
        body,
      }),
      invalidatesTags: ["PasswordLog"],
    }),

    // Admin sets a new password for a dropshipper: { id, password, password_confirmation, note? }
    adminResetPassword: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ENDPOINTS.users.adminResetPassword.path.replace("{id}", id),
        method: API_ENDPOINTS.users.adminResetPassword.method,
        body,
      }),
      invalidatesTags: ["PasswordLog"],
    }),

    // Admin password change report. Params: user_id, change_type, search, date_from, date_to, page.
    getPasswordLogs: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.users.passwordLogs.path,
        params: Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
        ),
      }),
      providesTags: ["PasswordLog"],
    }),
  }),
});


export const {
  useButtonClickMutation,
  useAddContactMutation,
  useGetUserDetailsQuery,
  useGetAdminListQuery,
  useGetDropshippersQuery,
  useGetDropshipperLeaderboardQuery,
  useEditUserProfileMutation,
  useUserBanMutation,
  useUserUnbanMutation,
  useChangeOwnPasswordMutation,
  useSetEmployeeStatusMutation,
  useAdminResetPasswordMutation,
  useGetPasswordLogsQuery,
} = userApi;

export default userApi;


