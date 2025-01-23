import { useState } from "react";
import CustomTable from "../../components/ui/CustomTable";
import { useGetAllWarehouseQuery } from "../../redux/features/warehouse";
import statusMeaning from "../../utils/statusMeaning.utils";
import CreateWarehouse from "./components/CreateWarehouse";
const tableHead = [
  "Name",
  "Location",
  "Price per Day",
  "Size",
  "Total Grids",
  "Status",
  "Action",
];

const Warehouse = () => {
  const { data } = useGetAllWarehouseQuery();
  const [details, setDetails] = useState({});
  //   const [isDetailsModalOpen, setDetailsModalOpen]=useState(false);
  return (
    <div className="p-5">
      <div className="flex justify-end mb-5">
        <CreateWarehouse />
      </div>
      <CustomTable tableHead={tableHead}>
        {data?.data?.map((item) => (
          <tr key={item?.id}>
            <td className="px-5 py-3 border">{item?.name}</td>
            <td className="px-5 py-3 border">
              {item?.district}
              {item?.area}
            </td>
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
