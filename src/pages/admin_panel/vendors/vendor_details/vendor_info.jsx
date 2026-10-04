import React from "react";
import {
  Loader2,
  Store,
  Phone,
  MapPin,
  User,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  useGetVendorProfileQuery,
  useUpdateVendorMutation,
  useVendorIsActiveMutation,
} from "../../../../redux/features/vendor_api";
import { toast } from "react-toastify";

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 text-sm">
    <span className="text-gray-500">{label}</span>
    <div className="font-medium text-gray-800 text-right max-w-[65%]">{value || "—"}</div>
  </div>
);

const VendorInfo = ({ vendorId }) => {
  const { data, isLoading, isError, refetch } = useGetVendorProfileQuery(vendorId);
  const [updateVendor, { isLoading: isUpdatingDelivery }] = useUpdateVendorMutation();
  const [vendorIsActive, { isLoading: isUpdatingStatus }] = useVendorIsActiveMutation();

  const vendor = data?.data || null;

  const hasOwnDelivery = Boolean(
    vendor?.has_own_delivery_account === true ||
    vendor?.has_own_delivery_account === 1 ||
    vendor?.has_own_delivery_account === "1" ||
    vendor?.has_own_delivery_account === "true"
  );

  const handleToggleDeliveryAccount = async (e) => {
    const nextVal = e.target.checked;
    try {
      const res = await updateVendor({
        id: vendorId,
        data: { has_own_delivery_account: nextVal },
      }).unwrap();
      toast.success(
        res?.message ||
          (nextVal
            ? "নিজস্ব ডেলিভারি অ্যাকাউন্ট সক্রিয় করা হয়েছে!"
            : "নিজস্ব ডেলিভারি অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে!")
      );
    } catch (err) {
      toast.error(err?.data?.message || "ডেলিভারি অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।");
    }
  };

  const handleToggleIsActive = async (e) => {
    const nextStatus = e.target.checked ? 1 : 0;
    try {
      const res = await vendorIsActive({
        id: vendorId,
        data: { is_active: nextStatus },
      }).unwrap();
      toast.success(res?.message || "ভেন্ডর স্ট্যাটাস সফলভাবে আপডেট হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "ভেন্ডর স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );

  if (isError || !vendor)
    return (
      <div className="text-center py-16 space-y-2">
        <Store className="w-12 h-12 text-red-300 mx-auto" />
        <p className="text-red-500 text-sm">Failed to load vendor info.</p>
        <button onClick={refetch} className="text-sm text-red-600 underline">
          Retry
        </button>
      </div>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Delivery & Logistics Account Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-gray-800">
              Delivery & Logistics Account (নিজস্ব ডেলিভারি অ্যাকাউন্ট)
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              hasOwnDelivery
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            {hasOwnDelivery ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Own Courier Active (নিজস্ব অ্যাকাউন্ট সক্রিয়)
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-gray-400" />
                Platform Courier (প্ল্যাটফর্ম ডেলিভারি ব্যবহৃত হবে)
              </>
            )}
          </span>
        </div>

        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                Own Delivery Account:
              </span>
              <code className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-mono">
                has_own_delivery_account: {hasOwnDelivery ? "true" : "false"}
              </code>
            </div>
            <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
              {hasOwnDelivery
                ? "এই ভেন্ডর নিজস্ব কুরিয়ার সার্ভিস বা ডেলিভারি অ্যাকাউন্ট (যেমন CarryBee ইত্যাদি) ব্যবহার করে পার্সেল প্রসেস ও ডেলিভারি পরিচালনা করবেন।"
                : "এই ভেন্ডরের নিজস্ব কোনো কুরিয়ার অ্যাকাউন্ট নেই। এই ভেন্ডরের পার্সেল ডেলিভারির জন্য মূল প্ল্যাটফর্মের ডিফল্ট ডেলিভারি অ্যাকাউন্ট ব্যবহার করা হবে।"}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <span className="text-xs font-medium text-gray-600">
              {isUpdatingDelivery
                ? "আপডেট হচ্ছে..."
                : hasOwnDelivery
                ? "সক্রিয় (Active)"
                : "নিষ্ক্রিয় (Inactive)"}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={hasOwnDelivery}
                disabled={isUpdatingDelivery}
                onChange={handleToggleDeliveryAccount}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
            {isUpdatingDelivery && (
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Shop Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Store className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">Shop Details</h3>
        </div>
        <div className="px-5 py-2">
          <Row label="Shop Name" value={vendor.shop_name} />
          <Row label="Shop Type" value={vendor.shop_type} />
          <Row label="Description" value={vendor.description} />
          <Row
            label="Own Delivery Account"
            value={
              <div className="flex items-center justify-end gap-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    hasOwnDelivery
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {hasOwnDelivery ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-gray-400" />
                      Inactive
                    </>
                  )}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={hasOwnDelivery}
                    disabled={isUpdatingDelivery}
                    onChange={handleToggleDeliveryAccount}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                {isUpdatingDelivery && (
                  <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                )}
              </div>
            }
          />
          <Row
            label="Status"
            value={
              <div className="flex items-center justify-end gap-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    vendor.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {vendor.is_active ? (
                    <ToggleRight className="w-3.5 h-3.5" />
                  ) : (
                    <ToggleLeft className="w-3.5 h-3.5" />
                  )}
                  {vendor.is_active ? "Active" : "Inactive"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!vendor.is_active}
                    disabled={isUpdatingStatus}
                    onChange={handleToggleIsActive}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                </label>
                {isUpdatingStatus && (
                  <Loader2 className="w-3.5 h-3.5 text-green-600 animate-spin" />
                )}
              </div>
            }
          />
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">Contact Details</h3>
        </div>
        <div className="px-5 py-2">
          <Row label="Owner Name" value={vendor.owner_name} />
          <Row label="Contact Person" value={vendor.contact_person} />
          <Row label="Emergency Contact" value={vendor.emergency_contact} />
          <Row label="WhatsApp" value={vendor.whatsapp} />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">Location</h3>
        </div>
        <div className="px-5 py-2 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          <div className="py-3 sm:px-4 text-sm">
            <p className="text-xs text-gray-400 mb-1">Division</p>
            <p className="font-medium text-gray-800">{vendor.division?.name || "—"}</p>
          </div>
          <div className="py-3 sm:px-4 text-sm">
            <p className="text-xs text-gray-400 mb-1">District</p>
            <p className="font-medium text-gray-800">{vendor.district?.name || "—"}</p>
          </div>
          <div className="py-3 sm:px-4 text-sm">
            <p className="text-xs text-gray-400 mb-1">Zone</p>
            <p className="font-medium text-gray-800">{vendor.zone || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorInfo;
