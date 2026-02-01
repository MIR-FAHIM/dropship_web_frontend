import baseApi from "../../api/baseApi";

const picnicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // CREATE new picnic registration
    createPicnic: builder.mutation({
      query: (data) => ({
        url: "/picnic",
        method: "POST",
        body: data,
      }),
    }),

    // GET all picnic registrations
    getAllPicnics: builder.query({
      query: () => "/picnic",
    }),

    // GET single picnic registration by ID
    getPicnicById: builder.query({
      query: (id) => `/picnic/${id}`,
    }),

    // UPDATE a registration
    updatePicnic: builder.mutation({
      query: ({ id, updateData }) => ({
        url: `/picnic/${id}`,
        method: "PUT",
        body: updateData,
      }),
    }),

    // DELETE a registration
    deletePicnic: builder.mutation({
      query: (id) => ({
        url: `/picnic/${id}`,
        method: "DELETE",
      }),
    }),

  }),
});

export const {
  useCreatePicnicMutation,
  useGetAllPicnicsQuery,
  useGetPicnicByIdQuery,
  useUpdatePicnicMutation,
  useDeletePicnicMutation,
} = picnicApi;

export default picnicApi;