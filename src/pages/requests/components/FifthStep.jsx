import { Form, Formik } from "formik";
import TabHeading from "../../../components/shared/TabHeading";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";
import FormikInput from "../../../components/formik/FormikInput";
import CustomButton from "../../../components/ui/CustomButton";
import { useAdvancePaymentMutation } from "../../../redux/features/payment";
import { useGetPaymentsByRequestIdQuery } from "../../../redux/features/request";
import statusMeaning from "../../../utils/statusMeaning.utils";

const FifthStep = ({ setActiveTab, requestId, user }) => {
  const [advancePaymentFn] = useAdvancePaymentMutation();
  const { data: paymentsData, isLoading: isPaymentsDataLoading } =
    useGetPaymentsByRequestIdQuery(requestId);
  const handleSubmit = async (values) => {
    const toastId = toast.loading("Payment creating please wait...");
    const data = {
      amount: values?.amount,
      request_id: Number(requestId),
    };
    const formdata = new FormData();
    Object.keys(data).forEach((key) => {
      formdata.append(key, data[key]);
    });
    try {
      const res = await advancePaymentFn(formdata).unwrap();
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
