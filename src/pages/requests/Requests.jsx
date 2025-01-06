import { useState } from "react";
import CustomTable from "../../components/ui/CustomTable";
import {
  useGetAllRequestQuery,
  useAssignWarehouseMutation,
} from "../../redux/features/request";
import { useGetAllWarehouseQuery } from "../../redux/features/warehouse";
import { format, parseISO } from "date-fns";
import CustomPopover from "../../components/ui/CustomPopover";
import { PiDotsThreeOutlineVerticalBold } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const tableHead = [
  "Date",
  "User",
  "Size",
  "Start Date",
  "End Date",
  "Check Item Request",
  "Status",
  "Warehouse",
  "Action",
];

const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-1/3">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        {children}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Requests = () => {
  const navigate = useNavigate();
  const { data: requestData } = useGetAllRequestQuery();
  const { data: warehouseData, isLoading: warehouseLoading } =
    useGetAllWarehouseQuery();
  const [assignWarehouse] = useAssignWarehouseMutation();

  const [selectedItems, setSelectedItems] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState({});
  const [error, setError] = useState(null);

  const handleShowItems = (items) => setSelectedItems(items);
  const handleUser = (user) => setSelectedUsers(user);
  const handleCloseItems = () => setSelectedItems(null);
  const handleCloseUsers = () => setSelectedUsers(null);

  const handleWarehouseChange = async (requestId, warehouseId) => {
    setSelectedWarehouse((prevState) => ({
      ...prevState,
      [requestId]: warehouseId,
    }));

    try {
      await assignWarehouse({
        warehouseInfo: {
          warehouse_id: warehouseId,
        },
        requestId: requestId,
      }).unwrap();
      setError(null); // Clear any previous errors
      console.log("Warehouse assigned successfully");
    } catch (err) {
      setError(`Failed to assign warehouse: ${err.message}`);
      console.error("Error assigning warehouse:", err);
    }
  };

  return (
    <div>
      <div className="p-5">
        <h3 className="text-xl font-semibold">
          Total Requests:{" "}
          <span className="font-bold">
            {requestData?.data?.data.length || 0}
          </span>
        </h3>
      </div>
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
      )}
      <CustomTable tableHead={tableHead}>
        {requestData?.data?.data.map((item) => (
          <tr key={item?.id}>
            <td className="px-5 py-3 border">
              {format(parseISO(item?.created_at), "dd-MMM',' hh:mm a")}
            </td>
            <td className="px-5 py-3 border">
              <button
                onClick={() => handleUser(item?.user)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {item?.user?.name}
              </button>
            </td>
            <td className="px-5 py-3 border">{item?.size}</td>
            <td className="px-5 py-3 border">{item?.start_date}</td>
            <td className="px-5 py-3 border">{item?.end_date}</td>
            <td className="px-5 py-3 border">
              <button
                onClick={() => handleShowItems(item?.items)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Check Item Request ({item?.items.length})
              </button>
            </td>
            <td className="px-5 py-3 border">
  {item?.status === 0 ? 'Pending' : item?.status === 1 ? 'Confirmed' : 'Unknown'}
</td>
            <td className="px-5 py-3 border">
              <select
                value={selectedWarehouse[item?.id] || item?.warehouse_id || ""}
                onChange={(e) =>
                  handleWarehouseChange(item?.id, e.target.value)
                }
                className="px-4 py-2 border rounded"
                disabled={warehouseLoading}
              >
                <option value="" disabled>
                  {warehouseLoading ? "Loading..." : "Select Warehouse"}
                </option>
                {warehouseData?.warehouses?.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.warehouse_type?.type_name})
                  </option>
                ))}
              </select>
            </td>
            <td className="px-5 py-3 border flex justify-center">
              <CustomPopover icon={<PiDotsThreeOutlineVerticalBold />}>
                <div className="flex flex-col items-start">
                  <button className="requestActions">View Memo</button>
                  <button
                    onClick={() => navigate(`/request-details/${item?.id}`)}
                    className="requestActions"
                  >
                    Create Order
                  </button>
                  <button className="requestActions">Change status</button>
                  <button className="requestActions">Split Quantity</button>
                  <button className="requestActions">Contact Guest</button>
                  <button className="requestActions">Delete</button>
                </div>
              </CustomPopover>
            </td>
          </tr>
        ))}
      </CustomTable>

      <Modal
        isOpen={!!selectedItems}
        title="Item Request Details"
        onClose={handleCloseItems}
      >
        <ul>
          {selectedItems?.map((item) => (
            <li key={item?.id} className="mb-2">
              <span className="font-bold">{item?.name}:</span>{" "}
              {item?.request_quatity}
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        isOpen={!!selectedUsers}
        title="User Request Details"
        onClose={handleCloseUsers}
      >
        <div className="mb-4">
          <p>
            <strong>Name:</strong>{" "}
            <span className="font-bold">{selectedUsers?.name}</span>
          </p>
          <p>
            <strong>Mobile Number:</strong> {selectedUsers?.phone}
          </p>
          <p>
            <strong>Email:</strong> {selectedUsers?.email}
          </p>
          <p>
            <strong>Address:</strong> {selectedUsers?.address}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Requests;
