import baseApi from "../../api/baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mutation for creating a main category
    register: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data
      }),
    }),

   


      
  }),
});

export const {
 
  useRegisterMutation,


} = authApi;

export default authApi;
