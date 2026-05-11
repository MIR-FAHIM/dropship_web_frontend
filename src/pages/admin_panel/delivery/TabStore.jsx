import React, { useState, useEffect } from "react";
import { Plus, Loader2, Store, X, ChevronDown, User } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
  useListCarryBeeStoresQuery,
  useCreateCarryBeeStoreMutation,
} from "../../../redux/features/delivery_company/carrybeeStoreApi";
import { useGetVendorListQuery } from "../../../redux/features/vendor_api";

/* ────────────────────────────────────────────────
   Small helpers
──────────────────────────────────────────────── */
const Select = ({ label, value, onChange, options = [], placeholder, disabled }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed pr-8"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const Field = ({ label, value, onChange, placeholder, disabled }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50"
    />
  </div>
);

/* ────────────────────────────────────────────────
   Add Store Modal
──────────────────────────────────────────────── */
const AddStoreModal = ({ companyId, onClose, onSuccess }) => {
  // System vendors
  const { data: vendorData, isLoading: vendorLoading } = useGetVendorListQuery();
  const vendors = vendorData?.data || [];

  // Form state
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [form, setForm] = useState({
    name: "",
    contact_person_name: "",
    contact_person_number: "",
    contact_person_secondary_number: "",
    address: "",
  });
  const [cityId, setCityId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [areaId, setAreaId] = useState("");

  // CarryBee geo data
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery(companyId);
  const { data: zonesData, isLoading: zonesLoading } = useGetZonesQuery(
    { companyId, cityId },
    { skip: !cityId }
  );
  const { data: areasData, isLoading: areasLoading } = useGetAreasQuery(
    { companyId, cityId, zoneId },
    { skip: !cityId || !zoneId }
  );

  const [createStore, { isLoading: creating }] = useCreateCarryBeeStoreMutation();

  // Options
  const cityOptions = (citiesData?.data?.data?.cities || []).map((c) => ({ value: c.id, label: c.name }));
  const zoneOptions = (zonesData?.data?.data?.zones || []).map((z) => ({ value: z.id, label: z.name }));
  const areaOptions = (areasData?.data?.data?.areas || []).map((a) => ({ value: a.id, label: a.name }));

  // When vendor changes — auto-fill form fields
  useEffect(() => {
    if (!selectedVendorId) return;
    const v = vendors.find((v) => String(v.id) === String(selectedVendorId));
    if (!v) return;
    setForm({
      name: v.shop_name || "",
      contact_person_name: v.contact_person || "",
      contact_person_number: v.user?.phone || "",
      contact_person_secondary_number: v.whatsapp || "",
      address: v.user?.address || "",
    });
  }, [selectedVendorId]);

  // Reset zone/area when city changes
  useEffect(() => { setZoneId(""); setAreaId(""); }, [cityId]);
  useEffect(() => { setAreaId(""); }, [zoneId]);

  const setField = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cityId || !zoneId || !areaId) {
      toast.error("শহর, জোন এবং এলাকা নির্বাচন করুন।");
      return;
    }
    try {
      await createStore({
        companyId,
        ...form,
        city_id: Number(cityId),
        zone_id: Number(zoneId),
        area_id: Number(areaId),
      }).unwrap();
      toast.success("স্টোর সফলভাবে তৈরি হয়েছে।");
      onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || "স্টোর তৈরিতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Store className="w-5 h-5 text-red-500" /> নতুন স্টোর যোগ করুন
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Vendor selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              ভেন্ডর বেছে নিন <span className="text-gray-400">(অটো-ফিল করবে)</span>
            </label>
            <div className="relative">
              {vendorLoading ? (
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> লোড হচ্ছে...
                </div>
              ) : (
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 pr-8"
                >
                  <option value="">— ভেন্ডর নির্বাচন করুন —</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.shop_name} ({v.user?.email})
                    </option>
                  ))}
                </select>
              )}
              <User className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="স্টোরের নাম *" value={form.name} onChange={setField("name")} placeholder="Store name" />
            <Field label="যোগাযোগ ব্যক্তি *" value={form.contact_person_name} onChange={setField("contact_person_name")} placeholder="Contact person" />
            <Field label="প্রাথমিক নম্বর *" value={form.contact_person_number} onChange={setField("contact_person_number")} placeholder="01XXXXXXXXX" />
            <Field label="সেকেন্ডারি নম্বর" value={form.contact_person_secondary_number} onChange={setField("contact_person_secondary_number")} placeholder="01XXXXXXXXX" />
          </div>

          <Field label="ঠিকানা *" value={form.address} onChange={setField("address")} placeholder="Full address" />

          {/* Geo selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="শহর *"
              value={cityId}
              onChange={setCityId}
              options={cityOptions}
              placeholder={citiesLoading ? "লোড হচ্ছে..." : "শহর বেছে নিন"}
              disabled={citiesLoading}
            />
            <Select
              label="জোন *"
              value={zoneId}
              onChange={setZoneId}
              options={zoneOptions}
              placeholder={!cityId ? "আগে শহর বেছে নিন" : zonesLoading ? "লোড হচ্ছে..." : "জোন বেছে নিন"}
              disabled={!cityId || zonesLoading}
            />
            <Select
              label="এলাকা *"
              value={areaId}
              onChange={setAreaId}
              options={areaOptions}
              placeholder={!zoneId ? "আগে জোন বেছে নিন" : areasLoading ? "লোড হচ্ছে..." : "এলাকা বেছে নিন"}
              disabled={!zoneId || areasLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              স্টোর তৈরি করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────
   Main TabStore
──────────────────────────────────────────────── */
const TabStore = ({ company }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const companyId = company.id;

  const { data: storesData, isLoading, error, refetch } = useListCarryBeeStoresQuery(companyId);
  const stores = Array.isArray(storesData?.data?.data?.stores) ? storesData.data.data.stores : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">CarryBee স্টোর সমূহ</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" /> নতুন স্টোর
        </button>
      </div>

      {/* Store list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-sm">
            স্টোর লোড করতে সমস্যা হয়েছে।
          </div>
        ) : !Array.isArray(stores) || stores.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <Store className="w-8 h-8 mx-auto mb-2 opacity-30" />
            কোনো স্টোর নেই। নতুন স্টোর যোগ করুন।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">নাম</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">যোগাযোগ ব্যক্তি</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">নম্বর</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">হাব</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">স্ট্যাটাস</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">ঠিকানা</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s, i) => (
                  <tr key={s.id ?? i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {s.name ?? "—"}
                      {s.is_default_pickup_store && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Pickup</span>
                      )}
                      {s.is_default_return_store && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Return</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.contact_person_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{s.contact_person_number ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{s.hub_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        s.status === "active"
                          ? "bg-green-100 text-green-700"
                          : s.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {s.status ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.address ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <AddStoreModal
          companyId={companyId}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); refetch(); }}
        />
      )}
    </div>
  );
};

export default TabStore;
