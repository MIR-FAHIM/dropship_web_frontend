import { useState } from "react";
import CustomNavbar from "./components/shared/CustomNavbar";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
// icons
import { PiReceipt, PiUsers } from "react-icons/pi";
import {
  HiOutlineSquares2X2,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import { IoIosArrowBack } from "react-icons/io";
import { IoCalendarOutline } from "react-icons/io5";
import { LuArchive } from "react-icons/lu";
import { BiLogoProductHunt, BiTransferAlt } from "react-icons/bi";
import { MdOutlineProductionQuantityLimits, MdOutlineWarehouse } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa6";
import logo from "../src/assets/jayga-logo.png";
import sLogo from "../src/assets/jayga-logo-without-label.png";
import { Heart, HomeIcon } from "lucide-react";
import { FaProductHunt } from "react-icons/fa";
// menu links
const menuLinks = [
  {
    path: "/",
    label: "Home",
    icon: <HomeIcon />,
  },
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <HiOutlineSquares2X2 />,
  },
  {
    path: "/items/category",
    label: "All Products",
    icon: <LuArchive />,
  },
  {
    path: "/favproducts",
    label: "Favourite Product",
    icon: <Heart />,
  },
  {
    path: "/post",
    label: "Facebook Content",
    icon: <MdOutlineWarehouse />,
  },
  {
    path: "/order",
    label: "Order List",
    icon: <HiOutlineClipboardDocumentCheck />,
  },
  {
    path: "/saleandprofit",
    label: "Sales & Profit",
    icon: <IoCalendarOutline />,
  },
  {
    path: "/billing",
    label: "Transactions",
    icon: <PiReceipt />,
    children: [
      {
        path: "/billing/payments",
        label: "Payments",
      },
      {
        path: "/billing/transactions",
        label: "Transactions",
      },
    ],
  },
  {
    path: "/users",
    label: "Support Ticket",
    icon: <PiUsers />,
  },
  {
    path: "/withdraw",
    label: "Withdraw",
    icon: <PiReceipt />,
    children:[
      {
        path: "/add-payment-account",
        label: "Add Payment Account",
      },
      {
        path: "/withdraw",
        label: "Withdraw",
      },
    ]
   
  },
  {
    path: "/contact-us",
    label: "Contact Developer",
    icon: <PiUsers />,
  },
];

const App = () => {
  const [isCollapse, setCollapse] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(0);
  const { t, i18n } = useTranslation();

  // Language Change Handler
  

  const handleOpenAccordion = (value) => setOpenAccordion(openAccordion === value ? 0 : value);

  return (
    <>
      {/* collapse button */}
      <div className="relative z-[500]">
        {/* Language Switcher - Placing it here or in a prominent spot */}
     
        
        <button
          onClick={() => setCollapse(!isCollapse)}
          className={`absolute top-[25px] border p-1 rounded-full text-xl text-text-300 bg-background/50 ${
            isCollapse
              ? "left-[3.8%]"
              : "lg:left-[18.8%] 2xl:left-[14.2%] left-[37%]"
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
                <img src={sLogo} alt="" className="2xl:h-[50px]" />
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
            {/* expanded sidebar */}
            <div className="lg:w-[20%] 2xl:w-[15%] w-[40%] h-screen border flex flex-col justify-between">
              <div>
                {/* header */}
                <div className="h-[80px] bg-white p-5 border-b border-border flex justify-start">
                  <img src={logo} alt="" />
                </div>
                {/* links */}
                <div className="text-text-300 m-3">
                  {menuLinks.map((item, index) => {
                    if (item.children) {
                      return (
                        <Accordion
                          key={index}
                          open={openAccordion === index}
                          icon={
                            <FaAngleDown
                              className={`size-4 transition-transform ${
                                index === open ? "rotate-180" : ""
                              }`}
                            />
                          }
                        >
                          <AccordionHeader
                            className="text-base font-normal px-2 py-2 border-b-0"
                            onClick={() => handleOpenAccordion(index)}
                          >
                            <div className="flex items-center gap-x-3">
                              <span className="text-xl">{item.icon}</span>
                              {t(item.label)}
                            </div>
                          </AccordionHeader>
                          <AccordionBody className="p-0 text-base">
                            <div className="flex flex-col pl-8 space-y-1">
                              {item.children.map((child, childIndex) => (
                                <NavLink
                                  key={childIndex}
                                  to={child.path}
                                  className={({ isActive }) =>
                                    `py-1 px-2 rounded hover:bg-primary-400 hover:text-primary ${
                                      isActive
                                        ? "text-primary bg-primary-400"
                                        : "text-text-300"
                                    }`
                                  }
                                >
                                  {t(child.label)}
                                </NavLink>
                              ))}
                            </div>
                          </AccordionBody>
                        </Accordion>
                      );
                    }

                    return (
                      <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-x-3 py-2 px-2 hover:bg-primary-400 rounded-md hover:text-primary ${
                            isActive
                              ? "text-primary bg-primary-400"
                              : "text-text-300"
                          }`
                        }
                      >
                        <span className="text-xl">{item.icon}</span>
                        {t(item.label)}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
              {/* footer */}
              <div className="m-3 text-text-300">
                <p>{t('welcome')}</p>
              </div>
            </div>
          </>
        )}
        
        {/* content */}
        <div
          className={`bg-background ${
            isCollapse ? "lg:w-[95%] w-[92%]" : "lg:w-[80%] 2xl:w-[85%] w-[60%]"
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
