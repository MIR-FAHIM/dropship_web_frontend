import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/auth/Login";
import RegisterPage from "../pages/auth/register";
import PrivateRoute from "./PrivateRoute";
import { pagePaths } from "./pages.routes";
import HomePage from "../pages/home_page/home_page";
import PrivacyPolicySalon from "../pages/privacy_policy/salon_privacy_policy";
import ProductsListHomePage from "../pages/home_page/product_list_home";
import ProductDetailsHomePage from "../pages/home_page/product_detail_home";
import ContactPage from "../pages/home_page/contact_us";
import SoftwareSell from "../pages/myzoo/software_sale";
import PicnicRegistration from "../pages/kazi_bari/add_member";
import RegisteredMembersTable from "../pages/kazi_bari/registered_table";
import VendorLanding from "../pages/vendor/VendorLanding";
import VendorLogin from "../pages/vendor/VendorLogin";
import VendorRegister from "../pages/vendor/VendorRegister";
import VendorPanelLayout from "../pages/vendor/vendor_panel/VendorPanelLayout";
import VendorDashboard from "../pages/vendor/vendor_panel/VendorDashboard";
import VendorProducts from "../pages/vendor/vendor_panel/VendorProducts";
import VendorOrders from "../pages/vendor/vendor_panel/VendorOrders";
import VendorAccounting from "../pages/vendor/vendor_panel/VendorAccounting";
import VendorSettings from "../pages/vendor/vendor_panel/VendorSettings";
import AdminPanelLayout from "../pages/admin_panel/AdminPanelLayout";
import AdminDashboard from "../pages/admin_panel/AdminDashboard";
import AdminProducts from "../pages/admin_panel/AdminProducts";
import AdminOrders from "../pages/admin_panel/AdminOrders";
import AdminVendors from "../pages/admin_panel/AdminVendors";
import AdminDropshippers from "../pages/admin_panel/AdminDropshippers";
import AdminEmployees from "../pages/admin_panel/AdminEmployees";
import AdminAccounting from "../pages/admin_panel/AdminAccounting";
import AdminSettings from "../pages/admin_panel/AdminSettings";
// route generator func
import { routeGenerator } from "../utils/routeGenerator";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },

    {
    path: "/picnic-registration",
    element: <PicnicRegistration />,
  },

  
  {
    path: "/registered-members",
    element: <RegisteredMembersTable />,
  },
  {
    path: "/contact-us",
    element: <ContactPage />,
  },
  {
    path: "/salon-privacy-policy",
    element: <PrivacyPolicySalon />,
  },
  {
    path: "/products-home/:id",
    element: <ProductsListHomePage />,
  },
  {
    path: "/software-offer",
    element: <SoftwareSell />,
  },
  {
    path: "/vendor",
    element: <VendorLanding />,
  },
  {
    path: "/vendor-login",
    element: <VendorLogin />,
  },
  {
    path: "/vendor-register",
    element: <VendorRegister />,
  },
  {
    path: "/vendor-panel",
    element: <VendorPanelLayout />,
    children: [
      { index: true, element: <VendorDashboard /> },
      { path: "products", element: <VendorProducts /> },
      { path: "orders", element: <VendorOrders /> },
      { path: "accounting", element: <VendorAccounting /> },
      { path: "settings", element: <VendorSettings /> },
    ],
  },
  {
    path: "/admin-panel",
    element: <AdminPanelLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "products", element: <AdminProducts /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "vendors", element: <AdminVendors /> },
      { path: "dropshippers", element: <AdminDropshippers /> },
      { path: "employees", element: <AdminEmployees /> },
      { path: "accounting", element: <AdminAccounting /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },
  {
    path: "/products-detail-home/:id",
    element: <ProductDetailsHomePage />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <App />
      </PrivateRoute>
    ),
    children: routeGenerator(pagePaths),
  },
  {
    path: "/login",
    element: <Login />,
  },

      {
        path: "/register",
        element: <RegisterPage />,
      },
  
  {
    path: "*",
    element: <p>Page not found!</p>,
  },
]);
