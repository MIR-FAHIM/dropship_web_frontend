import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Store } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { imgBaseUrl } from "../../../../config";
import {
  useAddResellerStoreProfileMutation,
  useGetResellerStoreProfileByResellerQuery,
  useUpdateResellerStoreProfileMutation,
} from "../../../redux/features/resellerStoreProfile";
import StoreProductPagesTab from "./StoreProductPagesTab";
import StoreOrdersTab from "./StoreOrdersTab";

const initialForm = {
  shop_name: "",
  logo: "",
  phone: "",
  whatsapp: "",
  address: "",
  details: "",
  facebook_url: "",
  website: "",
  theme: "default",
  status: "active",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";
const allowedLogoTypes = ["image/jpeg", "image/png", "image/webp"];
const tabKeys = ["information", "product-pages", "orders"];

const getProfile = (response) => {
  const data = response?.data;
  if (!data) return null;
  if (Array.isArray(data)) return data[0] || null;
  if (Array.isArray(data?.data)) return data.data[0] || null;
  return data?.data || data;
};

const getErrorMessages = (error) => {
  const errors = error?.data?.errors;
  if (!errors) return [];
  if (Array.isArray(errors)) return errors;
  if (typeof errors === "object") return Object.values(errors).flat();
  return [String(errors)];
};

const getLogoUrl = (logo) => {
  if (!logo || typeof logo !== "string") return null;
  if (/^https?:\/\//i.test(logo)) return logo;
  return `${String(imgBaseUrl).replace(/\/+$/, "")}/${logo.replace(/^\/+/, "")}`;
};

const buildStoreProfileFormData = ({ form, resellerId, selectedLogoFile }) => {
  const formData = new FormData();

  formData.append("reseller_id", resellerId);
  formData.append("shop_name", form.shop_name || "");
  formData.append("phone", form.phone || "");
  formData.append("whatsapp", form.whatsapp || "");
  formData.append("address", form.address || "");
  formData.append("details", form.details || "");
  formData.append("facebook_url", form.facebook_url || "");
  formData.append("website", form.website || "");
  formData.append("theme", form.theme || "");
  formData.append("status", form.status || "active");

  if (selectedLogoFile) {
    formData.append("logo", selectedLogoFile);
  }

  return formData;
};

const StoreProfile = () => {
  const resellerId = getFromLocalstorage("userId");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = tabKeys.includes(searchParams.get("tab")) ? searchParams.get("tab") : "information";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [form, setForm] = useState(initialForm);
  const [apiErrors, setApiErrors] = useState([]);
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [selectedLogoPreview, setSelectedLogoPreview] = useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetResellerStoreProfileByResellerQuery(resellerId, { skip: !resellerId });

  const profile = useMemo(() => getProfile(data), [data]);
  const isMissingProfile = isError && [404, 204].includes(error?.status);

  const [addProfile, { isLoading: creating }] = useAddResellerStoreProfileMutation();
  const [updateProfile, { isLoading: updating }] = useUpdateResellerStoreProfileMutation();
  const saving = creating || updating;
  const logoPreviewUrl = selectedLogoPreview || getLogoUrl(form.logo);

  useEffect(() => {
    if (!profile) {
      setForm(initialForm);
      setSelectedLogoFile(null);
      return;
    }

    setForm({
      shop_name: profile.shop_name || "",
      logo: profile.logo || "",
      phone: profile.phone || "",
      whatsapp: profile.whatsapp || "",
      address: profile.address || "",
      details: profile.details || "",
      facebook_url: profile.facebook_url || "",
      website: profile.website || "",
      theme: profile.theme || "default",
      status: profile.status || "active",
    });
    setSelectedLogoFile(null);
  }, [profile]);

  useEffect(() => {
    if (!selectedLogoFile) {
      setSelectedLogoPreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedLogoFile);
    setSelectedLogoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedLogoFile]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tabKeys.includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [activeTab, searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "information" ? {} : { tab });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedLogoFile(null);
      return;
    }

    if (!allowedLogoTypes.includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WebP image");
      event.target.value = "";
      setSelectedLogoFile(null);
      return;
    }

    setSelectedLogoFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiErrors([]);

    const payload = buildStoreProfileFormData({
      form,
      resellerId: Number(resellerId),
      selectedLogoFile,
    });

    try {
      if (profile?.id) {
        await updateProfile({ id: profile.id, body: payload }).unwrap();
      } else {
        await addProfile(payload).unwrap();
      }
      setSelectedLogoFile(null);
      toast.success("Store profile saved successfully");
    } catch (err) {
      setApiErrors(getErrorMessages(err));
      toast.error(err?.data?.message || "Store profile save failed");
    }
  };

  if (!resellerId) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
        Please login again. Reseller id was not found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Store className="h-5 w-5 text-blue-600" />
            Store Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up the shop information shown for your reseller business.
          </p>
        </div>
        {profile?.id && (
          <span className="inline-flex w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            Profile #{profile.id}
          </span>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-100">
        {[
          { key: "information", label: "Information" },
          { key: "product-pages", label: "Product Pages" },
          { key: "orders", label: "Orders" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "product-pages" ? (
        <StoreProductPagesTab resellerId={resellerId} />
      ) : activeTab === "orders" ? (
        <StoreOrdersTab resellerId={resellerId} />
      ) : isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 py-20">
          <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
        </div>
      ) : isError && !isMissingProfile ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          {error?.data?.message || "Failed to load store profile."}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={isFetching ? "opacity-60" : ""}>
          {apiErrors.length > 0 && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {apiErrors.map((message, index) => (
                <p key={index}>{message}</p>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Shop Name</label>
                <input name="shop_name" value={form.shop_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Shop Logo</label>
                <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  {logoPreviewUrl ? (
                    <img
                      src={logoPreviewUrl}
                      alt="Store logo preview"
                      className="h-16 w-16 shrink-0 rounded-lg border border-gray-200 bg-white object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-400">
                      <Store className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Accepted: JPG, PNG, WebP.</p>
                    {selectedLogoFile && (
                      <p className="mt-1 truncate text-xs font-semibold text-green-700">{selectedLogoFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp</label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Facebook URL</label>
                <input name="facebook_url" value={form.facebook_url} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input name="website" value={form.website} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Theme</label>
                <select name="theme" value={form.theme} onChange={handleChange} className={inputClass}>
                  <option value="default">default</option>
                  <option value="modern">modern</option>
                  <option value="classic">classic</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={3} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Details</label>
                <textarea name="details" value={form.details} onChange={handleChange} rows={4} className={inputClass} />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {profile?.id ? "Update Store Profile" : "Create Store Profile"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default StoreProfile;



