import { useState } from "react";
import CustomModal from "../../../components/ui/CustomModal";
import { Form, Formik } from "formik";
import FormikInput from "../../../components/formik/FormikInput";
import FileUpload from "../../../components/formik/FileUpload";
import {
  useCreateWarehouseMutation,
  useGetWarehouseTypesQuery,
} from "../../../redux/features/warehouse";
import FormikDropdown from "../../../components/formik/FormikDropdown";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";
import CustomButton from "../../../components/ui/CustomButton";

const initialValues = {
  location: "",
  
  latitude: "",
  longitude: "",
  size: "",
  contact_person: "",
  contact_phone: "",
  owner_name: "",
  owner_phone: "",
  owner_email: "",
  total_grids: "",
  grid_price_per_day: "",
  district: "",
  area: "",
  warehouse_image: null,
  warehouse_type_id: "",
};

const CreateWarehouse = () => {
  const { data } = useGetWarehouseTypesQuery();
  const [CreateWarehouseFunc] = useCreateWarehouseMutation();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const warehouseOptions = data?.warehouse_types?.map((item) => ({
    label: item?.type_name,
    value: String(item?.id),
  }));

  const handleCreateWarehouse = async (values) => {
    setCreateModalOpen(false);
    const toastId = toast.loading("Creating warehouse...");
    // Prepare FormData
    const formData = new FormData();
    formData.append("location", values.location);
    formData.append("latitude", values.latitude);
    formData.append("longitude", values.longitude);
    formData.append("size", values.size);
    formData.append("contact_person", values.contact_person);
    formData.append("contact_phone", values.contact_phone);
    formData.append("owner_name", values.owner_name);
    formData.append("owner_phone", values.owner_phone);
    formData.append("owner_email", values.owner_email);
    formData.append("total_grids", values.total_grids);
    formData.append("grid_price_per_day", values.grid_price_per_day);
    formData.append("district", values.district);
    formData.append("area", values.area);
    formData.append("warehouse_type_id", values.warehouse_type_id);
    formData.append("warehouse_image", values.warehouse_image);

    try {
      const response = await CreateWarehouseFunc(formData).unwrap();
      console.log({ response });
      toast.success("Warehouse created successfully!", {
        id: toastId,
        duration: 2000,
      });
    } catch (error) {
      console.log(getFirstErrorMessage(error));
      toast.error(getFirstErrorMessage(error), {
        id: toastId,
        duration: 2000,
      });
    }
  };

  return (
    <div>
      <CustomButton
        onClick={() => setCreateModalOpen(true)}
        label="Create warehouse"
      />
      <CustomModal open={isCreateModalOpen} setOpen={setCreateModalOpen}>
        <Formik initialValues={initialValues} onSubmit={handleCreateWarehouse}>
          {({ setFieldValue }) => {
            return (
              <Form className="space-y-5 font-dmSans overflow-y-scroll max-h-[90vh] py-2">
                <FormikInput name="location" label="Location" />
                <FormikInput name="latitude" label="Latitude" />
                <FormikInput name="longitude" label="Longitude" />
                <FormikInput name="size" label="Size" />
                <FormikInput name="contact_person" label="Contact Person" />
                <FormikInput name="contact_phone" label="Contact Phone" />
                <FormikInput name="owner_name" label="Owner Name" />
                <FormikInput name="owner_phone" label="Owner Phone" />
                <FormikInput name="owner_email" label="Owner Email" />
                <FormikInput name="total_grids" label="Total Grids" />
                <FormikInput
                  name="grid_price_per_day"
                  label="Grid Price Per Day"
                />
                <FormikInput name="district" label="District" />
                <FormikInput name="area" label="Area" />
                <FileUpload
                  name="warehouse_image"
                  placeholder="Upload a warehouse image"
                  setFieldValue={setFieldValue}
                />
                <FormikDropdown
                  name="warehouse_type_id"
                  options={warehouseOptions}
                  label="Select Warehouse Type"
                />
                <CustomButton type="submit" label="Create" />
              </Form>
            );
          }}
        </Formik>
      </CustomModal>
    </div>
  );
};

export default CreateWarehouse;
