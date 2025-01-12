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
    getAllWarehouse: builder.query({
      query: () => `/warehouses`,
    }),
    getWarehouseById: builder.query({
      query: (id) => `/warehouses/${id}`,
     
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
} = warehouseApi;
