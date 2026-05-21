import React from "react";
import {
  Loader2,
  Store,
  Phone,
  MapPin,
  User,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useGetVendorProfileQuery } from "../../../../redux/features/vendor_api";

const Row = ({ label, value }) => (
  <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 text-right max-w-[60%]">{value || "—"}</span>
  </div>
);

const VendorInfo = ({ vendorId }) => {
  const { data, isLoading, isError, refetch } = useGetVendorProfileQuery(vendorId);
  const vendor = data?.data || null;

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
            label="Status"
            value={
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
