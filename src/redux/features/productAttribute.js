import baseApi from "../api/baseApi";
import { API_ENDPOINTS } from "../api/apiEndpoints";

const productAttributeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProductAttribute: builder.mutation({
      query: (data) => ({
        url: API_ENDPOINTS.productAttributes.create.path,
        method: API_ENDPOINTS.productAttributes.create.method,
        body: data,
      }),
    }),
    listProductAttributes: builder.query({
      query: (product_id) => ({
        url: API_ENDPOINTS.productAttributes.list.path + `?product_id=${product_id}`,
        method: "GET",
      }),
    }),

listByProductAttributes: builder.query({
  query: (productId) => ({
    url: `/product-attributes/by-product/${productId}`,
    method: "GET",
  }),
}),

  }),
});

export const {
  useCreateProductAttributeMutation,
  useListProductAttributesQuery,
  useListByProductAttributesQuery,
} = productAttributeApi;

export default productAttributeApi;
