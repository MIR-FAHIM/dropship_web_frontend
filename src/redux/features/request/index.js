import baseApi from "../../api/baseApi";

const requestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRequest: builder.mutation({
      query: (orderInfo) => ({
        url: "/place-order",
        method: "POST",
        body: orderInfo,
      }),
      invalidatesTags: ["Request"],
    }),
    placeOrder: builder.mutation({
      query: (requestInfo) => ({
        url: "/place-order",
        method: "POST",
        body: requestInfo,
      }),
      invalidatesTags: ["Request"],
    }),
    assignWarehouse: builder.mutation({
      query: ({ warehouseInfo, requestId }) => {
        return {
          url: `/requests/warehouse/${requestId}`,
          method: "PATCH",
          body: warehouseInfo,
        };
      },
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
    updateItem: builder.mutation({
      query: ({ itemInfo, id }) => ({
        url: `/items/${id}`,
        method: "PUT",
        body: itemInfo,
      }),
      invalidatesTags: ["Request"],
    }),
    updateDuration: builder.mutation({
      query: ({ durationInfo, id }) => ({
        url: `/requests/date/${id}`,
        method: "PUT",
        body: durationInfo,
      }),
      invalidatesTags: ["Request"],
    }),
    updateWTypeAndSize: builder.mutation({
      query: ({ updateInfo, id }) => ({
        url: `/requests/size/warehouse-type/${id}`,
        method: "PUT",
        body: updateInfo,
      }),
      invalidatesTags: ["Request"],
    }),
    deleteItem: builder.mutation({
      query: ({ id }) => ({
        url: `/items/${id}`,
        method: "DELETE",
        body: "",
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
      query: (orderQuery) => `/admin/requests?page=${orderQuery?.page}`,
      providesTags: ["Request"],
    }),
    getAssignedGridsByRequestIt: builder.query({
      query: (id) => `/fetch-items-by-request/${id}`,
      providesTags: ["Request"],
    }),
    getOrderRequestById: builder.query({
      query: (id) => `/admin/requests/${id}`,
      providesTags: ["Request"],
    }),
    getPaymentsByRequestId: builder.query({
      query: (id) => `/payments/request/${id}`,
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
  useUpdateItemMutation,
  useDeleteItemMutation,
  useGetAssignedGridsByRequestItQuery,
  useUpdateDurationMutation,
  useUpdateWTypeAndSizeMutation,
  usePlaceOrderMutation,
  useGetPaymentsByRequestIdQuery,
} = requestApi;
