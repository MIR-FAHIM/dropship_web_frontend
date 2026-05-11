import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const carrybeeBaseApi = createApi({
  reducerPath: "carrybeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://sandbox.carrybee.com/api/v2",
  }),
  tagTypes: ["CarryBeeStore"],
  endpoints: () => ({}),
});

export default carrybeeBaseApi;
