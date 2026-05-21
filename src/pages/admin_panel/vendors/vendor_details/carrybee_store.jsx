import React, { useState, useEffect } from "react";
import { Loader2, Plus, Store, X, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
  useListCarryBeeStoresQuery,
  useCreateCarryBeeStoreMutation,
} from "../../../../redux/features/delivery_company/carrybeeStoreApi";

/* ── helpers ── */
const Sel = ({ label, value, onChange, options = [], placeholder, disabled }) => (
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
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const Fld = ({ label, value, onChange, placeholder, disabled }) => (
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

/* ── Add Store Modal ── */
const AddStoreModal = ({ vendorId, onClose, onSuccess }) => {
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

  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery();
  const { data: zonesData, isLoading: zonesLoading } = useGetZonesQuery(
    { vendorId, cityId },
    { skip: !cityId }
  );
  const { data: areasData, isLoading: areasLoading } = useGetAreasQuery(
    { vendorId, cityId, zoneId },
    { skip: !cityId || !zoneId }
  );

  const [createStore, { isLoading: creating }] = useCreateCarryBeeStoreMutation();

  const cityOptions = (citiesData?.data?.data?.cities || []).map((c) => ({ value: c.id, label: c.name }));
  const zoneOptions = (zonesData?.data?.data?.zones || []).map((z) => ({ value: z.id, label: z.name }));
  const areaOptions = (areasData?.data?.data?.areas || []).map((a) => ({ value: a.id, label: a.name }));

  useEffect(() => { setZoneId(""); setAreaId(""); }, [cityId]);
  useEffect(() => { setAreaId(""); }, [zoneId]);

  const setField = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact_person_number.trim()) {
      toast.warning("Store name and primary phone are required.");
      return;
    }
    if (!cityId || !zoneId || !areaId) {
      toast.warning("Please select city, zone, and area.");
      return;
    }
    try {
      await createStore({
        vendorId,
        ...form,
        city_id: Number(cityId),
        zone_id: Number(zoneId),
        area_id: Number(areaId),
      }).unwrap();
      toast.success("Store created successfully.");
      onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create store.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Store className="w-5 h-5 text-red-500" /> Add New Store
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Fld label="Store Name *" value={form.name} onChange={setField("name")} placeholder="e.g. Main Warehouse" />
            <Fld label="Contact Person" value={form.contact_person_name} onChange={setField("contact_person_name")} placeholder="Full name" />
            <Fld label="Primary Phone *" value={form.contact_person_number} onChange={setField("contact_person_number")} placeholder="01XXXXXXXXX" />
            <Fld label="Secondary Phone" value={form.contact_person_secondary_number} onChange={setField("contact_person_secondary_number")} placeholder="Optional" />
          </div>

          <Fld label="Address" value={form.address} onChange={setField("address")} placeholder="Full store address" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Sel
              label="City *"
              value={cityId}
              onChange={setCityId}
              options={cityOptions}
              placeholder={citiesLoading ? "Loading…" : "Select city"}
              disabled={citiesLoading}
            />
            <Sel
              label="Zone *"
              value={zoneId}
              onChange={setZoneId}
              options={zoneOptions}
              placeholder={!cityId ? "Select city first" : zonesLoading ? "Loading…" : "Select zone"}
              disabled={!cityId || zonesLoading}
            />
            <Sel
              label="Area *"
              value={areaId}
              onChange={setAreaId}
              options={areaOptions}
              placeholder={!zoneId ? "Select zone first" : areasLoading ? "Loading…" : "Select area"}
              disabled={!zoneId || areasLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={creating}
              className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2">
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main Component ── */
const CarryBeeStore = ({ vendorId }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useListCarryBeeStoresQuery(vendorId, { skip: !vendorId });
  const stores = Array.isArray(data?.data?.data?.stores) ? data.data.data.stores : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">CarryBee Stores</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" /> New Store
        </button>
      </div>

      {/* Store table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">
            Failed to load stores.{" "}
            <button onClick={refetch} className="underline text-red-600">Retry</button>
          </div>
        ) : stores.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            <Store className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No stores yet. Add a new store.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Store ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Contact Person</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Hub</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Address</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s, i) => (
                  <tr key={s.id ?? i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-gray-500">   {s.id ?? "—"}</td>
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

      {modalOpen && (
        <AddStoreModal
          vendorId={vendorId}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); refetch(); }}
        />
      )}
    </div>
  );
};

export default CarryBeeStore;
