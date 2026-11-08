import { useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ArrowLeft, ArrowRight, Loader2, Package, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { useOrderReplacementProductsQuery, useUpdateOrderInfoMutation } from "../../../redux/features/order";

const inputClass = "w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const secondaryButton = "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50";
const currency = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 2 });
const money = (value) => currency.format(Number(value || 0));
const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const basePrice = (product) => Number(product.admin_price ?? Math.ceil(Number(product.unit_price) * 1.05));

export default function ReplaceOrderProductDialog({ order, onClose, onSaved }) {
  const item = order.items[0];
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", page: 1 });
  const [product, setProduct] = useState(null);
  const [attributeId, setAttributeId] = useState("");
  const [sellingPrice, setSellingPrice] = useState(String(item.reseller_price ?? ""));
  const [saveError, setSaveError] = useState("");
  const { currentData, isFetching, isError, error, refetch } = useOrderReplacementProductsQuery(filters, { refetchOnMountOrArgChange: true });
  const [updateOrder, { isLoading: saving }] = useUpdateOrderInfoMutation();
  const catalog = currentData?.data;
  const products = catalog?.data || [];
  const qty = Number(item.qty);
  const variants = product?.product_attributes || [];
  const selectedVariant = variants.find((variant) => String(variant.id) === attributeId);
  const subtotal = roundMoney(roundMoney(Number(sellingPrice)) * qty);
  const total = roundMoney(subtotal + Number(order.shipping_fee || 0) - Number(order.discount || 0));
  const invalidPrice = sellingPrice === "" || !Number.isFinite(Number(sellingPrice)) || (product && roundMoney(Number(sellingPrice)) < basePrice(product));
  const invalidTotal = !Number.isFinite(total) || total < Number(order.advance_amount || 0);
  const disabled = saving || !product || invalidPrice || invalidTotal;

  const search = (event) => {
    event.preventDefault();
    const value = searchInput.trim();
    if (value === filters.search && filters.page === 1) refetch();
    else setFilters({ search: value, page: 1 });
  };

  const select = (nextProduct) => {
    setProduct(nextProduct);
    setAttributeId("");
    setSaveError("");
  };

  const save = async (event) => {
    event.preventDefault();
    if (disabled) return;
    setSaveError("");
    try {
      await updateOrder({
        id: order.id,
        total,
        items: [{
          id: item.id,
          expected_product_id: item.product_id ?? null,
          product_id: product.id,
          attribute_id: attributeId ? Number(attributeId) : null,
          qty,
          reseller_price: roundMoney(Number(sellingPrice)),
        }],
      }).unwrap();
      toast.success("Order product replaced");
      onSaved();
    } catch (err) {
      const message = Object.values(err?.data?.errors || {}).flat().find((value) => typeof value === "string");
      setSaveError(err?.status === 409 ? "The order changed. Close this dialog and reload the order before trying again." : message || err?.data?.message || "Unable to replace the order product.");
    }
  };

  return (
    <Dialog open onClose={() => { if (!saving) onClose(); }} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-5">
        <DialogPanel className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-5">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-900"><Package className="h-5 w-5 shrink-0 text-blue-600" /> Replace Product</DialogTitle>
            <button type="button" aria-label="Close" title="Close" disabled={saving} onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X className="h-5 w-5" /></button>
          </header>
          <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="mb-4 text-sm">
              <p className="text-xs font-medium text-gray-500">Current product</p>
              <p className="mt-1 break-words font-semibold text-gray-900">{item.product_name || "Unavailable product"}</p>
              <p className="mt-1 break-words text-xs text-gray-600">{item.sku || "No SKU"} · {item.shop?.shop_name || order.vendor?.shop_name || "No vendor"} · Qty {qty}</p>
            </div>
            <form onSubmit={search} className="mb-3 flex flex-wrap gap-2">
              <input aria-label="Search replacement products" maxLength={100} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Product name, SKU or ID" className={`${inputClass} flex-1 basis-40`} />
              <button type="submit" disabled={isFetching || saving} className={secondaryButton}>{isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search</button>
            </form>
            <div className="min-h-20 border-y border-gray-200" aria-busy={isFetching}>
              {isFetching ? <p role="status" className="flex items-center gap-2 px-2 py-6 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />Loading products...</p> :
                isError ? <div role="alert" className="space-y-2 p-3 text-sm text-red-700"><p>{error?.data?.message || "Unable to load replacement products."}</p><button type="button" onClick={refetch} className={secondaryButton}>Retry</button></div> :
                products.length === 0 ? <p className="px-2 py-6 text-sm text-gray-500">No available products found.</p> :
                <ul className="max-h-56 divide-y divide-gray-100 overflow-y-auto">
                  {products.map((candidate) => {
                    const selected = product?.id === candidate.id;
                    const unavailable = Number(item.product_id) === candidate.id || candidate.current_stock < qty;
                    return <li key={candidate.id}>
                      <button type="button" disabled={unavailable || saving} aria-pressed={selected} onClick={() => select(candidate)} className={`flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-blue-50 disabled:opacity-50 ${selected ? "bg-blue-50 ring-1 ring-inset ring-blue-300" : ""}`}>
                        <span className="min-w-0 flex-1 basis-32 break-words"><strong className="font-semibold text-gray-900">{candidate.name}</strong><span className="mt-1 block break-words text-xs text-gray-600">{candidate.sku} · {candidate.vendor?.shop_name}</span></span>
                        <span className="text-xs text-gray-600"><span className="block font-semibold text-gray-800">{money(basePrice(candidate))}</span>{Number(item.product_id) === candidate.id ? "Current product" : `${candidate.current_stock} in stock`}</span>
                      </button>
                    </li>;
                  })}
                </ul>}
            </div>
            {catalog?.last_page > 1 && <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-600">
              <button type="button" className={secondaryButton} disabled={isFetching || saving || filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} aria-label="Previous product page" title="Previous product page"><ArrowLeft className="h-4 w-4" /></button>
              <span>Page {filters.page} of {catalog.last_page}</span>
              <button type="button" className={secondaryButton} disabled={isFetching || saving || filters.page >= catalog.last_page} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} aria-label="Next product page" title="Next product page"><ArrowRight className="h-4 w-4" /></button>
            </div>}
            <form id="replace-order-product" onSubmit={save} className="mt-4 space-y-3">
              {product && <>
                <div className="border-b border-gray-200 pb-3 text-sm">
                  <p className="break-words font-semibold text-gray-900">{product.name}</p>
                  <p className="mt-1 break-words text-xs text-gray-600">{product.sku} · {product.vendor?.shop_name} · Vendor {money(product.unit_price)} · Base {money(basePrice(product))}</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="min-w-0 text-sm text-gray-700">Variant
                    <select className={`mt-1 ${inputClass}`} disabled={saving || variants.length === 0} value={attributeId} onChange={(event) => setAttributeId(event.target.value)}>
                      <option value="">No variant</option>
                      {variants.map((variant) => <option key={variant.id} value={variant.id} disabled={!variant.is_active || variant.stock < qty}>{variant.attribute?.name}: {variant.value?.value || `#${variant.id}`} ({variant.stock} in stock)</option>)}
                    </select>
                  </label>
                  <label className="min-w-0 text-sm text-gray-700">Selling price per unit
                    <input type="number" required min={basePrice(product)} step="0.01" disabled={saving} className={`mt-1 ${inputClass}`} value={sellingPrice} onChange={(event) => setSellingPrice(event.target.value)} />
                  </label>
                </div>
                {invalidPrice && <p className="text-xs text-red-700">Selling price must be at least {money(basePrice(product))}.</p>}
                {invalidTotal && <p className="text-xs text-red-700">The new total cannot be below the recorded advance or zero.</p>}
                <dl className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <dt>Item subtotal</dt><dd className="text-right tabular-nums">{money(subtotal)}</dd>
                  <dt>Order total</dt><dd className="text-right font-semibold tabular-nums text-gray-900">{money(total)}</dd>
                </dl>
              </>}
              {saveError && <p role="alert" className="break-words text-sm text-red-700">{saveError}</p>}
            </form>
          </div>
          <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-gray-200 px-4 py-3 sm:px-5">
            <button type="button" disabled={saving} onClick={onClose} className={secondaryButton}>Cancel</button>
            <button type="submit" form="replace-order-product" disabled={disabled || (selectedVariant && (!selectedVariant.is_active || selectedVariant.stock < qty))} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Replacing..." : "Replace Product"}</button>
          </footer>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

ReplaceOrderProductDialog.propTypes = {
  order: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
