import { useState } from "react";
import { Radio, Switch } from "@material-tailwind/react";
import { useFormik } from "formik";
import {
  useAssignGridMutation,
  useGetGridsByWarehouseIdQuery,
  useToggleOccupiedGridMutation,
} from "../../../redux/features/grid";
import CustomButton from "../../../components/ui/CustomButton";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";
import Swal from "sweetalert2";
import Loader from "../../../components/shared/Loader";

const transformData = (data) => {
  const result = {
    request_id: data[0].request_id,
    assignments: [],
  };

  data.forEach((item) => {
    const { id, assignedGrid, recived_quatity } = item;
    result.assignments.push({
      item_id: id,
      grid_id: assignedGrid.id,
      quantity: recived_quatity,
    });
  });

  return result;
};

const SixthStep = ({ details }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGrid, setSelectedGrid] = useState(null);
  const [updatedItems, setUpdatedItems] = useState(details?.items || []);
  const [assignedGrids, setAssignedGrids] = useState([]);
  const [assignedItems, setAssignedItems] = useState([]);
  const [assignGridFn] = useAssignGridMutation();
  const [toggleGridFn] = useToggleOccupiedGridMutation();

  const { data: gridData, isLoading } = useGetGridsByWarehouseIdQuery(
    details?.warehouse_id
  );
  const allGrids = gridData?.grids;

  const formik = useFormik({
    initialValues: {
      quantity: "",
    },
    onSubmit: (values, { resetForm }) => {
      if (selectedItem && selectedGrid) {
        const remainingQuantity =
          selectedItem?.request_quatity - parseInt(values.quantity);

        const updatedItem = {
          ...selectedItem,
          request_quatity: remainingQuantity,
          recived_quatity: parseInt(values.quantity),
          assignedGrid: selectedGrid,
        };
        setAssignedItems((prevItems) => [...prevItems, updatedItem]);
        const updatedItemsArray = updatedItems.map((item) =>
          item.id === selectedItem.id ? updatedItem : item
        );
        setUpdatedItems(updatedItemsArray);

        setAssignedGrids((prev) => [...prev, selectedGrid.id]);
        // Reset selection and form
        setSelectedItem(null);
        setSelectedGrid(null);
        resetForm();
      }
    },
    validate: (values) => {
      const errors = {};
      if (!values.quantity) {
        errors.quantity = "Quantity is required";
      } else if (
        parseInt(values.quantity) <= 0 ||
        parseInt(values.quantity) > selectedItem?.request_quatity
      ) {
        errors.quantity = "Invalid quantity";
      }
      return errors;
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  const handleToggleOccupied = async (isOccupied, selectedGrid) => {
    const toastId = toast.loading("Grid creating please wait...");
    try {
      const res = await toggleGridFn(selectedGrid?.id).unwrap();
      toast.success(res.message, {
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

  const handleSubmit = async () => {
    const data = transformData(assignedItems);
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        // text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#158E72",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      });
      if (result.isConfirmed) {
        const res = await assignGridFn(data).unwrap();
        toast.success(res.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      console.log("error:", error);
      toast.error(getFirstErrorMessage(error), {
        duration: 2000,
      });
    }
  };

  return (
    <div>
      <div className="p-5 grid grid-cols-3 gap-5">
        {/* Items Section */}
        <div className="col-span-2 h-full space-y-4">
          {updatedItems?.map((item) => (
            <div key={item?.id} className="border p-4 rounded-md">
              <p>Name: {item?.name}</p>
              <p>Type: {item?.type}</p>
              <p>Available requested quantity: {item?.request_quatity}</p>
              <button
                className={`px-4 py-2 bg-blue-500 text-white rounded mt-2 ${
                  selectedItem?.id === item.id ? "bg-green-500" : ""
                }`}
                onClick={() => setSelectedItem(item)}
                disabled={item?.request_quatity === 0}
              >
                Select Item
              </button>
            </div>
          ))}
        </div>

        {/* Grid Section */}
        <div className="space-y-5 col-span-1">
          {/* Assign Grid Form */}
          <p className="font-semibold">Choice grid</p>
          <div className="grid grid-cols-2 gap-2">
            {allGrids?.map((grid) => {
              const isAssigned = assignedGrids.includes(grid?.id);

              return (
                <Radio
                  key={grid?.id}
                  name="gridId"
                  id={grid?.id}
                  label={
                    <p className={grid?.is_occupied == "1" && "text-red-400"}>
                      {grid?.grid_code}
                    </p>
                  }
                  onChange={() => setSelectedGrid(grid)}
                  checked={selectedGrid?.id === grid.id}
                  disabled={isAssigned} // Disable if grid is assigned
                  className={
                    isAssigned
                      ? "opacity-50 cursor-not-allowed text-red-400"
                      : ""
                  }
                />
              );
            })}
          </div>

          {/* Is Occupied Switch */}
          {selectedGrid && (
            <div className="flex items-center space-x-4">
              <p className="font-semibold">
                Is {selectedGrid?.grid_code} Occupied?
              </p>
              <Switch
                id={selectedGrid.grid_code}
                name={selectedGrid.grid_code}
                crossOrigin=""
                checked={selectedGrid?.is_occupied == "1" || false}
                onChange={(e) =>
                  handleToggleOccupied(e.target.checked, selectedGrid)
                }
              />
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="quantity" className="font-semibold">
                Enter Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                className="outline-gray-200 border border-gray-400 focus-visible:outline-gray-300 w-full px-2 py-1"
                value={formik.values.quantity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!selectedGrid}
              />
              {formik.touched.quantity && formik.errors.quantity && (
                <p className="text-red-500 text-sm">{formik.errors.quantity}</p>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={!selectedGrid || !formik.values.quantity}
            >
              Assign Grid
            </button>
          </form>
        </div>
      </div>
      {assignedItems?.length > 0 && (
        <div>
          <p className="font-bold"> Assigned Grids and Items</p>
          <div className="grid grid-cols-3 gap-5 my-5">
            {assignedItems?.map((item) => (
              <div key={item?.id} className="border p-4 rounded-md mb-2">
                <p>Item Name: {item?.name}</p>
                <p>Received Quantity: {item?.recived_quatity}</p>
                <p>Grid Code: {item?.assignedGrid?.grid_code}</p>
                <p>Grid ID: {item?.assignedGrid?.id}</p>
              </div>
            ))}
          </div>
          <CustomButton onClick={() => handleSubmit()} label="Assign grids" />
        </div>
      )}
    </div>
  );
};

export default SixthStep;
