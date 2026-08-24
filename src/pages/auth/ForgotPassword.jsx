import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useForgotPasswordMutation, useResetPasswordMutation } from "../../redux/features/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resendDelayMs = 2 * 60 * 1000;

const getResponseData = (response) => response?.data?.data || response?.data || response;

const getApiErrorMessage = (error, fallback) => {
  const data = error?.data || error;
  if (data?.message) return data.message;

  const errors = data?.errors;
  if (errors && typeof errors === "object") {
    const firstError = Object.values(errors).flat().find(Boolean);
    if (firstError) return String(firstError);
  }

  return fallback;
};

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || "";
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(initialEmail);
  const [otpInfo, setOtpInfo] = useState(null);
  const [expiresAtMs, setExpiresAtMs] = useState(null);
  const [resendAvailableAtMs, setResendAvailableAtMs] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [form, setForm] = useState({
    otp: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotPassword, { isLoading: sendingOtp }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resettingPassword }] = useResetPasswordMutation();

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const otpExpiresIn = useMemo(() => {
    if (!expiresAtMs) return null;
    return Math.max(0, Math.ceil((expiresAtMs - nowMs) / 1000));
  }, [expiresAtMs, nowMs]);

  const resendRemaining = useMemo(() => {
    if (!resendAvailableAtMs) return 0;
    return Math.max(0, Math.ceil((resendAvailableAtMs - nowMs) / 1000));
  }, [resendAvailableAtMs, nowMs]);

  const validateEmail = () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) return "Email is required";
    if (!emailPattern.test(cleanEmail)) return "Please enter a valid email address";
    return "";
  };

  const requestOtp = async () => {
    const validationError = validateEmail();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setMessage("");

    try {
      const response = await forgotPassword({ email: email.trim() }).unwrap();
      const data = getResponseData(response);
      const nextExpiresAt = data?.expires_at ? Date.parse(data.expires_at) : null;

      setOtpInfo(data);
      setExpiresAtMs(Number.isNaN(nextExpiresAt) ? null : nextExpiresAt);
      setResendAvailableAtMs(Date.now() + resendDelayMs);
      setStep("otp");
      setMessage(`OTP sent to ${data?.phone || "your registered mobile number"}`);
      toast.success(response?.message || "Password reset OTP sent successfully");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Could not send password reset OTP"));
      toast.error(getApiErrorMessage(error, "Could not send password reset OTP"));
    }
  };

  const validateResetForm = () => {
    if (!/^\d{6}$/.test(form.otp)) return "OTP must be exactly 6 digits";
    if (!form.password) return "New password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password_confirmation !== form.password) return "Confirm password must match new password";
    return "";
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    const validationError = validateResetForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setMessage("");

    try {
      const response = await resetPassword({
        email: email.trim(),
        otp: form.otp,
        password: form.password,
        password_confirmation: form.password_confirmation,
      }).unwrap();

      toast.success(response?.message || "Password reset successfully");
      navigate("/login", {
        replace: true,
        state: {
          email: email.trim(),
          passwordReset: true,
        },
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Password reset failed"));
      toast.error(getApiErrorMessage(error, "Password reset failed"));
    }
  };

  const handleChangeEmail = () => {
    setStep("email");
    setOtpInfo(null);
    setExpiresAtMs(null);
    setResendAvailableAtMs(null);
    setForm({ otp: "", password: "", password_confirmation: "" });
    setMessage("");
    setErrorMessage("");
  };

  const updateOtp = (event) => {
    setForm((prev) => ({
      ...prev,
      otp: event.target.value.replace(/\D/g, "").slice(0, 6),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="cursor-pointer text-3xl font-bold text-[#158E72]" onClick={() => navigate("/")}>
            ResellerBrain
          </h1>
          <p className="mt-2 text-sm text-gray-500">Reset your password with mobile OTP verification</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              {step === "email" ? <Mail className="h-5 w-5 text-[#158E72]" /> : <ShieldCheck className="h-5 w-5 text-[#158E72]" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{step === "email" ? "Forgot Password" : "Verify OTP"}</h2>
              <p className="text-xs text-gray-500">
                {step === "email" ? "Enter your login email to receive an OTP" : "Set a new password for your account"}
              </p>
            </div>
          </div>

          {message && (
            <div className="mb-4 flex gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {step === "email" ? (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                requestOtp();
              }}
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="example@email.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#158E72]"
                />
              </div>

              <button
                type="submit"
                disabled={sendingOtp}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#158E72] py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingOtp ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {sendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
                <div className="flex items-start gap-3">
                  <KeyRound className="mt-0.5 h-5 w-5 text-[#158E72]" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">OTP sent to {otpInfo?.phone || "your registered mobile"}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {otpExpiresIn === null
                        ? "Use the latest OTP before it expires."
                        : otpExpiresIn > 0
                          ? `OTP expires in ${formatTime(otpExpiresIn)}`
                          : "OTP expired. Please resend a new OTP."}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">OTP</label>
                <input
                  value={form.otp}
                  onChange={updateOtp}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6 digit OTP"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg font-bold tracking-[0.35em] transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#158E72]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#158E72]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.password_confirmation}
                    onChange={(event) => setForm((prev) => ({ ...prev, password_confirmation: event.target.value }))}
                    placeholder="Re-enter new password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#158E72]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={resettingPassword}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#158E72] py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resettingPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {resettingPassword ? "Resetting Password..." : "Reset Password"}
              </button>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={sendingOtp || resendRemaining > 0}
                  className="rounded-lg border border-[#158E72] px-4 py-2.5 text-sm font-semibold text-[#158E72] transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingOtp ? "Sending..." : resendRemaining > 0 ? `Resend in ${formatTime(resendRemaining)}` : "Resend OTP"}
                </button>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Change email
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-gray-100 pt-5">
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-[#158E72] hover:text-emerald-800">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} ResellerBrain. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
