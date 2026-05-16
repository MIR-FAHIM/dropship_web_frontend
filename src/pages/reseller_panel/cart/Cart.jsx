import React, { useState } from "react";
import { FaTrash, FaShoppingBag, FaTag, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGetCartQuery, useDeleteCartMutation, useUpdateCartMutation, useAddNoteMutation } from "../../../redux/features/cart";
import { imgBaseUrl } from "../../../../config";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";

const money = (n) => `৳${Number(n || 0).toLocaleString()}`;

const CartPage = () => {
  const navigate = useNavigate();
  const { data: cartList, error, isLoading, refetch } = useGetCartQuery(getFromLocalstorage("userId") || 1);
  const [deleteCart, { isLoading: isDeleting }] = useDeleteCartMutation();
  const [updateCart, { isLoading: isUpdating }] = useUpdateCartMutation();
  const [addNote] = useAddNoteMutation();
  const [notes, setNotes] = useState({});
  const [savingNote, setSavingNote] = useState({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Error fetching cart: {error.message}
      </div>
    );
  }

  const cart = cartList?.data;
  const items = cart?.items || [];
  const totalItems = cart?.total_items ?? 0;
  const subtotal = Number(cart?.subtotal ?? 0);
  const resellerProfit = Number(cart?.reseller_profit_total ?? 0);
  const totalCost = subtotal - resellerProfit; // vendor cost = selling - profit
  const profitMargin = subtotal > 0 ? ((resellerProfit / subtotal) * 100).toFixed(1) : 0;

  const handleDelete = (itemId) => {
    deleteCart(itemId).unwrap().then(() => refetch()).catch(() => alert("Error deleting item"));
  };

  const handleIncrease = (item) => {
    updateCart({ itemId: item.id, qty: item.qty + 1 }).unwrap().then(() => refetch()).catch(() => alert("Error updating quantity"));
  };

  const handleDecrease = (item) => {
    if (item.qty <= 1) return;
    updateCart({ itemId: item.id, qty: item.qty - 1 }).unwrap().then(() => refetch()).catch(() => alert("Error updating quantity"));
  };

  const handleNoteChange = (itemId, value) => {
    setNotes((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSaveNote = async (itemId) => {
    setSavingNote((prev) => ({ ...prev, [itemId]: true }));
    try {
      await addNote({ itemId, note: notes[itemId] ?? "" }).unwrap();
    } catch {
      alert("Failed to save note");
    } finally {
      setSavingNote((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <FaShoppingBag className="text-indigo-600 text-xl" />
        <h2 className="text-xl font-black text-gray-800">Reseller Cart</h2>
        {totalItems > 0 && (
          <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
            {totalItems} item{totalItems > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── Left: Cart Items ── */}
        <div className="flex-1 w-full">
          {items.length === 0 ? (
            <div className="border rounded-xl p-10 text-center text-gray-400 font-semibold bg-white">
              Your cart is empty.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const imageUrl = item?.product?.primary_image?.file_name
                  ? `${imgBaseUrl}/${item.product.primary_image.file_name}`
                  : null;

                const costPrice = Number(item?.unit_price ?? 0);
                const sellPrice = Number(item?.reseller_price ?? item?.unit_price ?? 0);
                const itemProfit = Number(item?.line_total_reseller_profit ?? (item.qty * (sellPrice - costPrice)));
                const lineTotal = Number(item?.line_total ?? (item.qty * sellPrice));
                const itemMargin = sellPrice > 0 ? ((sellPrice - costPrice) / sellPrice * 100).toFixed(0) : 0;

                return (
                  <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">

                    {/* Top row: image + name + prices + qty + delete */}
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="shrink-0">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item?.product?.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-100" />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-2xl">
                            <FaShoppingBag />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 mb-1">
                          {item?.product?.name || "Product"}
                        </h3>

                        {/* Price badges */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs font-semibold">
                            Cost: {money(costPrice)}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                            <FaTag className="text-[10px]" /> Sell: {money(sellPrice)}
                          </span>
                          {itemProfit > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                              +{money(itemProfit)} profit ({itemMargin}%)
                            </span>
                          )}
                        </div>

                        {/* Qty controls + line total + delete */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDecrease(item)}
                              disabled={item.qty <= 1 || isUpdating}
                              className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 text-base leading-none"
                            >
                              −
                            </button>
                            <div className="w-9 h-7 border border-gray-200 rounded flex items-center justify-center text-sm font-black text-gray-800">
                              {item.qty}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleIncrease(item)}
                              disabled={isUpdating}
                              className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 text-base leading-none"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-black text-gray-800">{money(lineTotal)}</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting}
                            className="ml-auto text-red-400 hover:text-red-600 disabled:opacity-40 p-1"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Note */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-gray-50">
                      <textarea
                        rows={2}
                        placeholder="Customer / delivery note (optional)"
                        value={notes[item.id] ?? (item.note || "")}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        className="flex-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNote(item.id)}
                        disabled={savingNote[item.id]}
                        className="shrink-0 self-end px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition"
                      >
                        {savingNote[item.id] ? "Saving…" : "Save Note"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Profit Summary ── */}
        {items.length > 0 && (
          <div className="w-full lg:w-80 shrink-0">

            {/* Profit highlight card */}
            <div className="rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 p-4 text-white mb-3 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <FaChartLine className="text-lg opacity-90" />
                <span className="text-sm font-bold opacity-90">Your Total Profit</span>
              </div>
              <div className="text-3xl font-black tracking-tight">+{money(resellerProfit)}</div>
              <div className="text-xs opacity-80 mt-0.5">Margin: {profitMargin}% on selling price</div>
            </div>

            {/* Breakdown */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <h4 className="text-sm font-black text-gray-700 mb-3">Order Summary</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Items</span>
                  <span className="font-bold text-gray-800">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Product Cost</span>
                  <span className="font-bold text-gray-700">{money(totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Selling Price</span>
                  <span className="font-bold text-indigo-700">{money(subtotal)}</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between">
                  <span className="font-bold text-gray-500">Your Profit</span>
                  <span className="font-black text-green-600">+{money(resellerProfit)}</span>
                </div>
              </div>

              {/* Per-item profit breakdown */}
              {items.length > 1 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Per Item</p>
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const itemProfit = Number(item?.line_total_reseller_profit ?? 0);
                      return (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 truncate max-w-[60%]">
                            {item?.product?.name || "Item"}
                          </span>
                          <span className="text-xs font-bold text-green-600 shrink-0">+{money(itemProfit)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate("/app/checkout")}
                disabled={totalItems === 0}
                className="mt-4 w-full py-2.5 rounded-xl text-white font-black text-sm transition bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
