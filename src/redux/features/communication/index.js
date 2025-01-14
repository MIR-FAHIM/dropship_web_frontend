import baseApi from "../../api/baseApi";

const communicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
   
    getNotesByReq: builder.query({
      query: (id) => `/notes/${id}`,
    }),
  }),
});

export const { useGetNotesByReqQuery } = communicationApi;
