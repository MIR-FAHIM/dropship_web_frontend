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
      providesTags: ["Grid"],
    }),
    createGrid: builder.mutation({
      query: (gridInfo) => ({
        url: "/grids",
        method: "POST",
        body: gridInfo,
      }),
      invalidatesTags: ["Grid"],
    }),
    assignGrid: builder.mutation({
      query: (gridInfo) => ({
        url: "/assign-grids",
        method: "POST",
        body: gridInfo,
      }),
      invalidatesTags: ["Grid"],
    }),
    toggleOccupiedGrid: builder.mutation({
      query: (id) => {
        // console.log("Grid Info:", id);
        return {
          url: `/grid/toggle-occupied/${id}`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["Grid"],
    }),
  }),
});

export const {
  useGetAllGridQuery,
  useGetGridByIdQuery,
  useCreateGridMutation,
  useGetGridsByWarehouseIdQuery,
  useAssignGridMutation,
  useToggleOccupiedGridMutation,
} = gridApi;
