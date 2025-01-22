import { useParams } from "react-router-dom";
import { useGetOrderDetailsByIdQuery } from "../../redux/features/order";
import Loader from "../../components/shared/Loader";
import React, { useEffect, useState } from "react";
// icons
import { LuUserRoundCheck } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import { PiCalendarCheck, PiCheckSquareOffset } from "react-icons/pi";
import { LuMessageSquareText } from "react-icons/lu";
import { PiStorefront } from "react-icons/pi";
import FirstStep from "./components/FirstStep";
import SecondStep from "./components/SecondStep";
import ThirdStep from "./components/ThirdStep";
import RequetsedDeliveryItem from "./components/RequestedItemdDelivery";
import FourthStep from "./components/FourthStep";
// import FifthStep from "./components/FifthStep";
import SixthStep from "./components/SixthStep";
import { Tab, TabPanel, Tabs, TabsHeader } from "@material-tailwind/react";
import Communication from "./components/Communication";
import ItemDispatch from "./components/itemdispatch";

const OrderDetails = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetOrderDetailsByIdQuery(id);
  const [activeTab, setActiveTab] = useState("1stStep");
  const requestTabs = [
    {
      label: "User Details",
      value: "1stStep",
      icon: LuUserRoundCheck,
      content: (
        <FirstStep
          setActiveTab={setActiveTab}
          user={data?.data?.order?.request?.user}
        />
      ),
    },
    {
      label: "Warehouse",
      value: "2ndStep",
      icon: BsBoxSeam,
      content: <SecondStep details={data?.data?.order?.request} />,
    },
    {
      label: "Duration",
      value: "3rdStep",
      icon: PiCalendarCheck,
      content: (
        <ThirdStep
          details={data?.data?.order?.request}
          setActiveTab={setActiveTab}
        />
      ),
    },
    {
      label: "Challan",
      value: "4thStep",
      icon: PiStorefront,
      content: <FourthStep files={data?.data?.request_files} />,
    },
    // {
    //   label: "Payment",
    //   value: "5thStep",
    //   icon: PiCheckSquareOffset,
    //   content: (
    //     <FifthStep
    //       setActiveTab={setActiveTab}
    //       requestId={data?.data?.order_request?.id}
    //       user={data?.data?.order_request?.user}
    //     />
    //   ),
    // },
    {
      label: "Assign grids",
      value: "6thStep",
      icon: PiStorefront,
      content: (
        <SixthStep details={data?.data?.order?.request?.assigned_grids} />
      ),
    },
    {
      label: "Dispatch Item",
      value: "ItemDispatch",
      icon: PiStorefront,
      content: (
        <ItemDispatch details={data?.data?.order?.request?.assigned_grids}  request = {data?.data?.order}/>
      ),
    },
    {
      label: "Delivery Items",
      value: "RequetsedDeliveryItem",
      icon: PiStorefront,
      content: (
        <RequetsedDeliveryItem details={data?.data} />
      ),
    },
    {
      label: "Communication",
      value: "communication",
      icon: LuMessageSquareText,
      content: <Communication details={data?.data} />,
    },
  ];
  useEffect(() => {
    setActiveTab(activeTab);
  }, [activeTab]);
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div className="bg-white p-5">
      <Tabs value={activeTab} className="flex gap-10">
        <TabsHeader
          className="flex flex-col space-y-5 p-3"
          indicatorProps={{
            className: "bg-transparent shadow-none",
          }}
        >
          {requestTabs?.map(({ label, value, icon }) => {
            const isActive = value === activeTab;
            return (
              <Tab
                onClick={() => setActiveTab(value)}
                key={value}
                value={value}
                className="min-w-[180px] flex justify-start"
              >
                <div className="flex items-center gap-2">
                  <div className={`${isActive && "bg-white p-1 rounded-md"}`}>
                    {React.createElement(icon, { className: "w-5 h-5" })}
                  </div>
                  <p
                    className={
                      isActive
                        ? "text-text-100 font-medium"
                        : "font-normal text-text-300"
                    }
                  >
                    {label}
                  </p>
                </div>
              </Tab>
            );
          })}
        </TabsHeader>
        <div className="w-full">
          {requestTabs?.map(({ value, content }) => {
            return (
              <TabPanel key={value} value={value} className="p-0">
                {value === activeTab && <>{content}</>}
              </TabPanel>
            );
          })}
        </div>
      </Tabs>
    </div>
  );
};

export default OrderDetails;
