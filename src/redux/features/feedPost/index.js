import baseApi from "../../api/baseApi";

const feedPostApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedPosts: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page);
        if (params.per_page) queryParams.append("per_page", params.per_page);
        if (params.product_id) queryParams.append("product_id", params.product_id);
        if (params.search) queryParams.append("search", params.search);
        if (params.user_id) queryParams.append("user_id", params.user_id);
        if (params.status) queryParams.append("status", params.status);

        const qs = queryParams.toString();
        return {
          url: `/feed-posts${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["FeedPost"],
    }),

    getFeedPostDetails: builder.query({
      query: (id) => ({
        url: `/feed-posts/details/${id}`,
        method: "GET",
      }),
      providesTags: ["FeedPost"],
    }),

    createFeedPost: builder.mutation({
      query: (postData) => ({
        url: "/feed-posts/create",
        method: "POST",
        body: postData,
      }),
      invalidatesTags: ["FeedPost"],
    }),

    updateFeedPost: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/feed-posts/update/${id}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["FeedPost"],
    }),

    deleteFeedPost: builder.mutation({
      query: (id) => ({
        url: `/feed-posts/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FeedPost"],
    }),

    reactToFeedPost: builder.mutation({
      query: ({ id, type, user_id }) => ({
        url: `/feed-posts/${id}/react`,
        method: "POST",
        body: { type, user_id },
      }),
      invalidatesTags: ["FeedPost"],
    }),

    getFeedPostComments: builder.query({
      query: (id) => ({
        url: `/feed-posts/${id}/comments`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "FeedPostComments", id }],
    }),

    addFeedPostComment: builder.mutation({
      query: ({ id, comment, parent_id, user_id }) => ({
        url: `/feed-posts/${id}/comments`,
        method: "POST",
        body: { comment, parent_id, user_id },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FeedPostComments", id },
        "FeedPost",
      ],
    }),

    deleteFeedPostComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/feed-posts/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        ...(postId ? [{ type: "FeedPostComments", id: postId }] : []),
        "FeedPost",
      ],
    }),

    shareFeedPostToPage: builder.mutation({
      query: ({ id, facebook_page_id, custom_caption }) => ({
        url: `/feed-posts/${id}/share-to-page`,
        method: "POST",
        body: { facebook_page_id, custom_caption },
      }),
      invalidatesTags: ["FeedPost"],
    }),

    getFacebookPages: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.user_id) queryParams.append("user_id", params.user_id);
        const qs = queryParams.toString();
        return {
          url: `/facebook/pages${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useGetFeedPostsQuery,
  useGetFeedPostDetailsQuery,
  useCreateFeedPostMutation,
  useUpdateFeedPostMutation,
  useDeleteFeedPostMutation,
  useReactToFeedPostMutation,
  useGetFeedPostCommentsQuery,
  useAddFeedPostCommentMutation,
  useDeleteFeedPostCommentMutation,
  useShareFeedPostToPageMutation,
  useGetFacebookPagesQuery,
} = feedPostApi;

export default feedPostApi;
