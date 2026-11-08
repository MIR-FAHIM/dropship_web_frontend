import baseApi from "../../api/baseApi";

const partnerStoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerStore: builder.query({
      query: () => ({
        url: "/partner/store",
        method: "GET",
      }),
      providesTags: ["PartnerStore"],
    }),

    savePartnerStore: builder.mutation({
      query: (data) => ({
        url: "/partner/store/save",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PartnerStore"],
    }),

    regeneratePartnerSecret: builder.mutation({
      query: () => ({
        url: "/partner/store/regenerate-secret",
        method: "POST",
      }),
      invalidatesTags: ["PartnerStore"],
    }),

    testPartnerWebhook: builder.mutation({
      query: (headers) => ({
        url: "/partner/v1/webhook/test",
        method: "POST",
        headers: headers || {},
      }),
    }),
  }),
});

export const {
  useGetPartnerStoreQuery,
  useSavePartnerStoreMutation,
  useRegeneratePartnerSecretMutation,
  useTestPartnerWebhookMutation,
} = partnerStoreApi;

export default partnerStoreApi;
