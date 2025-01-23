import TabHeading from "../../../components/shared/TabHeading";

const SixthStep = ({ details }) => {
  return (
    <div>
      <TabHeading
        title={"Grid and Item Assignment Overview"}
        subTitle={
          "Review the assigned grids and item details, including quantities, types, and grid codes."
        }
      />
      <div className="font-plex grid grid-cols-4 gap-4">
        {details?.map((detail, index) => (
          <div key={index} className="border p-4 rounded-md">
            <div className="flex items-center">
              <h3 className="font-medium">Grid Code:</h3>
              <p className="font-semibold ms-1">
                {detail.grid?.grid_code || "N/A"}
              </p>
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
              <h3 className="font-medium">Quantity:</h3>
              <p className="font-semibold ms-1">{detail.quantity || "N/A"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SixthStep;
