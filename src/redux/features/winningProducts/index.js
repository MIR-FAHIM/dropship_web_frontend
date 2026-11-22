import baseApi from "../../api/baseApi";

// Partner Portal F6: winning products (admin marketing content + marketer cards).
const winningProductsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------- admin ---------- */
    getAdminWinningProducts: builder.query({
      query: (params = {}) => ({ url: "/admin/winning-products", params }),
      providesTags: ["WinningProducts"],
    }),
    getProductWinning: builder.query({
      query: (productId) => ({ url: `/admin/products/${productId}/winning` }),
      providesTags: ["WinningProducts"],
    }),
    // formData: hook, ad_angle, creative_tip, captions, local_image / original_image files, remove_* flags
    saveProductWinning: builder.mutation({
      query: ({ productId, formData }) => ({ url: `/admin/products/${productId}/winning`, method: "POST", body: formData }),
      invalidatesTags: ["WinningProducts"],
    }),
    unmarkProductWinning: builder.mutation({
      query: (productId) => ({ url: `/admin/products/${productId}/winning`, method: "DELETE" }),
      invalidatesTags: ["WinningProducts"],
    }),

    /* ---------- marketer ---------- */
    getWinningProducts: builder.query({
      query: (params = {}) => ({ url: "/marketer/winning-products", params }),
      // MarketerPitch: starring in the calculator refreshes the cards too.
      providesTags: ["WinningProducts", "MarketerPitch"],
    }),
  }),
});

export const {
  useGetAdminWinningProductsQuery,
  useGetProductWinningQuery,
  useSaveProductWinningMutation,
  useUnmarkProductWinningMutation,
  useGetWinningProductsQuery,
} = winningProductsApi;

export default winningProductsApi;
