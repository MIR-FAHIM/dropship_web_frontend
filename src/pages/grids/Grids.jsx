import { useState, useEffect } from "react";
import { useGetAllWarehouseQuery } from "../../redux/features/warehouse"; // Assuming you have a warehouse API
import { useGetAllGridQuery } from "../../redux/features/grid"; // Assuming you have an API for grids
import CreateGrid from "./components/CreateGrid";

const GridStatusPage = () => {
  const {
    data: warehouses,
    isLoading: warehouseLoading,
    error: warehouseError,
  } = useGetAllWarehouseQuery();
  const [selectedWarehouse, setSelectedWarehouse] = useState(null); // Store selected warehouse
  const [gridData, setGridData] = useState([]);

  console.log("warehouses", warehouses);

  // Fetch all grids initially
  const {
    data: grids,
    isLoading: gridLoading,
    error: gridError,
  } = useGetAllGridQuery(); // Fetch all grids

  useEffect(() => {
    // Ensure the warehouse data and grids data are available
    if (grids?.grids && selectedWarehouse) {
      // Filter the grids for the selected warehouse by matching warehouse_id
      const filteredGrids = grids.grids.filter(
        (grid) => grid.warehouse_id === parseInt(selectedWarehouse)
      );
      setGridData(filteredGrids); // Update grid data when it is fetched and filtered
    }
  }, [grids, selectedWarehouse]); // Re-run when either grids or selected warehouse changes

  const handleWarehouseChange = (e) => {
    const warehouseId = e.target.value;
    setSelectedWarehouse(warehouseId); // Update selected warehouse
  };

  // Function to render grid color based on occupancy
  const getGridColor = (isOccupied) => {
    return isOccupied === "1" ? "bg-red-500" : "bg-green-500"; // Red if occupied, green if not
  };

  if (warehouseLoading) {
    return <p>Loading warehouses...</p>;
  }

  if (warehouseError) {
    return <p>Error fetching warehouses: {warehouseError.message}</p>;
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold mb-4">Grid Status</h2>
        <CreateGrid />
      </div>

      {/* Warehouse selection dropdown */}
      <div className="mb-4">
        <label className="font-semibold">Select Warehouse: </label>
        <select
          onChange={handleWarehouseChange}
          className="border p-2"
          disabled={warehouseLoading}
          value={selectedWarehouse || ""}
        >
          <option value="">Select a warehouse</option>
          {warehouses?.warehouses?.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse?.name + "-" + warehouse?.size}
            </option>
          ))}
        </select>
      </div>

      {/* Show grid status when warehouse is selected */}
      {selectedWarehouse && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Grids in Warehouse</h3>
          <div className="grid grid-cols-4 gap-4">
            {gridLoading ? (
              <p>Loading grid data...</p>
            ) : gridError ? (
              <p>Error fetching grid data: {gridError.message}</p>
            ) : // If no grids, show a message
            gridData.length > 0 ? (
              gridData.map((grid) => (
                <div key={grid.id} className="border p-4 text-center">
                  <div className="font-semibold">{grid.grid_code}</div>
                  <div className="text-sm">
                    <p>
                      Status:{" "}
                      {grid.is_occupied === "1" ? "Occupied" : "Available"}
                    </p>
                    <p>Rack: {grid.has_rack === "1" ? "Yes" : "No"}</p>
                  </div>
                  {/* Grid color based on occupancy */}
                  <div
                    className={`mt-2 p-2 rounded ${getGridColor(
                      grid.is_occupied
                    )}`}
                  >
                    {grid.is_occupied === "1" ? "Occupied" : "Available"}
                  </div>
                </div>
              ))
            ) : (
              <p>No grids available for this warehouse.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GridStatusPage;
