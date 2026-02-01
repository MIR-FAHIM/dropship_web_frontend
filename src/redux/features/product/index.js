import baseApi from "../../api/baseApi";

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mutation for creating a main category
    createProduct: builder.mutation({
      query: (categoryData) => ({
        url: "/createProduct",
        method: "POST",
        body: categoryData,
      }),
    }),

   
    getProductByProductCategory: builder.query({
        query: (data) => `/getProductsByProdyctCat/${data.cat_id}/${data.seller}`,  // Corrected typo here
      }),
      
    getFavProducts: builder.query({
        query: (id) => `/get-fav-products/${id}`,  // Corrected typo here
      }),
      
    getProductDetails: builder.query({
        query: (data) => `/getProductDetails/${data.id}/${data.seller}`,  // Corrected typo here
      }),
      
   
   
   
  }),
});

export const {

  usecreateProductMutation,
  useGetProductByProductCategoryQuery,
  useGetProductDetailsQuery,
  useGetFavProductsQuery,
} = productApi;

export default productApi;
