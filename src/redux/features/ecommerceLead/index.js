import baseApi from "../../api/baseApi";
import { API_ENDPOINTS, buildEndpointPath } from "../../api/apiEndpoints";

const ecommerceLeadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createEcommerceLead: builder.mutation({
      query: (body) => ({
        url: API_ENDPOINTS.ecommerceWebsiteLeads.create.path,
        method: "POST",
        body,
      }),
      invalidatesTags: ["EcommerceWebsiteLead"],
    }),

    listEcommerceLeads: builder.query({
      query: (params) => ({
        url: API_ENDPOINTS.ecommerceWebsiteLeads.list.path,
        params: params || undefined,
      }),
      providesTags: ["EcommerceWebsiteLead"],
    }),

    updateEcommerceLeadStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: buildEndpointPath(API_ENDPOINTS.ecommerceWebsiteLeads.updateStatus.path, { id }),
        method: "POST",
        body,
      }),
      invalidatesTags: ["EcommerceWebsiteLead"],
    }),
  }),
});

export const {
  useCreateEcommerceLeadMutation,
  useListEcommerceLeadsQuery,
  useUpdateEcommerceLeadStatusMutation,
} = ecommerceLeadApi;

export default ecommerceLeadApi;
