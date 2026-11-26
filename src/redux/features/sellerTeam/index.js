import baseApi from "../../api/baseApi";

// Passive Income phase 1 — seller team (referral): seller code after 10 delivered orders,
// sign-up with a code, my 4-level team, and admin tools.
const sellerTeamApi = baseApi.enhanceEndpoints({ addTagTypes: ["SellerTeam", "AdminSellerTeam"] }).injectEndpoints({
  endpoints: (builder) => ({
    // Public: is the code valid, whose team? → { valid, seller_name }
    checkSellerCode: builder.query({
      query: (code) => `/seller-team/code/${encodeURIComponent(code)}`,
    }),
    getMySellerTeam: builder.query({
      query: () => "/seller-team/summary",
      providesTags: ["SellerTeam"],
    }),
    getMySellerTeamMembers: builder.query({
      query: ({ level = 1, page = 1 } = {}) => `/seller-team/members?level=${level}&page=${page}`,
      providesTags: ["SellerTeam"],
    }),

    // Admin
    getAdminSellerTeam: builder.query({
      query: ({ search = "", filter = "", page = 1 } = {}) =>
        `/admin/seller-team/sellers?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${filter ? `&filter=${filter}` : ""}`,
      providesTags: ["AdminSellerTeam"],
    }),
    getAdminSellerTeamUser: builder.query({
      query: (id) => `/admin/seller-team/users/${id}`,
      providesTags: ["AdminSellerTeam"],
    }),
    setSellerUpline: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/seller-team/users/${id}/upline`, method: "PUT", body }),
      invalidatesTags: ["AdminSellerTeam"],
    }),
    verifySeller: builder.mutation({
      query: ({ id, reason }) => ({ url: `/admin/seller-team/users/${id}/verify`, method: "POST", body: { reason } }),
      invalidatesTags: ["AdminSellerTeam"],
    }),
    unverifySeller: builder.mutation({
      query: ({ id, reason }) => ({ url: `/admin/seller-team/users/${id}/unverify`, method: "POST", body: { reason } }),
      invalidatesTags: ["AdminSellerTeam"],
    }),
  }),
});

export const {
  useLazyCheckSellerCodeQuery,
  useGetMySellerTeamQuery,
  useGetMySellerTeamMembersQuery,
  useGetAdminSellerTeamQuery,
  useGetAdminSellerTeamUserQuery,
  useSetSellerUplineMutation,
  useVerifySellerMutation,
  useUnverifySellerMutation,
} = sellerTeamApi;
