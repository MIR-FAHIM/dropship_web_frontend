import React, { useState } from "react";
import { UserPlus, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDropshipperRegisterMutation } from "../../redux/features/auth";
import { toast } from "sonner";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [register, { isLoading }] = useDropshipperRegisterMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await register(formData).unwrap();
      toast.success(res?.message || "রেজিস্ট্রেশন সফল হয়েছে!");
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
      });
      navigate("/login");
    } catch (err) {
      toast.error(err?.data?.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে!");
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
          <p className="mt-2 text-gray-500 text-sm">
            ড্রপশিপার হিসেবে রেজিস্টার করুন
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#158E72]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                ড্রপশিপার রেজিস্ট্রেশন
              </h2>
              <p className="text-xs text-gray-500">
                নতুন অ্যাকাউন্ট তৈরি করুন
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                পুরো নাম
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="আপনার পুরো নাম"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#158E72] focus:border-transparent transition"
              />
            </div>

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

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ফোন নম্বর
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="০১XXXXXXXXX"
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
                  placeholder="কমপক্ষে ৮ অক্ষর"
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

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ঠিকানা
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="আপনার ঠিকানা লিখুন"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#158E72] focus:border-transparent transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#158E72] text-white py-3 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  রেজিস্টার করুন <ArrowRight className="w-4 h-4" />
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

          {/* Login */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">ইতোমধ্যে অ্যাকাউন্ট আছে?</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full border-2 border-[#158E72] text-[#158E72] py-3 rounded-lg font-semibold text-sm hover:bg-emerald-50 transition flex items-center justify-center gap-2"
            >
              লগইন করুন <ArrowRight className="w-4 h-4" />
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

export default RegisterPage;
