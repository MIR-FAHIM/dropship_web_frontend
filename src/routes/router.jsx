import { createBrowserRouter } from "react-router-dom";
// route generator func
// import { routeGenerator } from "../utils/routeGenerator";
import App from "../App";
import Login from "../pages/auth/Login";
import PrivateRoute from "./PrivateRoute";
import { routeGenerator } from "../utils/routeGenerator";
import { pagePaths } from "./pages.routes";
// import { pagePaths } from "./pages.routes";

export const router = createBrowserRouter([
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
