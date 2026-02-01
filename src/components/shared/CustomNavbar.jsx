import React, { useState, useEffect } from "react";
import { Navbar, Collapse, IconButton, Button } from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { LuBell } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { setToken } from "../../redux/slices/authSlice";
import { useTranslation } from "react-i18next";
import { FaWallet } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa"; 
import { useGetCartQuery } from "../../redux/features/cart"; 
import { useGetUserBalanceQuery } from "../../redux/features/order"; 
import getStorage from "redux-persist/es/storage/getStorage";

const navLinks = [
  { path: "/profile", label: "Account" },
];

function NavList() {
  return (
    <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6 bg-white text-black px-4 lg:px-0">
      <Link to={"/"}>
        <LuBell />
      </Link>
      {navLinks.map((item, index) => {
        return (
          <Link key={index} to={item.path} className="p-1">
            {item.label}
          </Link>
        );
      })}
    </ul>
  );
}

const CustomNavbar = () => {
    const { data: balance, errorBal, isLoadingBal } = useGetUserBalanceQuery(1); // Fetch balance for user with ID 1
  const [openNav, setOpenNav] = React.useState(false);
  const [cartCount, setCartCounts] = useState(0); // Initialize the cart count
  const [showBalance, setShowBalance] = useState(false); // State to track visibility of balance
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Get cart data for user id 1
  const userId = localStorage.getItem("userId") || 1;
  const { data, error, isLoading, refetch } = useGetCartQuery(userId);

  // UseEffect to handle setting the cart count when data changes
  useEffect(() => {
    if (data) {
      setCartCounts(data?.data?.total_items || 0);
    }
  }, [data]);

  useEffect(() => {
    // This effect will run after the balance is loaded
    console.log('Balance Loaded:', balance);
  }, [balance]);

  const handleWindowResize = () =>
    window.innerWidth >= 960 && setOpenNav(false);

  const handleLogout = () => {
    dispatch(setToken({ token: null }));
  };

  const handleChangeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Change language dynamically
    localStorage.setItem("language", lng); // Optionally persist language selection
  };

  React.useEffect(() => {
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const goToCart = async () => {
    await refetch(); // Refetch cart data to ensure it's up-to-date
    if ((data?.data?.total_items || 0) > 0) {
      navigate("/cart"); // Navigate to the cart page if cart has items
    } else {
      alert("Your cart is empty!"); // Optionally notify the user if the cart is empty
    }
  };
  const handleContactUsClick = () => {
    navigate(`contact-us-form`);

    // setOpenNotificationModal(true);
  };
  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance); // Toggle balance visibility
  };

  return (
    <Navbar className="sticky top-0 z-[499] max-w-full rounded-none h-[80px] bg-opacity-100 bg-white px-0 opacity-100">
      <div className="flex items-center justify-between text-blue-gray-900 h-full px-4">
        
        <div className="hidden lg:flex items-center gap-x-5">
          <NavList />
          <Button onClick={() => handleLogout()}>Logout</Button>

          {/* Balance button */}
          <Button
            onClick={toggleBalanceVisibility} // Toggle visibility when clicked
            className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 text-white font-semibold shadow-lg hover:scale-105 transform transition-all duration-200"
          >
            <FaWallet className="text-lg" />
            {isLoadingBal ? (
              <span className="text-xl">Loading balance...</span>
            ) : errorBal ? (
              <span className="text-xl text-red-500">Error fetching balance</span>
            ) : (
              <span className="text-xl">Balance</span>
            )}
          </Button>

          {/* Conditionally display the balance */}
          {showBalance && !isLoadingBal && !errorBal && (
            <div className="text-xl mt-2">
              <span>Balance: ${balance.data.balance}</span> {/* Using balance.balance */}
            </div>
          )}
        </div>

        {/* Add a Cart icon with count badge */}
        <div className="relative" onClick={goToCart}>
          <FaShoppingCart className="text-4xl text-gray-700" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 block w-5 h-5 text-xs bg-red-600 text-white rounded-full text-center">
              {cartCount}
            </span>
          )}
        </div>
      
          <Button
            size="small"
            sx={{ textTransform: "none" }}
            onClick={() => handleContactUsClick()
            }
          >
            Contact with Developer
          </Button>
    
        {/* Language switcher container */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleChangeLanguage('en')}
            className="bg-blue-500 text-white p-2 rounded-md text-sm"
          >
            English
          </button>
          <button
            onClick={() => handleChangeLanguage('bd')}
            className="bg-green-500 text-white p-2 rounded-md text-sm"
          >
            বাংলা
          </button>
        </div>

        <IconButton
          variant="text"
          className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          ripple={false}
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>

      <Collapse open={openNav}>
        <NavList />
      </Collapse>
    </Navbar>
  );
};

export default CustomNavbar;
