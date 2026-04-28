import React from "react";
import { useGetAllNotificationsQuery } from "../../../redux/features/notification";

const AdminNotification = () => {
  const { data, error, isLoading } = useGetAllNotificationsQuery();

  if (isLoading) return <div>Loading notifications...</div>;
  if (error) return <div>Error loading notifications.</div>;

  const notifications = data?.data?.data || [];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      <ul className="space-y-4">
        {notifications.length === 0 && <li>No notifications found.</li>}
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`p-4 rounded shadow border ${notification.is_seen ? "bg-gray-100" : "bg-blue-50 border-blue-400"}`}
          >
            <div className="flex items-center gap-3">
              {notification.image && (
                <img
                  src={notification.image}
                  alt="Notification"
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <div className="font-semibold text-lg">{notification.title}</div>
                <div className="text-gray-600">{notification.subtitle}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </div>
                <div className="text-xs mt-1">
                  <span className="font-medium">Type:</span> {notification.type} | <span className="font-medium">Module:</span> {notification.module}
                </div>
                {!notification.is_seen && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded">New</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminNotification;
