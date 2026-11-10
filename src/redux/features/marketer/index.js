import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const marketerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMarketerPerformance: builder.query({
      query: (params = {}) => {
        const search = new URLSearchParams();
        if (params.from) search.set("from", params.from);
        if (params.to) search.set("to", params.to);
        if (params.client_id) search.set("client_id", params.client_id);
        const qs = search.toString();
        return { url: API_ENDPOINTS.marketer.performance.path + (qs ? `?${qs}` : ""), method: "GET" };
      },
      providesTags: ["MarketerPerformance"],
    }),
    getMarketerClients: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          per_page = 20,
          search,
          period,
          activity,
          min_orders,
          sort_by,
          sort_direction,
        } = params;
        const q = new URLSearchParams();
        q.set("page", page);
        q.set("per_page", per_page);
        if (search) q.set("search", search);
        if (period && period !== "all") q.set("period", period);
        if (activity && activity !== "all") q.set("activity", activity);
        if (min_orders !== undefined && min_orders !== "" && min_orders !== null) {
          q.set("min_orders", min_orders);
        }
        if (sort_by) q.set("sort_by", sort_by);
        if (sort_direction) q.set("sort_direction", sort_direction);
        return {
          url: `${API_ENDPOINTS.marketer.clients.path}?${q.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["MarketerClients"],
    }),
    createMarketerClient: builder.mutation({
      query: (body) => ({
        url: API_ENDPOINTS.marketer.createClient.path,
        method: "POST",
        body,
      }),
      invalidatesTags: ["MarketerClients"],
    }),
    getMarketerInvitations: builder.query({
      query: ({ page = 1, per_page = 20 } = {}) => ({
        url: `${API_ENDPOINTS.marketer.invitations.path}?page=${page}&per_page=${per_page}`,
        method: "GET",
      }),
      providesTags: ["MarketerInvitations"],
    }),
    createMarketerInvitation: builder.mutation({
      query: (body) => ({
        url: API_ENDPOINTS.marketer.createInvitation.path,
        method: "POST",
        body,
      }),
      invalidatesTags: ["MarketerInvitations"],
    }),
    revokeMarketerInvitation: builder.mutation({
      query: ({ id }) => ({
        url: buildEndpointPath(API_ENDPOINTS.marketer.revokeInvitation.path, { id }),
        method: "DELETE",
      }),
      invalidatesTags: ["MarketerInvitations"],
    }),
    getMarketerRelationship: builder.query({
      query: () => ({ url: API_ENDPOINTS.marketerClient.relationship.path, method: "GET" }),
      providesTags: ["MarketerRelationship"],
    }),
    previewMarketerInvitation: builder.mutation({
      query: (body) => ({
        url: API_ENDPOINTS.marketerClient.previewInvitation.path,
        method: "POST",
        body,
      }),
    }),
    acceptMarketerInvitation: builder.mutation({
      query: (body) => ({
        url: API_ENDPOINTS.marketerClient.acceptInvitation.path,
        method: "POST",
        body,
      }),
      invalidatesTags: ["MarketerRelationship"],
    }),
    endMarketerRelationship: builder.mutation({
      query: ({ id }) => ({
        url: buildEndpointPath(API_ENDPOINTS.marketerClient.endRelationship.path, { id }),
        method: "PATCH",
      }),
      invalidatesTags: ["MarketerRelationship"],
    }),
    getAdminMarketers: builder.query({
      query: ({ page = 1, per_page = 20 } = {}) => ({
        url: `${API_ENDPOINTS.adminMarketers.list.path}?page=${page}&per_page=${per_page}`,
        method: "GET",
      }),
      providesTags: ["AdminMarketers"],
    }),
    createAdminMarketer: builder.mutation({
      query: (body) => ({
        url: API_ENDPOINTS.adminMarketers.create.path,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminMarketers"],
    }),
    updateMarketerSuspension: builder.mutation({
      query: ({ id, banned }) => ({
        url: buildEndpointPath(API_ENDPOINTS.adminMarketers.updateSuspension.path, { id }),
        method: "PATCH",
        body: { banned },
      }),
      invalidatesTags: ["AdminMarketers"],
    }),
    getAdminMarketerClients: builder.query({
      query: ({ id, page = 1, per_page = 20 }) => ({
        url: `${buildEndpointPath(API_ENDPOINTS.adminMarketers.clients.path, { id })}?page=${page}&per_page=${per_page}`,
        method: "GET",
      }),
      providesTags: ["AdminMarketerClients"],
    }),
    endAdminMarketerClientLink: builder.mutation({
      query: ({ id }) => ({
        url: buildEndpointPath(API_ENDPOINTS.adminMarketers.endClientLink.path, { id }),
        method: "PATCH",
      }),
      invalidatesTags: ["AdminMarketerClients", "AdminMarketers"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMarketerPerformanceQuery,
  useGetMarketerClientsQuery,
  useCreateMarketerClientMutation,
  useGetMarketerInvitationsQuery,
  useCreateMarketerInvitationMutation,
  useRevokeMarketerInvitationMutation,
  useGetMarketerRelationshipQuery,
  usePreviewMarketerInvitationMutation,
  useAcceptMarketerInvitationMutation,
  useEndMarketerRelationshipMutation,
  useGetAdminMarketersQuery,
  useCreateAdminMarketerMutation,
  useUpdateMarketerSuspensionMutation,
  useGetAdminMarketerClientsQuery,
  useEndAdminMarketerClientLinkMutation,
} = marketerApi;

export default marketerApi;
