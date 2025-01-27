import { useGetGridsByWarehouseIdQuery } from "../../../redux/features/grid"; // Assuming you have an API for grids

const WarehouseGrid = ({id}) => {
  // Fetch all grid data
  const {
    data: grids,
    isLoading: gridLoading,
    error: gridError,
  } = useGetGridsByWarehouseIdQuery(id);

  // Function to determine grid color based on occupancy
  const getGridColor = (isOccupied) => {
    return isOccupied === "1" ? "bg-red-500" : "bg-green-500"; // Red if occupied, green if not
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-semibold mb-4">Warehouse Grids</h2>

      {gridLoading ? (
        <p>Loading grid data...</p>
      ) : gridError ? (
        <p>Error fetching grid data: {gridError.message}</p>
      ) : grids?.data?.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {grids.data.map((grid) => (
            <div key={grid.id} className="border p-4 text-center">
              <div className="font-semibold">{grid.grid_code}</div>
              <div className="text-sm">
                <p>
                  Status:{" "}
                  {grid.is_occupied === "1" ? "Occupied" : "Available"}
                </p>
                <p>Rack: {grid.has_rack === "1" ? "Yes" : "No"}</p>
              </div>
              {/* Display grid color */}
              <div
                className={`mt-2 p-2 rounded ${getGridColor(
                  grid.is_occupied
                )}`}
              >
                {grid.is_occupied === "1" ? "Occupied" : "Available"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No grids available.</p>
      )}
    </div>
  );
};

export default WarehouseGrid;
