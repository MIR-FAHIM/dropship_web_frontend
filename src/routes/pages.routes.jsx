import Grids from "../pages/grids/Grids";
import Items from "../pages/items/Items";
import Orders from "../pages/orders/Orders";
import Overview from "../pages/overview/Overview";
import Requests from "../pages/requests/Requests";
import Users from "../pages/users/Users";

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
    ],
  },
];
