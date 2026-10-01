import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const productAssistantQaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductAssistantQasByProduct: builder.query({
      query: (productId) => ({
        url: buildEndpointPath(API_ENDPOINTS.productAssistantQas.byProduct.path, { productId }),
        method: API_ENDPOINTS.productAssistantQas.byProduct.method,
      }),
      providesTags: (result, error, productId) => [
        { type: "ProductAssistantQa", id: productId },
        "ProductAssistantQa",
      ],
    }),

    listProductAssistantQas: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.productAssistantQas.list.path,
        method: API_ENDPOINTS.productAssistantQas.list.method,
        params,
      }),
      providesTags: ["ProductAssistantQa"],
    }),

    addProductAssistantQa: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.productAssistantQas.add.path,
        method: API_ENDPOINTS.productAssistantQas.add.method,
        body: payload,
      }),
      invalidatesTags: (result, error, payload) => [
        { type: "ProductAssistantQa", id: payload?.product_id },
        "ProductAssistantQa",
      ],
    }),

    updateProductAssistantQa: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.productAssistantQas.update.path, { id }),
        method: API_ENDPOINTS.productAssistantQas.update.method,
        body: payload,
      }),
      invalidatesTags: (result, error, { productId, product_id }) => [
        ...((productId || product_id) ? [{ type: "ProductAssistantQa", id: productId || product_id }] : []),
        "ProductAssistantQa",
      ],
    }),

    deleteProductAssistantQa: builder.mutation({
      query: ({ id }) => ({
        url: buildEndpointPath(API_ENDPOINTS.productAssistantQas.delete.path, { id }),
        method: API_ENDPOINTS.productAssistantQas.delete.method,
      }),
      invalidatesTags: (result, error, { productId, product_id }) => [
        ...((productId || product_id) ? [{ type: "ProductAssistantQa", id: productId || product_id }] : []),
        "ProductAssistantQa",
      ],
    }),
  }),
});

export const {
  useGetProductAssistantQasByProductQuery,
  useListProductAssistantQasQuery,
  useAddProductAssistantQaMutation,
  useUpdateProductAssistantQaMutation,
  useDeleteProductAssistantQaMutation,
} = productAssistantQaApi;

export default productAssistantQaApi;
