import baseApi from "../../api/baseApi";
import { API_ENDPOINTS, buildEndpointPath } from "../../api/apiEndpoints";

const withdrawApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addWithdrawRequest: builder.mutation({
      query: (body) => ({
          url: API_ENDPOINTS.withdraws.addWithdrawRequest.path,
         method: API_ENDPOINTS.withdraws.addWithdrawRequest.method,
        body,
      }),
      invalidatesTags: ["Request"],
    }),
    getUserWithdrawRequests: builder.query({
      query: (userId) => ({
        url: API_ENDPOINTS.withdraws.getUserWithdrawRequests.path.replace("{userId}", userId),
        method: API_ENDPOINTS.withdraws.getUserWithdrawRequests.method,
      }),
      providesTags: ["Request"],
    }),
    
    getAllWithdraws: builder.query({
      query: () => ({
        url: API_ENDPOINTS.withdraws.getAllWithdraws.path,
        method: API_ENDPOINTS.withdraws.getAllWithdraws.method,
      }),
      providesTags: ["Request"],
    }),

    changeWithdrawStatus: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: API_ENDPOINTS.withdraws.changeStatus.path.replace("{id}", id),
        method:API_ENDPOINTS.withdraws.changeStatus.method,
        body: payload,
      }),
      invalidatesTags: ["Request"],
    }),
  }),
});

export const {
  useAddWithdrawRequestMutation,
  useGetUserWithdrawRequestsQuery,
  useGetAllWithdrawsQuery,
  useChangeWithdrawStatusMutation,
} = withdrawApi;
