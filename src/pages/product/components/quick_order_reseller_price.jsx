import React, { useState, useEffect } from "react";
import { getAdminBasePrice } from "../../../utils/pricing.utils";

const ResellerPriceModal = ({
  open,
  onClose,
  product,
  modalAction,
  isSubmitting,
  outOfStock,
  onSubmit,
}) => {
  const basePrice = getAdminBasePrice(product);
  const [resellerPrice, setResellerPrice] = useState(() =>
    basePrice > 0 ? String(basePrice) : ""
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      setResellerPrice(basePrice > 0 ? String(basePrice) : "");
      setQuantity(1);
    }
  }, [open, basePrice]);

  if (!open) return null;

  const resellerPriceVal = Number(resellerPrice) || 0;
  const profit = resellerPriceVal - basePrice;
  const margin = basePrice > 0 ? (profit / basePrice) * 100 : 0;
  const totalSell = resellerPriceVal * quantity;
  const totalBase = basePrice * quantity;
  const totalProfit = totalSell - totalBase;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Set Selling Price</p>
            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mt-0.5">{product?.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none mt-0.5">✕</button>
        </div>

        {/* Base price */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
          <span className="text-xs text-gray-500">Admin/Base Price</span>
          <span className="text-sm font-black text-gray-800">৳{basePrice.toLocaleString()}</span>
        </div>

        {/* Reseller price input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Your Selling Price</label>
          <div className="flex items-center border-2 border-gray-200 focus-within:border-red-400 rounded-xl overflow-hidden transition-colors">
            <span className="px-3 text-sm font-bold text-gray-500 bg-gray-50 border-r border-gray-200 h-full flex items-center">৳</span>
            <input
              type="number"
              min={basePrice}
              value={resellerPrice}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || (!isNaN(Number(v)) && Number(v) >= 0)) setResellerPrice(v);
              }}
              placeholder="Enter your price"
              className="flex-1 px-3 py-2.5 text-sm font-bold text-gray-800 outline-none bg-white"
            />
          </div>
        </div>

        {/* Profit stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-xl px-3 py-2 text-center ${profit >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <p className="text-[10px] text-gray-500">Profit / item</p>
            <p className={`text-sm font-black ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>
              ৳{Number.isFinite(profit) ? profit.toFixed(0) : 0}
            </p>
          </div>
          <div className="rounded-xl px-3 py-2 text-center bg-gray-50">
            <p className="text-[10px] text-gray-500">Margin</p>
            <p className="text-sm font-black text-gray-700">{Number.isFinite(margin) ? margin.toFixed(1) : 0}%</p>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600">Quantity</span>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
            >−</button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= 1) setQuantity(v); }}
              className="w-12 text-center text-sm font-bold text-gray-800 outline-none border-x border-gray-200 py-2"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
            >+</button>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl px-2 py-2 text-center bg-gray-50">
            <p className="text-[10px] text-gray-500">Total Sell</p>
            <p className="text-xs font-black text-gray-800">৳{Number.isFinite(totalSell) ? totalSell.toFixed(0) : 0}</p>
          </div>
          <div className="rounded-xl px-2 py-2 text-center bg-gray-50">
            <p className="text-[10px] text-gray-500">Total Cost</p>
            <p className="text-xs font-black text-gray-800">৳{Number.isFinite(totalBase) ? totalBase.toFixed(0) : 0}</p>
          </div>
          <div className={`rounded-xl px-2 py-2 text-center ${totalProfit >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <p className="text-[10px] text-gray-500">Total Profit</p>
            <p className={`text-xs font-black ${totalProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
              ৳{Number.isFinite(totalProfit) ? totalProfit.toFixed(0) : 0}
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          disabled={isSubmitting || outOfStock || resellerPriceVal < basePrice}
          onClick={() => onSubmit(resellerPriceVal, quantity)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
            ${isSubmitting || outOfStock || resellerPriceVal < basePrice
              ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400"
              : modalAction === "quickOrder"
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-red-600 text-white hover:bg-red-700"}`}
        >
          {isSubmitting ? "Processing…" : modalAction === "quickOrder" ? "⚡ Confirm Quick Order" : "🛒 Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ResellerPriceModal;
