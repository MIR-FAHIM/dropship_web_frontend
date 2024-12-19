import { Formik } from "formik";
import TabHeading from "./TabHeading";
import { Form } from "react-router-dom";
import FormikInput from "../../../components/formik/FormikInput";
import FormikDropdown from "../../../components/formik/FormikDropdown";
import { transformArrayOfStringsIntoLabelAndValueArray } from "../../../utils";
import { industryTypes } from "../../../constants";
import CustomButton from "../../../components/ui/CustomButton";
// import { useGetWarehouseTypesQuery } from "../../../redux/features/warehouse";

const FirstStep = ({ setActiveTab }) => {
  // const { data } = useGetWarehouseTypesQuery();
  // const warehouseTypes = data?.warehouse_types?.map((item) => ({
  //   label: item?.type_name,
  //   value: String(item?.id),
  // }));
  const initialValues = {
    userName: "",
    businessName: "",
    sizeInSqFt: "",
    phoneNumber: "",
    email: "",
    industry_type: "Electronics & Appliances",
    warehouse: "",
    businessLocation: "",
  };
  const handleSubmit = async (values) => {
    console.log(values);
  };
  return (
    <div className="w-full">
      <TabHeading
        title="Details"
        subTitle="Enter user details and select warehouse"
      />
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {() => {
          return (
            <Form className="space-y-5 font-dmSans">
              <div className="grid grid-cols-2 gap-10">
                <FormikInput name="userName" label={"User name"} />
                <FormikInput name="businessName" label={"Business name"} />
                <FormikInput name="phoneNumber" label={"Phone number"} />
                <FormikInput name="email" label={"Email"} />
                <FormikDropdown
                  options={transformArrayOfStringsIntoLabelAndValueArray(
                    industryTypes
                  )}
                  name="industry_type"
                  label="Industry"
                />
                {/* <FormikDropdown
                  options={warehouseTypes}
                  name="warehouse"
                  label="Warehouse"
                /> */}
              </div>
            </Form>
          );
        }}
      </Formik>
      <CustomButton
        className="mt-10"
        type="button"
        label="Continue"
        onClick={() => setActiveTab("2ndStep")}
      />
    </div>
  );
};

export default FirstStep;
