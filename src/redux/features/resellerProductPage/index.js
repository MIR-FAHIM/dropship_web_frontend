import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const resellerProductPageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addResellerProductPage: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.resellerProductPages.add.path,
        method: API_ENDPOINTS.resellerProductPages.add.method,
        body: payload,
      }),
      invalidatesTags: ["ResellerProductPage"],
    }),

    createResellerProductPage: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.resellerProductPages.create.path,
        method: API_ENDPOINTS.resellerProductPages.create.method,
        body: payload,
      }),
      invalidatesTags: ["ResellerProductPage"],
    }),

    updateResellerProductPage: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.resellerProductPages.update.path, { id }),
        method: API_ENDPOINTS.resellerProductPages.update.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "ResellerProductPage",
        { type: "ResellerProductPage", id },
      ],
    }),

    updateResellerProductPageDesign: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.resellerProductPages.design.path, { id }),
        method: API_ENDPOINTS.resellerProductPages.design.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "ResellerProductPage",
        { type: "ResellerProductPage", id },
      ],
    }),

    removeResellerProductPage: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.resellerProductPages.remove.path, { id }),
        method: API_ENDPOINTS.resellerProductPages.remove.method,
      }),
      invalidatesTags: ["ResellerProductPage"],
    }),

    listResellerProductPages: builder.query({
      query: ({ reseller_id } = {}) => ({
        url: API_ENDPOINTS.resellerProductPages.list.path,
        params: { reseller_id },
      }),
      providesTags: ["ResellerProductPage"],
    }),

    getResellerProductPageDetails: builder.query({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.resellerProductPages.details.path, { id }),
        method: API_ENDPOINTS.resellerProductPages.details.method,
      }),
      providesTags: (result, error, id) => [{ type: "ResellerProductPage", id }],
    }),

    getResellerProductPageBySlug: builder.query({
      query: (slug) => ({
        url: buildEndpointPath(API_ENDPOINTS.resellerProductPages.bySlug.path, { slug }),
        method: API_ENDPOINTS.resellerProductPages.bySlug.method,
      }),
      providesTags: (result, error, slug) => [{ type: "ResellerProductPage", id: slug }],
    }),
  }),
});

export const {
  useAddResellerProductPageMutation,
  useCreateResellerProductPageMutation,
  useUpdateResellerProductPageMutation,
  useUpdateResellerProductPageDesignMutation,
  useRemoveResellerProductPageMutation,
  useListResellerProductPagesQuery,
  useGetResellerProductPageDetailsQuery,
  useGetResellerProductPageBySlugQuery,
} = resellerProductPageApi;

export default resellerProductPageApi;


