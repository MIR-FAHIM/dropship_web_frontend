import React, { useState, useEffect } from "react";
import {
  Globe,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Loader2,
  Save,
  Radio,
  Store,
  Layers,
  ArrowRight,
  Send,
  Headphones,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import {
  useGetPartnerStoreQuery,
  useSavePartnerStoreMutation,
  useRegeneratePartnerSecretMutation,
  useTestPartnerWebhookMutation,
} from "../../../redux/features/partnerStore";

export default function MyWebsitePage() {
  const { data: storeResponse, isLoading, isFetching, refetch } = useGetPartnerStoreQuery();
  const [savePartnerStore, { isLoading: isSaving }] = useSavePartnerStoreMutation();
  const [regenerateSecret, { isLoading: isRegenerating }] = useRegeneratePartnerSecretMutation();
  const [testWebhook, { isLoading: isTestingWebhook }] = useTestPartnerWebhookMutation();

  const store = storeResponse?.data?.store || null;
  const hasStore = storeResponse?.data?.has_store || false;

  const [formData, setFormData] = useState({
    store_name: "",
    store_domain: "",
    store_url: "",
    webhook_url: "",
    is_active: true,
  });

  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  useEffect(() => {
    if (store) {
      setFormData({
        store_name: store.store_name || "",
        store_domain: store.store_domain || "",
        store_url: store.store_url || "",
        webhook_url: store.webhook_url || "",
        is_active: store.is_active ?? true,
      });
    }
  }, [store]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} ক্লিপবোর্ডে কপি করা হয়েছে!`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.store_name.trim()) {
      toast.error("অনুগ্রহ করে আপনার স্টোরের নাম লিখুন");
      return;
    }

    try {
      const res = await savePartnerStore(formData).unwrap();
      toast.success(res.message || "ওয়েবসাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
    } catch (err) {
      const errMsg = err?.data?.message || "সংরক্ষণ করতে সমস্যা হয়েছে";
      toast.error(errMsg);
    }
  };

  const handleRegenerateSecretConfirm = async () => {
    try {
      const res = await regenerateSecret().unwrap();
      setShowRegenerateModal(false);
      toast.success(res.message || "নতুন API Secret জেনারেট হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "API Secret পরিবর্তন করা যায়নি");
    }
  };

  const handleTestWebhook = async () => {
    if (!store?.webhook_url) {
      toast.error("আগে Webhook URL কনফিগার করে সেভ করুন");
      return;
    }
    try {
      const res = await testWebhook({
        "X-RB-API-KEY": store.api_key,
        "X-RB-API-SECRET": store.api_secret,
      }).unwrap();
      if (res.status === "success") {
        toast.success("Webhook টেস্ট সফল হয়েছে! স্টোর রেসপন্স পাঠিয়েছে।");
      } else {
        toast.error("Webhook রেসপন্স পেতে ব্যর্থ হয়েছে");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Webhook কানেকশন এরর");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-500">স্টোর ও API তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16 pt-3 px-3 sm:px-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            <span>Dedicated Dropshipping Website Engine</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            আমার নিজস্ব ওয়েবসাইট ও পার্টনার API
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-blue-100 sm:text-base">
            আপনার নিজস্ব ডোমেইনে চলা আলাদা ই-কমার্স ওয়েবসাইটের সাথে ResellerBrain সরাসরি কানেক্ট করুন। আপনার সাইটে কাস্টমার অর্ডার করলে অটোমেটিক্যালি ResellerBrain এ পৌঁছাবে এবং আমরা আপনার ব্র্যান্ড নামে কুরিয়ারে ক্যাশ অন ডেলিভারিতে পাঠিয়ে দেব।
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Connection Status Bar (If store is created) */}
      {hasStore && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${store?.is_active ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
              <Radio className={`h-5 w-5 ${store?.is_active ? "animate-pulse" : ""}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{store?.store_name}</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${store?.is_active ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {store?.is_active ? "সক্রিয় (Connected)" : "স্থগিত (Inactive)"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {store?.last_sync_at
                  ? `সর্বশেষ সিঙ্কঃ ${new Date(store.last_sync_at).toLocaleString("bn-BD")}`
                  : "এখনও কোনো রিকোয়েস্ট আসেনি (Waiting for first API request)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {store?.store_url && (
              <a
                href={store.store_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              >
                <Globe className="h-3.5 w-3.5 text-gray-500" />
                <span>ওয়েবসাইটে যান</span>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            )}
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-gray-500 ${isFetching ? "animate-spin" : ""}`} />
              <span>রিফ্রেশ</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Form + API Credentials */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Store Configuration Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">স্টোর সেটিংস (Store Setup)</h2>
                <p className="text-xs text-gray-500">আপনার নিজস্ব ই-কমার্স ওয়েবসাইটের বিবরণ সেট করুন</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Store className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  স্টোরের নাম (Store Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমনঃ Tanvir Gadget Shop"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-800 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-400">এই নামটি পার্সেল প্যাকিং স্লিপে প্রেরক হিসেবে মুদ্রিত হবে।</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  কাস্টম ডোমেইন (Custom Domain)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="যেমনঃ tanvirgadget.com"
                    value={formData.store_domain}
                    onChange={(e) => setFormData({ ...formData, store_domain: e.target.value.toLowerCase().trim() })}
                    className="w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-sm font-medium text-gray-800 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  আপনার নিজস্ব ডোমেইন বা সাবডোমেন এখানে লিখুন। DNS ও ডোমেন কানেকশনে আমাদের ডেডিকেটেড ডেভেলপার সরাসরি ফ্রি সহায়তা করবে।
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  ওয়েবসাইট URL (Store URL)
                </label>
                <input
                  type="url"
                  placeholder="https://tanvirgadget.com"
                  value={formData.store_url}
                  onChange={(e) => setFormData({ ...formData, store_url: e.target.value.trim() })}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-800 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Webhook URL (ঐচ্ছিক / Optional)
                  </label>
                  {hasStore && store?.webhook_url && (
                    <button
                      type="button"
                      onClick={handleTestWebhook}
                      disabled={isTestingWebhook}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      <Send className="h-3 w-3" />
                      <span>{isTestingWebhook ? "টেস্টিং..." : "টেস্ট পিং পাঠান"}</span>
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://tanvirgadget.com/api/webhooks/resellerbrain"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value.trim() })}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-800 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-400">অর্ডারের স্ট্যাটাস পরিবর্তন বা কুরিয়ার ডেলিভারি হলে এই লিংকে রিয়েল-টাইম নোটিফিকেশন যাবে।</p>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3.5">
                <div>
                  <span className="text-sm font-semibold text-gray-800">API সংযোগ স্ট্যাটাস</span>
                  <p className="text-xs text-gray-500">অন থাকলে এই ওয়েবসাইটের মাধ্যমে প্রোডাক্ট ও অর্ডার সিঙ্ক হবে</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>সংরক্ষণ করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{hasStore ? "সেটিংস আপডেট করুন" : "API কী তৈরি ও সেভ করুন"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: API Keys Dock */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">API ক্রেডেনশিয়ালস</h2>
                  <p className="text-xs text-gray-500">এই কী দিয়ে আপনার ওয়েবসাইট কানেক্ট হবে</p>
                </div>
              </div>
            </div>

            {hasStore ? (
              <div className="space-y-4">
                {/* API Key */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Live API Key (Public)
                    </label>
                    <span className="text-[11px] font-mono text-gray-400">Header: X-RB-API-KEY</span>
                  </div>
                  <div className="mt-1 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                    <input
                      type="text"
                      readOnly
                      value={store?.api_key || ""}
                      className="w-full bg-transparent px-2.5 py-1.5 font-mono text-xs text-gray-800 outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(store?.api_key, "API Key")}
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-100"
                    >
                      {copiedField === "API Key" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600">কপি!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-gray-500" />
                          <span>কপি</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* API Secret */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Live API Secret (Private)
                    </label>
                    <span className="text-[11px] font-mono text-gray-400">Header: X-RB-API-SECRET</span>
                  </div>
                  <div className="mt-1 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                    <input
                      type={showSecret ? "text" : "password"}
                      readOnly
                      value={store?.api_secret || ""}
                      className="w-full bg-transparent px-2.5 py-1.5 font-mono text-xs text-gray-800 outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="px-2 text-gray-500 hover:text-gray-700"
                      title={showSecret ? "হাইড করুন" : "দেখান"}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(store?.api_secret, "API Secret")}
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-100"
                    >
                      {copiedField === "API Secret" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600">কপি!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-gray-500" />
                          <span>কপি</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Webhook Secret */}
                {store?.webhook_secret && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Webhook Signing Secret
                      </label>
                      <span className="text-[11px] font-mono text-gray-400">HMAC-SHA256</span>
                    </div>
                    <div className="mt-1 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                      <input
                        type="text"
                        readOnly
                        value={store?.webhook_secret}
                        className="w-full bg-transparent px-2.5 py-1.5 font-mono text-xs text-gray-800 outline-none select-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(store?.webhook_secret, "Webhook Secret")}
                        className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-100"
                      >
                        {copiedField === "Webhook Secret" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Warning note */}
                <div className="flex items-start gap-2.5 rounded-xl bg-amber-50/70 p-3 text-xs text-amber-900 border border-amber-200/60">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <p>
                    <strong>নিরাপত্তা সতর্কতাঃ</strong> এই API Secret কারো সাথে শেয়ার করবেন না। এটি শুধুমাত্র আপনার সার্ভার-সাইড এনভায়রনমেন্টে সেভ রাখবেন।
                  </p>
                </div>

                {/* Regenerate Secret Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRegenerateModal(true)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>নতুন সিক্রেট তৈরি করুন (Regenerate API Secret)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Key className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-gray-900">এখনও কোনো কী তৈরি করা হয়নি</h3>
                <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
                  বাম পাশের ফর্মটিতে আপনার স্টোরের নাম লিখে "API কী তৈরি ও সেভ করুন" বাটনে ক্লিক করুন।
                </p>
              </div>
            )}
          </div>

          {/* Dedicated Developer Assistance Highlight Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 p-5 shadow-sm">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl" />

            <div className="relative z-10 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                  <Headphones className="h-3.5 w-3.5 text-emerald-600" />
                  <span>ডেডিকেটেড ডেভেলপার সাপোর্ট</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  সার্বক্ষণিক লাইভ
                </span>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-gray-900 leading-snug">
                  👨‍💻 ওয়েবসাইট চালু ও পরিচালনায় ডেভেলপার সবসময় আপনার পাশে!
                </h3>
                <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
                  আপনার ওয়েবসাইট সম্পূর্ণ সেটআপ, ডোমেন কানেক্ট, লোগো ও ব্যানার কনফিগারেশন এবং যেকোনো টেকনিক্যাল সহায়তায় আমাদের <strong>ডেডিকেটেড ডেভেলপার টিম</strong> সবসময় আপনার সাথে থাকবে। আপনার কোনো কোডিং বা টেকনিক্যাল অভিজ্ঞতার প্রয়োজন নেই — পুরো টেকনিক্যাল দিক আমরাই পরিচালনা করব!
                </p>
              </div>

              {/* Assistance Feature Points */}
              <div className="space-y-2 rounded-xl bg-white/95 p-3 text-xs text-gray-700 border border-emerald-100 shadow-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>ফ্রি কাস্টম ডোমেন বা সাবডোমেন সেটআপ:</strong> আপনার ব্র্যান্ডের নামে ডোমেন কানেকশন সম্পূর্ণ ফ্রি-তে কনফিগার করা হবে।</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>লোগো, ব্যানার ও থিম কাস্টমাইজেশন:</strong> আপনার ব্র্যান্ডের নিজস্ব পরিচয় অনুযায়ী স্টোর সম্পূর্ণ প্রস্তুত থাকবে।</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>অটোমেটিক প্রোডাক্ট ও ক্যাটালগ সিঙ্ক:</strong> পাইকারি মূল্যে ট্রেন্ডিং প্রোডাক্ট রিয়েল-টাইমে আপডেট থাকবে।</span>
                </div>
              </div>

              {/* Direct WhatsApp Action Button */}
              <a
                href={`https://wa.me/8801941606310?text=${encodeURIComponent(
                  `হ্যালো ResellerBrain টিম, আমি আমার dropship ই-কমার্স ওয়েবসাইট সেটআপ ও ডেভেলপার সহায়তা পেতে চাই।\n\nস্টোরের নাম: ${
                    formData.store_name || store?.store_name || "আমার নতুন স্টোর"
                  }\nডোমেন: ${formData.store_domain || store?.store_domain || "এখনও ঠিক করিনি"}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/35 active:scale-[0.99]"
              >
                <FaWhatsapp className="h-4 w-4 sm:h-5 sm:w-5 text-white transition-transform group-hover:scale-110" />
                <span>ডেভেলপারের সাথে সরাসরি WhatsApp-এ কথা বলুন</span>
              </a>

              <p className="text-center text-[11px] text-gray-500">
                সরাসরি হেল্পলাইন ও WhatsApp: <strong className="text-gray-800 font-mono">01941606310</strong>
              </p>
            </div>
          </div>

          {/* Realistic 3-Step Storefront Guide */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>সহজ ৩-ধাপে আপনার নিজস্ব ই-কমার্স ব্র্যান্ড</span>
            </h3>

            <div className="space-y-3.5 text-xs text-gray-600">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  ১
                </span>
                <div>
                  <h4 className="font-bold text-gray-800">স্টোরের নাম ও ডোমেন নির্বাচন</h4>
                  <p className="mt-0.5 text-gray-600 leading-relaxed">
                    আপনার স্টোরের নাম লিখুন এবং আপনার পছন্দের কাস্টম ডোমেন (যেমনঃ <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800 font-mono">yourbrand.com</code>) বা আমাদের ফ্রি সাবডোমেন নির্বাচন করুন। আমাদের টিম আপনার ডোমেন ফ্রি-তে পয়েন্ট করে দেবে।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  ২
                </span>
                <div>
                  <h4 className="font-bold text-gray-800">প্রোডাক্ট সিঙ্ক ও প্রফিট মার্জিন সেট</h4>
                  <p className="mt-0.5 text-gray-600 leading-relaxed">
                    ResellerBrain-এর সকল ট্রেন্ডিং ও পাইকারি প্রোডাক্ট রিয়েল-টাইমে আপনার ওয়েবসাইটে সিঙ্ক থাকবে। আপনার স্টোর অ্যাডমিন প্যানেল থেকে নিজের ইচ্ছামতো রিটেল প্রাইজ ও লাভ নির্ধারণ করুন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  ৩
                </span>
                <div>
                  <h4 className="font-bold text-gray-800">অটোমেটিক সেলস ও নো-রিস্ক ফুলফিলমেন্ট</h4>
                  <p className="mt-0.5 text-gray-600 leading-relaxed">
                    কাস্টমাররা আপনার সাইটে অর্ডার করলেই অর্ডার সরাসরি ফুলফিলমেন্টের জন্য চলে আসবে। প্যাকেজিং ও কুরিয়ার ডেলিভারি হবে আপনার ব্র্যান্ড নামে এবং প্রতি অর্ডারের লাভ সরাসরি আপনার ওয়ালেটে জমা হবে।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Regenerate Secret */}
      {showRegenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="rounded-full bg-rose-100 p-2.5">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">আপনি কি নিশ্চিত?</h3>
            </div>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              নতুন API Secret তৈরি করলে আপনার বর্তমান সিক্রেটটি <strong>তাত্ক্ষণিকভাবে অকার্যকর</strong> হয়ে যাবে। আপনার ওয়েবসাইটের কনফিগারেশনে নতুন সিক্রেটটি আপডেট না করা পর্যন্ত অর্ডার সিঙ্ক বন্ধ থাকবে।
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRegenerateModal(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleRegenerateSecretConfirm}
                disabled={isRegenerating}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isRegenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>হ্যাঁ, নতুন সিক্রেট তৈরি করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
