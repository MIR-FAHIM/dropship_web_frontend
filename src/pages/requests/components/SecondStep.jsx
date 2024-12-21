import { Button } from "@material-tailwind/react";
import CustomButton from "../../../components/ui/CustomButton";
import TabHeading from "./TabHeading";
import FormikInput from "../../../components/formik/FormikInput";
import { FieldArray, Form, Formik } from "formik";
import FormikDate from "../../../components/formik/FormikDate";
import WarehouseTypes from "../../../components/formik/WarehouseTypes";
const SecondStep = () => {
  const initialValues = {
    items: [{ item_name: "", quantity: "" }],
    start_date: "25-12-2024",
    end_date: "30-12-2024",
    size: "",
    warehouseType_id: "",
  };
  const handleSubmit = (values) => {
    const items = values.items.map((item) => ({
      name: item.item_name,
      request_quatity: item.quantity,
      type: "box",
    }));
    console.log(items);
  };
  return (
    <div>
      <TabHeading
        title="Add Items"
        subTitle="Add items or update items after receiving. Items added here can only be assigned"
      />
      <div>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values }) => {
            console.log(values);
            return (
              <Form className="space-y-6">
                <FormikInput name="size" label="Size" />
                <WarehouseTypes />
                <FieldArray name="items">
                  {(fieldArrayProps) => {
                    const { push, remove } = fieldArrayProps;
                    const { items } = values;

                    return (
                      <div className="space-y-5">
                        {items.map((item, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-3 gap-5 items-center"
                          >
                            {/* Item Name Field */}
                            <FormikInput
                              name={`items[${index}].item_name`}
                              label="Item Name"
                              className=""
                            />

                            {/* Quantity Field */}
                            <FormikInput
                              name={`items[${index}].quantity`}
                              label="Quantity"
                              type="number"
                              className=""
                            />

                            <FormikInput
                              name={`items[${index}].type`}
                              label="Type"
                              type="number"
                              className=""
                            />

                            {/* Remove Button */}
                            {index > 0 && (
                              <Button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:underline text-sm border border-red-500 w-[150px] bg-white shadow-none hover:shadow-none capitalize"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}

                        {/* Add New Item Button */}
                        <button
                          type="button"
                          onClick={() => push({ item_name: "", quantity: "" })}
                          size="lg"
                          className="flex items-center gap-2 text-primary p-2 mt-10"
                        >
                          + Add New Item
                        </button>
                      </div>
                    );
                  }}
                </FieldArray>

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
                <CustomButton
                  label="Continue"
                  type="submit"
                  size="lg"
                  className="mt-10"
                />
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default SecondStep;
