import baseApi from "../../api/baseApi";
import { API_ENDPOINTS, buildEndpointPath } from "../../api/apiEndpoints";


const attributeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
       
    getAttributes: builder.query({
      query: (page = 1) => ({
        url: API_ENDPOINTS.attributes.list.path,
       
      }),
      providesTags: ["Attribute"],
    }),
    getAttributeDetails: builder.query({
        
       query: (id) => buildEndpointPath(API_ENDPOINTS.attributes.details.path, { id }),  
     
      providesTags: ["Attribute"],
    }),
        createAttribute: builder.mutation({
            query: (attributeData) => ({
                url: API_ENDPOINTS.attributes.create.path,
                method: API_ENDPOINTS.attributes.create.method,
                body: attributeData,
            }),
            invalidatesTags: ["Attribute"],
        }),
        createValue: builder.mutation({
            query: (valueData) => ({
                url: API_ENDPOINTS.attributes.valuesCreate.path,
                method: API_ENDPOINTS.attributes.valuesCreate.method,
                body: valueData,
            }),
            invalidatesTags: ["Attribute"],
        }),



    }),
});

export const {
    useGetAttributesQuery,
    useCreateAttributeMutation,
    useCreateValueMutation,
    useGetAttributeDetailsQuery,
} = attributeApi;

export default attributeApi;
