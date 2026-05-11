import baseApi from "../../api/baseApi";
import API_ENDPOINTS from "../../api/apiEndpoints";

const deliveryCompanyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listDeliveryCompanies: builder.query({
      query: () => API_ENDPOINTS.deliveryCompanies.list.path,
      providesTags: ["DeliveryCompany"],
    }),
  }),
});

export const { useListDeliveryCompaniesQuery } = deliveryCompanyApi;

export default deliveryCompanyApi;
