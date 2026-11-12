import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import { useEditUserProfileMutation } from "../../../redux/features/user";

const EditDropshipperModal = ({ user, onClose }) => {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    password: "",
  });
  const [editUserProfile, { isLoading }] = useEditUserProfileMutation();
  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(Object.entries(form).filter(([key, value]) => key !== "password" || value));
    try {
      const result = await editUserProfile({ id: user.id, ...payload }).unwrap();
      toast.success(result?.message || "ড্রপশিপারের তথ্য আপডেট হয়েছে");
      onClose();
    } catch (error) {
      const message = error?.data?.errors
        ? Object.values(error.data.errors).flat().join(" ")
        : error?.data?.message || "তথ্য আপডেট করা যায়নি";
      toast.error(message);
    }
  };

  const inputClass = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
  const fields = [
    ["name", "নাম", "text"],
    ["email", "ইমেইল", "email"],
    ["phone", "ফোন", "tel"],
    ["address", "ঠিকানা", "text"],
    ["password", "নতুন পাসওয়ার্ড (ঐচ্ছিক)", "password"],
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && !isLoading && onClose()}>
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div><h2 className="text-lg font-bold text-gray-900">ড্রপশিপার তথ্য সম্পাদনা</h2><p className="text-xs text-gray-500">ID: #{user.id} · পরিবর্তনগুলো অডিট লগে সংরক্ষিত হবে</p></div>
          <button type="button" onClick={onClose} disabled={isLoading} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {fields.map(([key, label, type]) => (
            <label key={key} className={"text-sm font-medium text-gray-700 " + (key === "address" ? "sm:col-span-2" : "")}>
              {label}
              <input className={inputClass} type={type} value={form[key]} onChange={setField(key)} required={key === "name" || key === "email"} minLength={key === "password" ? 8 : undefined} autoComplete={key === "password" ? "new-password" : undefined} />
            </label>
          ))}
          <p className="sm:col-span-2 text-xs text-gray-500">পাসওয়ার্ড পরিবর্তন করলে নিরাপত্তার জন্য লগে পাসওয়ার্ডের মান রাখা হবে না।</p>
        </div>
        <div className="flex justify-end gap-2 border-t bg-gray-50 px-5 py-4">
          <button type="button" onClick={onClose} disabled={isLoading} className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-white">বাতিল</button>
          <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} সংরক্ষণ
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDropshipperModal;