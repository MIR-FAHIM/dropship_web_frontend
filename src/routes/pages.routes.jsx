import Activity from "../pages/activity/Activity";
// import Billing from "../pages/billing/Billing";
import Payments from "../pages/billing/pages/Payments";
import Transactions from "../pages/billing/pages/Transactions";
import Grids from "../pages/grids/Grids";
import Items from "../pages/items/Items";
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
