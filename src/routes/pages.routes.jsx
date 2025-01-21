import Activity from "../pages/activity/Activity";
import Payments from "../pages/billing/pages/Payments";
import Transactions from "../pages/billing/pages/Transactions";
import PaymentPage from "../pages/billing/PaymentPage";
import Grids from "../pages/grids/Grids";
import Invoice from "../pages/Invoice/Invoice";
import InvoiceInPDF from "../pages/Invoice/InvoiceInPDF";
import Items from "../pages/items/Items";
import OrderDetails from "../pages/orderDetails/OrderDetails";
import Orders from "../pages/orders/Orders";
import Overview from "../pages/overview/Overview";
import RequestDetails from "../pages/requests/RequestDetails";
import Requests from "../pages/requests/Requests";
import Users from "../pages/users/Users";
import Warehouse from "../pages/warehouse/Warehouse";


export const pagePaths = [

  {
    path: "/",
    element: <Overview />,
    children: [
      {
        path: "/requests",
        element: <Requests />,
      },
      {
        path: "/request-details/:id",
        element: <RequestDetails />,
      },
      {
        path: "/grids",
        element: <Grids />,
      },
      {
        path: "/orders",
        element: <Orders />,
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
        path: "/orders/details/:id",
        element: <OrderDetails />,
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/items",
        element: <Items />,
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
        path: "/billing/transactions",
        element: <Transactions />,
      },
      {
        path: "/activity",
        element: <Activity />,
      },
      {
        path: "/warehouse",
        element: <Warehouse />,
      },
    ],
  },
];
