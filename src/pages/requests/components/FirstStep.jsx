/* eslint-disable react/prop-types */
import { Formik } from "formik";
import TabHeading from "./TabHeading";
import { Form } from "react-router-dom";
import FormikInput from "../../../components/formik/FormikInput";
import FormikDropdown from "../../../components/formik/FormikDropdown";
import { transformArrayOfStringsIntoLabelAndValueArray } from "../../../utils";
import { industryTypes } from "../../../constants";
import CustomButton from "../../../components/ui/CustomButton";
// import { useGetWarehouseTypesQuery } from "../../../redux/features/warehouse";

const FirstStep = ({ setActiveTab, user }) => {
  // console.log("user", user);
  // const { data } = useGetWarehouseTypesQuery();
  // const warehouseTypes = data?.warehouse_types?.map((item) => ({
  //   label: item?.type_name,
  //   value: String(item?.id),
  // }));
  const initialValues = {
    name: user?.name,
    company_name: user?.company_name,
    phone: user?.phone,
    email: user?.email,
    industry_type: user?.industry_type,
    address: user?.address,
  };
  const handleSubmit = async (values) => {
    console.log(values);
  };
  return (
    <div className="w-full p-5">
      <TabHeading
        title="Details"
        subTitle="Enter user details and select warehouse"
      />
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {() => {
          return (
            <Form className="space-y-5 font-dmSans">
              <div className="grid grid-cols-2 gap-10">
                <FormikInput name="name" label={"User name"} />
                <FormikInput name="company_name" label={"Business name"} />
                <FormikInput name="phone" label={"Phone number"} />
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
