import baseApi from "../../api/baseApi";

const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mutation for creating a main category
    createPost: builder.mutation({
      query: (orderData) => ({
        url: "/create-post",
        method: "POST",
        body: orderData
      }),
    }),

   
    getPostByType: builder.query({
        query: (type) => `/getPostByType/${type}`, 
        method:"GET", // Corrected typo here
      }),
      
   
      
  }),
});

export const {

  useCreatePostMutation,
  useGetPostByTypeQuery,
 

} = postApi;

export default postApi;
