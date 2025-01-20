import { Form, Formik } from "formik";
import TabHeading from "../../../components/shared/TabHeading";
import FormikDate from "../../../components/formik/FormikDate";
import CustomButton from "../../../components/ui/CustomButton";
import { useUpdateDurationMutation } from "../../../redux/features/request";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";
import { useState } from "react";

const ThirdStep = ({ details, setActiveTab }) => {
  const [updateDurationFn] = useUpdateDurationMutation();
  const [isDirty, setIsDirty] = useState(false);
  const initialValues = {
    start_date: details?.start_date || "",
    end_date: details?.end_date || "",
  };
  const handleUpdateDuration = async (values) => {
    const toastId = toast.loading("Duration updating please wait...");
    try {
      const res = await updateDurationFn({
        durationInfo: values,
        id: details?.id,
      }).unwrap();
      console.log(res);
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
      <Formik
        initialValues={initialValues}
        onSubmit={handleUpdateDuration}
        enableReinitialize
      >
        {({ dirty }) => {
          if (dirty) {
            setIsDirty(true);
          } else {
            setIsDirty(false);
          }
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
      {!isDirty && (
        <CustomButton
          onClick={() => setActiveTab("4thStep")}
          label="Continue"
          type="button"
          size="lg"
          className="mt-10"
        />
      )}
    </div>
  );
};

export default ThirdStep;
