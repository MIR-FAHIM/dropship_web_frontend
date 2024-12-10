import { createBrowserRouter } from "react-router-dom";
// route generator func
// import { routeGenerator } from "../utils/routeGenerator";
import App from "../App";
import Login from "../pages/auth/Login";
// import { pagePaths } from "./pages.routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // children: routeGenerator(pagePaths),
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
