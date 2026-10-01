import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUploads: builder.query({
      query: (page = 1) => `${API_ENDPOINTS.uploads.list.path}?page=${page}`,
      providesTags: ["Upload"],
    }),
    listUploadsByUserId: builder.query({
      query: ({ userId, page = 1 }) => ({
        url: buildEndpointPath(API_ENDPOINTS.uploads.listByUser.path, { userId }),
        params: { page },
      }),
      providesTags: ["Upload"],
    }),

    uploadImage: builder.mutation({
      query: (formData) => ({
        url: API_ENDPOINTS.uploads.image.path,
        method: API_ENDPOINTS.uploads.image.method,
        body: formData,
      }),
      invalidatesTags: ["Upload"],
    }),

    deleteUpload: builder.mutation({
      query: (id) => ({
        url: `/uploads/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Upload"],
    }),
  }),
});

export const {
  useListUploadsQuery,
  useListUploadsByUserIdQuery,
  useUploadImageMutation,
  useDeleteUploadMutation,
} = uploadApi;

export default uploadApi;
