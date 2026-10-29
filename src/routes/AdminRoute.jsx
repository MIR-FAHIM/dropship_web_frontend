import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useCheckAdminQuery } from "../redux/features/auth";
import { logout } from "../redux/slices/authSlice";
import { getFromLocalstorage, removeFromLocalstorage } from "../utils/localstorage.utils";

const AdminRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const token = getFromLocalstorage("token");
  const userId = getFromLocalstorage("userId");

  const hasCredentials = Boolean(token && userId);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useCheckAdminQuery(undefined, {
    skip: !hasCredentials,
    refetchOnMountOrArgChange: true,
  });

  const isUnauthorized =
    !hasCredentials ||
    isError ||
    (data && data?.status !== "success") ||
    (data && !data?.data?.is_admin);

  useEffect(() => {
    if (hasCredentials && (isError || (data && !data?.data?.is_admin))) {
      removeFromLocalstorage("token");
      removeFromLocalstorage("userId");
      dispatch(logout());

      const msg =
        error?.data?.message ||
        "অ্যাডমিন অনুমতি নেই। অনুগ্রহ করে অ্যাডমিন একাউন্টে লগইন করুন।";
      toast.error(msg, { id: "admin-auth-denied", duration: 3000 });
    }
  }, [hasCredentials, isError, data, error, dispatch]);

  if (!hasCredentials) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-red-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">
              অ্যাডমিন অ্যাক্সেস যাচাই করা হচ্ছে
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              অনুগ্রহ করে অপেক্ষা করুন...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-red-400 font-medium pt-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying admin credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminRoute;
