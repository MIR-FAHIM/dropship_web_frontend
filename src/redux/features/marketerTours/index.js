import baseApi from "../../api/baseApi";

// Partner Portal F7: tour milestones (progress only — nothing is claimed or paid).
const marketerToursApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMarketerTours: builder.query({
      query: () => ({ url: "/marketer/tours" }),
      keepUnusedDataFor: 120,
    }),
  }),
});

export const { useGetMarketerToursQuery } = marketerToursApi;
