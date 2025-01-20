import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/auth/Login";
import PrivateRoute from "./PrivateRoute";
import { pagePaths } from "./pages.routes";
// route generator func
import { routeGenerator } from "../utils/routeGenerator";

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
