import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { logout, useCurrentToken } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch();
  const token = useSelector(useCurrentToken);

  if (!token) {
    toast.error("Please login", { duration: 2000 });
    dispatch(logout());
    return <Navigate to="/login" replace={true} />;
  }
  return children;
};

export default PrivateRoute;
