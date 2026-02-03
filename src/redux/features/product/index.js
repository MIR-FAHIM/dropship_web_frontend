import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (productData) => ({
        url: API_ENDPOINTS.products.create.path,
        method: API_ENDPOINTS.products.create.method,
        body: productData,
      }),
    }),

    uploadProductImage: builder.mutation({
      query: ({ productId, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.products.imageUpload.path, {
          productId,
        }),
        method: API_ENDPOINTS.products.imageUpload.method,
        body: payload,
      }),
    }),

    listProducts: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.products.list.path,
        params,
      }),
    }),

    listFeaturedProducts: builder.query({
      query: () => API_ENDPOINTS.products.listFeatured.path,
    }),
    getFavProducts: builder.query({
      query: (userId) => buildEndpointPath(API_ENDPOINTS.wishlists.list.path, { userId }),
    }),

    listTodayDealProducts: builder.query({
      query: () => API_ENDPOINTS.products.listTodayDeal.path,
    }),

    getProductDetails: builder.query({
      query: (id) =>
        buildEndpointPath(API_ENDPOINTS.products.details.path, { id }),
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: buildEndpointPath(API_ENDPOINTS.products.update.path, { id }),
        method: API_ENDPOINTS.products.update.method,
        body: productData,
      }),
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.products.delete.path, { id }),
        method: API_ENDPOINTS.products.delete.method,
      }),
    }),
    deleteWishProduct: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.wishlists.delete.path, { id }),
        method: API_ENDPOINTS.wishlists.delete.method,
      }),
    }),

    addProductImage: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.products.addImage.path, { id }),
        method: API_ENDPOINTS.products.addImage.method,
        body: payload,
      }),
    }),
    addWishList: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.wishlists.add.path, { id }),
        method: API_ENDPOINTS.wishlists.add.method,
        body: payload,
      }),
    }),

    deleteProductImage: builder.mutation({
      query: (imageId) => ({
        url: buildEndpointPath(API_ENDPOINTS.products.deleteImage.path, {
          imageId,
        }),
        method: API_ENDPOINTS.products.deleteImage.method,
      }),
    }),
  }),
});

export const {
  useCreateProductMutation,
  useUploadProductImageMutation,
  useListProductsQuery,
  useListFeaturedProductsQuery,
  useGetFavProductsQuery,
  useListTodayDealProductsQuery,
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddWishListMutation,
  useDeleteProductImageMutation,
  useDeleteWishProductMutation,
} = productApi;

export default productApi;
