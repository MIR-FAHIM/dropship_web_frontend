import baseApi from "../../api/baseApi";
import API_ENDPOINTS from "../../api/apiEndpoints";

const deliveryCompanyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listDeliveryCompanies: builder.query({
      query: () => API_ENDPOINTS.deliveryCompanies.list.path,
      providesTags: ["DeliveryCompany"],
    }),
    getAssignedOrderOfCompany: builder.query({
      query: (companyId) => API_ENDPOINTS.deliveryCompanies.getAssignedOrderOfCompany.path.replace("{companyId}", companyId),
      providesTags: ["DeliveryCompany"],
    }),
  }),
});

export const { useListDeliveryCompaniesQuery, useGetAssignedOrderOfCompanyQuery } = deliveryCompanyApi;

export default deliveryCompanyApi;
