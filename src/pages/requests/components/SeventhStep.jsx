import { toast } from "sonner";
import Loader from "../../../components/shared/Loader";
import CustomButton from "../../../components/ui/CustomButton";
//import CustomButton from "../../../components/ui/CustomButton";
import { useGetWarehouseByIdQuery } from "../../../redux/features/warehouse";
import {
  useGetAssignedGridsByRequestItQuery,
  
  usePlaceOrderMutation,
} from "../../../redux/features/request";
import { getFirstErrorMessage } from "../../../utils/error.utils";
import FormikForm from "../../../components/formik/FormikForm";
import FormikInput from "../../../components/formik/FormikInput";

const SeventhStep = ({ details }) => {

  const { data: warehouseData, isWareLoading, error } = useGetWarehouseByIdQuery(details?.order_request?.warehouse_id);
  const { data, isLoading } = useGetAssignedGridsByRequestItQuery(
    details?.order_request?.id
  );
   

  const [placeOrderFn] = usePlaceOrderMutation();
  const userInfo = details?.order_request?.user;
  const handlePlaceOrder = async (values) => {
    const toastId = toast.loading("Payment creating please wait...");
    const data = {
      payment: values?.payment,
      request_id: Number(details?.order_request?.id),
    };
    const formdata = new FormData();
    Object.keys(data).forEach((key) => {
      formdata.append(key, data[key]);
    });
    try {
      const res = await placeOrderFn(formdata).unwrap();
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
  const startDate = details?.order_request?.start_date;
  const endDate = details?.order_request?.end_date;

  
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
    return diffDays;
  };
  const duration = startDate && endDate ? calculateDuration(startDate, endDate) : 0;
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

          <hr className="my-6 border-t border-gray-300" />

          <div className="space-y-4 p-6 border rounded-lg shadow-lg bg-blue-50">
  <h3 className="font-medium text-lg text-green-1500">Billing Calculation</h3>
  
  <div className="space-y-1">
    <p className="font-semibold text-gray-700">Total Grid Occupied</p>
    <p className="font-medium font-DMSans text-green-600">{data?.total_grids}</p>
  </div>
  <div className="space-y-1">
    <p className="font-semibold text-gray-700">Total Size (sqft)</p>
    <p className="font-medium font-DMSans text-green-600">{data?.total_grids * 50}</p>
  </div>
  <div className="space-y-1">
    <p className="font-semibold text-gray-700">Per Grid Price Per Day</p>
    <p className="font-medium font-DMSans text-green-600">
    {warehouseData?.warehouse?.grid_price_per_day}
    </p>
  </div>
  <div className="space-y-1">
    <p className="font-semibold text-gray-700">Estimated Price Per Day</p>
    <p className="font-medium font-DMSans text-green-600">
      {data?.total_grids ? data.total_grids * warehouseData?.warehouse?.grid_price_per_day : "Calculating..."}
    </p>
  </div>
  
  <div className="space-y-1">
    <p className="font-semibold text-gray-700">Requested Duration</p>
    <p className="font-medium font-DMSans text-green-600 mt-2">
      Duration: {duration} days
    </p>
  </div>
  
  <div className="space-y-1">
    <p className="font-semibold text-gray-700">Estimated Price Per Month</p>
    <p className="font-medium font-DMSans text-green-600">
      {data?.total_grids ? data.total_grids * warehouseData?.warehouse?.grid_price_per_day * 30 : "Calculating..."}
    </p>
  </div>
  
  <div className="space-y-1">
    <p className="font-semibold text-gray-700">Estimated Price On Duration</p>
    <p className="font-medium font-DMSans text-green-600">
      {data?.total_grids ? data.total_grids * warehouseData?.warehouse?.grid_price_per_day * duration : "Calculating..."}
    </p>
  </div>
  
</div>

        </div>

       


      </div>
      <div>
        <FormikForm onSubmit={handlePlaceOrder} initialValues={{ payment: "" }}>
          <FormikInput
            type="number"
            name="payment"
            label={"Estimated payment"}
            required
          />
          <CustomButton type="submit" label="Place Order" />
        </FormikForm>
      </div>
    </section>
  );
};

export default SeventhStep;
