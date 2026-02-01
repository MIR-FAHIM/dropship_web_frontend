import baseApi from "../../api/baseApi";

const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mutation for creating a main category
    createMainCategory: builder.mutation({
      query: (categoryData) => ({
        url: "/createMainCategory",
        method: "POST",
        body: categoryData,
      }),
    }),

    // Query for fetching main categories
    getMainCategory: builder.query({
      query: () => "/getMainCategories",
    }),

    // Mutation for creating a product category
    createProductCategory: builder.mutation({
      query: (productData) => ({
        url: "/createProductCategory",
        method: "POST",
        body: productData,
      }),
    }),

    // Query for fetching product categories
    getProductCategory: builder.query({
      query: () => "/getProductCategories",
    }),
  }),
});

export const {
  useCreateMainCategoryMutation,
  useGetMainCategoryQuery,
  useCreateProductCategoryMutation,
  useGetProductCategoryQuery,
} = categoryApi;

export default categoryApi;
