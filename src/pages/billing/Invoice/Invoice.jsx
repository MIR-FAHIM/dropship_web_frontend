import { useState } from "react";
import TabHeading from "../../../components/shared/TabHeading";

import DatePicker from "react-datepicker";
import { format, parse } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
// import { TbCurrencyTaka } from "react-icons/tb";
import CustomTable from "../../../components/ui/CustomTable";
import CustomButton from "../../../components/ui/CustomButton";
import { toast } from "sonner";
import { getFirstErrorMessage } from "../../../utils/error.utils";
// Helper function to convert a string to a Date object
const convertToDateObject = (dateString) => {
  return parse(dateString, "yyyy-MM-dd", new Date());
};

const tableHead = [
  "Date",
  "Space Used (SQFT)",
  "Duration (DAY)",
  "Grid Price Per Day",
  "Total",
];

const Invoice = () => {
  const { id } = useParams();
  const [invoiceInfo, setInvoiceInfo] = useState({
    startDate: "",
    endDate: "",
    id,
  });
  const { data, error, isError } = useGetInvoiceAmountQuery(invoiceInfo);
  const [createInvoiceFn] = useCreateInvoiceMutation();

  const handleCreateInvoice = async (values) => {
    const toastId = toast.loading("Generating invoice please wait...");
    const data = {
      start: values?.startDate,
      end: values?.endDate,
      order_list_id: values?.id,
    };
    const formdata = new FormData();
    Object.keys(data).forEach((key) => {
      formdata.append(key, data[key]);
    });
    try {
      const res = await createInvoiceFn(formdata).unwrap();
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
    <div className="p-5 font-DMSans">
      <TabHeading
        title={"Generate Invoice"}
        subTitle={"Generate an invoice for the order"}
      />
      <div className="grid grid-cols-1 gap-10">
        <div className="">
          <div className="flex flex-col gap-4">
            {/* Start Date Picker */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium">
                Start Date
              </label>
              <DatePicker
                id="startDate"
                selected={
                  invoiceInfo.startDate
                    ? convertToDateObject(invoiceInfo.startDate)
                    : new Date()
                }
                onChange={(date) => {
                  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
                  setInvoiceInfo((prev) => ({
                    ...prev,
                    startDate: formattedDate,
                  }));
                }}
                className="border rounded px-3 py-2 w-full"
                dateFormat="yyyy-MM-dd"
              />
            </div>

            {/* End Date Picker */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium">
                End Date
              </label>
              <DatePicker
                id="endDate"
                selected={
                  invoiceInfo.endDate
                    ? convertToDateObject(invoiceInfo.endDate)
                    : new Date()
                }
                onChange={(date) => {
                  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
                  setInvoiceInfo((prev) => ({
                    ...prev,
                    endDate: formattedDate,
                  }));
                }}
                className="border rounded px-3 py-2 w-full"
                dateFormat="yyyy-MM-dd"
                minDate={
                  invoiceInfo.startDate
                    ? convertToDateObject(invoiceInfo.startDate)
                    : new Date()
                }
              />
            </div>
          </div>
          {/* Display invoice details */}
          <div className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold">Invoice Information</h2>
            <p>Start Date: {invoiceInfo.startDate || "Not selected"}</p>
            <p>End Date: {invoiceInfo.endDate || "Not selected"}</p>
            <div>
              {isError ? (
                <p className="text-lg font-semibold text-red-400">
                  {error?.data?.message}
                </p>
              ) : (
                <div className="space-y-5">
                  <CustomTable tableHead={tableHead}>
                    <tr>
                      <td className="px-5 py-3 border">
                        {invoiceInfo?.startDate} - {invoiceInfo?.endDate}
                      </td>
                      <td className="px-5 py-3 border">
                        {data?.data?.totalGrids}
                      </td>
                      <td className="px-5 py-3 border">
                        {data?.data?.duration}
                      </td>
                      <td className="px-5 py-3 border">
                        {data?.data?.gridPricePerDay}
                      </td>
                      <td className="px-5 py-3 border">{data?.data?.amount}</td>
                    </tr>
                  </CustomTable>
                  <CustomButton
                    onClick={() => handleCreateInvoice(invoiceInfo)}
                    label="Generate Invoice"
                  />
                  {/* <CustomButton onClick={() => toPDF()} label="Download PDF" /> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
