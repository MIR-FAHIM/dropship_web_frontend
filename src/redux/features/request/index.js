import baseApi from "../../api/baseApi";

const requestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRequest: builder.mutation({
      query: (requestInfo) => ({
        url: "/create-order-request/user",
        method: "POST",
        body: requestInfo,
      }),
    }),
    getAllRequest: builder.query({
      query: () => `/admin/requests`,
    }),
  }),
});

export const { useGetAllRequestQuery } = requestApi;
