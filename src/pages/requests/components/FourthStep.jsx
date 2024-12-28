import { Form, Formik } from "formik";
import TabHeading from "./TabHeading";
import { LuCirclePlus } from "react-icons/lu";
import { useUploadChallanMutation } from "../../../redux/features/request";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";
import CustomButton from "../../../components/ui/CustomButton";

const FourthStep = ({ requestId }) => {
  const [uploadChallanFn] = useUploadChallanMutation();
  const handleSubmit = async (values) => {
    const toastId = toast.loading("Challan updating...!");
    const data = {
      relatable_id: requestId,
      type: "challan request",
      file: values?.file,
    };
    const formdata = new FormData();
    Object.keys(data).forEach((key) => {
      formdata.append(key, data[key]);
    });
    try {
      const res = await uploadChallanFn(formdata).unwrap();
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
        title="Challan"
        subTitle="Uploaded challan will show up here. You can also add a challan given by the user"
      />
      <p className="font-medium font-DMSans">Upload your delivery challan</p>

      <Formik initialValues={{ file: "" }} onSubmit={handleSubmit}>
        {({ values, setFieldValue }) => {
          console.log(values);
          return (
            <Form className="space-y-5 font-dmSans">
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center gap-4 h-[250px] border border-border-color rounded-lg mt-5 cursor-pointer"
              >
                <LuCirclePlus className="text-xl" />
                <p>Drag and drop or click to choose files</p>
                <p className="font-semibold">Max file size: 5MB</p>
              </label>
              <div className="flex items-center">
                <button className="bg-primary-400 py-2 px-4 rounded-xl text-text-100 font-medium font-DMSans border border-border rounded-r-none">
                  Selected file:
                </button>
                <input
                  placeholder="Select a file"
                  type="text"
                  readOnly
                  value={values?.file?.name || ""}
                  className="py-2 ps-2 min-w-[300px] border border-border focus-visible:outline-gray-200"
                />
              </div>
              <input
                id="file"
                type="file"
                name="file"
                className="hidden"
                onChange={(event) =>
                  setFieldValue("file", event.target.files[0])
                }
              />
              <CustomButton className="mt-10" type="submit" label="Submit" />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default FourthStep;
