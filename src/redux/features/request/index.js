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
    assignWarehouse: builder.mutation({
      query: (requestInfo) => ({
        url: `/requests/warehouse/${requestInfo.warehouse_id}`,
        method: "PATCH",
        body: { warehouse_id: requestInfo.warehouse_id },
      }),
      invalidatesTags: ["Request"],
    }),
    
    addMultipleItems: builder.mutation({
      query: (requestInfo) => ({
        url: "/addmultipleitems",
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
  useAddMultipleItemsMutation,
  useAssignWarehouseMutation,
} = requestApi;
