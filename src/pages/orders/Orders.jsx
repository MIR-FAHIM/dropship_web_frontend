import { Link } from "react-router-dom";
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
            <th className="border p-2">Time</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.data?.map((item) => {
            return (
              <tr key={item?.order_id}>
                <td className="border p-2">{item?.order_id}</td>

                <td className="border p-2">{item.request_id}</td>
                <td className="border p-2">{item.payment}</td>
                <td className="border p-2">{item.payment}</td>
                <td className="border p-2">{item.status}</td>
                <td className="border p-2">
                  {item.created_at
                    ? format(parseISO(item.created_at), "dd-MMM-yyyy, hh:mm a")
                    : "N/A"}{" "}
                  {/* Format the created_at date */}
                </td>
                <td className="border p-2">
                  <Link to={`details/${item?.order_id}`}>View details</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
