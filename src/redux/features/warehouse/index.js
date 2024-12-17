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
    getWarehouseTypes: builder.query({
      query: () => `/admin/warehouse-types`,
    }),
  }),
});

export const {
  useGetAllWarehouseQuery,
  useGetWarehouseTypesQuery,
  useCreateWarehouseMutation,
} = warehouseApi;
