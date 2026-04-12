import React, { useState } from "react";
import { LogIn, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../redux/features/auth";
import { saveToLocalstorage } from "../../utils/localstorage.utils";
import { useDispatch } from "react-redux";
import { setToken } from "../../redux/slices/authSlice";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loginFunc, { isLoading }] = useLoginMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginFunc(formData).unwrap();
      dispatch(setToken({ token: res.data.token }));
      saveToLocalstorage("token", res.data.token);
      saveToLocalstorage("userId", res.data.user.id);
      toast.success(res?.message || "লগইন সফল হয়েছে!");
      if (res.data.user.user_type === "dropshipper") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.data?.message || "লগইন ব্যর্থ হয়েছে!");
    }
  };

  return (
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ইমেইল
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#158E72] focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
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

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-[#158E72] hover:text-emerald-800 font-medium"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
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
  );
};

export default Login;
