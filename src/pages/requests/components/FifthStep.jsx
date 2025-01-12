import { Form, Formik } from "formik";
import TabHeading from "../../../components/shared/TabHeading";
import FormikInput from "../../../components/formik/FormikInput";
import CustomButton from "../../../components/ui/CustomButton";
import { useAdvancePaymentMutation } from "../../../redux/features/payment";
import { useGetPaymentsByRequestIdQuery } from "../../../redux/features/request";
import statusMeaning from "../../../utils/statusMeaning.utils";
import Swal from "sweetalert2";
import { useGetWarehouseByIdQuery } from "../../../redux/features/warehouse";
import { useGetAssignedGridsByRequestItQuery } from "../../../redux/features/request";

const FifthStep = ({ setActiveTab, requestId, user, details }) => {
  const [advancePaymentFn] = useAdvancePaymentMutation();
  const { data: paymentsData } = useGetPaymentsByRequestIdQuery(requestId);
  const { data, isLoading } = useGetAssignedGridsByRequestItQuery(details?.id);
  const { data: warehouseData } = useGetWarehouseByIdQuery(
    details?.warehouse_id
  );
  const handleSubmit = async (values) => {
    const data = {
      amount: values?.amount,
      request_id: Number(requestId),
    };
    const formdata = new FormData();
    Object.keys(data).forEach((key) => {
      formdata.append(key, data[key]);
    });

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        // text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#158E72",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      });

      if (result.isConfirmed) {
        const res = await advancePaymentFn(formdata).unwrap();
        await Swal.fire({
          title: "Paid",
          text: res.message,
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      await Swal.fire({
        title: "Error!",
        text: error?.data?.message || "Something went wrong!",
        icon: "error",
      });
    }
  };

  const startDate = details?.start_date;
  const endDate = details?.end_date;

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
    return diffDays;
  };
  const duration =
    startDate && endDate ? calculateDuration(startDate, endDate) : 0;
  return (
    <div>
      <TabHeading
        title={"Payment"}
        subTitle={"Initial payment (20%) of the estimated sq ft usage"}
      />
      <p className="font-medium mb-8">
        Enter size required to generate initial bill
      </p>
      <div className="grid grid-cols-4 gap-4 my-5">
        {paymentsData?.data?.map((item) => (
          <div key={item?.id} className="border rounded-md p-4">
            <p>
              Id: <span className="font-medium">{item?.id}</span>
            </p>
            <p>
              Amount: <span className="font-medium">{item?.amount}</span>
            </p>
            <p>
              Status:{" "}
              <span className="font-medium">
                {statusMeaning("payment", item?.status)}
              </span>
            </p>
          </div>
        ))}
      </div>
      <div className="space-y-4 p-6 border rounded-lg shadow-lg bg-blue-50">
        <h3 className="font-medium text-lg text-green-1500">
          Billing Calculation
        </h3>

        {/* Total Grid Occupied */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-700">Total Grid Occupied</p>
            <p className="font-medium font-DMSans text-green-600">
              {data?.total_grids && data.total_grids > 0
                ? data.total_grids
                : "Add Items and Assign in Grids"}
            </p>
          </div>
        </div>

        {/* Total Size (sqft) */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-700">Total Size (sqft)</p>
            <p className="font-medium font-DMSans text-green-600">
              {data?.total_grids && data.total_grids > 0
                ? data.total_grids * 50
                : "Add Items and Assign in Grids"}
            </p>
          </div>
        </div>

        {/* Per Grid Price Per Day */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-700">
              Per Grid Price Per Day
            </p>
            <p className="font-medium font-DMSans text-green-600">
              {warehouseData?.warehouse?.grid_price_per_day
                ? warehouseData?.warehouse?.grid_price_per_day
                : "No Data"}
            </p>
          </div>
        </div>

        {/* Estimated Price Per Day */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-700">
              Estimated Price Per Day
            </p>
            <p className="font-medium font-DMSans text-green-600">
              {data?.total_grids && warehouseData?.warehouse?.grid_price_per_day
                ? data.total_grids *
                  warehouseData?.warehouse?.grid_price_per_day
                : "Add Items and Assign in Grids"}
            </p>
          </div>
        </div>

        {/* Requested Duration */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-700">Requested Duration</p>
            <p className="font-medium font-DMSans text-green-600 mt-2">
              {duration > 0
                ? `Duration: ${duration} days`
                : "Please Add a Duration"}
            </p>
          </div>
        </div>

        {/* Estimated Price Per Month */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-700">
              Estimated Price Per Month
            </p>
            <p className="font-medium font-DMSans text-green-600">
              {data?.total_grids && warehouseData?.warehouse?.grid_price_per_day
                ? data.total_grids *
                  warehouseData?.warehouse?.grid_price_per_day *
                  30
                : "No Grid Added Yet"}
            </p>
          </div>
        </div>

        {/* Estimated Price On Duration */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-700">
              Estimated Price On Duration
            </p>
            <p className="font-medium font-DMSans text-green-600">
              {data?.total_grids &&
              warehouseData?.warehouse?.grid_price_per_day &&
              duration > 0
                ? data.total_grids *
                  warehouseData?.warehouse?.grid_price_per_day *
                  duration
                : "No Data"}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-700">
              Advance Payment (20%) On Duration
            </p>
            <p className="font-medium font-DMSans text-green-600">
              {data?.total_grids &&
              warehouseData?.warehouse?.grid_price_per_day &&
              duration > 0
                ? data.total_grids *
                  warehouseData?.warehouse?.grid_price_per_day *
                  duration *
                  0.2
                : "No Data"}
            </p>
          </div>
        </div>
      </div>
      <Formik
        initialValues={{
          email: user?.email,
          amount: "",
        }}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ dirty }) => {
          return (
            <Form className="font-dmSans">
              <div className="grid grid-cols-2 gap-5">
                <FormikInput label="Size Required" name="size" type="number" />
                <FormikInput
                  label="Initial payment"
                  name="amount"
                  type="number"
                />
                <FormikInput label="Email" name="email" readonly />
              </div>
              <p>A payment link will be sent to this email</p>
              {dirty && (
                <CustomButton className="mt-10" type="submit" label="Send" />
              )}
            </Form>
          );
        }}
      </Formik>
      <CustomButton
        className="mt-10"
        type="button"
        label="Continue"
        onClick={() => setActiveTab("6thStep")}
      />
    </div>
  );
};

export default FifthStep;
