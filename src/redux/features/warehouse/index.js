import baseApi from "../../api/baseApi";

const warehouseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createWarehouse: builder.mutation({
      query: (wareInfo) => ({
        url: "/warehouses",
        method: "POST",
        body: wareInfo,
      }),
    }),
    createWarehouseUser: builder.mutation({
      query: (user) => ({
        url: "/register/user",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["User"],
    }),
    assignWarehouseUser: builder.mutation({
      query: (data) => ({
        url: "/warehouse/assign-staff",
        method: "POST",
        body: data,
      }),
    }),
    getAllWarehouse: builder.query({
      query: () => `/warehouses`,
    }),
    getWarehouseById: builder.query({
      query: (id) => `/warehouses/${id}`,
    }),
    getWarehouseUser: builder.query({
      query: (id) => `/warehouse-stuff/${id}`,
      providesTags: ["User"],
    }),
    getWarehouseTypes: builder.query({
      query: () => `/admin/warehouse-types`,
    }),
  }),
});

export const {
  useGetWarehouseByIdQuery,
  useGetAllWarehouseQuery,
  useGetWarehouseTypesQuery,
  useCreateWarehouseMutation,
  useCreateWarehouseUserMutation,
  useAssignWarehouseUserMutation,
  useGetWarehouseUserQuery,
} = warehouseApi;
