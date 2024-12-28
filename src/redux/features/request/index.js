import baseApi from "../../api/baseApi";

const requestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRequest: builder.mutation({
      query: (requestInfo) => ({
        url: "/create-order-request/user",
        method: "POST",
        body: requestInfo,
      }),
      invalidatesTags: ["Request"],
    }),
    uploadChallan: builder.mutation({
      query: (requestInfo) => ({
        url: "/request-files/user",
        method: "POST",
        body: requestInfo,
      }),
    }),
    getAllRequest: builder.query({
      query: () => `/admin/requests`,
      providesTags: ["Request"],
    }),
    getOrderRequestById: builder.query({
      query: (id) => `/admin/requests/${id}`,
      providesTags: ["Request"],
    }),
  }),
});

export const {
  useGetAllRequestQuery,
  useGetOrderRequestByIdQuery,
  useCreateRequestMutation,
  useUploadChallanMutation,
} = requestApi;
