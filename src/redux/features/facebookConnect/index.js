import baseApi from "../../api/baseApi";

// Dropshipper → Facebook page connect (one click). Tokens never reach the browser:
// the backend keeps them encrypted; these endpoints only return page names, photos and status.
const facebookConnectApi = baseApi.enhanceEndpoints({ addTagTypes: ["MyFacebookPages", "MyFacebookPosts"] }).injectEndpoints({
  endpoints: (builder) => ({
    getMyFacebookPages: builder.query({
      query: () => "/facebook/my-pages",
      providesTags: ["MyFacebookPages"],
    }),
    // Returns { url } — the Facebook login page to send the dropshipper to.
    startFacebookConnect: builder.mutation({
      query: () => ({ url: "/facebook/connect/start", method: "GET" }),
    }),
    getPendingFacebookPages: builder.query({
      query: (key) => `/facebook/connect/pending/${key}`,
    }),
    chooseFacebookPages: builder.mutation({
      query: ({ key, pageIds }) => ({ url: `/facebook/connect/pending/${key}`, method: "POST", body: { page_ids: pageIds } }),
      invalidatesTags: ["MyFacebookPages"],
    }),
    checkFacebookPage: builder.mutation({
      query: (id) => ({ url: `/facebook/my-pages/${id}/check`, method: "POST" }),
      invalidatesTags: ["MyFacebookPages"],
    }),
    disconnectFacebookPage: builder.mutation({
      query: (id) => ({ url: `/facebook/my-pages/${id}`, method: "DELETE" }),
      invalidatesTags: ["MyFacebookPages"],
    }),
    // Phase 2: post a product to my page(s)
    getFacebookPostDraft: builder.query({
      query: (productId) => `/facebook/products/${productId}/draft`,
      providesTags: ["MyFacebookPages"],
    }),
    // body: { page_ids, caption, image_indexes, scheduled_at? }
    publishProductToFacebook: builder.mutation({
      query: ({ productId, body }) => ({ url: `/facebook/products/${productId}/publish`, method: "POST", body }),
      invalidatesTags: ["MyFacebookPages", "MyFacebookPosts"],
    }),
    // Phase 3: my post history, fresh numbers from Facebook, cancel a scheduled post
    getMyFacebookPosts: builder.query({
      query: ({ status = "", page = 1 } = {}) => `/facebook/my-posts?per_page=15&page=${page}${status ? `&status=${status}` : ""}`,
      providesTags: ["MyFacebookPosts"],
    }),
    refreshFacebookPostStats: builder.mutation({
      query: (ids = []) => ({ url: "/facebook/my-posts/refresh-stats", method: "POST", body: { ids } }),
      invalidatesTags: ["MyFacebookPosts", "MyFacebookPages"],
    }),
    cancelFacebookPost: builder.mutation({
      query: (id) => ({ url: `/facebook/my-posts/${id}`, method: "DELETE" }),
      invalidatesTags: ["MyFacebookPosts", "MyFacebookPages"],
    }),
  }),
});

export const {
  useGetMyFacebookPagesQuery,
  useStartFacebookConnectMutation,
  useGetPendingFacebookPagesQuery,
  useChooseFacebookPagesMutation,
  useCheckFacebookPageMutation,
  useDisconnectFacebookPageMutation,
  useGetFacebookPostDraftQuery,
  usePublishProductToFacebookMutation,
  useGetMyFacebookPostsQuery,
  useRefreshFacebookPostStatsMutation,
  useCancelFacebookPostMutation,
} = facebookConnectApi;
