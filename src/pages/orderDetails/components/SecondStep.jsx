import TabHeading from "../../../components/shared/TabHeading";

const SecondStep = ({ details }) => {
  const { warehouse, warehouse_type, items, size } = details;

  return (
    <div>
      <TabHeading
        title={"Warehouse Details Overview"}
        subTitle={
          "Explore warehouse information, including location, type, contact details, and capacity."
        }
      />
      <div className="font-plex space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium">Warehouse Name</h3>
            <p>{warehouse?.name || "N/A"}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Warehouse Type</h3>
            <p>{warehouse_type?.type_name || "N/A"}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Warehouse Size</h3>
            <p>{size || "N/A"}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Items</h3>
          {items && items.length > 0 ? (
            <ul className="grid grid-cols-3 gap-4">
              {items.map((item) => (
                <li key={item.id} className="border p-4 rounded-md">
                  <div>
                    <h4 className="text-md font-medium">Item Name:</h4>
                    <p>{item.name}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium">Type:</h4>
                    <p>{item.type}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium">Requested Quantity:</h4>
                    <p>{item.request_quatity}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No items available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecondStep;
