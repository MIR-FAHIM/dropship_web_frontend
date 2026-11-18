import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AlertTriangle, ArrowRight, Loader2, Search, Store, X } from "lucide-react";
import { toast } from "sonner";
import { useGetVendorListQuery } from "../../../../redux/features/vendor_api";
import {
  useChangeProductVendorMutation,
  useGetProductVendorChangesQuery,
  usePreviewProductVendorChangeQuery,
} from "../../../../redux/features/product";

/**
 * Admin product page → "Change vendor". Kept apart from the normal Edit because a vendor
 * change also moves the auto SKU (p{id}v{vendor}) and open carts; old orders stay with the
 * old vendor. Shows the impact first, needs a reason, and is logged.
 */
const fmt = (iso) => (iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "");

const ChangeVendorModal = ({ product, onClose }) => {
  const [search, setSearch] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [reason, setReason] = useState("");
  const [updateSku, setUpdateSku] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const { data: vendorData, isLoading: vendorsLoading } = useGetVendorListQuery();
  const vendors = vendorData?.data?.data || vendorData?.data || [];
  const options = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors
      .filter((v) => Number(v.id) !== Number(product.vendor_id))
      .filter((v) => !q || `${v.shop_name || ""} ${v.id} ${v.user?.name || ""} ${v.user?.phone || ""}`.toLowerCase().includes(q));
  }, [vendors, search, product.vendor_id]);

  const { data: previewData, isFetching: previewing, isError: previewError } = usePreviewProductVendorChangeQuery(
    { id: product.id, vendorId },
    { skip: !vendorId }
  );
  const preview = previewData?.data;
  const { data: historyData } = useGetProductVendorChangesQuery(product.id);
  const history = historyData?.data || [];
  const [changeVendor, { isLoading: saving }] = useChangeProductVendorMutation();

  const canSave = vendorId && preview && !preview.same_vendor && reason.trim().length >= 3 && confirmed && !saving;

  const handleSave = async () => {
    try {
      const res = await changeVendor({ id: product.id, vendor_id: Number(vendorId), reason: reason.trim(), update_sku: updateSku }).unwrap();
      const moved = res?.data?.change?.cart_items_moved ?? 0;
      toast.success(`Vendor changed to ${preview.to_vendor.shop_name}${moved ? ` · ${moved} cart item(s) moved` : ""}.`);
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Could not change the vendor.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true" aria-labelledby="change-vendor-title">
      <div className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        <h2 id="change-vendor-title" className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Store className="h-5 w-5 text-amber-600" /> Change vendor
        </h2>
        <p className="mt-1 text-xs text-gray-600">
          Moves this product to another vendor. Existing orders stay with the vendor who received them.
        </p>

        {/* Current vendor */}
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <span className="text-gray-500">Current vendor: </span>
          <span className="font-semibold text-gray-900">{product.vendor?.shop_name || `Vendor #${product.vendor_id}`}</span>
          <span className="text-gray-500"> (#{product.vendor_id}) · SKU </span>
          <span className="font-mono text-gray-800">{product.sku || "—"}</span>
        </div>

        {/* Pick the new vendor */}
        <label className="mt-4 block text-sm font-semibold text-gray-800" htmlFor="new-vendor-search">New vendor</label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="new-vendor-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shop name, vendor ID, owner or phone"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={vendorId}
          onChange={(e) => { setVendorId(e.target.value); setConfirmed(false); }}
          size={Math.min(6, Math.max(3, options.length))}
          aria-label="New vendor"
          className="mt-2 w-full rounded-lg border border-gray-300 p-1 text-sm"
        >
          {vendorsLoading && <option disabled>Loading vendors…</option>}
          {options.map((v) => (
            // Vendor id (not the owner's user id) — that's what products.vendor_id holds.
            <option key={v.id} value={v.id}>
              {v.shop_name || "Unnamed shop"} · #{v.id}{v.is_active === false || v.is_active === 0 ? " (inactive)" : ""}
            </option>
          ))}
        </select>

        {/* Impact */}
        {vendorId && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            {previewing && !preview ? (
              <p className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Checking what will change…</p>
            ) : previewError ? (
              <p className="text-red-700">Could not load the impact. Try another vendor or reload.</p>
            ) : preview ? (
              <>
                <p className="flex flex-wrap items-center gap-1.5 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  {preview.from_vendor?.shop_name || "—"} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> {preview.to_vendor.shop_name}
                  {!preview.to_vendor.is_active && <span className="rounded bg-red-100 px-1.5 text-xs text-red-700">inactive vendor</span>}
                </p>
                <ul className="mt-2 space-y-1.5 text-xs">
                  <li>
                    <b>SKU:</b>{" "}
                    {preview.sku.is_auto ? (
                      <label className="inline-flex flex-wrap items-center gap-1.5">
                        <input type="checkbox" checked={updateSku} onChange={(e) => setUpdateSku(e.target.checked)} />
                        change <span className="font-mono">{preview.sku.current || "—"}</span> → <span className="font-mono font-semibold">{preview.sku.after}</span>
                      </label>
                    ) : (
                      <>custom SKU <span className="font-mono">{preview.sku.current}</span> stays the same</>
                    )}
                  </li>
                  <li><b>Carts:</b> {preview.cart_items_to_move} item(s) in dropshippers&apos; carts will move to the new vendor (so new orders go to them).</li>
                  <li>
                    <b>Orders:</b> {preview.all_orders} order(s) have this product and stay with the old vendor.
                    {preview.open_orders > 0 && (
                      <span className="font-semibold text-red-700"> {preview.open_orders} of them are still open: reassign them from the order page if the new vendor should ship them.</span>
                    )}
                  </li>
                  <li><b>Not changed:</b> images, attributes, prices, stock, reviews, wishlists, clicks.</li>
                </ul>
              </>
            ) : null}
          </div>
        )}

        <label className="mt-4 block text-sm font-semibold text-gray-800" htmlFor="vendor-change-reason">Reason *</label>
        <textarea
          id="vendor-change-reason"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Supplier changed, wrong vendor when copying"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        <label className="mt-3 flex items-start gap-2 text-xs text-gray-700">
          <input type="checkbox" className="mt-0.5" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} disabled={!preview} />
          I checked the impact above and want to move this product to the new vendor.
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-200 disabled:text-amber-900"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Change vendor
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-5 border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-700">Vendor change history</p>
            <ul className="mt-2 space-y-1.5 text-xs text-gray-600">
              {history.map((h) => (
                <li key={h.id}>
                  <span className="text-gray-500">{fmt(h.created_at)}</span> · {h.from_vendor?.shop_name || `#${h.from_vendor_id}`} → <b className="text-gray-800">{h.to_vendor?.shop_name || `#${h.to_vendor_id}`}</b>
                  {h.old_sku !== h.new_sku && <> · SKU {h.old_sku} → {h.new_sku}</>}
                  {h.changer?.name && <> · by {h.changer.name}</>}
                  {h.reason && <> · “{h.reason}”</>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

ChangeVendorModal.propTypes = {
  product: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ChangeVendorModal;
