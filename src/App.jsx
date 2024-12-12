import { useState } from "react";
import CustomNavbar from "./components/shared/CustomNavbar";
import { NavLink, Outlet } from "react-router-dom";
// icons
import { PiReceipt, PiUsers } from "react-icons/pi";
import {
  HiOutlineSquares2X2,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import { IoIosArrowBack } from "react-icons/io";
import { IoCalendarOutline } from "react-icons/io5";
import { LuArchive } from "react-icons/lu";
import { BiTransferAlt } from "react-icons/bi";
import { MdOutlineWarehouse } from "react-icons/md";
// menu links
const menuLinks = [
  {
    path: "/",
    label: "Overview",
    icon: <HiOutlineSquares2X2 />,
  },
  {
    path: "/requests",
    label: "Requests",
    icon: <HiOutlineClipboardDocumentCheck />,
  },
  {
    path: "/grids",
    label: "Grids",
    icon: <PiUsers />,
  },
  {
    path: "/orders",
    label: "Orders",
    icon: <IoCalendarOutline />,
  },
  {
    path: "/billing",
    label: "Billing",
    icon: <PiReceipt />,
  },
  {
    path: "/users",
    label: "Users",
    icon: <PiUsers />,
  },
  {
    path: "/items",
    label: "Items",
    icon: <LuArchive />,
  },
  {
    path: "/activity",
    label: "Activity",
    icon: <BiTransferAlt />,
  },
  {
    path: "/warehouse",
    label: "Warehouse",
    icon: <MdOutlineWarehouse />,
  },
];
const App = () => {
  const [isCollapse, setCollapse] = useState(false);
  return (
    <>
      {/* collapse button */}
      <div className="relative z-[9999]">
        <button
          onClick={() => setCollapse(!isCollapse)}
          className={`absolute top-[25px] border p-1 rounded-full text-xl text-text-300 bg-background/50 ${
            isCollapse ? "left-[3.8%]" : "lg:left-[18.8%] left-[37%]"
          }`}
        >
          <IoIosArrowBack />
        </button>
      </div>
      <div className="flex">
        {/* sidebar */}
        {isCollapse ? (
          <>
            {/* collapsed sidebar */}
            <div className="lg:w-[5%] w-[8%] h-screen">
              {/* header */}
              <div className="h-[80px] lg:p-5 p-2 flex justify-center items-center">
                <img src="jayga-logo-without-label.png" alt="" />
              </div>
              {/* links */}
              <div className="flex flex-col items-center mt-5 px-1 space-y-2">
                {menuLinks.map((item, index) => {
                  return (
                    <NavLink
                      key={index}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-x-3 md:p-2 p-1 hover:bg-primary-400 md:text-3xl text-2xl rounded-md hover:text-primary ${
                          isActive
                            ? "text-primary bg-primary-400"
                            : "text-text-300"
                        }`
                      }
                    >
                      {item.icon}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* expended sidebar */}
            <div className="lg:w-[20%] w-[40%] h-screen border flex flex-col justify-between">
              <div>
                {/* header */}
                <div className="h-[80px] bg-white p-5 border-b border-border flex justify-start">
                  <img src="jayga-logo.png" alt="" className="h-full" />
                </div>
                {/* links */}
                <div className="text-text-300 m-3">
                  {menuLinks.map((item, index) => {
                    return (
                      <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-x-3  py-2 px-2 hover:bg-primary-400 rounded-md hover:text-primary ${
                            isActive
                              ? "text-primary bg-primary-400"
                              : "text-text-300"
                          }`
                        }
                      >
                        <span className="text-xl">{item.icon}</span>{" "}
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
              {/* footer */}
              <div className="m-3 text-text-300">
                <p>Developed by Jayga Systems B.V</p>
              </div>
            </div>
          </>
        )}
        {/* content */}
        <div
          className={`bg-background ${
            isCollapse ? "lg:w-[95%] w-[92%]" : "lg:w-[80%] w-[60%]"
          } max-h-screen overflow-y-scroll`}
        >
          <CustomNavbar />
          <div className="bg-white m-5">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
