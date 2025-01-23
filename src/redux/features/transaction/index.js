import baseApi from "../../api/baseApi";

const transactiontApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTransaction: builder.query({
      query: () => `/transactions`,
    }),
    getTransactionById: builder.query({
      query: (id) => `/transactions/${id}`,
    }),
  
  }),
});

export const {
  useGetAllTransactionQuery,
  useGetTransactionByIdQuery,
 
} = transactiontApi;
