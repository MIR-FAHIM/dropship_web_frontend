import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBrand: builder.mutation({
      query: (brandData) => ({
        url: API_ENDPOINTS.brands.create.path,
        method: API_ENDPOINTS.brands.create.method,
        body: brandData,
      }),
      invalidatesTags: ["Brand"],
    }),

    listBrands: builder.query({
      query: (page = 1) => `${API_ENDPOINTS.brands.list.path}?page=${page}`,
      providesTags: ["Brand"],
    }),

    getBrandDetails: builder.query({
      query: (id) =>
        buildEndpointPath(API_ENDPOINTS.brands.details.path, { id }),
    }),

    updateBrand: builder.mutation({
      query: ({ id, ...brandData }) => ({
        url: buildEndpointPath(API_ENDPOINTS.brands.update.path, { id }),
        method: API_ENDPOINTS.brands.update.method,
        body: brandData,
      }),
      invalidatesTags: ["Brand"],
    }),

    deleteBrand: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.brands.delete.path, { id }),
        method: API_ENDPOINTS.brands.delete.method,
      }),
      invalidatesTags: ["Brand"],
    }),
  }),
});

export const {
  useCreateBrandMutation,
  useListBrandsQuery,
  useGetBrandDetailsQuery,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;

export default brandApi;
