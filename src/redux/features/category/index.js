import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: API_ENDPOINTS.categories.create.path,
        method: API_ENDPOINTS.categories.create.method,
        body: categoryData,
      }),
      invalidatesTags: ["Category"],
    }),

    listCategories: builder.query({
      query: (page = 1) => `${API_ENDPOINTS.categories.list.path}?page=${page}`,
      providesTags: ["Category"],
    }),
    listCategoriesWithChildren: builder.query({
      query: () => API_ENDPOINTS.categories.listWithChildren.path,
    }),

    getCategoryDetails: builder.query({
      query: (id) =>
        buildEndpointPath(API_ENDPOINTS.categories.details.path, { id }),
    }),

    getCategoryChildren: builder.query({
      query: (id) =>
        buildEndpointPath(API_ENDPOINTS.categories.children.path, { id }),
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...categoryData }) => ({
        url: buildEndpointPath(API_ENDPOINTS.categories.update.path, { id }),
        method: API_ENDPOINTS.categories.update.method,
        body: categoryData,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.categories.delete.path, { id }),
        method: API_ENDPOINTS.categories.delete.method,
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useListCategoriesQuery,
  useListCategoriesWithChildrenQuery,
  useGetCategoryDetailsQuery,
  useGetCategoryChildrenQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;

export default categoryApi;
