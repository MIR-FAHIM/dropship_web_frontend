import { Switch } from "@material-tailwind/react";
import {
  useGetAllPaymentQuery,
  useUpdatePaymentStatusMutation,
} from "../../../redux/features/payment";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";

const Payments = () => {
  const { data, isLoading, error } = useGetAllPaymentQuery();
  const [updateStatusFn] = useUpdatePaymentStatusMutation();

  if (isLoading) {
    return <p>Loading logs...</p>;
  }

  if (error) {
    return <p>Error fetching logs: {error.message}</p>;
  }

  const onStatusChange = async (changedStatus, id, currentStatus) => {
    const toastId = toast.loading("Payment status updating please wait!");
    try {
      const res = await updateStatusFn({
        paymentInfo: {
          status: changedStatus === true ? 1 : 0,
        },
        id: id,
      });
      console.log({ res });
      toast.success(res?.data?.message, {
        id: toastId,
        duration: 2000,
      });
    } catch (error) {
      console.log("error:", error);
      toast.error(getFirstErrorMessage(error), {
        id: toastId,
        duration: 2000,
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Payments</h2>

      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Payment ID</th>
            <th className="border p-2">Req ID</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Reason</th>
            <th className="border p-2">Time</th>
            <th className="border p-2">Paid</th>{" "}
            {/* Add a new column for the switch */}
          </tr>
        </thead>
        <tbody>
          {/* Check if logs data is available */}
          {data.data?.map((log) => (
            <tr key={log.id}>
              <td className="border p-2">{log.id}</td>
              <td className="border p-2">{log.relatable_id}</td>
              <td className="border p-2">{log.type}</td>
              <td className="border p-2">{log.amount}</td>

              <td className="border p-2">{log.payment_region}</td>
              <td className="border p-2">
                {log.created_at
                  ? format(parseISO(log.created_at), "dd-MMM-yyyy, hh:mm a")
                  : "N/A"}{" "}
                {/* Format the created_at date */}
              </td>
              <td className="border p-2">
                {/* Toggle switch based on payment status */}
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-2">Not Paid</span>
                  <Switch
                    id={log.id}
                    defaultChecked={log.status == "1"}
                    crossOrigin=""
                    onChange={(e) =>
                      onStatusChange(e.target.checked, log.id, log.status)
                    }
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
