import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, RefreshCw } from "lucide-react";
import { useGetUserDetailsQuery } from "../redux/features/user";
import { getFromLocalstorage } from "../utils/localstorage.utils";
import { isVendorHistoryUser } from "../utils/vendorOrderHistory.utils";

const VendorHistoryRoute = ({ children }) => {
  const token = getFromLocalstorage("token");
  const userId = getFromLocalstorage("userId");
  const location = useLocation();
  const { currentData, isFetching, isError, error, refetch } = useGetUserDetailsQuery(userId, { skip: !token || !userId });
  if (!token || !userId || error?.status === 401) return <Navigate to="/vendor-login" replace state={{ from: location }} />;
  if (isFetching) return <div role="status" className="flex items-center justify-center gap-2 py-20 text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin" />Checking vendor access...</div>;
  if (isError || currentData?.status !== "success") return (
    <div role="alert" className="py-10 text-center text-sm text-red-700">
      <p>{error?.data?.message || "Unable to verify vendor access."}</p>
      <button type="button" onClick={refetch} disabled={isFetching} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 disabled:opacity-50"><RefreshCw className="h-4 w-4" />Retry</button>
    </div>
  );
  if (!isVendorHistoryUser(currentData.data)) return <Navigate to="/" replace />;
  return children;
};

VendorHistoryRoute.propTypes = { children: PropTypes.node.isRequired };
export default VendorHistoryRoute;
