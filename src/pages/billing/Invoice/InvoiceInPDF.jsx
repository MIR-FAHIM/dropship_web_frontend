import { useParams } from "react-router-dom";

import { usePDF } from "react-to-pdf";
import CustomButton from "../../../components/ui/CustomButton";
import CustomTable from "../../../components/ui/CustomTable";
import { format } from "date-fns";
import Loader from "../../../components/shared/Loader";

const tableHead = ["Date", "Space Used", "Duration", "Total Items", "Total"];

const InvoiceInPDF = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetInvoiceDetailsByPaymentIdQuery(id);
  const { toPDF, targetRef } = usePDF({ filename: "invoice-jayga.pdf" });
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div className="bg-background">
      <div className=" p-5 rounded-md">
        {/* PDF section */}
        <div
          ref={targetRef}
          className="bg-white p-16 px-20 rounded-md min-h-[650px] flex flex-col justify-between"
        >
          <div>
            <img src="/jayga-logo-without-label.png" alt="" className="h-10" />
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold flex items-center">
                  {data?.data?.email_data?.amount} TK
                </p>
                <p>Date: {format(new Date(), "dd-MM-yyyy")}</p>
              </div>
              <div className="font-medium">
                <p>For: {data?.data?.email_data?.user_name}</p>
                <p>Contact: {data?.data?.email_data?.phone}</p>
              </div>
            </div>
            <hr className="my-5" />
            <div>
              <CustomTable tableHead={tableHead}>
                <tr>
                  <td className="px-5 py-3 border">
                    {data?.data?.email_data?.start_date} -{" "}
                    {data?.data?.email_data?.end_date}
                  </td>
                  <td className="px-5 py-3 border">
                    {data?.data?.email_data?.total_grids}
                  </td>
                  <td className="px-5 py-3 border">
                    {data?.data?.email_data?.duration}
                  </td>
                  <td className="px-5 py-3 border">
                    {data?.data?.email_data?.total_items}
                  </td>
                  <td className="px-5 py-3 border">
                    {data?.data?.email_data?.amount}
                  </td>
                </tr>
              </CustomTable>
            </div>
          </div>
          <div>
            <div className="border border-l-0 border-r-0 flex items-center justify-between font-bold pt-2 pb-5 my-5">
              <p>Gross Total</p>
              <p>{data?.data?.email_data?.amount} TK</p>
            </div>
            <div className="font-medium mb-5">
              <p>
                Invoice from <span className="font-semibold">Jayga Ltd.</span>
              </p>
              <p>
                Invoice Number:{" "}
                <span className="font-semibold">
                  {data?.data?.email_data?.invoice_number}
                </span>
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
      <CustomButton
        onClick={() => toPDF()}
        label="Download PDF"
        className={"w-1/2 mx-auto"}
      />
    </div>
  );
};

export default InvoiceInPDF;
