
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
      invalidatesTags: ["Product"],
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
      query: (args = 1) => {
        const page = typeof args === "object" ? args.page ?? 1 : args;
        const vendorId = typeof args === "object" ? args.vendor_id : undefined;
        const params = {
          page,
          ...(vendorId ? { vendor_id: vendorId } : {}),
        };
        return {
          url: API_ENDPOINTS.products.list.path,
          params,
        };
      },
      providesTags: ["Product"],
    }),
    listHomeProducts: builder.query({
      query: (page = 1) => ({
        url: API_ENDPOINTS.products.listhome.path,
        params: { page, },
      }),
      providesTags: ["Product"],
    }),
    listProductsCategoryWise: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.products.categoryWise.path,
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
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: buildEndpointPath(API_ENDPOINTS.products.update.path, { id }),
        method: API_ENDPOINTS.products.update.method,
        body: productData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),

    duplicateProduct: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.products.duplicate.path, { id }),
        method: API_ENDPOINTS.products.duplicate.method,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.products.delete.path, { id }),
        method: API_ENDPOINTS.products.delete.method,
      }),
      invalidatesTags: ["Product"],
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
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),
    addWishList: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.wishlists.add.path, { id }),
        method: API_ENDPOINTS.wishlists.add.method,
        body: payload,
      }),
    }),

    deleteProductImage: builder.mutation({
      query: (arg) => {
        const imageId = typeof arg === "object" ? arg.imageId : arg;
        return {
        url: buildEndpointPath(API_ENDPOINTS.products.deleteImage.path, {
          imageId,
        }),
        method: API_ENDPOINTS.products.deleteImage.method,
        };
      },
      invalidatesTags: (result, error, arg) => {
        const productId = typeof arg === "object" ? arg.productId : null;
        return productId ? [{ type: "Product", id: productId }] : ["Product"];
      },
    }),

    approveProduct: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.products.approval.path, { id }),
        method: API_ENDPOINTS.products.approval.method,
        body: payload,
      }),
      invalidatesTags: ["Product"],
    }),

    getPriceUpdateLogs: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.products.priceUpdateLogs.path,
        params,
      }),
    }),
  }),
});

export const {
  useCreateProductMutation,
  useUploadProductImageMutation,
  useAddProductImageMutation,
  useListProductsQuery,
  useListHomeProductsQuery,
  useListProductsCategoryWiseQuery,
  useListFeaturedProductsQuery,
  useGetFavProductsQuery,
  useListTodayDealProductsQuery,
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useDuplicateProductMutation,
  useDeleteProductMutation,
  useAddWishListMutation,
  useDeleteProductImageMutation,
  useDeleteWishProductMutation,
  useApproveProductMutation,
  useGetPriceUpdateLogsQuery,
} = productApi;

export default productApi;
