import baseApi from "../../api/baseApi";

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mutation for creating a main category
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/create-order",
        method: "POST",
        body: orderData
      }),
    }),
    createContactUs: builder.mutation({
      query: (orderData) => ({
        url: "https://hrmapi.biswasandbrothers.com/api/add-contact-us",
        method: "POST",
           headers: {
      token: 'prefix_67e12b036e3f06.63889147',
      'Content-Type': 'application/json'
    },
        body: orderData
      }),
    }),

   
    getOrderBySeller: builder.query({
        query: (id) => `/getOrdersByUserID/${id}`, 
        method:"GET", // Corrected typo here
      }),
      
    getDeliveredOrdersBySeller: builder.query({
        query: (id) => `/getDeliveredOrder/${id}`, 
        method:"GET", // Corrected typo here
      }),
      
// Inside your redux query definition
getUserBalance: builder.query({
  query: (id) => `/getBalance/${id}`,
}),

      
    deleteOrder: builder.mutation({
        query: (id) => `/delete-cart/${id}`,  // Corrected typo here
      }),
      
  }),
});

export const {
  useGetUserBalanceQuery,
  useCreateOrderMutation,
  useCreateContactUsMutation,
  useGetOrderBySellerQuery,
  useGetDeliveredOrdersBySellerQuery,
  
  useDeleteOrderMutation,

} = orderApi;

export default orderApi;
