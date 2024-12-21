import { useParams } from "react-router-dom";
import { useGetOrderRequestByIdQuery } from "../../redux/features/request";
import FirstStep from "./components/FirstStep";
import SecondStep from "./components/SecondStep";
// icons
import { LuUserRoundCheck } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import { PiCalendarCheck, PiCheckSquareOffset } from "react-icons/pi";
import { PiStorefront } from "react-icons/pi";
import { Tab, TabPanel, Tabs, TabsHeader } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import ThirdStep from "./components/ThirdStep";
import FourthStep from "./components/FourthStep";
import FifthStep from "./components/FifthStep";
import SixthStep from "./components/SixthStep";

const RequestDetails = () => {
  const { id } = useParams();
  const { data } = useGetOrderRequestByIdQuery(id);
  const [activeTab, setActiveTab] = useState("1stStep");
  useEffect(() => {
    setActiveTab(activeTab);
  }, [activeTab]);
  const requestTabs = [
    {
      label: "User Details",
      value: "1stStep",
      icon: LuUserRoundCheck,
      content: <FirstStep setActiveTab={setActiveTab} />,
    },
    {
      label: "Warehouse",
      value: "2ndStep",
      icon: BsBoxSeam,
      content: <SecondStep />,
    },
    {
      label: "Duration",
      value: "3rdStep",
      icon: PiCalendarCheck,
      content: <ThirdStep />,
    },
    {
      label: "Challan",
      value: "4thStep",
      icon: PiStorefront,
      content: <FourthStep />,
    },
    {
      label: "Payment",
      value: "5thStep",
      icon: PiCheckSquareOffset,
      content: <FifthStep />,
    },
    {
      label: "Assign grids",
      value: "6thStep",
      icon: PiStorefront,
      content: <SixthStep />,
    },
    {
      label: "Place order",
      value: "7thStep",
      icon: PiStorefront,
      content: <SixthStep />,
    },
  ];
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

export default RequestDetails;
