import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const socialMediaTextApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSocialMediaTextByProduct: builder.query({
      query: (productId) => ({
        url: buildEndpointPath(API_ENDPOINTS.socialMediaTextContents.byProduct.path, { productId }),
        method: API_ENDPOINTS.socialMediaTextContents.byProduct.method,
      }),
      providesTags: (result, error, productId) => [
        { type: "SocialMediaText", id: productId },
        "SocialMediaText",
      ],
    }),

    addSocialMediaText: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.socialMediaTextContents.add.path,
        method: API_ENDPOINTS.socialMediaTextContents.add.method,
        body: payload,
      }),
      invalidatesTags: (result, error, payload) => [
        { type: "SocialMediaText", id: payload?.product_id },
        "SocialMediaText",
      ],
    }),

    updateSocialMediaText: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.socialMediaTextContents.update.path, { id }),
        method: API_ENDPOINTS.socialMediaTextContents.update.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { productId }) => [
        ...(productId ? [{ type: "SocialMediaText", id: productId }] : []),
        "SocialMediaText",
      ],
    }),

    toggleActiveSocialMediaText: builder.mutation({
      query: ({ id }) => ({
        url: buildEndpointPath(API_ENDPOINTS.socialMediaTextContents.toggleActive.path, { id }),
        method: API_ENDPOINTS.socialMediaTextContents.toggleActive.method,
      }),
      invalidatesTags: (result, error, { productId }) => [
        ...(productId ? [{ type: "SocialMediaText", id: productId }] : []),
        "SocialMediaText",
      ],
    }),

    deleteSocialMediaText: builder.mutation({
      query: ({ id }) => ({
        url: buildEndpointPath(API_ENDPOINTS.socialMediaTextContents.delete.path, { id }),
        method: API_ENDPOINTS.socialMediaTextContents.delete.method,
      }),
      invalidatesTags: (result, error, { productId }) => [
        ...(productId ? [{ type: "SocialMediaText", id: productId }] : []),
        "SocialMediaText",
      ],
    }),
  }),
});

export const {
  useGetSocialMediaTextByProductQuery,
  useAddSocialMediaTextMutation,
  useUpdateSocialMediaTextMutation,
  useToggleActiveSocialMediaTextMutation,
  useDeleteSocialMediaTextMutation,
} = socialMediaTextApi;

export default socialMediaTextApi;
