import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const noticeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getResellerNotices: builder.query({
      query: () => ({
        url: API_ENDPOINTS.notices.reseller.path,
        method: API_ENDPOINTS.notices.reseller.method,
      }),
      providesTags: ["Notice"],
    }),

    getAdminNotices: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.notices.list.path,
        method: API_ENDPOINTS.notices.list.method,
        params,
      }),
      providesTags: ["Notice"],
    }),

    addNotice: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.notices.add.path,
        method: API_ENDPOINTS.notices.add.method,
        body: payload,
      }),
      invalidatesTags: ["Notice"],
    }),

    updateNotice: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.notices.update.path, { id }),
        method: API_ENDPOINTS.notices.update.method,
        body: payload,
      }),
      invalidatesTags: ["Notice"],
    }),

    deleteNotice: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.notices.delete.path, { id }),
        method: API_ENDPOINTS.notices.delete.method,
      }),
      invalidatesTags: ["Notice"],
    }),
  }),
});

export const {
  useGetResellerNoticesQuery,
  useGetAdminNoticesQuery,
  useAddNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} = noticeApi;

export default noticeApi;
