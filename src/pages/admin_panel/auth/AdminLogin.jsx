import React, { useState } from "react";
import { LogIn, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoginMutation } from "../../../redux/features/auth";
import { saveToLocalstorage } from "../../../utils/localstorage.utils";
import { useDispatch } from "react-redux";
import { setToken } from "../../../redux/slices/authSlice";
import { toast } from "sonner";
import AccountActivationModal from "../../../components/shared/AccountActivationModal";

const isActivationRequired = (dataOrMsg) => {
  if (!dataOrMsg) return false;
  if (typeof dataOrMsg === "object") {
    const msg = dataOrMsg?.message || "";
    if (isActivationRequired(msg)) return true;
    if (dataOrMsg?.status === "failed" && isActivationRequired(msg)) return true;
    return false;
  }
  const str = String(dataOrMsg).toLowerCase();
  return (
    str.includes("activate your account") ||
    str.includes("activate account") ||
    str.includes("account activation") ||
    str.includes("need to activate")
  );
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loginFunc, { isLoading }] = useLoginMutation();
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [activationMessage, setActivationMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginFunc(formData).unwrap();
      if (res?.status === "failed") {
        if (isActivationRequired(res)) {
          setActivationMessage(res?.message || "You need to activate your account");
          setActivationModalOpen(true);
          return;
        }
        toast.error(res?.message || "Login failed!");
        return;
      }

      const loggedUser = res?.data?.user;
      const roles = [
        loggedUser?.user_type?.toLowerCase(),
        loggedUser?.role?.toLowerCase(),
      ].filter(Boolean);

      const allowedAdminRoles = ["admin", "superadmin", "product manager"];
      const isAdmin = roles.some((r) => allowedAdminRoles.includes(r));

      if (!isAdmin) {
        toast.error("এই অ্যাকাউন্টের অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই।");
        return;
      }

      dispatch(setToken({ token: res.data.token }));
      saveToLocalstorage("token", res.data.token);
      saveToLocalstorage("userId", res.data.user.id);
      toast.success(res?.message || "Admin login successful!");

      const target = location.state?.from?.pathname || "/admin-panel";
      navigate(target, { replace: true });
    } catch (err) {
      const errorData = err?.data || err;
      if (isActivationRequired(errorData) || isActivationRequired(err?.message)) {
        const msg = errorData?.message || err?.message || "You need to activate your account";
        setActivationMessage(msg);
        setActivationModalOpen(true);
        return;
      }
      toast.error(errorData?.message || "Login failed!");
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-red-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
            ResellerBrain
          </h1>
          <p className="mt-2 text-gray-500 text-sm">Admin Panel Login</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Admin Login</h2>
              <p className="text-xs text-gray-500">Sign in to the admin panel</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} ResellerBrain. All rights reserved.
        </p>
      </div>
    </div>
      <AccountActivationModal
        isOpen={activationModalOpen}
        onClose={() => setActivationModalOpen(false)}
        message={activationMessage || "You need to activate your account"}
        userEmail={formData.email}
        supportNumber="01941606310"
      />
    </>
  );
};

export default AdminLogin;
