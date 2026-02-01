import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getFromLocalstorage } from "../../utils/localstorage.utils";
import {imgBaseUrl} from '../../../config';
const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${imgBaseUrl}/api`,
    prepareHeaders: (headers) => {
      const token = getFromLocalstorage("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Grid", "Request", "Payment", "Note", "User", "Warehouse"],
  endpoints: () => ({}),
});

export default baseApi;
