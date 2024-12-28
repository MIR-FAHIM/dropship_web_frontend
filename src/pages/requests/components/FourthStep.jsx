import { Form, Formik } from "formik";
import TabHeading from "./TabHeading";
import { LuCirclePlus } from "react-icons/lu";

const FourthStep = () => {
  const handleSubmit = (values) => {
    console.log(values);
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
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default FourthStep;
