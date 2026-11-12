import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminBasePrice } from "../../../utils/pricing.utils";
import { appendLocationToAddress } from "../../../utils/address.utils";
import { useGetProductDetailsQuery } from "../../../redux/features/product";
import { imgBaseUrl } from "../../../../config";
import { toast } from "sonner";
import {
  useGetDivisionsQuery,
  useGetDistrictsQuery,
  useGetUpazilasQuery,
  useCalculateDeliveryChargeQuery,
} from "../../../redux/features/address";
import { useCheckAdvanceRequirementQuery } from "../../../redux/features/order";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  HelpCircle,
  Info,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
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
  initialData = null,
}) => {
  const navigate = useNavigate();
  const activeUserId = userId || localStorage.getItem("userId");
  const basePrice = getAdminBasePrice(product);
  const listedMaxResellPrice = Number(product?.max_resell_price);
  const hasListedMaxResellPrice = Number.isFinite(listedMaxResellPrice) && listedMaxResellPrice > 0;

  // Attributes & Product Resolution
  const shouldFetchDetails = Boolean(open && product?.id && (
    !product?.product_attributes || (modalAction === "quickOrder" && !hasListedMaxResellPrice)
  ));
  const { currentData: detailsData, isLoading: isLoadingDetails } = useGetProductDetailsQuery(
    product?.id,
    { skip: !shouldFetchDetails }
  );

  const resolvedProduct = detailsData?.data || detailsData || product;

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

  const groupedAttributes = useMemo(() => {
    if (!attributes || attributes.length === 0) return {};
    return attributes.reduce((acc, attr) => {
      const name = attr.attribute?.name || "Variant";
      if (!acc[name]) acc[name] = [];
      acc[name].push(attr);
      return acc;
    }, {});
  }, [attributes]);

  // Form states
  const [resellerPrice, setResellerPrice] = useState(() =>
    basePrice > 0 ? String(basePrice) : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({});

  // Quick Order Step 1 fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedThanaId, setSelectedThanaId] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [editedCollectionAmount, setEditedCollectionAmount] = useState(null);
  const savedCollectionAmount = initialData?.collectionAmount;

  useEffect(() => {
    setEditedCollectionAmount(null);
  }, [open, product?.id, savedCollectionAmount]);

  // Address Queries
  const { data: divisionsData, isLoading: loadingDivisions } = useGetDivisionsQuery(undefined, {
    skip: !open || modalAction !== "quickOrder",
  });
  const divisions = safeArray(divisionsData?.data ?? divisionsData ?? []);

  const { data: districtsData, isLoading: loadingDistricts } = useGetDistrictsQuery(
    selectedDivisionId,
    { skip: !open || modalAction !== "quickOrder" || !selectedDivisionId }
  );
  const districts = safeArray(districtsData?.data ?? districtsData ?? []);

  const { data: upazilasData, isLoading: loadingUpazilas } = useGetUpazilasQuery(
    selectedDistrictId,
    { skip: !open || modalAction !== "quickOrder" || !selectedDistrictId }
  );
  const upazilas = safeArray(upazilasData?.data ?? upazilasData ?? []);

  const selectedDivision = useMemo(
    () => divisions.find((d) => String(d.id) === String(selectedDivisionId)),
    [divisions, selectedDivisionId]
  );
  const selectedDistrict = useMemo(
    () => districts.find((d) => String(d.id) === String(selectedDistrictId)),
    [districts, selectedDistrictId]
  );
  const selectedThana = useMemo(
    () => upazilas.find((u) => String(u.id) === String(selectedThanaId)),
    [upazilas, selectedThanaId]
  );

  // Vendor district resolution for courier charge
  const vendorDistrictId = useMemo(() => {
    return (
      resolvedProduct?.shop?.district_id ??
      resolvedProduct?.vendor?.district_id ??
      resolvedProduct?.vendor?.district?.id ??
      null
    );
  }, [resolvedProduct]);

  // Dynamic delivery charge calculation
  const {
    data: deliveryChargeData,
    isLoading: loadingCharge,
    isFetching: fetchingCharge,
    error: chargeError,
  } = useCalculateDeliveryChargeQuery(
    {
      vendor_district_id: vendorDistrictId || undefined,
      customer_district_id: selectedDistrictId,
      division_id: selectedDivisionId,
    },
    { skip: !open || modalAction !== "quickOrder" || !selectedDistrictId }
  );

  const isCalculatingCharge = Boolean(selectedDistrictId && (loadingCharge || fetchingCharge));
  const hasCalculatedDelivery = Boolean(
    selectedDistrictId &&
      !isCalculatingCharge &&
      !chargeError &&
      deliveryChargeData?.data?.charge !== undefined
  );
  const deliveryCharge = hasCalculatedDelivery ? Number(deliveryChargeData?.data?.charge) : 0;
  const deliveryZone = deliveryChargeData?.data?.zone ?? "";

  // Reliability Balance Query
  const { data: advanceReqData } = useCheckAdvanceRequirementQuery(activeUserId, {
    skip: !open || !activeUserId || modalAction !== "quickOrder",
  });
  const eligibility = advanceReqData?.data || {};
  const requiresAdvance = Boolean(eligibility.requires_advance);
  const completedOrdersCount = eligibility.completed_orders_count ?? 0;
  const availableWalletBalance = Number(eligibility.available_wallet_balance ?? 0);

  // Initialize/Reset values when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setCustomerName(initialData.customerName || "");
        setCustomerPhone(initialData.customerPhone || "");
        setSelectedDivisionId(initialData.divisionId ? String(initialData.divisionId) : "");
        setSelectedDistrictId(initialData.districtId ? String(initialData.districtId) : "");
        setSelectedThanaId(initialData.thanaId ? String(initialData.thanaId) : "");
        setAddress(initialData.address || "");
        setNote(initialData.note || "");
        setQuantity(initialData.quantity || 1);
      } else {
        setCustomerName("");
        setCustomerPhone("");
        setSelectedDivisionId("");
        setSelectedDistrictId("");
        setSelectedThanaId("");
        setAddress("");
        setNote("");
        setQuantity(1);
      }

      setResellerPrice(basePrice > 0 ? String(basePrice) : "");

      // Attributes default selection
      if (attributes.length > 0) {
        const initial = {};
        Object.entries(groupedAttributes).forEach(([attrName, attrs]) => {
          if (initialData?.selectedAttributes && initialData.selectedAttributes[attrName] !== undefined) {
            initial[attrName] = initialData.selectedAttributes[attrName];
          } else {
            const firstInStock = attrs.find((a) => (a.stock ?? 1) > 0) || attrs[0];
            if (firstInStock) {
              initial[attrName] = firstInStock.attribute_value_id;
            }
          }
        });
        setSelectedAttributes(initial);
      } else {
        setSelectedAttributes({});
      }
    }
  }, [open, basePrice, product?.id, groupedAttributes, attributes.length, initialData]);

  // Selected attribute ID & readable label
  const selectedAttributeId = useMemo(() => {
    if (!attributes || attributes.length === 0) return null;
    const valueId = Object.values(selectedAttributes).find((v) => v != null);
    if (valueId == null) return null;
    const match = attributes.find(
      (a) => Number(a.attribute_value_id) === Number(valueId)
    );
    return match ? match.id : null;
  }, [attributes, selectedAttributes]);

  const selectedAttributeLabel = useMemo(() => {
    if (!attributes || attributes.length === 0) return "";
    return Object.entries(selectedAttributes)
      .map(([attrName, valId]) => {
        const match = attributes.find(
          (a) => Number(a.attribute_value_id) === Number(valId)
        );
        return match ? `${attrName}: ${match.value?.value || ""}` : "";
      })
      .filter(Boolean)
      .join(", ");
  }, [attributes, selectedAttributes]);

  // Financial calculations
  const productCost = basePrice * quantity;
  const maxResellPrice = hasListedMaxResellPrice ? listedMaxResellPrice : Number(resolvedProduct?.max_resell_price);
  const suggestedCollectionAmount = Number.isFinite(maxResellPrice) && maxResellPrice > 0
    ? String(Math.round(maxResellPrice * quantity * 100) / 100)
    : "";
  const collectionAmount = editedCollectionAmount ?? (
    savedCollectionAmount == null || savedCollectionAmount === "" ? suggestedCollectionAmount : String(savedCollectionAmount)
  );

  const codAmount = Number(collectionAmount) || 0;
  const codFee = Math.round(codAmount * 0.01);
  const estimatedProfit = codAmount - productCost - deliveryCharge - codFee;

  const productImage = useMemo(() => {
    if (product?.primary_image?.url) return product.primary_image.url;
    if (product?.primary_image?.file_name)
      return `${imgBaseUrl}/${product.primary_image.file_name}`;
    if (typeof product?.thumbnail_img === "string" && product.thumbnail_img.startsWith("http")) {
      return product.thumbnail_img;
    }
    return null;
  }, [product]);

  const hasAttributes = attributes.length > 0;
  const isMissingAttributeSelection = hasAttributes && selectedAttributeId == null;

  if (!open) return null;

  // Step 2: Validate and continue to Checkout (No order creation, no balance deduction)
  const handleContinueToCheckout = (e) => {
    e?.preventDefault?.();

    if (isMissingAttributeSelection) {
      toast.error("দয়া করে প্রডাক্ট ভ্যারিয়েন্ট নির্বাচন করুন");
      return;
    }
    if (!customerName.trim()) {
      toast.error("কাস্টমারের পুরো নাম লিখুন");
      return;
    }
    const cleanPhone = customerPhone.trim();
    if (!cleanPhone || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
      toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)");
      return;
    }
    if (!selectedDivisionId) {
      toast.error("বিভাগ নির্বাচন করুন");
      return;
    }
    if (!selectedDistrictId) {
      toast.error("জেলা নির্বাচন করুন");
      return;
    }
    if (!selectedThanaId) {
      toast.error("থানা / উপজেলা নির্বাচন করুন");
      return;
    }
    const finalAddress = appendLocationToAddress(
      address.trim(),
      selectedThana?.name || "",
      selectedDistrict?.name || ""
    );
    if (!finalAddress || finalAddress.length < 5) {
      toast.error("কাস্টমারের বিস্তারিত ডেলিভারি ঠিকানা লিখুন (কমপক্ষে ৫ অক্ষর)");
      return;
    }
    if (!hasCalculatedDelivery || deliveryCharge <= 0) {
      toast.error("ডেলিভারি চার্জ গণনা সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন");
      return;
    }
    if (codAmount <= 0) {
      toast.error("কাস্টমার কালেকশন এমাউন্ট (COD) লিখুন");
      return;
    }
    if (estimatedProfit < 0) {
      toast.error("কাস্টমার কালেকশন এমাউন্ট প্রোডাক্ট খরচ ও ডেলিভারি চার্জের চেয়ে বেশি হতে হবে যেন লাভ থাকে");
      return;
    }

    setAddress(finalAddress);

    const quickOrderData = {
      product: resolvedProduct,
      quantity,
      selectedAttributeId,
      selectedAttributeLabel,
      collectionAmount: codAmount,
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      divisionId: selectedDivisionId,
      divisionName: selectedDivision?.name || "",
      districtId: selectedDistrictId,
      districtName: selectedDistrict?.name || "",
      thanaId: selectedThanaId,
      thanaName: selectedThana?.name || "",
      address: finalAddress,
      note: note.trim(),
      deliveryCharge,
      deliveryZone,
      codFee,
      productCost,
      basePrice,
      estimatedProfit,
      requiresAdvance,
      completedOrdersCount,
      availableWalletBalance,
      minOrdersThreshold: eligibility.min_orders_threshold ?? 5,
    };

    // Store in sessionStorage fallback
    sessionStorage.setItem("quickOrderData", JSON.stringify(quickOrderData));
    onClose?.();
    navigate("/app/checkout", { state: { quickOrderData } });
  };

  // Standard cart submission handler
  const handleCartSubmit = () => {
    const resellerPriceVal = Number(resellerPrice) || 0;
    if (resellerPriceVal < basePrice) {
      toast.error(`Selling price must be at least ৳${basePrice}`);
      return;
    }
    if (isMissingAttributeSelection) {
      toast.error("Please select a variant");
      return;
    }
    onSubmit?.(resellerPriceVal, quantity, selectedAttributeId);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh] my-auto overflow-hidden transition-all ${
          modalAction === "quickOrder" ? "max-w-xl" : "max-w-md"
        }`}
        style={{ margin: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50/90 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            {productImage ? (
              <img
                src={productImage}
                alt=""
                className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center shrink-0 text-gray-500">
                <ShoppingBag className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  {modalAction === "quickOrder" ? (
                    <>
                      <Zap className="w-3 h-3 text-yellow-500 fill-current" /> Step 1: Quick Order Details
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </span>
                <span className="text-[11px] font-bold text-gray-500">
                  Base: ৳{basePrice}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 truncate mt-0.5" title={product?.name}>
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto flex-1">

          {/* Product Variant / Attribute Selection */}
          {hasAttributes && (
            <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200/70">
              <p className="text-xs font-bold text-gray-700 mb-2">প্রডাক্ট ভ্যারিয়েন্ট নির্বাচন করুন:</p>
              <div className="flex flex-col gap-2.5">
                {Object.entries(groupedAttributes).map(([attrName, attrs]) => (
                  <div key={attrName} className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">{attrName}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {attrs.map((attr) => {
                        const isSelected = selectedAttributes[attrName] === attr.attribute_value_id;
                        const inStock = (attr.stock ?? 1) > 0;
                        const isColor = Boolean(attr.value?.color_code);
                        return (
                          <button
                            key={attr.id}
                            type="button"
                            disabled={!inStock}
                            onClick={() =>
                              setSelectedAttributes((prev) => ({
                                ...prev,
                                [attrName]: attr.attribute_value_id,
                              }))
                            }
                            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                : inStock
                                ? "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                            }`}
                          >
                            {isColor && (
                              <span
                                className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: attr.value.color_code }}
                              />
                            )}
                            {attr.value?.value || "Default"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200/70">
            <div>
              <p className="text-xs font-bold text-gray-800">অর্ডার পরিমাণ (Quantity)</p>
              <p className="text-[11px] text-gray-500">মোট বেস খরচ: ৳{productCost}</p>
            </div>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-base"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val >= 1) setQuantity(val);
                }}
                className="w-10 text-center text-xs font-black text-gray-800 outline-none border-x border-gray-200 py-1"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-base"
              >
                +
              </button>
            </div>
          </div>

          {/* ═════════ MODAL ACTION === QUICK ORDER (Step 1 Fields) ═════════ */}
          {modalAction === "quickOrder" && (
            <>
              {/* Customer Info Card */}
              <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 border-b border-indigo-100 pb-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>কাস্টমারের তথ্য (Customer Details)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      কাস্টমারের নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="পুরো নাম লিখুন"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX (১১ ডিজিট)"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full text-xs font-medium pl-8 pr-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
                      />
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Hierarchy Card */}
              <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ডেলিভারি ঠিকানা ও লোকেশন হায়ারার্কি</span>
                  </div>
                  {deliveryZone && hasCalculatedDelivery && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      {deliveryZone} (৳{deliveryCharge})
                    </span>
                  )}
                </div>

                {/* Division > District > Thana Cascades */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">
                      ১. বিভাগ (Division) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedDivisionId}
                      onChange={(e) => {
                        setSelectedDivisionId(e.target.value);
                        setSelectedDistrictId("");
                        setSelectedThanaId("");
                      }}
                      className="w-full text-xs px-2.5 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="">বিভাগ সিলেক্ট করুন</option>
                      {divisions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">
                      ২. জেলা (District) <span className="text-red-500">*</span>
                    </label>
                    <select
                      disabled={!selectedDivisionId || loadingDistricts}
                      value={selectedDistrictId}
                      onChange={(e) => {
                        const newDistId = e.target.value;
                        const prevDist = selectedDistrict?.name;
                        const prevThana = selectedThana?.name;
                        setSelectedDistrictId(newDistId);
                        setSelectedThanaId("");
                        const newDist = districts.find((d) => String(d.id) === String(newDistId));
                        if (address.trim() && newDist?.name) {
                          setAddress((prev) =>
                            appendLocationToAddress(prev, "", newDist.name, prevThana, prevDist)
                          );
                        }
                      }}
                      className="w-full text-xs px-2.5 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500 font-medium disabled:opacity-50"
                    >
                      <option value="">
                        {!selectedDivisionId ? "আগে বিভাগ সিলেক্ট করুন" : "জেলা সিলেক্ট করুন"}
                      </option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">
                      ৩. থানা/উপজেলা <span className="text-red-500">*</span>
                    </label>
                    <select
                      disabled={!selectedDistrictId || loadingUpazilas}
                      value={selectedThanaId}
                      onChange={(e) => {
                        const newThanaId = e.target.value;
                        const prevThana = selectedThana?.name;
                        const currDist = selectedDistrict?.name;
                        setSelectedThanaId(newThanaId);
                        const newThana = upazilas.find((u) => String(u.id) === String(newThanaId));
                        if (address.trim() && (newThana?.name || currDist)) {
                          setAddress((prev) =>
                            appendLocationToAddress(prev, newThana?.name, currDist, prevThana, currDist)
                          );
                        }
                      }}
                      className="w-full text-xs px-2.5 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500 font-medium disabled:opacity-50"
                    >
                      <option value="">
                        {!selectedDistrictId ? "আগে জেলা সিলেক্ট করুন" : "থানা সিলেক্ট করুন"}
                      </option>
                      {upazilas.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery charge status note */}
                {selectedDistrictId && (
                  <div className="text-[11px] flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-gray-600 font-medium">ডেলিভারি চার্জ:</span>
                    {isCalculatingCharge ? (
                      <span className="text-indigo-600 flex items-center gap-1 font-bold">
                        <Loader2 className="w-3 h-3 animate-spin" /> হিসাব হচ্ছে…
                      </span>
                    ) : hasCalculatedDelivery ? (
                      <span className="text-indigo-700 font-black">
                        ৳{deliveryCharge} ({deliveryZone})
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold">গণনা করা যায়নি</span>
                    )}
                  </div>
                )}

                {/* Detailed delivery address */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-gray-700">
                      বিস্তারিত ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                    </label>
                    {[selectedThana?.name, selectedDistrict?.name].some(Boolean) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (address.trim()) {
                            setAddress((prev) =>
                              appendLocationToAddress(prev, selectedThana?.name, selectedDistrict?.name)
                            );
                          } else {
                            setAddress([selectedThana?.name, selectedDistrict?.name].filter(Boolean).join(", "));
                          }
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition active:scale-95"
                      >
                        + থানা ও জেলা যুক্ত করুন
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="বাড়ি নং, রোড নং, এলাকা, গ্রাম বা পরিচিত কোনো ল্যান্ডমার্ক"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => {
                      if (address.trim() && (selectedThana?.name || selectedDistrict?.name)) {
                        setAddress((prev) =>
                          appendLocationToAddress(prev, selectedThana?.name, selectedDistrict?.name)
                        );
                      }
                    }}
                    className="w-full text-xs font-medium px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
                  />

                  {/* Real-time full address preview */}
                  {Boolean(selectedThana?.name || selectedDistrict?.name) && (
                    <div className="mt-1 flex flex-col gap-1">
                      {address.trim() ? (
                        <div className="text-[11px] text-emerald-900 bg-emerald-50/80 border border-emerald-200 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">
                            <span className="font-semibold text-gray-600">পূর্ণাঙ্গ ঠিকানা: </span>
                            <span className="font-bold text-gray-900">
                              {appendLocationToAddress(address, selectedThana?.name, selectedDistrict?.name)}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          💡 থানা ও জেলা ({[selectedThana?.name, selectedDistrict?.name].filter(Boolean).join(", ")}) ঠিকানা লেখার পর শেষে স্বয়ংক্রিয়ভাবে যুক্ত হবে।
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Optional note */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">
                    অর্ডার নোট (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="ডেলিভারির বিশেষ কোনো নির্দেশনা থাকলে লিখুন"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Financial Calculation & COD Fee Box */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-800">
                      Customer Collection Amount (COD) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-gray-500">
                      কুরিয়ার কাস্টমার থেকে মোট যে টাকা সংগ্রহ করবে
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={productCost + deliveryCharge + codFee}
                      value={collectionAmount}
                      onChange={(e) => setEditedCollectionAmount(e.target.value)}
                      className="w-full text-sm font-black text-gray-900 pl-8 pr-3 py-2 bg-white rounded-xl border-2 border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="যেমন: 1200"
                    />
                    <span className="absolute left-3 top-2 text-sm font-black text-gray-500">৳</span>
                  </div>
                  <p className="text-[11px] font-medium text-emerald-900 mt-1.5 flex items-center gap-1">
                    ডেলিভারি চার্জ ও COD অ্যামাউন্টের ১% ফি-সহ কাস্টমারের কাছ থেকে মোট যে টাকা সংগ্রহ করতে চান, তা লিখুন। আলাদা করে যোগ করতে হবে না। যেমন, ১২০০ লিখলে কাস্টমারের কাছ থেকে মোট ১২০০ টাকাই সংগ্রহ করা হবে।
                  </p>
                </div>

                {/* Live Formula Breakdown */}
                <div className="rounded-xl border border-emerald-100 bg-white/90 p-3 sm:p-4" aria-label="সম্ভাব্য লাভের হিসাব">
                  <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-2 text-xs">
                    <span className="font-semibold text-gray-600">কাস্টমারের কাছ থেকে সংগ্রহ</span>
                    <span className="font-black text-gray-900">৳{codAmount}</span>
                  </div>
                  <div className="space-y-2 py-2.5 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-gray-600"><span className="w-4 text-center font-black text-rose-500">−</span>প্রোডাক্ট খরচ</span>
                      <span className="font-bold text-gray-800">৳{productCost}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-gray-600"><span className="w-4 text-center font-black text-rose-500">−</span>ডেলিভারি চার্জ</span>
                      {!selectedDistrictId || (hasCalculatedDelivery && deliveryCharge <= 0) ? (
                        <span className="rounded-md bg-amber-50 px-2 py-1 text-right text-[10px] font-bold text-amber-800">আগে ঠিকানা নির্বাচন করুন</span>
                      ) : isCalculatingCharge ? (
                        <span className="text-[10px] font-bold text-indigo-600">হিসাব হচ্ছে…</span>
                      ) : hasCalculatedDelivery ? (
                        <span className="font-bold text-gray-800">৳{deliveryCharge}</span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-600">চার্জ হিসাব করা যায়নি</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-gray-600"><span className="w-4 text-center font-black text-rose-500">−</span>১% COD ফি</span>
                      <span className="font-bold text-gray-800">৳{codFee}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t-2 border-emerald-200 pt-2.5">
                    <span className="flex items-center gap-2 text-xs font-black text-gray-800"><span className="w-4 text-center text-emerald-700">=</span>সম্ভাব্য প্রফিট</span>
                    <span className={`text-base font-black ${hasCalculatedDelivery && deliveryCharge > 0 ? (estimatedProfit >= 0 ? "text-emerald-700" : "text-red-600") : "text-amber-700"}`}>
                      {hasCalculatedDelivery && deliveryCharge > 0 ? (estimatedProfit >= 0 ? "+" : "−") + "৳" + Math.abs(estimatedProfit) : "—"}
                    </span>
                  </div>
                  {(!selectedDistrictId || (hasCalculatedDelivery && deliveryCharge <= 0)) && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-center text-[11px] font-semibold text-amber-800">
                      সঠিক লাভের হিসাব দেখতে আগে ডেলিভারির ঠিকানা নির্বাচন করুন।
                    </p>
                  )}
                </div>

                {hasCalculatedDelivery && deliveryCharge > 0 && estimatedProfit < 0 && (
                  <p className="text-[11px] font-bold text-red-600 text-center">
                    ⚠️ কালেকশন এমাউন্ট খুবই কম। প্রোডাক্ট ও ডেলিভারি খরচের তুলনায় আপনার ক্ষতি (Loss) হবে।
                  </p>
                )}
              </div>

              {/* Reliability Balance Status Box */}
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 text-xs text-amber-950 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    রিলায়েবিলিটি ব্যালেন্স স্ট্যাটাস
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    অর্ডার সম্পন্ন: {completedOrdersCount}/5
                  </span>
                </div>
                {requiresAdvance ? (
                  <div className="space-y-1.5 text-[11px] leading-relaxed">
                    <p className="text-amber-900 font-semibold">
                      নতুন ড্রপশিপার হিসেবে প্রথম ৫টি সফল অর্ডারের ক্ষেত্রে একাউন্ট সিকিউরিটি হিসেবে রিলায়েবিলিটি ব্যালেন্স প্রযোজ্য।
                    </p>
                    <div className="bg-emerald-50 border border-emerald-200/80 p-2 rounded-lg text-emerald-950 font-medium">
                      💡 <strong>গুরুত্বপূর্ণ তথ্য:</strong> এই টাকাটি কোনো চার্জ বা খরচ নয় — এটি আপনার সিকিউরিটি ব্যালেন্স। অর্ডার সম্পন্ন হওয়ার পর এটি আপনার ওয়ালেটে থাকবে এবং আপনি <strong>যেকোনো সময় এটি উইথড্র (উত্তোলন) করে নিতে পারবেন</strong>।
                    </div>
                    <p className="text-gray-600 text-[10px]">
                      বর্তমান ওয়ালেট ব্যালেন্স: <strong>৳{availableWalletBalance}</strong> (চেকআউট পেজে 'Pay Later' অথবা ওয়ালেট থেকে পরিশোধের সুবিধা পাবেন)।
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    অভিনন্দন! আপনি একজন ভেরিফাইড ড্রপশিপার (৫+ সম্পন্ন অর্ডার)। আপনার জন্য কোনো অগ্রিম সিকিউরিটি ব্যালেন্স আবশ্যক নয়।
                  </p>
                )}
              </div>
            </>
          )}

          {/* ═════════ MODAL ACTION === CART ═════════ */}
          {modalAction === "cart" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  আপনার বিক্রয়মূল্য (Reseller Selling Price)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={basePrice}
                    value={resellerPrice}
                    onChange={(e) => setResellerPrice(e.target.value)}
                    placeholder={`৳${basePrice} বা তার বেশি`}
                    className="w-full text-sm font-bold pl-8 pr-3 py-2 bg-white rounded-xl border border-gray-300 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute left-3 top-2 text-sm font-bold text-gray-400">৳</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/90 shrink-0 flex items-center justify-between gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            বাতিল (Cancel)
          </button>

          {modalAction === "quickOrder" ? (
            <button
              type="button"
              disabled={
                outOfStock ||
                isMissingAttributeSelection ||
                !customerName.trim() ||
                !customerPhone.trim() ||
                !selectedDistrictId ||
                !selectedThanaId ||
                !address.trim() ||
                estimatedProfit < 0
              }
              onClick={handleContinueToCheckout}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                outOfStock ||
                isMissingAttributeSelection ||
                !customerName.trim() ||
                !customerPhone.trim() ||
                !selectedDistrictId ||
                !selectedThanaId ||
                !address.trim() ||
                estimatedProfit < 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
              }`}
            >
              <span>Continue to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || outOfStock || Number(resellerPrice) < basePrice || isMissingAttributeSelection}
              onClick={handleCartSubmit}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResellerPriceModal;
