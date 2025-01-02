import Loader from "../../../components/shared/Loader";
import CustomButton from "../../../components/ui/CustomButton";
import { useGetAssignedGridsByRequestItQuery } from "../../../redux/features/request";

const SeventhStep = ({ details }) => {
  const { data, isLoading } = useGetAssignedGridsByRequestItQuery(
    details?.order_request?.id
  );
  const userInfo = details?.order_request?.user;
  return (
    <section>
      <div className="grid grid-cols-3 gap-5 font-DMSans mb-5">
        <div className="col-span-2 p-4 rounded-md border space-y-5">
          <div>
            <p className="font-semibold mb-3">Items & Grid Assignment</p>
            {isLoading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {data?.data?.map((item) => (
                  <div key={item?.id} className="border rounded-md p-4">
                    <p>
                      Name:{" "}
                      <span className="font-medium capitalize">
                        {item?.item_name}
                      </span>
                    </p>
                    <p>
                      Type:{" "}
                      <span className="font-medium capitalize">
                        {item?.item_type}
                      </span>
                    </p>
                    <p>
                      Grid code:{" "}
                      <span className="font-medium">{item?.grid_code}</span>
                    </p>
                    <p>
                      Quantity:{" "}
                      <span className="font-medium">{item?.quantity}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold mb-3">Requirements</p>
            <div className="space-y-1">
              <p>Duration</p>
              <div className="font-medium font-DMSans flex items-center gap-2">
                <p>{details?.order_request?.start_date}</p> -
                <p>{details?.order_request?.end_date}</p>
              </div>
              <p>Size</p>
              <p className="font-medium font-DMSans">
                {details?.order_request?.size}
              </p>
              <p>Warehouse</p>
              <p className="font-medium font-DMSans">
                {details?.order_request?.warehouse_type?.type_name}
              </p>
              <p className="font-medium font-DMSans">
                {details?.order_request?.warehouse_type?.description}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-md border">
          <p className="font-semibold mb-3">User Details</p>
          <div className="space-y-1">
            <p>Customer</p>
            <p className="font-medium font-DMSans">{userInfo?.name}</p>
            <p>Phone</p>
            <p className="font-medium font-DMSans">{userInfo?.phone}</p>
            <p>Email</p>
            <p className="font-medium font-DMSans">{userInfo?.email}</p>
            <p>Address</p>
            <p className="font-medium font-DMSans">{userInfo?.address}</p>
            <p>Company</p>
            <p className="font-medium font-DMSans">{userInfo?.company_name}</p>
          </div>
        </div>
      </div>
      <CustomButton label="Place Order" />
    </section>
  );
};

export default SeventhStep;
