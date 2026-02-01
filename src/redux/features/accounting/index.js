import baseApi from "../../api/baseApi";

const accountingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Mutation for creating a main category
   

   
    getAddBalanceDataUser: builder.query({
        query: (id) => `/get-balance-add-data-user/${id}`,  // Corrected typo here
      }),
      
  
      
  }),
});

export const {

 
  useGetAddBalanceDataUserQuery,
 
} = accountingApi;

export default accountingApi;
