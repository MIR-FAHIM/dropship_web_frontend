import baseApi from "../../api/baseApi";

const itemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query({
      query: () => `/items/showall`,
    }),
  
  }),
});

export const { useGetItemsQuery } = itemApi;
