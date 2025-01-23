
import { useGetItemsQuery } from "../../redux/features/item"; // Assuming you have a log query for fetching logs
import { format, parseISO } from "date-fns";

const Items = () => {
  const { data, isLoading, error } = useGetItemsQuery(); // Fetch logs using the API

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
      <h2 className="text-xl font-semibold mb-4">All Items</h2>
     
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Item Name</th>
            <th className="border p-2">Item Type</th>
            <th className="border p-2">Total Quantity</th>
            <th className="border p-2">User</th>
          </tr>
        </thead>
        <tbody>
          {/* Check if logs data is available */}
          {data.data?.map((log) => (
            <tr key={log.id}>
              <td className="border p-2">{log.id}</td>
              <td className="border p-2">{log.name}</td>
              <td className="border p-2">{log.type}</td>
              <td className="border p-2">{log.request_quantity}</td>
              <td className="border p-2">
                {log.user?.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Items;
