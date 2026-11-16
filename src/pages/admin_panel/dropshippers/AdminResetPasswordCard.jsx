import { useState } from "react";
import { KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAdminResetPasswordMutation } from "../../../redux/features/user";
import PasswordInput, { fieldErrorsFrom, MIN_PASSWORD_LENGTH } from "../../../components/shared/PasswordInput";

const EMPTY = { password: "", password_confirmation: "", note: "" };

// Admin sets a new password for one dropshipper. The change is written to the password log.
const AdminResetPasswordCard = ({ dropshipper }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [adminResetPassword, { isLoading }] = useAdminResetPasswordMutation();

  const setField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = {};
    if (!form.password) clientErrors.password = "নতুন পাসওয়ার্ড দিন।";
    else if (form.password.length < MIN_PASSWORD_LENGTH) clientErrors.password = `পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`;
    if (form.password !== form.password_confirmation) clientErrors.password_confirmation = "দুটি পাসওয়ার্ড মিলছে না।";
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    const name = dropshipper?.name || `#${dropshipper?.id}`;
    if (!window.confirm(`${name}-এর পাসওয়ার্ড পরিবর্তন করবেন? তাকে সব ডিভাইস থেকে লগআউট করা হবে।`)) return;

    try {
      const res = await adminResetPassword({ id: dropshipper.id, ...form }).unwrap();
      toast.success(res?.message || "পাসওয়ার্ড রিসেট হয়েছে");
      setForm(EMPTY);
      setErrors({});
    } catch (err) {
      const serverErrors = fieldErrorsFrom(err);
      setErrors(serverErrors);
      if (!Object.keys(serverErrors).length) toast.error(err?.data?.message || "পাসওয়ার্ড রিসেট করা যায়নি");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5">
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          নতুন পাসওয়ার্ড সেট করলে ড্রপশিপারকে সব ডিভাইস থেকে লগআউট করা হবে। পাসওয়ার্ডটি নিরাপদ উপায়ে তাকে জানিয়ে দিন। এই কাজটি লগে আপনার নামে রেকর্ড হবে।
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordInput
          id="admin_new_password"
          label="নতুন পাসওয়ার্ড"
          value={form.password}
          onChange={setField("password")}
          error={errors.password}
          hint={`কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষর`}
        />
        <PasswordInput
          id="admin_confirm_password"
          label="পাসওয়ার্ড নিশ্চিত করুন"
          value={form.password_confirmation}
          onChange={setField("password_confirmation")}
          error={errors.password_confirmation}
        />
      </div>
      <div>
        <label htmlFor="admin_reset_note" className="mb-1.5 block text-sm font-medium text-gray-700">
          কারণ / নোট <span className="font-normal text-gray-400">(ঐচ্ছিক, লগে দেখাবে)</span>
        </label>
        <input
          id="admin_reset_note"
          type="text"
          maxLength={250}
          value={form.note}
          onChange={(e) => setField("note")(e.target.value)}
          placeholder="যেমন: ফোনে অনুরোধ করেছেন, পাসওয়ার্ড ভুলে গেছেন"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {errors.note && <p className="mt-1 text-xs text-rose-600">{errors.note}</p>}
      </div>
      <button
        type="submit"
        disabled={isLoading || !dropshipper?.id}
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        নতুন পাসওয়ার্ড সেট করুন
      </button>
    </form>
  );
};

export default AdminResetPasswordCard;
