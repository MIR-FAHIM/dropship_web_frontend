import baseApi from "../../api/baseApi";

// Lead management (admin CRM): GET/POST /leads, stats, tags, contact log,
// convert dropshipper -> lead. Every admin sees every lead.
const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "all"));

const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: (params = {}) => ({ url: "/leads", params: clean(params) }),
      providesTags: ["Lead"],
    }),
    getLeadStats: builder.query({
      query: () => "/leads/stats",
      providesTags: ["Lead"],
    }),
    getLead: builder.query({
      query: (id) => `/leads/${id}`,
      providesTags: ["Lead"],
    }),
    createLead: builder.mutation({
      query: (body) => ({ url: "/leads", method: "POST", body }),
      invalidatesTags: ["Lead", "User"],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/leads/${id}`, method: "PUT", body }),
      invalidatesTags: ["Lead", "User"],
    }),
    deleteLead: builder.mutation({
      query: (id) => ({ url: `/leads/${id}`, method: "DELETE" }),
      invalidatesTags: ["Lead", "User"],
    }),
    logLeadContact: builder.mutation({
      query: ({ id, channel }) => ({ url: `/leads/${id}/contact`, method: "POST", body: { channel } }),
      invalidatesTags: ["Lead"],
    }),
    leadFromDropshipper: builder.mutation({
      query: ({ userId, note }) => ({ url: `/leads/from-dropshipper/${userId}`, method: "POST", body: note ? { note } : {} }),
      invalidatesTags: ["Lead", "User"],
    }),
    getLeadTags: builder.query({
      query: () => "/leads/tags",
      providesTags: ["LeadTag"],
    }),
    createLeadTag: builder.mutation({
      query: (name) => ({ url: "/leads/tags", method: "POST", body: { name } }),
      invalidatesTags: ["LeadTag"],
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadStatsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useLogLeadContactMutation,
  useLeadFromDropshipperMutation,
  useGetLeadTagsQuery,
  useCreateLeadTagMutation,
} = leadsApi;

export default leadsApi;
