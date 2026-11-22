import baseApi from "../../api/baseApi";

// Partner Portal F8: partner sign-up (public), approval + level (admin), own profile (marketer).
const partnerProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public: FormData with the application fields and photos.
    applyAsPartner: builder.mutation({
      query: (formData) => ({ url: "/partner/apply", method: "POST", body: formData }),
    }),

    /* ---------- marketer ---------- */
    getMyPartnerProfile: builder.query({
      query: () => ({ url: "/marketer/profile" }),
      providesTags: ["PartnerProfile"],
    }),
    updateMyPartnerProfile: builder.mutation({
      query: (formData) => ({ url: "/marketer/profile", method: "POST", body: formData }),
      invalidatesTags: ["PartnerProfile", "MarketerCommission"],
    }),

    /* ---------- admin ---------- */
    approvePartner: builder.mutation({
      query: (id) => ({ url: `/admin/marketers/${id}/approve`, method: "POST" }),
      invalidatesTags: ["AdminMarketers", "MarketerCommission"],
    }),
    rejectPartner: builder.mutation({
      query: ({ id, reason }) => ({ url: `/admin/marketers/${id}/reject`, method: "POST", body: { reason } }),
      invalidatesTags: ["AdminMarketers"],
    }),
    setPartnerLevel: builder.mutation({
      query: ({ id, level }) => ({ url: `/admin/marketers/${id}/level`, method: "PATCH", body: { level } }),
      invalidatesTags: ["AdminMarketers", "MarketerCommission"],
    }),
  }),
});

export const {
  useApplyAsPartnerMutation,
  useGetMyPartnerProfileQuery,
  useUpdateMyPartnerProfileMutation,
  useApprovePartnerMutation,
  useRejectPartnerMutation,
  useSetPartnerLevelMutation,
} = partnerProfileApi;

export default partnerProfileApi;
