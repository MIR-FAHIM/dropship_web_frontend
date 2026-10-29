import React, { useEffect, useState } from "react";
import { LogIn, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useLoginMutation } from "../../redux/features/auth";
import { saveToLocalstorage } from "../../utils/localstorage.utils";
import { useDispatch } from "react-redux";
import { setToken } from "../../redux/slices/authSlice";
import { toast } from "sonner";
import AccountActivationModal from "../../components/shared/AccountActivationModal";

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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("rememberMe") !== "false";
  });
  const [formData, setFormData] = useState({
    email: location.state?.email || localStorage.getItem("rememberedEmail") || "",
    password: "",
  });
  const [loginFunc, { isLoading }] = useLoginMutation();
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [activationMessage, setActivationMessage] = useState("");

  useEffect(() => {
    if (location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
    }

    if (location.state?.passwordReset) {
      toast.success("Password reset successfully. Please login with your new password.");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginPayload = {
        email: formData.email.trim(),
        password: formData.password,
        remember: rememberMe,
      };
      const res = await loginFunc(loginPayload).unwrap();
      if (res?.status === "failed") {
        if (isActivationRequired(res)) {
          setActivationMessage(res?.message || "You need to activate your account");
          setActivationModalOpen(true);
          return;
        }
        toast.error(res?.message || "লগইন ব্যর্থ হয়েছে!");
        return;
      }

      // Persist remember preference and email
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberedEmail", formData.email.trim());
      } else {
        localStorage.setItem("rememberMe", "false");
        localStorage.removeItem("rememberedEmail");
      }

      const token = res.data?.token;
      const user = res.data?.user;
      const userId = user?.id;

      dispatch(setToken({ token, user, userId }));
      saveToLocalstorage("token", token);
      saveToLocalstorage("userId", userId);
      if (user) {
        saveToLocalstorage("user", user);
      }

      toast.success(res?.message || "লগইন সফল হয়েছে!");

      const destination =
        location.state?.from?.pathname ||
        (user?.user_type === "dropshipper" ? "/app/dashboard-new" : "/");
      navigate(destination, { replace: true });
    } catch (err) {
      const errorData = err?.data || err;
      if (isActivationRequired(errorData) || isActivationRequired(err?.message)) {
        const msg = errorData?.message || err?.message || "You need to activate your account";
        setActivationMessage(msg);
        setActivationModalOpen(true);
        return;
      }
      toast.error(errorData?.message || "লগইন ব্যর্থ হয়েছে!");
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-[#158E72] cursor-pointer"
            onClick={() => navigate("/")}
          >
            ResellerBrain
          </h1>
          <p className="mt-2 text-gray-500 text-sm">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-[#158E72]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">লগইন</h2>
              <p className="text-xs text-gray-500">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                ইমেইল
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="username"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#158E72] focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="আপনার পাসওয়ার্ড দিন"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#158E72] focus:border-transparent transition pr-12"
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

            {/* Remember Me & Forgot password */}
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="rememberMe" className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800 select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#158E72]"
                />
                <span>আমাকে মনে রাখুন</span>
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password", { state: { email: formData.email } })}
                className="text-[#158E72] hover:text-emerald-800 font-medium"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>

            {/* Privacy Policy & Terms Agreement */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agree-policy"
                checked={agreedToPolicy}
                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#158E72]"
              />
              <label htmlFor="agree-policy" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                আমি{" "}
                <Link
                  to="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#158E72] hover:text-emerald-800 underline font-medium"
                >
                  Privacy Policy
                </Link>
                {" "}এবং{" "}
                <Link
                  to="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#158E72] hover:text-emerald-800 underline font-medium"
                >
                  Terms &amp; Conditions
                </Link>
                {" "}পড়েছি এবং সম্মত আছি।
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !agreedToPolicy}
              className="w-full bg-[#158E72] text-white py-3 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  লগইন করুন <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">অথবা</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              এখনো অ্যাকাউন্ট নেই?
            </p>
            <button
              onClick={() => navigate("/register")}
              className="w-full border-2 border-[#158E72] text-[#158E72] py-3 rounded-lg font-semibold text-sm hover:bg-emerald-50 transition flex items-center justify-center gap-2"
            >
              এখনই রেজিস্টার করুন <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} ResellerBrain। সর্বস্বত্ব সংরক্ষিত।
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

export default Login;
