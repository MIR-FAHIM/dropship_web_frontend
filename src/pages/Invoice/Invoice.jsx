import { useState } from "react";
import TabHeading from "../../components/shared/TabHeading";
import { useGetInvoiceAmountQuery } from "../../redux/features/order";
import DatePicker from "react-datepicker";
import { format, parse } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
// import { TbCurrencyTaka } from "react-icons/tb";
import CustomTable from "../../components/ui/CustomTable";
import { usePDF } from "react-to-pdf";
import CustomButton from "../../components/ui/CustomButton";
// Helper function to convert a string to a Date object
const convertToDateObject = (dateString) => {
  return parse(dateString, "yyyy-MM-dd", new Date());
};

const tableHead = [
  "Date",
  "Space Used",
  "Duration",
  "Grid Price Per Day",
  "Total",
];

const Invoice = () => {
  const { id } = useParams();
  const { toPDF, targetRef } = usePDF({ filename: "invoice-jayga.pdf" });
  const [invoiceInfo, setInvoiceInfo] = useState({
    startDate: "",
    endDate: "",
    id,
  });

  const { data, error, isError } = useGetInvoiceAmountQuery(invoiceInfo);

  console.log(data, error);

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
                <div>
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
                  <CustomButton label="Generate Invoice" />
                  {/* <CustomButton onClick={() => toPDF()} label="Download PDF" /> */}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-background p-5 rounded-md">
          {/* PDF section */}
          <div
            ref={targetRef}
            className="bg-white p-10 px-12 rounded-md min-h-[650px] flex flex-col justify-between"
          >
            <div>
              <img
                src="/jayga-logo-without-label.png"
                alt=""
                className="h-10"
              />
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold flex items-center">
                    12,31,412 TK
                  </p>
                  <p>Date: 12-01-2025</p>
                </div>
                <div className="font-medium">
                  <p>For: Name</p>
                  <p>Contact: Number</p>
                </div>
              </div>
              <hr className="my-5" />
              <div>
                <CustomTable tableHead={tableHead}>
                  <tr>
                    <td className="px-5 py-3 border">
                      {invoiceInfo?.startDate} - {invoiceInfo?.endDate}
                    </td>
                    <td className="px-5 py-3 border">5</td>
                    <td className="px-5 py-3 border">2</td>
                    <td className="px-5 py-3 border">5000</td>
                  </tr>
                </CustomTable>
              </div>
            </div>
            <div>
              <div className="border border-l-0 border-r-0 flex items-center justify-between font-bold pt-2 pb-5 my-5">
                <p>Gross Total</p>
                <p>5000</p>
              </div>
              <div className="font-medium mb-5">
                <p>
                  Invoice from <span className="font-semibold">Jayga Ltd.</span>
                </p>
                <p>
                  Invoice Number:{" "}
                  <span className="font-semibold">18ACBA12</span>
                </p>
              </div>
              <div className="text-text-300">
                <p>
                  <span>Email: info@jayga.io</span>{" "}
                  <span>Phone: +8801708652111</span>
                </p>
                <p>House 10, Road 22, Sector 14, Uttara, Dhaka, 1230</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
