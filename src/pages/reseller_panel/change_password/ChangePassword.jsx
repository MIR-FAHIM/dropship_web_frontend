import { useState } from "react";
import { Info, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useChangeOwnPasswordMutation } from "../../../redux/features/user";
import PasswordInput, { fieldErrorsFrom, MIN_PASSWORD_LENGTH } from "../../../components/shared/PasswordInput";

const EMPTY = { current_password: "", password: "", password_confirmation: "" };

const validate = (form) => {
  const errors = {};
  if (!form.current_password) errors.current_password = "বর্তমান পাসওয়ার্ড দিন।";
  if (!form.password) errors.password = "নতুন পাসওয়ার্ড দিন।";
  else if (form.password.length < MIN_PASSWORD_LENGTH) errors.password = `পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`;
  else if (form.password === form.current_password) errors.password = "নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ড থেকে আলাদা হতে হবে।";
  if (!form.password_confirmation) errors.password_confirmation = "নতুন পাসওয়ার্ডটি আবার লিখুন।";
  else if (form.password && form.password !== form.password_confirmation) errors.password_confirmation = "দুটি পাসওয়ার্ড মিলছে না।";
  return errors;
};

const ChangePassword = () => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [changeOwnPassword, { isLoading }] = useChangeOwnPasswordMutation();

  const setField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    try {
      const res = await changeOwnPassword(form).unwrap();
      toast.success(res?.message || "পাসওয়ার্ড পরিবর্তন হয়েছে");
      setForm(EMPTY);
      setErrors({});
    } catch (err) {
      const serverErrors = fieldErrorsFrom(err);
      setErrors(serverErrors);
      if (!Object.keys(serverErrors).length) {
        toast.error(err?.data?.message || "পাসওয়ার্ড পরিবর্তন করা যায়নি");
      }
    }
  };

  return (
    <div className="mx-auto max-w-lg p-4 sm:p-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">পাসওয়ার্ড পরিবর্তন</h1>
            <p className="text-xs text-gray-500">Change your account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5">
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>পাসওয়ার্ড কমপক্ষে {MIN_PASSWORD_LENGTH} digit হতে হবে।</span>
          </div>
          <PasswordInput
            id="current_password"
            label="বর্তমান পাসওয়ার্ড (Old password)"
            value={form.current_password}
            onChange={setField("current_password")}
            error={errors.current_password}
            autoComplete="current-password"
          />
          <PasswordInput
            id="password"
            label="নতুন পাসওয়ার্ড (New password)"
            value={form.password}
            onChange={setField("password")}
            error={errors.password}
            hint={`কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষর`}
          />
          <PasswordInput
            id="password_confirmation"
            label="নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm password)"
            value={form.password_confirmation}
            onChange={setField("password_confirmation")}
            error={errors.password_confirmation}
          />

          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>পাসওয়ার্ড পরিবর্তনের পর অন্য সব ডিভাইস থেকে আপনাকে লগআউট করা হবে। এই ডিভাইসে আপনি লগইন থাকবেন।</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            পাসওয়ার্ড পরিবর্তন করুন
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
