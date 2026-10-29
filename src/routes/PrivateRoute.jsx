import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { logout, setToken, useCurrentToken } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { getFromLocalstorage } from "../utils/localstorage.utils";

const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const reduxToken = useSelector(useCurrentToken);
  const localToken = getFromLocalstorage("token");

  // If Redux lost state but token exists in localStorage, rehydrate Redux
  if (!reduxToken && localToken) {
    const localUserId = getFromLocalstorage("userId");
    const localUser = getFromLocalstorage("user");
    dispatch(
      setToken({
        token: localToken,
        userId: localUserId,
        user: localUser,
      })
    );
    return children;
  }

  // If neither has a token, redirect to login
  if (!reduxToken && !localToken) {
    toast.error("অনুগ্রহ করে লগইন করুন", { id: "auth-login-required", duration: 2000 });
    dispatch(logout());
    return <Navigate to="/login" state={{ from: location }} replace={true} />;
  }

  return children;
};

export default PrivateRoute;
