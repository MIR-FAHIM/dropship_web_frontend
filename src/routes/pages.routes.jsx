import Requests from "../pages/request/Requests";

export const pagePaths = [
  {
    path: "/",
    element: "",
    children: [
      {
        path: "/requests",
        element: <Requests />,
      },
    ],
  },
];
