import { useGetAllPaymentQuery } from "../../../redux/features/payment";
import { format, parseISO } from "date-fns";

const Payments = () => {
  const { data, isLoading, error } = useGetAllPaymentQuery(); // Fetch logs using the API

  // If data is loading, show loading message
  if (isLoading) {
    return <p>Loading logs...</p>;
  }

  // If there is an error fetching logs, show error message
  if (error) {
    return <p>Error fetching logs: {error.message}</p>;
  }

  // Function to toggle the payment status (just for UI representation)
  const handleTogglePaymentStatus = (id, currentStatus) => {
    // Add your logic here to toggle the payment status (if needed for backend sync)
    console.log(`Toggling payment status for ID: ${id} to: ${currentStatus === 1 ? 0 : 1}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Payments</h2>

      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Req ID</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Amount</th>
           
            <th className="border p-2">Reason</th>
            <th className="border p-2">Time</th>
            <th className="border p-2">Paid</th> {/* Add a new column for the switch */}
          </tr>
        </thead>
        <tbody>
          {/* Check if logs data is available */}
          {data.data?.map((log) => (
            <tr key={log.id}>
              <td className="border p-2">{log.relatable_id}</td>
              <td className="border p-2">{log.type}</td>
              <td className="border p-2">{log.amount}</td>
             
              <td className="border p-2">{log.payment_region}</td>
              <td className="border p-2">
                {log.created_at
                  ? format(parseISO(log.created_at), "dd-MMM-yyyy, hh:mm a")
                  : "N/A"} {/* Format the created_at date */}
              </td>
              <td className="border p-2">
                {/* Toggle switch based on payment status */}
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-2">Not Paid</span>
                  <input
                    type="checkbox"
                    checked={log.status === 1}
                    onChange={() => handleTogglePaymentStatus(log.id, log.status)}
                    className="toggle-checkbox"
                  />
                  <span className="ml-2">Paid</span>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Payments;
