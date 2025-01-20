import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getFromLocalstorage } from "../../utils/localstorage.utils";
const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://adminwarehouse.jayga.io/api",
    prepareHeaders: (headers) => {
      const token = getFromLocalstorage("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Grid", "Request", "Payment", "Note"],
  endpoints: () => ({}),
});

export default baseApi;
