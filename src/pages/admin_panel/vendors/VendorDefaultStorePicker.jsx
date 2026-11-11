import { useState } from "react";
import PropTypes from "prop-types";
import { Loader2, Pencil, Store } from "lucide-react";
import { toast } from "react-toastify";
import { useListCarryBeeStoresQuery } from "../../../redux/features/delivery_company/carrybeeStoreApi";
import { useSetVendorDefaultCarrybeeStoreMutation } from "../../../redux/features/vendor_api";

/**
 * Admin sets a vendor's default CarryBee store (vendors.carryb_store_id).
 * The "Draft to CarryBee Order" modal auto-selects it. Stores are fetched
 * from CarryBee only when the picker is opened.
 */
const VendorDefaultStorePicker = ({ vendor }) => {
  const [editing, setEditing] = useState(false);
  const currentId = vendor?.carryb_store_id ? String(vendor.carryb_store_id) : "";

  const { data, isFetching, isError } = useListCarryBeeStoresQuery(String(vendor.id), { skip: !editing });
  const stores = Array.isArray(data?.data?.data?.stores) ? data.data.data.stores : [];
  const [saveStore, { isLoading: saving }] = useSetVendorDefaultCarrybeeStoreMutation();

  const handleChange = async (e) => {
    const value = e.target.value;
    try {
      // Store ids are text in CarryBee (e.g. "abcd-1234").
      await saveStore({ id: vendor.id, carryb_store_id: value || null }).unwrap();
      toast.success(value ? "Default CarryBee store saved" : "Default CarryBee store cleared");
      setEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save default store");
    }
  };

  if (!vendor?.carry_bee_info) return null;

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        title="Default store auto-selected in Draft to CarryBee Order"
        className={`mt-1 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold transition ${
          currentId
            ? "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
            : "border-dashed border-gray-300 text-gray-500 hover:border-sky-300 hover:text-sky-700"
        }`}
      >
        <Store className="h-3 w-3" />
        {currentId ? `Store #${currentId}` : "Set default store"}
        <Pencil className="h-2.5 w-2.5 opacity-60" />
      </button>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      {isFetching ? (
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading stores…
        </span>
      ) : isError ? (
        <span className="text-[11px] text-red-500">Could not load stores</span>
      ) : (
        <select
          autoFocus
          defaultValue={currentId}
          disabled={saving}
          onChange={handleChange}
          className="max-w-[180px] rounded border border-sky-300 bg-white px-1.5 py-0.5 text-[11px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-100"
        >
          <option value="">— No default —</option>
          {currentId && !stores.some((s) => String(s.id) === currentId) && (
            <option value={currentId}>Store #{currentId} (not found)</option>
          )}
          {stores.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {s.name} (#{s.id})
            </option>
          ))}
        </select>
      )}
      {saving && <Loader2 className="h-3 w-3 animate-spin text-sky-600" />}
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded px-1 text-[11px] text-gray-500 hover:bg-gray-100"
      >
        Cancel
      </button>
    </div>
  );
};

VendorDefaultStorePicker.propTypes = {
  vendor: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    carryb_store_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    carry_bee_info: PropTypes.object,
  }).isRequired,
};

export default VendorDefaultStorePicker;
