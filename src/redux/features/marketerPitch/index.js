import baseApi from "../../api/baseApi";

// Partner Portal F5: Pitch Calculator data (products with Reseller Brain price, stars, dollar rate).
const marketerPitchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPitchProducts: builder.query({
      query: (params = {}) => ({ url: "/marketer/pitch/products", params }),
      providesTags: ["MarketerPitch"],
    }),
    starPitchProduct: builder.mutation({
      query: ({ id, starred }) => ({ url: `/marketer/pitch/products/${id}/star`, method: starred ? "POST" : "DELETE" }),
      invalidatesTags: ["MarketerPitch"],
    }),
    getPitchSettings: builder.query({
      query: () => ({ url: "/marketer/pitch/settings" }),
      providesTags: ["MarketerPitch"],
    }),
    savePitchSettings: builder.mutation({
      query: (body) => ({ url: "/marketer/pitch/settings", method: "PUT", body }),
      invalidatesTags: ["MarketerPitch"],
    }),
  }),
});

export const {
  useGetPitchProductsQuery,
  useStarPitchProductMutation,
  useGetPitchSettingsQuery,
  useSavePitchSettingsMutation,
} = marketerPitchApi;

export default marketerPitchApi;
