import React, { useState } from "react";
import TabHeading from "../../../components/shared/TabHeading";
import { useItemDispatchRequestMutation } from "../../../redux/features/order";
import { toast } from "sonner";

const ItemDispatch = ({ details }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");

  const [itemDispatchRequest, { isLoading }] = useItemDispatchRequestMutation();

  const handleDispatch = async () => {
    if (!quantity) {
      toast.error("Give a quantity number.");
      return;
    }

    if (Number(quantity) > Number(selectedItem.quantity)) {
      toast.error("Quantity cannot exceed available quantity.");
      return;
    }

    const toastId = toast.loading("Dispatching...!");
    const payload = {
      item_id: selectedItem.item?.id,
      request_id: 123, // Assuming a request ID for now
      gridcode: selectedItem.grid?.grid_code,
      quantity: quantity,
      message: message || "Urgent delivery", // Default message if empty
    };

    try {
      await itemDispatchRequest(payload).unwrap();
      toast.success("Item dispatch Requested Successfully!", {
        id: toastId,
        duration: 2000,
      });
      setQuantity(""); // Reset quantity field
      setMessage(""); // Reset message field
    } catch (err) {
      toast.error("Error dispatching item. Please try again.", {
        id: toastId,
        duration: 2000,
      });
      console.error("Error dispatching item:", err);
    }
  };

  return (
    <div>
      <TabHeading title="Dispatch Item From Grid" subTitle="Select a grid and dispatch a quantity of that item." />
      <div className="font-plex grid grid-cols-4 gap-4">
        {details?.map((detail, index) => (
          <div
            key={index}
            className={`border p-4 rounded-md cursor-pointer ${
              selectedItem === detail ? "border-blue-500" : ""
            }`}
            onClick={() => setSelectedItem(detail)}
          >
            <div className="flex items-center">
              <h3 className="font-medium">Grid Code:</h3>
              <p className="font-semibold ms-1">{detail.grid?.grid_code || "N/A"}</p>
            </div>
            <div className="flex items-center">
              <h3 className="font-medium">Item Name:</h3>
              <p className="font-semibold ms-1">{detail.item?.name || "N/A"}</p>
            </div>
            <div className="flex items-center">
              <h3 className="font-medium">Item Type:</h3>
              <p className="font-semibold ms-1">{detail.item?.type || "N/A"}</p>
            </div>
            <div className="flex items-center">
              <h3 className="font-medium">Available Quantity:</h3>
              <p className="font-semibold ms-1">{detail.quantity || "N/A"}</p>
            </div>

            {selectedItem === detail && (
              <div className="mt-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium">
                    Dispatch Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1 p-2 border rounded-md w-full"
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="mt-2">
                  <label htmlFor="message" className="block text-sm font-medium">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 p-2 border rounded-md w-full"
                    placeholder="Enter message"
                  />
                </div>
                <button
                  onClick={handleDispatch}
                  className="mt-4 bg-blue-500 text-white p-2 rounded-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Dispatching..." : "Dispatch Item"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemDispatch;
