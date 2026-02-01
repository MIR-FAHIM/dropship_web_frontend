import { useState } from "react";
import CustomModal from "../../../components/ui/CustomModal";
import { useGetWarehouseTypesQuery } from "../../../redux/features/warehouse";
import FormikForm from "../../../components/formik/FormikForm";
import FormikDropdown from "../../../components/formik/FormikDropdown";
import FormikInput from "../../../components/formik/FormikInput";
import FormikSwitch from "../../../components/formik/FormikSwitch";
import CustomButton from "../../../components/ui/CustomButton";
import { useCreateGridMutation } from "../../../redux/features/grid";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";

const initialValues = {
  warehouse_id: "",
  grid_code: "",
  size: "",
  has_rack: "",
  rack_multiplier: "",
  type: "",
};

const CreateGrid = () => {
  // state
  const [isCreateGridModalOpen, setCreateGridModalOpen] = useState(false);
  //   api
  const { data } = useGetWarehouseTypesQuery();
  const [createGridFunc] = useCreateGridMutation();
  //   options creating
  const warehouseOptions = data?.warehouse_types?.map((item) => ({
    label: item?.type_name,
    value: String(item?.id),
  }));
  //   code generating
  const fourDigitCode = Math.floor(1000 + Math.random() * 9000);

  const handleSubmit = async (values) => {
    setCreateGridModalOpen(false);
    const toastId = toast.loading("Grid creating please wait...");
    const data = {
      warehouse_id: values?.warehouse_id,
      size: values?.size,
      has_rack: values?.has_rack === true ? 1 : 0,
      rack_multiplier: values?.rack_multiplier === true ? 1 : 0,
      type: values?.type,
      grid_code: fourDigitCode,
    };
    const formdata = new FormData();
    Object.keys(data).forEach((key) => {
      formdata.append(key, data[key]);
    });
    try {
      const res = await createGridFunc(formdata).unwrap();
      toast.error(res.message, {
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
      <CustomButton
        onClick={() => setCreateGridModalOpen(true)}
        label="Create Grid"
      />
      <CustomModal
        open={isCreateGridModalOpen}
        setOpen={setCreateGridModalOpen}
        title={"Create grid"}
      >
        <FormikForm onSubmit={handleSubmit} initialValues={initialValues}>
          <FormikDropdown
            options={warehouseOptions}
            name="warehouse_id"
            label="Warehouse"
          />
          <FormikInput name="size" label={"Size"} />
          <FormikSwitch name={"has_rack"} label={"Has rack"} />
          <FormikSwitch name={"rack_multiplier"} label={"Rack multiplier"} />
          <FormikInput name="type" label={"Type"} />
          <CustomButton type="submit" label="Create" />
        </FormikForm>
      </CustomModal>
    </div>
  );
};

export default CreateGrid;
