import { toast } from "sonner";
import FormikDropdown from "../../../components/formik/FormikDropdown";
import FormikForm from "../../../components/formik/FormikForm";
import CustomButton from "../../../components/ui/CustomButton";
import CustomModal from "../../../components/ui/CustomModal";
import { orderStatus } from "../../../constants";
import { getFirstErrorMessage } from "../../../utils/error.utils";
import { useUpdateOrderStatusMutation } from "../../../redux/features/order";

const UpdateOrderStatus = ({ open, setOpen, details }) => {
  const [updateOrderFn] = useUpdateOrderStatusMutation();
  const handleUpdateStatus = async (values) => {
    setOpen(false);
    const toastId = toast.loading("Order status updating please wait!");
    try {
      const res = await updateOrderFn({
        orderInfo: {
          status: values?.status,
        },
        id: details?.order_id,
      });
      console.log({ res });
      toast.success(res?.data?.message, {
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
    <CustomModal title={"Update Order Status"} open={open} setOpen={setOpen}>
      <FormikForm
        onSubmit={handleUpdateStatus}
        initialValues={{ status: details?.status }}
      >
        <FormikDropdown options={orderStatus} name="status" label={"Status"} />
        <div className="flex items-center mt-5 gap-5">
          <CustomButton
            variant="outlined"
            className={"border-red-400 text-red-400"}
            label="Cancel"
            onClick={() => setOpen(false)}
            type="button"
          />
          <CustomButton label="Update" type="submit" />
        </div>
      </FormikForm>
    </CustomModal>
  );
};

export default UpdateOrderStatus;
