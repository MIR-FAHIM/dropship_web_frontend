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
import AboutUs from "../pages/home_page/AboutUs";
import SoftwareSell from "../pages/myzoo/software_sale";
import PicnicRegistration from "../pages/kazi_bari/add_member";
import RegisteredMembersTable from "../pages/kazi_bari/registered_table";
import VendorLanding from "../pages/vendor/VendorLanding";
import VendorLogin from "../pages/vendor/VendorLogin";
import VendorRegister from "../pages/vendor/VendorRegister";
import VendorPanelLayout from "../pages/vendor/vendor_panel/VendorPanelLayout";
import VendorDashboard from "../pages/vendor/vendor_panel/VendorDashboard";
import VendorProducts from "../pages/vendor/vendor_panel/product/VendorProducts";
import VendorProductCreate from "../pages/vendor/vendor_panel/VendorProductCreate";
import VendorProductDetail from "../pages/vendor/vendor_panel/VendorProductDetail";
import VendorBankAccount from "../pages/vendor/vendor_panel/bank_account/VendorBankAccount";
import VendorOrders from "../pages/vendor/vendor_panel/VendorOrders";
import VendorAccounting from "../pages/vendor/vendor_panel/VendorAccounting";
import VendorSettings from "../pages/vendor/vendor_panel/VendorSettings";
import AdminPanelLayout from "../pages/admin_panel/AdminPanelLayout";
import AdminDashboard from "../pages/admin_panel/dashboard/AdminDashboard";
import AdminProducts from "../pages/admin_panel/products/AdminProducts";
import AdminOrders from "../pages/admin_panel/orders/AdminOrders";
import AdminVendors from "../pages/admin_panel/vendors/AdminVendors";
import AdminVendorDetails from "../pages/admin_panel/vendors/AdminVendorDetails";
import AdminDropshippers from "../pages/admin_panel/dropshippers/AdminDropshippers";
import AdminEmployees from "../pages/admin_panel/employees/AdminEmployees";
import AdminAccounting from "../pages/admin_panel/accounting/AdminAccounting";
import AdminSettings from "../pages/admin_panel/settings/AdminSettings";
import AdminLogin from "../pages/admin_panel/auth/AdminLogin";
import AdminCategories from "../pages/admin_panel/products/AdminCategories";
import AdminBrands from "../pages/admin_panel/products/AdminBrands";
import AdminAttributes from "../pages/admin_panel/products/AdminAttributes";
import AdminMedia from "../pages/admin_panel/media/AdminMedia";
import AdminProductCreate from "../pages/admin_panel/products/AdminProductCreate";
import AdminProductDetail from "../pages/admin_panel/products/AdminProductDetail";
import AdminOrderDetails from "../pages/admin_panel/orders/AdminOrderDetails";
import AdminTasks from "../pages/admin_panel/tasks/AdminTasks";
import TaskShareDetail from "../pages/admin_panel/tasks/TaskShareDetail";
import MyBusinessInfo from "../pages/admin_panel/my_business_info/MyBusinessInfo";
import AllWithdrawReq from "../pages/admin_panel/accounting/AllWithdrawReq";
import AdminDeliveryCompanies from "../pages/admin_panel/delivery/del_company/AdminDeliveryCompanies";
import AdminDeliveryCompanyDetails from "../pages/admin_panel/delivery/AdminDeliveryCompanyDetails";
import AllProductCategoryTab from "../pages/product/AllProductCategoryTab";
import ProductAssistantPage from "../pages/reseller_panel/product_assistant/product_assistant";
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
    path: "/all-product-category",
    element: <AllProductCategoryTab />,
  },
  {
    path: "/product-assistant",
    element: <ProductAssistantPage />,
  },


  {
    path: "/contact-us",
    element: <ContactPage />,
  },
  {
    path: "/about-us",
    element: <AboutUs />,
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
    path: "/admin-login",
    element: <AdminLogin />,
  },
  {
    path: "/vendor-login",
    element: <VendorLogin />,
  },

  {
    path: "task-share-detail/:id",
    element: <TaskShareDetail />
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
      { path: "products/create", element: <VendorProductCreate /> },
      { path: "products/:id", element: <VendorProductDetail /> },
      { path: "orders", element: <VendorOrders /> },
      { path: "accounting", element: <VendorAccounting /> },
      { path: "bank-account", element: <VendorBankAccount /> },
      { path: "settings", element: <VendorSettings /> },
    ],
  },

  {
    path: "/admin-panel",
    element: <AdminPanelLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "products", element: <AdminProducts /> },
      { path: "products/create", element: <AdminProductCreate /> },
      { path: "products/:id", element: <AdminProductDetail /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "brands", element: <AdminBrands /> },
      { path: "attributes", element: <AdminAttributes /> },
      { path: "media", element: <AdminMedia /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "orders/:id", element: <AdminOrderDetails /> },
      { path: "vendors", element: <AdminVendors /> },
      { path: "vendors/:id", element: <AdminVendorDetails /> },
      { path: "dropshippers", element: <AdminDropshippers /> },
      { path: "employees", element: <AdminEmployees /> },
      { path: "accounting", element: <AdminAccounting /> },
      { path: "tasks", element: <AdminTasks /> },
      { path: "task-share-detail/:id", element: <TaskShareDetail /> },
      { path: "settings", element: <AdminSettings /> },
      { path: "my-business-info", element: <MyBusinessInfo /> },
      { path: "all-withdraw-requests", element: <AllWithdrawReq /> },
      { path: "delivery/companies", element: <AdminDeliveryCompanies /> },
      { path: "delivery/companies/:id", element: <AdminDeliveryCompanyDetails /> },
    ],
  },
  {
    path: "/products-detail-home/:id",
    element: <ProductDetailsHomePage />,
  },
  {
    path: "/app",
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
