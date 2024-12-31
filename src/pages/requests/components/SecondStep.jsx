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
  useDeleteItemMutation,
  useUpdateItemMutation,
} from "../../../redux/features/request";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";
import { useState } from "react";
const SecondStep = ({ details }) => {
  const [addItemFn] = useAddMultipleItemsMutation();
  const [updateItemFn] = useUpdateItemMutation();
  const [deleteItemFn] = useDeleteItemMutation();
  const [itemQuantity, setItemQuantity] = useState({
    value: 0,
    index: 0,
  });
  const items = details?.items;
  const initialValues = {
    items: [{ item_name: "", quantity: "", type: "box" }],
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
      request_quatity: itemQuantity.value,
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
      setItemQuantity({
        value: 0,
        index: 0,
      });
    } catch (error) {
      console.log("error:", error);
      toast.error(getFirstErrorMessage(error), {
        id: toastId,
        duration: 2000,
      });
    }
  };
  const handleDeleteItem = async (id) => {
    const isAccepted = window.confirm("Are you sure?");
    if (!isAccepted) {
      return;
    }
    const toastId = toast.loading("Items deleting please wait...");

    try {
      const res = await deleteItemFn({
        id: id,
      }).unwrap();
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
        <Formik
          initialValues={initialValues}
          onSubmit={handleAddItems}
          enableReinitialize
        >
          {({ values, dirty }) => {
            return (
              <Form className="mt-10">
                <TabHeading
                  title="Add Items"
                  subTitle="Add items or update items after receiving. Items added here can only be assigned"
                />
                <div>
                  <h3 className="text-lg font-semibold">Added items:</h3>
                  <div className="space-y-3">
                    {items?.map((item, index) => {
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-5 font-semibold "
                        >
                          <p>{index + 1}/</p>
                          <p>
                            <span className="text-base font-normal me-1">
                              Name:
                            </span>
                            {item?.name}
                          </p>
                          <input
                            type="text"
                            className="outline-gray-200 border border-gray-400 focus-visible:outline-gray-300 w-20 px-1"
                            defaultValue={item?.request_quatity}
                            onChange={(e) =>
                              setItemQuantity({
                                value: e.target.value,
                                index: index,
                              })
                            }
                          />
                          <p>
                            <span className="text-base font-normal me-1">
                              Type:
                            </span>
                            {item?.type}
                          </p>
                          {itemQuantity.value > 0 &&
                            itemQuantity.index === index && (
                              <button
                                type="button"
                                onClick={() => handleUpdateItem(item)}
                              >
                                Update
                              </button>
                            )}
                          <button
                            type="button"
                            className="text-red-400"
                            onClick={() => handleDeleteItem(item?.id)}
                          >
                            Delete
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-lg font-bold mt-5">Add new items:</p>
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
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:underline text-sm border border-red-500 w-[150px] bg-white shadow-none hover:shadow-none capitalize"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}

                        {/* Add New Item Button */}
                        <button
                          type="button"
                          onClick={() => push({ item_name: "", quantity: "" })}
                          size="lg"
                          className="flex items-center gap-2 text-primary p-2 mt-5"
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
