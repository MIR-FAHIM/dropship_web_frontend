import { useParams } from "react-router-dom";
import { useGetOrderRequestByIdQuery } from "../../redux/features/request";
import FirstStep from "./components/FirstStep";
import SecondStep from "./components/SecondStep";
// icons
import { LuUserRoundCheck } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import {
  Tab,
  TabPanel,
  Tabs,
  TabsBody,
  TabsHeader,
} from "@material-tailwind/react";
import React, { useState } from "react";

const RequestDetails = () => {
  const { id } = useParams();
  const { data } = useGetOrderRequestByIdQuery(id);
  const [activeTab, setActiveTab] = useState("1stStep");
  const requestTabs = [
    {
      label: "User Details",
      value: "1stStep",
      icon: LuUserRoundCheck,
      content: <FirstStep />,
    },
    {
      label: "Add Items",
      value: "2ndStep",
      icon: BsBoxSeam,
      content: <SecondStep />,
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
        <TabsBody className="">
          {requestTabs?.map(({ value, content }) => (
            <TabPanel className="p-0" key={value} value={value}>
              {content}
            </TabPanel>
          ))}
        </TabsBody>
      </Tabs>
    </div>
  );
};

export default RequestDetails;
