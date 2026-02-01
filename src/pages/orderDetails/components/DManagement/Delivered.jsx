import Loader from "../../../../components/shared/Loader";
import CustomTable from "../../../../components/ui/CustomTable";

import statusMeaning from "../../../../utils/statusMeaning.utils";

const tableHead = [
  "Item Name",
  "Item Quantity",
  "Grid Code",
  "Quantity",
  "Status",
  "Actions",
];

const Delivered = ({ details }) => {
  const { data, isLoading } = useGetRequestedDeliveryItemQuery(
    details?.order?.id
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <CustomTable tableHead={tableHead}>
        {data?.data?.map((item) => (
          <tr key={item?.id}>
            <td className="px-5 py-3 border">{item?.item_name}</td>
            <td className="px-5 py-3 border">{item?.quantity}</td>
            <td className="px-5 py-3 border">{item?.grid_code}</td>
            <td className="px-5 py-3 border">{item?.quantity}</td>
            <td className="px-5 py-3 border">
              {statusMeaning("deliver", item?.status)}
            </td>
            <td className="px-5 py-3 border">
              <p>No action</p>
            </td>
          </tr>
        ))}
      </CustomTable>
    </div>
  );
};

export default Delivered;
