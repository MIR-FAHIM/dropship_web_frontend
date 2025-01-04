import { Form, Formik } from "formik";
import TabHeading from "./TabHeading";
import FormikDate from "../../../components/formik/FormikDate";
import CustomButton from "../../../components/ui/CustomButton";

const ThirdStep = ({ details, setActiveTab }) => {
  const initialValues = {
    start_date: details?.start_date || "",
    end_date: details?.end_date || "",
  };
  return (
    <div>
      <Formik initialValues={initialValues} onSubmit={null}>
        {({ dirty }) => {
          return (
            <Form className="space-y-6">
              <div className="mt-10">
                <TabHeading
                  title={"Duration"}
                  subTitle={"Duration of storage as given by the user"}
                />
                <h3 className="font-medium font-plex mb-5">
                  Select start and end date
                </h3>
                <div className="grid grid-cols-2">
                  <FormikDate label="Start date" name="start_date" />
                  <FormikDate label="End date" name="end_date" />
                </div>
              </div>
              {/* Submit Button */}
              {dirty && (
                <CustomButton
                  label="Save"
                  type="submit"
                  size="lg"
                  className="mt-10"
                />
              )}
            </Form>
          );
        }}
      </Formik>
      <CustomButton
        onClick={() => setActiveTab("4thStep")}
        label="Continue"
        type="button"
        size="lg"
        className="mt-10"
      />
    </div>
  );
};

export default ThirdStep;
