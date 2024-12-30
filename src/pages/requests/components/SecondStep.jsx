/* eslint-disable react/prop-types */
import { Button } from "@material-tailwind/react";
import CustomButton from "../../../components/ui/CustomButton";
import TabHeading from "./TabHeading";
import FormikInput from "../../../components/formik/FormikInput";
import { FieldArray, Form, Formik } from "formik";
import FormikDate from "../../../components/formik/FormikDate";
import WarehouseTypes from "../../../components/formik/WarehouseTypes";
import {
  useAddMultipleItemsMutation,
  useUpdateItemMutation,
} from "../../../redux/features/request";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";
const SecondStep = ({ details }) => {
  const [addItemFn] = useAddMultipleItemsMutation();
  const [updateItemFn] = useUpdateItemMutation();
  const initialValues = {
    items: details?.items?.map((item) => ({
      item_name: item.name || "",
      quantity: item.request_quatity || 0,
      type: item.type || "box",
      id: item?.id || "",
    })) || [{ item_name: "", quantity: "", type: "box" }],
    start_date: details?.start_date || "",
    end_date: details?.end_date || "",
    size: details?.size || "",
    warehouseType_id: String(details?.warehouseType_id) || "",
  };
  const handleAddItems = async (values) => {
    const toastId = toast.loading("Items adding please wait...");
    const items = values.items.map((item) => ({
      name: item.item_name,
      request_quatity: item.quantity,
      type: "box",
      request_id: details?.id,
      user_id: details?.user_id,
    }));
    try {
      const res = await addItemFn({ items }).unwrap();
      toast.success(res.message, {
        id: toastId,
        duration: 2000,
      });
      console.log(res);
    } catch (error) {
      console.log("error:", error);
      toast.error(getFirstErrorMessage(error), {
        id: toastId,
        duration: 2000,
      });
    }
  };
  const handleUpdateItem = async (values) => {
    const toastId = toast.loading("Items updating please wait...");
    const data = {
      request_quatity: values?.quantity,
    };
    try {
      const res = await updateItemFn({
        itemInfo: data,
        id: values?.id,
      }).unwrap();
      toast.success(res.message, {
        id: toastId,
        duration: 2000,
      });
      console.log(res);
    } catch (error) {
      console.log("error:", error);
      toast.error(getFirstErrorMessage(error), {
        id: toastId,
        duration: 2000,
      });
    }
  };
  return (
    <div className="p-5">
      <TabHeading
        title="Warehouse Details"
        subTitle="Add items or update items after receiving. Items added here can only be assigned"
      />
      <div>
        <Formik initialValues={{}} onSubmit={null}>
          {({ dirty }) => {
            return (
              <Form className="space-y-6">
                <FormikInput name="size" label="Size" />
                <WarehouseTypes />
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
                    label="Continue"
                    type="submit"
                    size="lg"
                    className="mt-10"
                  />
                )}
              </Form>
            );
          }}
        </Formik>
        <Formik initialValues={initialValues} onSubmit={handleAddItems}>
          {({ values, dirty }) => {
            return (
              <Form className="space-y-6 mt-10">
                <TabHeading
                  title="Add Items"
                  subTitle="Add items or update items after receiving. Items added here can only be assigned"
                />
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
                              className=""
                            />

                            {/* Remove Button */}
                            {index >= details?.items?.length && (
                              <Button
                                size="sm"
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:underline text-sm border border-red-500 w-[150px] bg-white shadow-none hover:shadow-none capitalize"
                              >
                                Remove
                              </Button>
                            )}
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => handleUpdateItem(item)}
                              className="text-red-500 hover:underline text-sm border border-red-500 w-[150px] bg-white shadow-none hover:shadow-none capitalize"
                            >
                              Update
                            </Button>
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
                {/* Submit Button */}
                {dirty && (
                  <CustomButton
                    label="Add"
                    type="submit"
                    size="lg"
                    className="mt-10"
                  />
                )}
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default SecondStep;
