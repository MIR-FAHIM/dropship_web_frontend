import baseApi from "../../api/baseApi";

const withdrawApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addWithdrawReq: builder.mutation({
      query: (data) => ({
        url: "/add-withdraw",
        method: "POST",
        body: data,
      }),
    }),
   
    addPaymentAccount: builder.mutation({
      query: (data) => ({
        url: "/add-seller-payment-account",
        method: "POST",
        body: data,
      }),
    }),
   
    getWithdrawReq: builder.query({
      query: () => `/get-all-withdraw`,
    }),
    getWithdrawReqByUser: builder.query({
      query: (id) => `/get-withdraw-user/${id}`,
    }),
    getPaymentAccountByUser: builder.query({
      query: (id) => `/get-seller-payment-account/${id}`,
    }),
    getPaymentMethodList: builder.query({
      query: () => `/get-active-payment-method`,
    }),
  }),
});

export const {
  useGetWithdrawReqByUserQuery,
  useGetWithdrawReqQuery,
  useAddWithdrawReqMutation,


  useAddPaymentAccountMutation,
  useGetPaymentMethodListQuery,
  useGetPaymentAccountByUserQuery,
 
} = withdrawApi;
