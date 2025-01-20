import {
  useGetAllPaymentQuery,
  useUpdatePaymentStatusMutation,
} from "../../../redux/features/payment";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";
import { useState } from "react";
import CustomModal from "../../../components/ui/CustomModal";
import { Link } from "react-router-dom";

const MakePaymentConfirmed = ({ updateStatusFn, itemDetails }) => {
  const [isOpen, setOpen] = useState(false);
  const onStatusChange = async () => {
    const toastId = toast.loading("Payment status updating please wait!");
    try {
      const res = await updateStatusFn({
        paymentInfo: {
          status: 1,
        },
        id: itemDetails?.id,
      });
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
      <button
        onClick={() => setOpen(true)}
        className="bg-red-50 py-1 px-2 rounded-md"
      >
        Pending
      </button>
      <CustomModal
        open={isOpen}
        setOpen={setOpen}
        title={"Confirm payment"}
        footer={true}
        onClick={onStatusChange}
      >
        <p className="font-bold">
          {" "}
          <span className="mr-1 font-semibold">Amount:</span>{" "}
          {itemDetails?.amount}
        </p>
        <p>
          {" "}
          <span className="mr-1 font-semibold">Reason:</span>{" "}
          {itemDetails?.payment_region}
        </p>
        <p>
          {" "}
          <span className="mr-1 font-semibold">Payment created at:</span>
          {itemDetails?.created_at
            ? format(parseISO(itemDetails?.created_at), "dd-MMM-yyyy, hh:mm a")
            : "N/A"}{" "}
        </p>
      </CustomModal>
    </div>
  );
};

const Payments = () => {
  const { data, isLoading, error } = useGetAllPaymentQuery();
  const [updateStatusFn] = useUpdatePaymentStatusMutation();

  if (isLoading) {
    return <p>Loading logs...</p>;
  }

  if (error) {
    return <p>Error fetching logs: {error.message}</p>;
  }

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
          {data.data?.map((item) => (
            <tr key={item?.id}>
              <td className="border p-2">{item?.id}</td>
              <td className="border p-2">{item?.relatable_id}</td>
              <td className="border p-2">{item?.type}</td>
              <td className="border p-2">{item?.amount}</td>

              <td className="border p-2">{item?.payment_region}</td>
              <td className="border p-2">
                {item?.created_at
                  ? format(parseISO(item?.created_at), "dd-MMM-yyyy, hh:mm a")
                  : "N/A"}{" "}
                {/* Format the created_at date */}
              </td>
              <td className="border p-2 flex flex-col gap-2">
                {item?.status === "1" ? (
                  <button className="bg-primary-400 py-1 px-2 rounded-md">
                    Payment Confirmed
                  </button>
                ) : (
                  <MakePaymentConfirmed
                    updateStatusFn={updateStatusFn}
                    itemDetails={item}
                  />
                )}
                <Link to={`/payment/invoice-pdf/${item?.id}`}>Invoice</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Payments;
