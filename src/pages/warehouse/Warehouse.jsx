import { useState } from "react";
import CustomTable from "../../components/ui/CustomTable";
import { useGetAllWarehouseQuery } from "../../redux/features/warehouse";
import statusMeaning from "../../utils/statusMeaning.utils";
import CreateWarehouse from "./components/CreateWarehouse";
const tableHead = [
  "District",
  "Location",
  "Price per Day",
  "Size",
  "Total Grids",
  "Status",
  "Action",
];

const Warehouse = () => {
  const { data } = useGetAllWarehouseQuery();
  console.log(data);
  const [details, setDetails] = useState({});
  //   const [isDetailsModalOpen, setDetailsModalOpen]=useState(false);
  return (
    <div>
      <div>
        <CreateWarehouse />
      </div>
      <CustomTable tableHead={tableHead}>
        {data?.warehouses?.map((item) => (
          <tr key={item?.id}>
            <td className="px-5 py-3 border">{item?.district}</td>
            <td className="px-5 py-3 border">{item?.location}</td>
            <td className="px-5 py-3 border">{item?.grid_price_per_day}</td>
            <td className="px-5 py-3 border">{item?.size}</td>
            <td className="px-5 py-3 border">{item?.total_grids}</td>
            <td className="px-5 py-3 border">
              {statusMeaning("Warehouse", item?.status)}
            </td>
            <td className="px-5 py-3 border">
              <button
                onClick={() => {
                  setDetails(item);
                }}
              >
                Details
              </button>
            </td>
          </tr>
        ))}
      </CustomTable>
    </div>
  );
};

export default Warehouse;
