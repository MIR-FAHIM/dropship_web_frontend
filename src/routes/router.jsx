import { createBrowserRouter } from "react-router-dom";
// route generator func
// import { routeGenerator } from "../utils/routeGenerator";
import App from "../App";
// import { pagePaths } from "./pages.routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // children: routeGenerator(pagePaths),
  },
  {
    path: "*",
    element: <p>Page not found!</p>,
  },
]);
