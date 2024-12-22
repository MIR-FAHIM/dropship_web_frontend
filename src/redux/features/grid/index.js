import baseApi from "../../api/baseApi";

const gridApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllGrid: builder.query({
      query: () => `/grids`,
      providesTags: ["Grid"],
    }),
    getGridById: builder.query({
      query: (id) => `/grids/${id}`,
    }),
    getGridsByWarehouseId: builder.query({
      query: (id) => `/warehouses/grids/${id}`,
    }),
    createGrid: builder.mutation({
      query: (gridInfo) => ({
        url: "/grids",
        method: "POST",
        body: gridInfo,
      }),
      invalidatesTags: ["Grid"],
    }),
  }),
});

export const {
  useGetAllGridQuery,
  useGetGridByIdQuery,
  useCreateGridMutation,
  useGetGridsByWarehouseIdQuery,
} = gridApi;
