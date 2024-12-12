import CustomTable from "../../components/ui/CustomTable";
import { useGetAllRequestQuery } from "../../redux/features/request";
import { format, parseISO } from "date-fns";
import { getOrderStatus } from "../../utils/statusMeaning";

const tableHead = ["Date", "User", "Items", "Quantity", "Status"];

const Requests = () => {
  const { data } = useGetAllRequestQuery();
  console.log({ data });
  return (
    <div className="">
      <div className="p-5">
        <h3 className="text-xl font-semibold">
          Requests <span className="font-bold">{data?.data?.length}</span>
        </h3>
      </div>
      <CustomTable tableHead={tableHead}>
        {data?.data?.map((item) => {
          return (
            <tr key={item?.id}>
              <td className="px-5 py-3 border">
                {format(parseISO(item?.created_at), "dd-MMM',' hh:mm a")}
              </td>
              <td className="px-5 py-3 border">{item?.user?.name}</td>
              <td className="px-5 py-3 border">
                {item?.items?.map((item) => (
                  <p key={item?.id}>{item?.name}:</p>
                ))}
              </td>
              <td className="px-5 py-3 border ">
                {item?.items?.map((item) => (
                  <p key={item?.id}>{item?.request_quatity}</p>
                ))}
              </td>
              <td className="px-5 py-3 border">
                {getOrderStatus(item?.status)}
              </td>
            </tr>
          );
        })}
      </CustomTable>
    </div>
  );
};

export default Requests;
