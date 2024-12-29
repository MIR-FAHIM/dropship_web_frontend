import { useGetAllPaymentQuery } from "../../../redux/features/payment";

import { format, parseISO } from "date-fns";

const Logs = () => {
  const { data, isLoading, error } = useGetAllPaymentQuery(); // Fetch logs using the API

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
            <th className="border p-2">Feature</th>
            <th className="border p-2">Response</th>
            <th className="border p-2">Message</th>
            <th className="border p-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {/* Check if logs data is available */}
          {data.data?.data.map((log) => (
            <tr key={log.id}>
              <td className="border p-2">{log.api_name}</td>
              <td className="border p-2">{log.response}</td>
              <td className="border p-2">{log.message}</td>
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

export default Logs;