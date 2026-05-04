import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCart: builder.mutation({
      query: (cartData) => ({
        url: API_ENDPOINTS.carts.addItem.path,
        method: API_ENDPOINTS.carts.addItem.method,
        body: cartData,
      }),
    }),

    getCart: builder.query({
      query: (userId) =>
        buildEndpointPath(API_ENDPOINTS.carts.active.path, { userId }),
    }),

    deleteCart: builder.mutation({
      query: (itemId) => ({
        url: buildEndpointPath(API_ENDPOINTS.carts.removeItem.path, {
          itemId,
        }),
        method: API_ENDPOINTS.carts.removeItem.method,
      }),
    }),

    updateCart: builder.mutation({
      query: ({ itemId, qty }) => ({
        url: buildEndpointPath(API_ENDPOINTS.carts.updateItemQty.path, {
          itemId,
        }),
        method: API_ENDPOINTS.carts.updateItemQty.method,
        params: { qty },
        body: (() => {
          const formData = new FormData();
          formData.append("qty", qty);
          return formData;
        })(),
      }),
    }),
    addNote: builder.mutation({
      query: ({ itemId, note }) => ({
        url: buildEndpointPath(API_ENDPOINTS.carts.addNote.path, {
          itemId,
        }),
        method: API_ENDPOINTS.carts.addNote.method,
        params: { note },
        body: (() => {
          const formData = new FormData();
          formData.append("note", note);
          return formData;
        })(),
      }),
    }),

    clearCart: builder.mutation({
      query: (userId) => ({
        url: buildEndpointPath(API_ENDPOINTS.carts.clear.path, { userId }),
        method: API_ENDPOINTS.carts.clear.method,
      }),
    }),
  }),
});

export const {
  useCreateCartMutation,
  useGetCartQuery,
  useDeleteCartMutation,
  useUpdateCartMutation,
  useAddNoteMutation,
  useClearCartMutation,
} = cartApi;

export default cartApi;
