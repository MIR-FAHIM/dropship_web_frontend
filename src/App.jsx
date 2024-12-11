import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import {
  HiOutlineSquares2X2,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import { Link, Outlet } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { PiUsers } from "react-icons/pi";
import CustomNavbar from "./components/shared/CustomNavbar";
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
    path: "/",
    label: "Grids",
    icon: <PiUsers />,
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
            isCollapse ? "left-[3.8%]" : "left-[18.8%]"
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
            <div className="w-[5%] h-screen">
              <div className="h-[80px] p-5 flex justify-center items-center">
                <img src="jayga-logo-without-label.png" alt="" />
              </div>
              <div className="flex flex-col items-center my-5">
                {menuLinks.map((item, index) => {
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      className="flex items-center gap-x-3 text-text-300 py-2 px-2 hover:bg-primary-400 hover:text-primary text-3xl rounded-md "
                    >
                      {item.icon}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* expended sidebar */}
            <div className="w-[20%] h-screen border flex flex-col justify-between">
              <div>
                {/* header */}
                <div className="h-[80px] bg-white p-5 border-b border-border flex justify-start">
                  <img src="jayga-logo.png" alt="" className="h-full" />
                </div>
                <div className="text-text-300 m-3">
                  <div>
                    {/* warehouses */}
                    <div className="border border-border rounded-xl my-5 p-3">
                      <div className="grid grid-cols-2 items-center gap-3 border-b border-border pb-3 mb-3">
                        <img
                          src="https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                          alt=""
                          className="rounded-lg h-[60px]"
                        />
                        <h3 className="text-text-300">Warehouse</h3>
                      </div>
                      <div className="space-y-4 text-text-300">
                        <p>Aftabnagar, Dhaka</p>
                        <p>Bashundhara</p>
                        <button className="flex items-center gap-3 text-primary">
                          <FiPlus className="bg-primary-400 rounded-sm p-1 text-2xl" />
                          Add warehouse
                        </button>
                      </div>
                    </div>
                    <div className="">
                      {menuLinks.map((item, index) => {
                        return (
                          <Link
                            key={index}
                            to={item.path}
                            className="flex items-center gap-x-3 text-text-300 py-2 px-2 hover:bg-primary-400 hover:text-primary"
                          >
                            <span className="text-xl">{item.icon}</span>{" "}
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
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
            isCollapse ? "w-[95%]" : "w-[80%]"
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
