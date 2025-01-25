import {
  useGetRequestedDeliveryItemQuery,
  useUpdateItemDeliveryStatusMutation,
} from "../../../../redux/features/order";
import { format, parseISO } from "date-fns";
import Swal from "sweetalert2";
import TabHeading from "../../../../components/shared/TabHeading";

const RequestedItemDelivery = ({ details }) => {
  const { data, isLoading, error, refetch } = useGetRequestedDeliveryItemQuery(
    details?.order.id
  );
  const [updateItemDeliveryStatus] = useUpdateItemDeliveryStatusMutation();

  const handleStatusChange = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You want to confirm the delivery of this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, confirm it!",
    });

    if (confirm.isConfirmed) {
      try {
        await updateItemDeliveryStatus({ id }).unwrap();
        Swal.fire(
          "Success!",
          "The delivery status has been updated.",
          "success"
        );
        refetch(); // Re-fetch the data to update the state
      } catch (err) {
        Swal.fire("Error!", err.message || "Something went wrong.", "error");
      }
    }
  };

  if (isLoading) {
    return <p>Loading Requested Delivery Items...</p>;
  }

  if (error) {
    return <p>Error fetching Requested Delivery Items: {error.message}</p>;
  }

  return (
    <div>
      <TabHeading title="Requested Delivery Items" />
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Item ID</th>
            <th className="border p-2">Item Name</th>
            <th className="border p-2">Grid ID</th>
            <th className="border p-2">Delivery Quantity</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Message</th>
            <th className="border p-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((log) => (
            <tr key={log.id}>
              <td className="border p-2">{log.id}</td>
              <td className="border p-2">{log.item_id}</td>
              <td className="border p-2">{log.item_name}</td>
              <td className="border p-2">{log.grid_code}</td>
              <td className="border p-2">{log.quantity}</td>
              <td className="border p-2">
                {log.status === "0" ? (
                  <button
                    onClick={() => handleStatusChange(log.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md"
                  >
                    Confirm Deliver
                  </button>
                ) : (
                  <span className="text-green-500 font-semibold">
                    Delivered
                  </span>
                )}
              </td>
              <td className="border p-2">{log.message}</td>
              <td className="border p-2">
                {log.created_at
                  ? format(parseISO(log.created_at), "dd-MMM-yyyy, hh:mm a")
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestedItemDelivery;
