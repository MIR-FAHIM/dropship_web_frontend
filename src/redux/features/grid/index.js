import baseApi from "../../api/baseApi";

const gridApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllGrid: builder.query({
      query: () => `/grids`,
    }),
    getGridById: builder.query({
      query: (id) => `/grids/${id}`,
    }),
  }),
});

export const { useGetAllGridQuery, useGetGridByIdQuery } = gridApi;
