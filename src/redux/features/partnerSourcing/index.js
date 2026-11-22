import baseApi from "../../api/baseApi";

// Partner Portal F4: product sourcing requests (marketer panel + admin sourcing team).
const partnerSourcingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------- marketer ---------- */
    getMyRequirements: builder.query({
      query: (params = {}) => ({ url: "/marketer/requirements", params }),
      providesTags: ["PartnerSourcing"],
    }),
    // body: FormData (product_image file + fields)
    submitRequirement: builder.mutation({
      query: (formData) => ({ url: "/marketer/requirements", method: "POST", body: formData }),
      invalidatesTags: ["PartnerSourcing"],
    }),
    withdrawRequirement: builder.mutation({
      query: (id) => ({ url: `/marketer/requirements/${id}`, method: "DELETE" }),
      invalidatesTags: ["PartnerSourcing"],
    }),

    /* ---------- admin ---------- */
    getSourcingRequests: builder.query({
      query: (params = {}) => ({ url: "/admin/sourcing-requests", params }),
      providesTags: ["PartnerSourcing"],
    }),
    updateSourcingRequest: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/sourcing-requests/${id}`, method: "PATCH", body }),
      invalidatesTags: ["PartnerSourcing"],
    }),
  }),
});

export const {
  useGetMyRequirementsQuery,
  useSubmitRequirementMutation,
  useWithdrawRequirementMutation,
  useGetSourcingRequestsQuery,
  useUpdateSourcingRequestMutation,
} = partnerSourcingApi;

export default partnerSourcingApi;
