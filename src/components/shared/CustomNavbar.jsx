import React from "react";
import { Navbar, Collapse, IconButton, Button } from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { LuBell } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { setToken } from "../../redux/slices/authSlice";

const navLinks = [
  { path: "/", label: "Account" },
  { path: "/", label: "Warehouses" },
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
  const [openNav, setOpenNav] = React.useState(false);
  const dispatch = useDispatch();

  const handleWindowResize = () =>
    window.innerWidth >= 960 && setOpenNav(false);

  const handleLogout = () => {
    dispatch(setToken({ token: null }));
  };

  React.useEffect(() => {
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);
  return (
    <Navbar className="sticky top-0 z-10 max-w-full rounded-none h-[80px] bg-opacity-100 bg-white px-0">
      <div className="flex items-center justify-between text-blue-gray-900 h-full px-4">
        <Link to={"/"} className="cursor-pointer font-bold">
          Dashboard
        </Link>
        <div className="hidden lg:flex items-center gap-x-5">
          <NavList />
          <Button onClick={() => handleLogout()}>Logout</Button>
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
