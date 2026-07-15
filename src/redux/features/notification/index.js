import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotifications: builder.query({
      query: () => buildEndpointPath(API_ENDPOINTS.notifications.allList.path),
      providesTags: ["Notification"],
    }),

    getUserNotifications: builder.query({
      query: ({ userId, ...params }) => ({
        url: buildEndpointPath(API_ENDPOINTS.notifications.byUser.path, { userId }),
        params,
      }),
      providesTags: ["Notification"],
    }),

    readUnreadNotification: builder.mutation({
      query: ({ notificationId, is_seen, user_id }) => ({
        url: buildEndpointPath(API_ENDPOINTS.notifications.readUnread.path, { notificationId }),
        method: API_ENDPOINTS.notifications.readUnread.method,
        body: { is_seen, user_id },
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllNotificationsRead: builder.mutation({
      query: (userId) => ({
        url: buildEndpointPath(API_ENDPOINTS.notifications.markAllRead.path, { userId }),
        method: API_ENDPOINTS.notifications.markAllRead.method,
      }),
      invalidatesTags: ["Notification"],
    }),

  }),
});

export const {
  useGetAllNotificationsQuery,
  useGetUserNotificationsQuery,
  useReadUnreadNotificationMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;

export default notificationApi;
