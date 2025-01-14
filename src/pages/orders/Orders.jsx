import { Link } from "react-router-dom";
import { useGetAllOrderQuery } from "../../redux/features/order"; // Assuming you have a log query for fetching logs
import { format, parseISO } from "date-fns";
import statusMeaning from "../../utils/statusMeaning.utils";
import { useState } from "react";
import UpdateOrderStatus from "./components/UpdateOrderStatus";

const Orders = () => {
  const { data, isLoading, error } = useGetAllOrderQuery();
  const [isOpen, setOpen] = useState(false);
  const [orderInfo, setOrderInfo] = useState({});
  if (isLoading) {
    return <p>Loading orders...</p>;
  }
  if (error) {
    return <p>Error fetching orders: {error.message}</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Orders</h2>

      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Order ID</th>
            <th className="border p-2">Request ID</th>
            <th className="border p-2">Payment</th>
            <th className="border p-2">Duration</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Render data rows if available */}
          {data?.data?.map((item) => (
            <tr key={item?.order_id}>
              <td className="border p-2">{item?.order_id}</td>
              <td className="border p-2">{item?.request_id}</td>
              <td className="border p-2">{item?.payment}</td>
              <td className="border p-2">
                {item?.request.start_date} {item?.request.end_date}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => {
                    setOrderInfo(item);
                    setOpen(true);
                  }}
                >
                  {statusMeaning("order", item?.status)}
                </button>
              </td>
              <td className="border p-2">
                {item?.created_at
                  ? format(parseISO(item?.created_at), "dd-MMM-yyyy, hh:mm a")
                  : "N/A"}
              </td>
              <td className="border p-2 flex flex-col space-4">
                <Link to={`details/${item?.order_id}`}>View details</Link>
                <Link to={`invoice/${item?.order_id}`}>Create Invoice</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <UpdateOrderStatus details={orderInfo} open={isOpen} setOpen={setOpen} />
    </div>
  );
};

export default Orders;
