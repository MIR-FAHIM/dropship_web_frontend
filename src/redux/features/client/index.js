import baseApi from "../../api/baseApi";

const clientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllClient: builder.query({
      query: () => `/users`,
    }),
    getClientById: builder.query({
      query: (id) => `/user/${id}`,
    }),
    updateClient: builder.mutation({
      query: ({ userInfo, id }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body: userInfo,
      }),
    }),
  }),
});

export const {
  useGetAllClientQuery,
  useGetClientByIdQuery,
  useUpdateClientMutation,
} = clientApi;
