import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const appVersionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppVersions: builder.query({
      query: (params = {}) => ({
        url: API_ENDPOINTS.appVersions.list.path,
        method: API_ENDPOINTS.appVersions.list.method,
        params,
      }),
      providesTags: ["AppVersion"],
    }),

    addAppVersion: builder.mutation({
      query: (payload) => ({
        url: API_ENDPOINTS.appVersions.store.path,
        method: API_ENDPOINTS.appVersions.store.method,
        body: payload,
      }),
      invalidatesTags: ["AppVersion"],
    }),

    updateAppVersion: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: buildEndpointPath(API_ENDPOINTS.appVersions.update.path, { id }),
        method: API_ENDPOINTS.appVersions.update.method,
        body: payload,
      }),
      invalidatesTags: ["AppVersion"],
    }),

    toggleAppVersion: builder.mutation({
      query: (id) => ({
        url: buildEndpointPath(API_ENDPOINTS.appVersions.toggle.path, { id }),
        method: API_ENDPOINTS.appVersions.toggle.method,
      }),
      invalidatesTags: ["AppVersion"],
    }),
  }),
});

export const {
  useGetAppVersionsQuery,
  useAddAppVersionMutation,
  useUpdateAppVersionMutation,
  useToggleAppVersionMutation,
} = appVersionApi;

export default appVersionApi;
