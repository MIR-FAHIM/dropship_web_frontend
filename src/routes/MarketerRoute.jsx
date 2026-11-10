import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, setToken, useCurrentToken } from "../redux/slices/authSlice";
import { getFromLocalstorage } from "../utils/localstorage.utils";
import { toast } from "sonner";

const MarketerRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const reduxToken = useSelector(useCurrentToken);
  const localToken = getFromLocalstorage("token");
  const localUser = getFromLocalstorage("user");

  // Rehydrate Redux from localStorage if needed
  if (!reduxToken && localToken) {
    dispatch(setToken({
      token: localToken,
      userId: getFromLocalstorage("userId"),
      user: localUser,
    }));
  }

  if (!reduxToken && !localToken) {
    toast.error("অনুগ্রহ করে লগইন করুন", { id: "auth-login-required", duration: 2000 });
    dispatch(logout());
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isMarketer = localUser?.user_type === "marketer" || localUser?.role === "marketer";
  if (!isMarketer) {
    if (localUser?.user_type === "dropshipper") {
      return <Navigate to="/app/dashboard-new" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default MarketerRoute;
