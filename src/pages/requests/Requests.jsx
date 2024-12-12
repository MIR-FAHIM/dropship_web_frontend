import React, { useState } from "react";
import CustomTable from "../../components/ui/CustomTable";
import { useGetAllRequestQuery } from "../../redux/features/request";

import { format, parseISO } from "date-fns";

// Example warehouse list (you can fetch this from an API if needed)
const warehouseList = [
  { id: 1, name: "Warehouse A" },
  { id: 2, name: "Warehouse B" },
  { id: 3, name: "Warehouse C" },
];

const tableHead = [
  "Date",
  "User",
  "Size",
  "Start Date",
  "End Date",
  "Check Item Request",
  "Status",
  "Warehouse",
];

const Requests = () => {
  const { data } = useGetAllRequestQuery();

  const [selectedItems, setSelectedItems] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState({}); // State to track warehouse selection per request

  // Handle the item selection for the modal
  const handleShowItems = (items) => {
    setSelectedItems(items);
  };
  const handleUser = (items) => {
    setSelectedUsers(items);
  };

  // Handle closing the item modal
  const handleCloseItems = () => {
    setSelectedItems(null);
  };
  const handleCloseUsers = () => {
    setSelectedUsers(null);
  };

  // Handle the warehouse selection for each row
  const handleWarehouseChange = (requestId, warehouseId) => {
    setSelectedWarehouse((prevState) => ({
      ...prevState,
      [requestId]: warehouseId,
    }));
  };

  return (
    <div className="">
      <div className="p-5">
        <h3 className="text-xl font-semibold">
          Requests <span className="font-bold">{data?.data?.length}</span>
        </h3>
      </div>
      <CustomTable tableHead={tableHead}>
        {data?.data?.map((item) => (
          <tr key={item?.id}>
            <td className="px-5 py-3 border">
              {format(parseISO(item?.created_at), "dd-MMM',' hh:mm a")}
            </td>
            <td className="px-5 py-3 border"> <button
                onClick={() => handleUser(item?.user)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {item?.user?.name}
              </button></td>
            <td className="px-5 py-3 border">{item?.size}</td>
            <td className="px-5 py-3 border">{item?.start_date}</td>
            <td className="px-5 py-3 border">{item?.end_date}</td>
            <td className="px-5 py-3 border">
              <button
                onClick={() => handleShowItems(item?.items)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Check Item Request
              </button>
            </td>
            <td className="px-5 py-3 border">{item?.status}</td>
            <td className="px-5 py-3 border">
              <select
                value={selectedWarehouse[item?.id] || ""}
                onChange={(e) =>
                  handleWarehouseChange(item?.id, e.target.value)
                }
                className="px-4 py-2 border rounded"
              >
                <option value="" disabled>
                  Select Warehouse
                </option>
                {warehouseList.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </CustomTable>

      {/* Modal for the Item List */}
      {selectedItems && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Item Request Details</h3>
            <ul>
              {selectedItems.map((item) => (
                <li key={item?.id} className="mb-2">
                  <span className="font-bold">{item?.name}:</span>{" "}
                  {item?.request_quatity}
                </li>
              ))}
            </ul>
            <button
              onClick={handleCloseItems}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

{selectedUsers && (
  <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg w-1/3">
      <h3 className="text-xl font-semibold mb-4">User Request Details</h3>
      
      {/* User Information */}
      <div className="mb-4">
        <p><strong>Name:</strong> <span className="font-bold">{selectedUsers.name}</span></p>
        <p><strong>Mobile Number:</strong> {selectedUsers.phone}</p>
        <p><strong>Email:</strong> {selectedUsers.email}</p>
        <p><strong>Address:</strong> {selectedUsers.address}</p>
      </div>
      
      <button
        onClick={handleCloseUsers}
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default Requests;
