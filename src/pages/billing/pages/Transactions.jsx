import { useGetAllTransactionQuery } from "../../../redux/features/transaction";
import { format, parseISO } from "date-fns";

const Transactions = () => {
  const { data, isLoading, error } = useGetAllTransactionQuery(); // Fetch logs using the API

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
      <h2 className="text-xl font-semibold mb-4">Transactions</h2>

      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Transaction ID</th>
            <th className="border p-2">Payment ID</th>
           
            <th className="border p-2">Amount</th>
           
            <th className="border p-2">TRX</th>
            <th className="border p-2">Time</th>
          
          </tr>
        </thead>
        <tbody>
          {/* Check if logs data is available */}
          {data.data?.map((log) => (
            <tr key={log.id}>
              <td className="border p-2">{log.id}</td>
              <td className="border p-2">{log.payment_id}</td>
            
              <td className="border p-2">{log.amount}</td>
             
              <td className="border p-2">{log.trxed}</td>
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

export default Transactions;
