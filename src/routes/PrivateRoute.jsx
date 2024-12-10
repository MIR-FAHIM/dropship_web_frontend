import { logout, useCurrentUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

const PrivateRoute = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(useCurrentUser);

  if (user.token) {
    toast.error("Please sign in", { duration: 2000 });
    dispatch(logout());
    return <Navigate to="/sign-in" replace={true} />;
  }
  return children;
};

export default PrivateRoute;
