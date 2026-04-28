import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotifications: builder.query({
      query: (userId) => buildEndpointPath(API_ENDPOINTS.notifications.allList.path),
    }),


  }),
});

export const { useGetAllNotificationsQuery } = notificationApi;

export default notificationApi;
