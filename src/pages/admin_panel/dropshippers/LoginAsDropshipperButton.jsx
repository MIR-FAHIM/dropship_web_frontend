import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "react-toastify";
import { useLoginAsDropshipperMutation } from "../../../redux/features/auth";
import { openDropshipperTab } from "../../../utils/impersonation";

/**
 * "লগইন করুন": opens the dropshipper's panel in a new tab, signed in as them.
 * The admin's own session (this tab and others) is not changed. See utils/impersonation.js.
 */
const LoginAsDropshipperButton = ({ user, size = "sm", className = "" }) => {
  const [loginAsDropshipper] = useLoginAsDropshipperMutation();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (!user?.id) {
      toast.error("ড্রপশিপারের তথ্য পাওয়া যায়নি!");
      return;
    }

    // Open the tab now, inside the click, so the browser does not block it.
    const tab = window.open("", "_blank");
    if (tab) {
      tab.document.title = "লগইন হচ্ছে…";
      tab.document.body.innerHTML = '<p style="font-family:sans-serif;padding:24px;color:#555">লগইন হচ্ছে…</p>';
    }

    setLoading(true);
    try {
      const payload = { id: user.id, user_id: user.id };
      if (user.email) payload.email = user.email;
      if (user.phone || user.mobile) payload.phone = user.phone || user.mobile;

      const res = await loginAsDropshipper(payload).unwrap();
      const token = res?.data?.token || res?.token;
      const loggedUser = res?.data?.user || res?.user || user;
      if (!token) throw new Error(res?.message || "লগইন টোকেন পাওয়া যায়নি!");

      if (!openDropshipperTab(tab, { token, user: loggedUser })) {
        toast.error("নতুন ট্যাব খোলা যায়নি। ব্রাউজারে পপ-আপ অনুমতি দিন।");
        return;
      }
      toast.success(`${loggedUser?.name || "ড্রপশিপার"}-এর প্যানেল নতুন ট্যাবে খোলা হয়েছে`);
    } catch (err) {
      tab?.close();
      toast.error(err?.data?.message || err?.message || "লগইন ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
  };
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      title={`${user?.name || "ড্রপশিপার"} এর প্যানেলে লগইন করুন (নতুন ট্যাবে)`}
      className={`inline-flex items-center whitespace-nowrap rounded-lg border border-blue-500 font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size] || sizes.sm} ${className}`}
    >
      {loading ? <Loader2 className={`${icon} animate-spin`} /> : <LogIn className={icon} />}
      <span>{loading ? "অপেক্ষা করুন..." : "লগইন করুন"}</span>
    </button>
  );
};

export default LoginAsDropshipperButton;
