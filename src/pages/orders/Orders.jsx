
import { useGetAllOrderQuery } from "../../redux/features/order"; // Assuming you have a log query for fetching logs
import { format, parseISO } from "date-fns";

const Orders = () => {
  const { data, isLoading, error } = useGetAllOrderQuery(); // Fetch logs using the API

  // If data is loading, show loading message
  if (isLoading) {
    return <p>Loading logs...</p>;
  }

  // If there is an error fetching logs, show error message
  if (error) {
    return <p>Error fetching logs: {error.message}</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Logs</h2>

      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Order ID</th>
            <th className="border p-2">Request ID</th>
            <th className="border p-2">Payment</th>
            <th className="border p-2">Duration</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Warehouse</th>
            <th className="border p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {/* Check if logs data is available */}
          {data.data?.map((log) => (
            <tr key={log.id}>
              <td className="border p-2">{log.order_id}</td>

              <td className="border p-2">{log.request_id}</td>
              <td className="border p-2">{log.payment}</td>
              <td className="border p-2">{log.request.start_date} {log.request.end_date}</td>
              <td className="border p-2">{log.status}</td>
              <td className="border p-2">{log.request.warehouse.name}</td>
              <td className="border p-2">
                {log.created_at
                  ? format(parseISO(log.created_at), "dd-MMM-yyyy, hh:mm a")
                  : "N/A"} {/* Format the created_at date */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
