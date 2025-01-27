/* eslint-disable react/prop-types */
import { Form, Formik } from "formik";
import TabHeading from "../../../components/shared/TabHeading";
import FormikInput from "../../../components/formik/FormikInput";
import FormikDropdown from "../../../components/formik/FormikDropdown";
import { transformArrayOfStringsIntoLabelAndValueArray } from "../../../utils";
import { industryTypes } from "../../../constants";
import CustomButton from "../../../components/ui/CustomButton";
import { useUpdateClientMutation } from "../../../redux/features/client";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";

const FirstStep = ({ setActiveTab, user }) => {
  const initialValues = {
    name: user?.name,
    company_name: user?.company_name,
    phone: user?.phone,
    email: user?.email,
    industry_type: user?.industry_type,
    address: user?.address,
  };
  const [updateClientFn] = useUpdateClientMutation();
  const handleSubmit = async (values) => {
    const toastId = toast.loading("User updating please wait...");
    const data = {
      name: values?.name,
      company_name: values?.company_name,
      phone: values?.phone,
      email: values?.email,
      industry_type: values?.industry_type,
      address: values?.address,
    };
    try {
      const res = await updateClientFn({
        userInfo: data,
        id: user?.id,
      }).unwrap();
      toast.success(res.message, {
        id: toastId,
        duration: 2000,
      });
      refetch();
    } catch (error) {
      console.log("error:", error);
      toast.error(getFirstErrorMessage(error), {
        id: toastId,
        duration: 2000,
      });
    }
  };
  return (
    <div className="w-full p-5">
      <TabHeading
        title="Details"
        subTitle="Enter user details and select warehouse"
      />
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ dirty }) => {
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
              </div>
              {dirty && (
                <CustomButton className="mt-10" type="submit" label="Save" />
              )}
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
