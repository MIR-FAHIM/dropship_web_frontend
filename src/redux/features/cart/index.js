import baseApi from "../../api/baseApi";

const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mutation for creating a main category
    createCart: builder.mutation({
      query: (cartData) => ({
        url: "/add-product-to-cart",
        method: "POST",
        body: cartData
      }),
    }),

   
    getCart: builder.query({
        query: (id) => `/get-cart-by-user/${id}`,  // Corrected typo here
      }),
      
    deleteCart: builder.mutation({
        query: (id) => `/delete-cart/${id}`,  // Corrected typo here
        method: "GET",
      }),
      
      updateCart: builder.mutation({
        query: ({ id, is_ordered, order_id }) => ({
          url: `/update-cart/${id}`, // API route to update cart by ID
          method: "POST",
          body: { is_ordered, order_id },
        }),
      }),
      
  }),
});

export const {

  useCreateCartMutation,
  useGetCartQuery,
  useDeleteCartMutation,
  useUpdateCartMutation
} = cartApi;

export default cartApi;
