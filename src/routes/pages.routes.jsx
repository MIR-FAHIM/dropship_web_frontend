import Activity from "../pages/activity/Activity";
import Payments from "../pages/billing/pages/Payments";
import Transactions from "../pages/billing/pages/Transactions";
import PaymentPage from "../pages/billing/PaymentPage";
import FavProducts from "../pages/favproduct/FavProducts";
import Invoice from "../pages/Invoice/Invoice";
import InvoiceInPDF from "../pages/Invoice/InvoiceInPDF";

import Items from "../pages/items/Items";
import ProfilePage from "../pages/profile/Profile";
import CartPage from "../pages/items/Cart";
import SuccessPage from "../pages/items/order_success";
import ProductsList from "../pages/items/ProductsList";
import ProductDetails from "../pages/items/ProductDetails";
import AdminActivity from "../pages/activity/AdminActivity";
import OrderDetailsPage from "../pages/orders/OrderDetails";
import Order from "../pages/orders/Orders";
import Overview from "../pages/overview/Overview";

import SalesAndProfit from "../pages/saleandprofit/SaleAndProfit";
import Users from "../pages/supports/SupportTicket";
import FAQPage from "../pages/supports/GeneralQuestions";
import Post from "../pages/post/Post";
import WarehouseDetails from "../pages/post/WarehouseDetails";
import SalesGuidelines from "../pages/saleguideline/saleguideline";
import WithdrawPage from "../pages/withdraw/withdraw_req";
import AddPaymentAccount from "../pages/payment_account/add_payment_account";
import ProductAssistant from "../pages/product_assistant/product_assistant";
import RegisterPage from "../pages/auth/register";
import ContactUsPage from "../pages/contactus/contact_us_form";
import CheckoutPage from "../pages/checkout/checkout";



export const pagePaths = [

  {
    path: "/dashboard-new",
    element: <Overview />,
    children: [
      {
        path: "/saleandprofit",
        element: <SalesAndProfit />,
      },
  
      {
        path: "/favproducts",
        element: <FavProducts />,
      },
      {
        path: "/order",
        element: <Order />,
      },
      {
        path: "/contact-us-form",
        element: <ContactUsPage />,
      },
      {
        path: "/orders/invoice/:id",
        element: <Invoice />,
      },
      {
        path: "/billing/paymentpage/:id",
        element: <PaymentPage />,
      },
      {
        path: "/payment/invoice-pdf/:id",
        element: <InvoiceInPDF />,
      },
      {
        path: "/orders-details/:id",
        element: <OrderDetailsPage />,
      },
      {
        path: "/withdraw",
        element: <WithdrawPage />,
      },
      {
        path: "/warehousedetails/:id",
        element: <WarehouseDetails />,
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/items",
        element: <Items />,
      },
      {
        path: "/product-assistant",
        element: <ProductAssistant />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/checkout",
        element: <CheckoutPage />,
      },
      {
        path: "/productlist/:id",
        element: <ProductsList />,
      },
      {
        path: "/productdetails/:id",
        element: <ProductDetails />,
      },
      {
        path: "/billing",
        element: <Payments />,
      },
      {
        path: "/billing/payments",
        element: <Payments />,
      },
      {
        path: "/adminactivity",
        element: <AdminActivity />,
      },
     
      {
        path: "/billing/transactions",
        element: <Transactions />,
      },
      {
        path: "/activity",
        element: <Activity />,
      },
      {
        path: "/post",
        element: <Post />,
      },
      {
        path: "/faq",
        element: <FAQPage />,
      },
      {
        path: "/order-success",
        element: <SuccessPage />,
      },
      {
        path: "/sale-guide-line",
        element: <SalesGuidelines />,
      },
      {
        path: "/add-payment-account",
        element: <AddPaymentAccount />,
      },
      {
        path: "/dashboard",
        element: <Overview />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },
];
