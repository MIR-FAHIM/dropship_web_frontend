import baseApi from "../../api/baseApi";

const communicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotesByReq: builder.query({
      query: (id) => `/notes/${id}`,
      providesTags: ["Note"],
    }),
    createNote: builder.mutation({
      query: (noteInfo) => ({
        url: "/notes",
        method: "POST",
        body: noteInfo,
      }),
      invalidatesTags: ["Note"],
    }),
  }),
});

export const { useGetNotesByReqQuery, useCreateNoteMutation } =
  communicationApi;
