import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/auth/Login";
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
    path: "*",
    element: <p>Page not found!</p>,
  },
]);
