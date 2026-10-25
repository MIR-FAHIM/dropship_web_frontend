import React, { useState, useEffect, useMemo } from "react";
import { getAdminBasePrice } from "../../../utils/pricing.utils";
import { useGetProductDetailsQuery } from "../../../redux/features/product";
import {
  useGetCartQuery,
  useClearCartMutation,
  useDeleteCartMutation,
} from "../../../redux/features/cart";
import { imgBaseUrl } from "../../../../config";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShoppingBag,
  Trash2,
  X,
  Zap,
} from "lucide-react";

const safeArray = (value) => (Array.isArray(value) ? value : []);

const ResellerPriceModal = ({
  open,
  onClose,
  product,
  modalAction = "quickOrder",
  isSubmitting,
  outOfStock,
  onSubmit,
  userId,
}) => {
  const activeUserId = userId || localStorage.getItem("userId");
  const basePrice = getAdminBasePrice(product);

  const [resellerPrice, setResellerPrice] = useState(() =>
    basePrice > 0 ? String(basePrice) : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [showCartDetails, setShowCartDetails] = useState(false);
  const [cartClearedLocally, setCartClearedLocally] = useState(false);

  // If product doesn't have product_attributes loaded, fetch details
  const shouldFetchDetails = Boolean(open && product?.id && !product?.product_attributes);
  const { data: detailsData, isLoading: isLoadingDetails } = useGetProductDetailsQuery(
    product?.id,
    { skip: !shouldFetchDetails }
  );

  const resolvedProduct = detailsData?.data || detailsData || product;

  // Attributes list
  const attributes = useMemo(() => {
    const rawAttrs = product?.product_attributes || resolvedProduct?.product_attributes;
    if (Array.isArray(rawAttrs)) return rawAttrs;
    if (typeof rawAttrs === "string") {
      try {
        const parsed = JSON.parse(rawAttrs);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [product?.product_attributes, resolvedProduct?.product_attributes]);

  // Group attributes by attribute name (e.g. Color, Size)
  const groupedAttributes = useMemo(() => {
    if (!attributes || attributes.length === 0) return {};
    return attributes.reduce((acc, attr) => {
      const name = attr.attribute?.name || "Variant";
      if (!acc[name]) acc[name] = [];
      acc[name].push(attr);
      return acc;
    }, {});
  }, [attributes]);

  // Initialize prices, qty, and default attribute selections when opened
  useEffect(() => {
    if (open) {
      setResellerPrice(basePrice > 0 ? String(basePrice) : "");
      setQuantity(1);
      setShowCartDetails(false);
      setCartClearedLocally(false);

      if (attributes.length > 0) {
        const initial = {};
        Object.entries(groupedAttributes).forEach(([attrName, attrs]) => {
          const firstInStock = attrs.find((a) => (a.stock ?? 1) > 0) || attrs[0];
          if (firstInStock) {
            initial[attrName] = firstInStock.attribute_value_id;
          }
        });
        setSelectedAttributes(initial);
      } else {
        setSelectedAttributes({});
      }
    }
  }, [open, basePrice, product?.id, groupedAttributes, attributes.length]);

  // Determine which attribute record ID corresponds to current selection
  const selectedAttributeId = useMemo(() => {
    if (!attributes || attributes.length === 0) return null;
    const valueId = Object.values(selectedAttributes).find((v) => v != null);
    if (valueId == null) return null;
    const match = attributes.find(
      (a) => Number(a.attribute_value_id) === Number(valueId)
    );
    return match ? match.id : null;
  }, [attributes, selectedAttributes]);

  // Active cart items query
  const {
    data: cartResponse,
    refetch: refetchCart,
  } = useGetCartQuery(activeUserId, {
    skip: !open || !activeUserId || modalAction !== "quickOrder",
  });

  const [clearCart, { isLoading: isClearingCart }] = useClearCartMutation();
  const [deleteCart, { isLoading: isDeletingItem }] = useDeleteCartMutation();

  const cartData = useMemo(
    () => cartResponse?.data ?? cartResponse?.data?.data ?? cartResponse,
    [cartResponse]
  );

  const cartItems = useMemo(() => {
    if (cartClearedLocally) return [];
    return safeArray(cartData?.items ?? cartData?.data?.items ?? []);
  }, [cartData, cartClearedLocally]);

  const existingCartCount = cartItems.length;

  const handleClearExistingCart = async () => {
    if (!activeUserId) return;
    try {
      try {
        await clearCart(activeUserId).unwrap();
      } catch (err) {
        // Fallback: delete items individually
        if (cartItems.length > 0) {
          await Promise.allSettled(
            cartItems.map((item) => deleteCart(item.id).unwrap())
          );
        }
      }
      localStorage.setItem("cartItems", JSON.stringify([]));
      localStorage.setItem("cart", "0");
      window.dispatchEvent(new Event("cart-updated"));
      setCartClearedLocally(true);
      refetchCart?.();
      toast.success("Cart cleared! Only this quick order item will be ordered.");
    } catch (err) {
      console.error("Failed to clear cart:", err);
      toast.error("Failed to clear cart");
    }
  };

  const handleDeleteCartItem = async (itemId) => {
    try {
      await deleteCart(itemId).unwrap();
      const current = (() => {
        try {
          return JSON.parse(localStorage.getItem("cartItems") || "[]");
        } catch {
          return [];
        }
      })();
      const updated = current.filter((id) => id !== itemId);
      localStorage.setItem("cartItems", JSON.stringify(updated));
      localStorage.setItem("cart", JSON.stringify(Math.max(0, updated.length)));
      window.dispatchEvent(new Event("cart-updated"));
      refetchCart?.();
      toast.success("Item removed from cart");
    } catch (err) {
      console.error("Failed to remove cart item:", err);
      toast.error("Could not remove item");
    }
  };

  if (!open) return null;

  const resellerPriceVal = Number(resellerPrice) || 0;
  const profit = resellerPriceVal - basePrice;
  const margin = basePrice > 0 ? (profit / basePrice) * 100 : 0;
  const totalSell = resellerPriceVal * quantity;
  const totalBase = basePrice * quantity;
  const totalProfit = totalSell - totalBase;

  const productImage = (() => {
    if (product?.primary_image?.url) return product.primary_image.url;
    if (product?.primary_image?.file_name) return `${imgBaseUrl}/${product.primary_image.file_name}`;
    if (typeof product?.thumbnail_img === "string" && product.thumbnail_img.startsWith("http")) {
      return product.thumbnail_img;
    }
    return null;
  })();

  const hasAttributes = attributes.length > 0;
  const isMissingAttributeSelection = hasAttributes && selectedAttributeId == null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md p-5 flex flex-col gap-3.5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            {productImage ? (
              <img
                src={productImage}
                alt=""
                className="w-11 h-11 rounded-xl object-cover border border-gray-100 shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {modalAction === "quickOrder" ? <><Zap className="w-3 h-3 text-yellow-500 fill-current" /> Quick Order</> : "Add to Cart"}
              </span>
              <h3 className="text-sm font-bold text-gray-800 line-clamp-1 mt-0.5">
                {product?.name || "Product"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items notification for Quick Order */}
        {modalAction === "quickOrder" && existingCartCount > 0 && !cartClearedLocally && (
          <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3 flex flex-col gap-2 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-950">
                    You have {existingCartCount} existing item{existingCartCount > 1 ? "s" : ""} in cart!
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                    Quick Order will checkout <strong>{existingCartCount + 1} items</strong> ({existingCartCount} from cart + this product).
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isClearingCart}
                onClick={handleClearExistingCart}
                className="shrink-0 px-2.5 py-1 text-[11px] font-bold text-red-700 bg-red-100 hover:bg-red-200 active:scale-95 rounded-lg transition-all flex items-center gap-1 border border-red-200"
                title="Clear existing cart items so only this product is checked out"
              >
                <Trash2 className="w-3 h-3" />
                {isClearingCart ? "Clearing..." : "Clear Cart"}
              </button>
            </div>

            {/* View / Hide items toggle */}
            <div className="pt-1.5 border-t border-amber-200/60">
              <button
                type="button"
                onClick={() => setShowCartDetails((v) => !v)}
                className="flex items-center justify-between w-full text-[11px] font-semibold text-amber-900 hover:text-amber-950"
              >
                <span>{showCartDetails ? "▲ Hide existing items" : `▼ View ${existingCartCount} existing item${existingCartCount > 1 ? "s" : ""}`}</span>
                {showCartDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showCartDetails && (
                <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {cartItems.map((cItem) => {
                    const itemImg = cItem?.product?.primary_image?.file_name
                      ? `${imgBaseUrl}/${cItem.product.primary_image.file_name}`
                      : cItem?.product?.thumbnail_img;
                    return (
                      <div
                        key={cItem.id}
                        className="flex items-center justify-between gap-2 p-1.5 bg-white/90 rounded-lg border border-amber-200/80 text-[11px]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {itemImg ? (
                            <img src={itemImg} alt="" className="w-7 h-7 rounded object-cover shrink-0 border" />
                          ) : (
                            <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate leading-tight">
                              {cItem?.product?.name || "Product"}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Qty: {cItem?.qty || 1} • ৳{cItem?.reseller_price || cItem?.product?.admin_price || 0}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCartItem(cItem.id)}
                          disabled={isDeletingItem}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove this item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation when cart is cleared */}
        {modalAction === "quickOrder" && cartClearedLocally && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 flex items-center gap-2 text-xs text-emerald-800 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Cart cleared! Only this quick order item will be ordered.</span>
          </div>
        )}

        {/* Product Attributes / Variants */}
        {isLoadingDetails && !hasAttributes ? (
          <div className="py-2 flex items-center gap-2 text-xs text-gray-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
            <span>Loading product options...</span>
          </div>
        ) : hasAttributes ? (
          <div className="flex flex-col gap-2.5 bg-gray-50/80 rounded-xl p-3 border border-gray-100">
            {Object.entries(groupedAttributes).map(([attrName, attrs]) => {
              const currentSelectedId = selectedAttributes[attrName];
              const selectedAttr = attrs.find((a) => a.attribute_value_id === currentSelectedId);
              return (
                <div key={attrName} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">{attrName}:</span>
                    {selectedAttr && (
                      <span className="text-gray-500 font-medium">
                        Selected: <strong className="text-gray-900">{selectedAttr.value?.value}</strong>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attrs.map((attr) => {
                      const isSelected = currentSelectedId === attr.attribute_value_id;
                      const isColor = Boolean(attr.value?.color_code);
                      const hasStock = (attr.stock ?? 1) > 0;
                      return (
                        <button
                          key={attr.id}
                          type="button"
                          disabled={!hasStock}
                          onClick={() =>
                            setSelectedAttributes((prev) => ({
                              ...prev,
                              [attrName]: attr.attribute_value_id,
                            }))
                          }
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? "border-black bg-gray-900 text-white shadow-xs ring-2 ring-gray-900/20"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                          } ${!hasStock ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                        >
                          {isColor && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/50 shrink-0"
                              style={{ backgroundColor: attr.value.color_code }}
                            />
                          )}
                          <span>{attr.value?.value || "Option"}</span>
                          {attr.stock != null && attr.stock <= 5 && (
                            <span className={`text-[10px] ${isSelected ? "text-amber-300" : "text-amber-600"}`}>
                              ({attr.stock} left)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Base price */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
          <span className="text-xs text-gray-500 font-medium">Admin / Base Price</span>
          <span className="text-sm font-black text-gray-800">৳{basePrice.toLocaleString()}</span>
        </div>

        {/* Reseller price input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Your Selling Price</label>
          <div className="flex items-center border-2 border-gray-200 focus-within:border-[#158E72] rounded-xl overflow-hidden transition-colors">
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
            <p className="text-[10px] text-gray-500 font-medium">Profit / item</p>
            <p className={`text-sm font-black ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>
              ৳{Number.isFinite(profit) ? profit.toFixed(0) : 0}
            </p>
          </div>
          <div className="rounded-xl px-3 py-2 text-center bg-gray-50">
            <p className="text-[10px] text-gray-500 font-medium">Margin</p>
            <p className="text-sm font-black text-gray-700">{Number.isFinite(margin) ? margin.toFixed(1) : 0}%</p>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">Quantity</span>
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
            <p className="text-[10px] text-gray-500 font-medium">Total Sell</p>
            <p className="text-xs font-black text-gray-800">৳{Number.isFinite(totalSell) ? totalSell.toFixed(0) : 0}</p>
          </div>
          <div className="rounded-xl px-2 py-2 text-center bg-gray-50">
            <p className="text-[10px] text-gray-500 font-medium">Total Cost</p>
            <p className="text-xs font-black text-gray-800">৳{Number.isFinite(totalBase) ? totalBase.toFixed(0) : 0}</p>
          </div>
          <div className={`rounded-xl px-2 py-2 text-center ${totalProfit >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <p className="text-[10px] text-gray-500 font-medium">Total Profit</p>
            <p className={`text-xs font-black ${totalProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
              ৳{Number.isFinite(totalProfit) ? totalProfit.toFixed(0) : 0}
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          disabled={
            isSubmitting ||
            outOfStock ||
            resellerPriceVal < basePrice ||
            isMissingAttributeSelection
          }
          onClick={() => onSubmit(resellerPriceVal, quantity, selectedAttributeId)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-sm
            ${
              isSubmitting ||
              outOfStock ||
              resellerPriceVal < basePrice ||
              isMissingAttributeSelection
                ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400"
                : modalAction === "quickOrder"
                ? "bg-black text-white hover:bg-gray-800 active:scale-[0.99]"
                : "bg-red-600 text-white hover:bg-red-700 active:scale-[0.99]"
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing…
            </span>
          ) : modalAction === "quickOrder" ? (
            existingCartCount > 0 && !cartClearedLocally ? (
              `⚡ Confirm Quick Order (${existingCartCount + 1} items)`
            ) : (
              "⚡ Confirm Quick Order"
            )
          ) : (
            "🛒 Add to Cart"
          )}
        </button>
      </div>
    </div>
  );
};

export default ResellerPriceModal;
