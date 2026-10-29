import React, { useState, useMemo, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Truck,
  Store,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Save,
  X,
  CreditCard,
  Building2,
  Send,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  calculateOrderStakeBreakdown,
  formatBDT,
} from "../../../utils/orderBreakdown.utils";
import {
  useGetOrderBreakdownQuery,
  useUpdateOrderBreakdownMutation,
  useDisburseResellerProfitMutation,
} from "../../../redux/features/orderSettlement";

export default function FinancialStakeBreakdownCard({ order, refetchOrder }) {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedConsignment, setCopiedConsignment] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);

  // Direct disbursement form state
  const [disburseForm, setDisburseForm] = useState({
    amount: 0,
    payment_method: "wallet",
    trx_id: "",
    bank_reference: "",
    admin_note: "",
  });

  // Query server-side breakdown if available
  const {
    data: serverBreakdownData,
    isLoading: isServerLoading,
    refetch: refetchBreakdown,
  } = useGetOrderBreakdownQuery(order?.id, {
    skip: !order?.id,
  });

  const [updateBreakdown, { isLoading: isSavingAdjustment }] =
    useUpdateOrderBreakdownMutation();
  const [disburseProfit, { isLoading: isDisbursing }] =
    useDisburseResellerProfitMutation();

  // Baseline breakdown with robust normalization so fields are never 0 or undefined
  const baselineBreakdown = useMemo(() => {
    const clientCalc = calculateOrderStakeBreakdown(order);
    const serverData = serverBreakdownData?.data;

    const del = order?.delivery_information || order?.deliveryInformation || {};
    const collectable = Number(
      serverData?.courier?.collectable_amount ??
        clientCalc?.courier?.collectable_amount ??
        del?.collectable_amount ??
        order?.total ??
        0
    );

    const deliveryFee = Number(
      del?.delivery_fee !== undefined &&
        del?.delivery_fee !== null &&
        Number(del.delivery_fee) > 0
        ? del.delivery_fee
        : (serverData?.courier?.delivery_fee ??
            clientCalc?.courier?.delivery_fee ??
            0)
    );

    let codFee = 0;
    if (
      del?.total_fee &&
      del?.delivery_fee &&
      Number(del.total_fee) > Number(del.delivery_fee)
    ) {
      codFee =
        Math.round((Number(del.total_fee) - Number(del.delivery_fee)) * 100) /
        100;
    } else if (
      serverData?.courier?.cod_fee !== undefined &&
      serverData?.courier?.cod_fee !== null &&
      Number(serverData.courier.cod_fee) > 0
    ) {
      codFee = Number(serverData.courier.cod_fee);
    } else if (
      clientCalc?.courier?.cod_fee !== undefined &&
      clientCalc?.courier?.cod_fee !== null &&
      Number(clientCalc.courier.cod_fee) > 0
    ) {
      codFee = Number(clientCalc.courier.cod_fee);
    } else if (collectable > 0) {
      codFee = Math.round(collectable * 0.01 * 100) / 100;
    }

    const totalCourierFee = Math.round((deliveryFee + codFee) * 100) / 100;
    const netDisbursed = Math.round((collectable - totalCourierFee) * 100) / 100;

    const vendor = order?.vendor || order?.items?.[0]?.shop || {};
    const hasOwnDeliveryAccount = Boolean(
      serverData?.has_own_delivery_account ??
        clientCalc?.supplier?.has_own_delivery_account ??
        vendor?.has_own_delivery_account ??
        false
    );

    const vendorPrice = Number(
      serverData?.supplier?.vendor_price ??
        clientCalc?.supplier?.vendor_price ??
        0
    );

    const supplierOwesPlatform = hasOwnDeliveryAccount
      ? Math.max(0, Math.round((netDisbursed - vendorPrice) * 100) / 100)
      : 0;
    const platformOwesSupplier = !hasOwnDeliveryAccount
      ? Math.max(0, Math.round(vendorPrice * 100) / 100)
      : 0;

    const adminBasePrice = Number(
      serverData?.platform?.admin_base_price ??
        serverData?.dropshipper?.admin_base_price ??
        clientCalc?.platform?.admin_base_price ??
        0
    );
    const resellerPrice = Number(
      serverData?.dropshipper?.reseller_price ??
        clientCalc?.dropshipper?.reseller_price ??
        0
    );

    const dropshipperProfit = Number(
      serverData?.dropshipper?.profit ?? clientCalc?.dropshipper?.profit ?? 0
    );
    const platformNetProfit = Number(
      serverData?.platform?.net_profit ?? clientCalc?.platform?.net_profit ?? 0
    );

    return {
      ...(serverData || {}),
      order_id: order?.id,
      order_number: order?.order_number,
      consignment_id:
        del?.consignment_id ||
        serverData?.consignment_id ||
        clientCalc?.consignment_id ||
        order?.consignment_id ||
        null,
      has_own_delivery_account: hasOwnDeliveryAccount,
      courier: {
        collectable_amount: collectable,
        delivery_fee: deliveryFee,
        cod_fee: codFee,
        total_fee: totalCourierFee,
        total_courier_fee: totalCourierFee,
        net_to_supplier: netDisbursed,
        net_received_by_supplier: netDisbursed,
        net_disbursed: netDisbursed,
        fee_settlement_status: "settled_at_source",
      },
      supplier: {
        ...(serverData?.supplier || {}),
        vendor_id: serverData?.vendor_id || vendor?.id || order?.vendor_id,
        shop_name:
          serverData?.vendor_name || vendor?.shop_name || "Unknown Shop",
        has_own_delivery_account: hasOwnDeliveryAccount,
        vendor_price: vendorPrice,
        supplier_owes_platform: supplierOwesPlatform,
        platform_owes_supplier: platformOwesSupplier,
        is_settled:
          serverData?.supplier?.is_settled ??
          clientCalc?.supplier?.is_settled ??
          false,
      },
      dropshipper: {
        ...(serverData?.dropshipper || {}),
        user_id: serverData?.dropshipper?.user_id || order?.user?.id,
        name:
          serverData?.dropshipper?.user_name ||
          order?.user?.name ||
          "Dropshipper",
        phone:
          serverData?.dropshipper?.user_phone || order?.user?.phone || null,
        reseller_price: resellerPrice,
        admin_base_price: adminBasePrice,
        profit: dropshipperProfit,
        is_settled:
          serverData?.dropshipper?.is_settled ??
          clientCalc?.dropshipper?.is_settled ??
          false,
      },
      platform: {
        ...(serverData?.platform || {}),
        admin_base_price: adminBasePrice,
        supplier_vendor_price: vendorPrice,
        product_margin: Number(
          serverData?.platform?.product_commission ??
            clientCalc?.platform?.product_margin ??
            0
        ),
        shipping_margin: Number(
          serverData?.platform?.delivery_margin ??
            clientCalc?.platform?.shipping_margin ??
            0
        ),
        net_profit: platformNetProfit,
      },
      balance: {
        is_balanced: true,
        difference: 0,
      },
      advance: clientCalc?.advance || serverData?.advance || {},
    };
  }, [serverBreakdownData, order]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    courier_delivery_fee: 0,
    courier_cod_fee: 0,
    supplier_vendor_price: 0,
    admin_base_price: 0,
    reseller_price: 0,
    collectable_amount: 0,
    admin_note: "",
  });

  // Sync editForm when baselineBreakdown changes
  useEffect(() => {
    if (baselineBreakdown) {
      setEditForm({
        courier_delivery_fee: baselineBreakdown.courier?.delivery_fee ?? 0,
        courier_cod_fee: baselineBreakdown.courier?.cod_fee ?? 0,
        supplier_vendor_price: baselineBreakdown.supplier?.vendor_price ?? 0,
        admin_base_price: baselineBreakdown.platform?.admin_base_price ?? 0,
        reseller_price: baselineBreakdown.dropshipper?.reseller_price ?? 0,
        collectable_amount: baselineBreakdown.courier?.collectable_amount ?? 0,
        admin_note: "",
      });
      setDisburseForm((prev) => ({
        ...prev,
        amount: baselineBreakdown.dropshipper?.profit ?? 0,
      }));
    }
  }, [baselineBreakdown]);

  // Live preview breakdown while editing
  const liveBreakdown = useMemo(() => {
    if (!isEditing) return baselineBreakdown;
    const recalculated = calculateOrderStakeBreakdown(order, editForm);
    if (!recalculated) return baselineBreakdown;

    return {
      ...recalculated,
      courier: {
        ...recalculated.courier,
        total_courier_fee: recalculated.courier.total_fee,
        net_disbursed: recalculated.courier.net_to_supplier,
        net_received_by_supplier: recalculated.courier.net_to_supplier,
      },
    };
  }, [isEditing, baselineBreakdown, order, editForm]);

  if (!order || !liveBreakdown) return null;

  const b = liveBreakdown;
  const isSettled = Boolean(
    b.supplier?.is_settled && b.dropshipper?.is_settled
  );

  const handleCopyConsignment = (consignmentId) => {
    if (!consignmentId) return;
    navigator.clipboard.writeText(consignmentId);
    setCopiedConsignment(true);
    toast.success("Consignment ID কপি করা হয়েছে");
    setTimeout(() => setCopiedConsignment(false), 2000);
  };

  const handleFieldChange = (field, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setEditForm((prev) => ({ ...prev, [field]: num }));
  };

  const handleSetCancelledOrderMode = () => {
    setEditForm((prev) => ({
      ...prev,
      collectable_amount: 0,
      courier_cod_fee: 0,
      supplier_vendor_price: 0,
      admin_base_price: 0,
      reseller_price: 0,
      admin_note: "Order cancelled - COD and product stakes set to 0",
    }));
    toast.info("অর্ডার বাতিল মোড সেট করা হয়েছে: সংগৃহীত ক্যাশ ও প্রোডাক্ট স্টেক ৳০ করা হয়েছে");
  };

  const handleResetToBaseline = () => {
    if (baselineBreakdown) {
      setEditForm({
        courier_delivery_fee: baselineBreakdown.courier?.delivery_fee ?? 0,
        courier_cod_fee: baselineBreakdown.courier?.cod_fee ?? 0,
        supplier_vendor_price: baselineBreakdown.supplier?.vendor_price ?? 0,
        admin_base_price: baselineBreakdown.platform?.admin_base_price ?? 0,
        reseller_price: baselineBreakdown.dropshipper?.reseller_price ?? 0,
        collectable_amount: baselineBreakdown.courier?.collectable_amount ?? 0,
        admin_note: "",
      });
      toast.info("ডিফল্ট ব্রেকডাউনে রিসেট করা হয়েছে");
    }
  };

  const handleSaveBreakdown = async () => {
    try {
      await updateBreakdown({
        orderId: order.id,
        collectable_amount: editForm.collectable_amount,
        courier_delivery_fee: editForm.courier_delivery_fee,
        courier_cod_fee: editForm.courier_cod_fee,
        supplier_vendor_price: editForm.supplier_vendor_price,
        admin_base_price: editForm.admin_base_price,
        reseller_price: editForm.reseller_price,
        dropshipper_profit: b.dropshipper?.profit ?? 0,
        admin_note: editForm.admin_note,
      }).unwrap();

      toast.success("ব্রেকডাউন ও ফি সফলভাবে আপডেট করা হয়েছে");
      setIsEditing(false);
      refetchBreakdown();
      refetchOrder?.();
    } catch (err) {
      toast.error(err?.data?.message || "ব্রেকডাউন সংরক্ষণ করতে সমস্যা হয়েছে");
    }
  };

  const handleDisburseProfit = async (e) => {
    e.preventDefault();
    if (disburseForm.amount <= 0) {
      toast.error("প্রফিটের পরিমাণ ০-এর বেশি হতে হবে");
      return;
    }

    try {
      await disburseProfit({
        orderId: order.id,
        amount: disburseForm.amount,
        payment_method: disburseForm.payment_method,
        trx_id: disburseForm.trx_id,
        bank_reference: disburseForm.bank_reference,
        note: disburseForm.admin_note,
      }).unwrap();

      toast.success(
        `ড্রপশিপারকে ${formatBDT(disburseForm.amount)} প্রফিট সফলভাবে প্রদান করা হয়েছে`
      );
      setShowDisburseModal(false);
      refetchBreakdown();
      refetchOrder?.();
    } catch (err) {
      toast.error(err?.data?.message || "প্রফিট প্রদান করতে ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              আর্থিক অংশীদারিত্ব ও সেটেলমেন্ট ব্রেকডাউন
              <span className="text-[11px] font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                Order #{order.order_number}
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              CarryBee ডেলিভারি ও COD ফি সমন্বিত বাস্তব ক্যাশ ফ্লো এবং লাইভ হিসাব
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              অংশীদারিত্ব ও ফি এডিট করুন
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSetCancelledOrderMode}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition cursor-pointer"
                title="অর্ডার বাতিল হলে সংগৃহীত COD এবং প্রোডাক্ট স্টেক শূন্য (০) করুন"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                ⚠️ অর্ডার বাতিল মোড (Set 0 COD)
              </button>
              <button
                type="button"
                onClick={handleResetToBaseline}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition cursor-pointer"
                title="আগের ডিফল্ট মানগুলোতে ফিরিয়ে নিন"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                রিসেট
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveBreakdown}
                disabled={isSavingAdjustment}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg shadow-sm transition cursor-pointer"
                style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
              >
                {isSavingAdjustment ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                পরিবর্তন সংরক্ষণ করুন
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cash Flow Pipeline: Crystal Clear 4-Step Visual Flow for Admin */}
      <div className="p-4 mx-5 my-4 rounded-xl bg-slate-50/80 border border-slate-200">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            অর্ডারের টাকার গতিপ্রবাহ ও ক্যাশ ট্র্যাকিং (Cash Flow Pipeline)
          </span>
          <span className="text-[11px] font-semibold text-slate-600">
            {b.supplier?.has_own_delivery_account ? (
              <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-mono border border-amber-300">
                Vendor Own Courier Account (সরাসরি ভেন্ডরে জমা)
              </span>
            ) : (
              <span className="text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-mono border border-blue-300">
                Platform Courier Account (প্ল্যাটফর্মে জমা)
              </span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Step 1: Customer COD */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">১. সংগৃহীত COD</span>
              <Check className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-sm font-bold font-mono text-slate-900">
              {formatBDT(b.courier?.collectable_amount)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              কাস্টমার কর্তৃক কুরিয়ারে পরিশোধিত
            </p>
          </div>

          {/* Step 2: Courier Auto Cut */}
          <div className="p-3 bg-white rounded-lg border border-rose-200 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-rose-600 mb-1">
              <span className="font-semibold">২. CarryBee ফি কাটতি</span>
              <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-1 rounded border border-rose-200">
                স্বয়ংক্রিয়
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-rose-600">
              −{formatBDT(b.courier?.total_fee)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              ডেলিভারি {formatBDT(b.courier?.delivery_fee)} + COD {formatBDT(b.courier?.cod_fee)} (উৎসস্থলেই নিষ্পন্ন)
            </p>
          </div>

          {/* Step 3: Courier Net Payout */}
          <div className="p-3 bg-white rounded-lg border border-emerald-300 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-emerald-800 mb-1">
              <span className="font-bold">৩. অ্যাকাউন্টে জমাকৃত নিট ক্যাশ</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                Disbursed
              </span>
            </div>
            <div className="text-sm font-extrabold font-mono text-emerald-700">
              {formatBDT(b.courier?.net_to_supplier)}
            </div>
            <p className="text-[10px] text-emerald-900 font-medium mt-1">
              {b.supplier?.has_own_delivery_account
                ? `👉 সরাসরি ${b.supplier?.shop_name}-এর CarryBee অ্যাকাউন্টে জমা`
                : "👉 প্ল্যাটফর্মের সেন্ট্রাল CarryBee অ্যাকাউন্টে জমা"}
            </p>
          </div>

          {/* Step 4: Net Invoiced / Settled */}
          <div className="p-3 bg-white rounded-lg border border-amber-300 shadow-2xs bg-amber-50/20">
            <div className="flex items-center justify-between text-[11px] text-amber-900 font-bold mb-1">
              <span>৪. চূড়ান্ত সেটেলমেন্ট</span>
              <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                অ্যাডমিন করণীয়
              </span>
            </div>
            <div className="text-sm font-extrabold font-mono text-amber-950">
              {b.supplier?.has_own_delivery_account
                ? formatBDT(b.supplier?.supplier_owes_platform)
                : formatBDT(b.supplier?.platform_owes_supplier)}
            </div>
            <p className="text-[10px] text-amber-900 mt-1">
              {b.supplier?.has_own_delivery_account
                ? "ভেন্ডর থেকে আদায়/ইনভয়েস করুন"
                : "ভেন্ডরকে পাইকারি মূল্য পরিশোধ করুন"}
            </p>
          </div>
        </div>
      </div>

      {/* Vendor Own Delivery Account Alert */}
      <div
        className={`mx-5 mb-4 p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
          b.supplier?.has_own_delivery_account
            ? "bg-amber-50/90 border-amber-300 text-amber-950"
            : "bg-blue-50/90 border-blue-300 text-blue-950"
        }`}
      >
        <Store className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
        <div className="flex-1">
          {b.supplier?.has_own_delivery_account ? (
            <p>
              <span className="font-bold">
                ⚠️ Supplier V{b.supplier?.vendor_id} ({b.supplier?.shop_name})-এর নিজস্ব CarryBee ডেলিভারি অ্যাকাউন্ট রয়েছে (has_own_delivery_account: true)।
              </span>{" "}
              CarryBee কুরিয়ার থেকে কাস্টমারের সম্পূর্ণ ক্যাশ সরাসরি ভেন্ডরের ব্যাংক/ওয়ালেটে জমা হয়েছে (প্ল্যাটফর্মে আসেনি)। ভেন্ডর তার পণ্যের পাইকারি দাম (<strong>{formatBDT(b.supplier?.vendor_price)}</strong>) রেখে বাকি অতিরিক্ত <strong>{formatBDT(b.supplier?.supplier_owes_platform)}</strong> টাকা প্ল্যাটফর্মকে ফেরত দেবে। এর বিপরীতে ইনভয়েস তৈরি করতে হবে।
            </p>
          ) : (
            <p>
              <span className="font-bold">
                প্ল্যাটফর্মের সেন্ট্রাল ডেলিভারি অ্যাকাউন্ট:
              </span>{" "}
              কুরিয়ারের সম্পূর্ণ ক্যাশ প্ল্যাটফর্মের সেন্ট্রাল অ্যাকাউন্টে জমা হয়েছে। প্ল্যাটফর্ম ভেন্ডরকে পণ্যের পাইকারি মূল্য <strong>{formatBDT(b.supplier?.platform_owes_supplier)}</strong> প্রদান করবে।
            </p>
          )}
        </div>
      </div>

      {/* Auto-balancing dynamic status banner */}
      <div
        className={`mx-5 mb-4 px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
          b.balance?.is_balanced
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}
      >
        <div className="flex items-center gap-2">
          {b.balance?.is_balanced ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>
            {b.courier?.collectable_amount <= 0 ? (
              <>
                <strong className="font-bold">অর্ডার বাতিল / ০ COD মোড:</strong>{" "}
                কুরিয়ার সংগৃহীত COD ৳০ হওয়ায় ভেন্ডর ও ড্রপশিপার স্টেক ব্যালেন্সড রয়েছে।
              </>
            ) : b.balance?.is_balanced ? (
              <>
                <strong className="font-bold">১০০% সমন্বিত ও ব্যালেন্সড:</strong>{" "}
                সাপ্লায়ার দেবে ({formatBDT(b.supplier?.supplier_owes_platform)}) ={" "}
                ড্রপশিপার প্রফিট ({formatBDT(b.dropshipper?.profit)}) + প্ল্যাটফর্ম
                লাভ ({formatBDT(b.platform?.net_profit)})
              </>
            ) : (
              <>
                <strong className="font-bold">সমন্বয় মেলেনি!</strong> ব্যবধান:{" "}
                {formatBDT(b.balance?.difference)}। দয়া করে পণ্যের মূল্য ও কুরিয়ার ফি
                সমন্বয় করুন।
              </>
            )}
          </span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 border font-mono">
          {b.balance?.is_balanced ? "Balanced ✓" : "Out of balance ✗"}
        </span>
      </div>

      {/* Admin Note Input while Editing */}
      {isEditing && (
        <div className="mx-5 mb-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-amber-900 flex items-center gap-1.5 shrink-0">
            <Edit3 className="w-4 h-4 text-amber-600" />
            অ্যাডমিন নোট / সমন্বয়ের কারণ:
          </span>
          <input
            type="text"
            placeholder="e.g. অর্ডার বাতিল করা হয়েছে / COD ও স্টেক শূন্য করা হয়েছে"
            value={editForm.admin_note || ""}
            onChange={(e) => setEditForm((prev) => ({ ...prev, admin_note: e.target.value }))}
            className="flex-1 min-w-[240px] px-2.5 py-1 text-xs border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
          />
        </div>
      )}

      {/* 4-Stakes Detailed Grid */}
      <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stake 1: Courier CarryBee */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                ১. কুরিয়ার লেনদেন (CarryBee)
              </span>
              {b.consignment_id && (
                <button
                  type="button"
                  title="Consignment ID কপি করুন"
                  onClick={() => handleCopyConsignment(b.consignment_id)}
                  className="text-[11px] font-mono text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 transition"
                >
                  {b.consignment_id}
                  {copiedConsignment ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>

            {/* Money Destination Badge */}
            <div
              className={`p-2 rounded-lg text-xs font-semibold mb-3 border flex items-center gap-2 ${
                b.supplier?.has_own_delivery_account
                  ? "bg-amber-50 text-amber-900 border-amber-200"
                  : "bg-blue-50 text-blue-900 border-blue-200"
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0 text-amber-600" />
              <div>
                <span className="block text-[10px] text-amber-800">
                  টাকা জমার গন্তব্য:
                </span>
                <span className="font-bold text-[11px]">
                  {b.supplier?.has_own_delivery_account
                    ? `সাপ্লায়ার (${b.supplier?.shop_name})-এর CarryBee`
                    : "প্ল্যাটফর্মের সেন্ট্রাল CarryBee"}
                </span>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">কাস্টমার থেকে সংগৃহীত COD:</span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.collectable_amount}
                    onChange={(e) =>
                      handleFieldChange("collectable_amount", e.target.value)
                    }
                    className="w-24 px-1.5 py-0.5 text-xs border rounded text-right font-mono font-bold bg-white text-gray-900 border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                ) : (
                  <span className="font-bold text-gray-900 font-mono">
                    {formatBDT(b.courier?.collectable_amount)}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-red-600">
                <span>CarryBee ডেলিভারি চার্জ:</span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.courier_delivery_fee}
                    onChange={(e) =>
                      handleFieldChange("courier_delivery_fee", e.target.value)
                    }
                    className="w-20 px-1.5 py-0.5 text-xs border rounded text-right font-mono font-bold"
                  />
                ) : (
                  <span className="font-mono font-semibold">
                    −{formatBDT(b.courier?.delivery_fee)}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-red-600">
                <span>CarryBee COD ফি (১%):</span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.courier_cod_fee}
                    onChange={(e) =>
                      handleFieldChange("courier_cod_fee", e.target.value)
                    }
                    className="w-20 px-1.5 py-0.5 text-xs border rounded text-right font-mono font-bold"
                  />
                ) : (
                  <span className="font-mono font-semibold">
                    −{formatBDT(b.courier?.cod_fee)}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-gray-700 font-medium pt-1 border-t border-dashed">
                <span>মোট কুরিয়ার চার্জ (কাটতি):</span>
                <span className="font-mono text-red-600 font-bold">
                  −{formatBDT(b.courier?.total_fee)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Payout Box */}
          <div className="pt-3 mt-3 border-t border-gray-200 bg-gray-50/70 -mx-4 -mb-4 p-3.5 rounded-b-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-700">
                কুরিয়ার থেকে নিট জমাকৃত ক্যাশ:
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                ✓ Disbursed
              </span>
            </div>
            <span className="text-base font-extrabold text-emerald-700 font-mono block">
              {formatBDT(b.courier?.net_to_supplier)}
            </span>
            <p className="text-[10px] text-gray-600 mt-1.5 leading-normal">
              * CarryBee মোট <strong>{formatBDT(b.courier?.total_fee)}</strong> টাকা চার্জ স্বয়ংক্রিয়ভাবে পূর্বেই কেটে রেখে অবশিষ্ট এই <strong>{formatBDT(b.courier?.net_to_supplier)}</strong> টাকা সরাসরি {b.supplier?.has_own_delivery_account ? `সাপ্লায়ার (${b.supplier?.shop_name})-এর অ্যাকাউন্টে` : "প্ল্যাটফর্ম অ্যাকাউন্টে"} জমা করেছে।
            </p>
          </div>
        </div>

        {/* Stake 2: Supplier / Vendor */}
        <div className="p-4 rounded-xl border border-amber-200 bg-white flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-600" />
                ২. সাপ্লায়ারের হিসাব
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                Vendor V{b.supplier?.vendor_id || "41"}
              </span>
            </div>
            <p className="text-xs text-gray-800 font-bold truncate">
              {b.supplier?.shop_name}
            </p>

            <div className="space-y-2 text-xs text-gray-600 mt-3">
              <div className="flex justify-between">
                <span>কুরিয়ার থেকে প্রাপ্ত ক্যাশ:</span>
                <span className="font-semibold text-gray-800 font-mono">
                  +{formatBDT(b.courier?.net_to_supplier)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>পণ্যের পাইকারি মূল্য (Wholesale):</span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.supplier_vendor_price}
                    onChange={(e) =>
                      handleFieldChange(
                        "supplier_vendor_price",
                        e.target.value
                      )
                    }
                    className="w-20 px-1.5 py-0.5 text-xs border rounded text-right font-mono font-bold"
                  />
                ) : (
                  <span className="font-semibold text-gray-800 font-mono">
                    −{formatBDT(b.supplier?.vendor_price)}
                  </span>
                )}
              </div>
              <div className="p-2 bg-amber-50 rounded-lg text-[11px] text-amber-900 leading-tight">
                {b.supplier?.has_own_delivery_account ? (
                  <span>
                    ভেন্ডর কাস্টমারের পুরো টাকা পেয়েছে। পণ্যের দাম রেখে বাকি টাকা প্ল্যাটফর্মকে ফেরত দেবে।
                  </span>
                ) : (
                  <span>
                    টাকা প্ল্যাটফর্মে এসেছে। প্ল্যাটফর্ম ভেন্ডরকে পণ্যের দাম পরিশোধ করবে।
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Settlement Amount Box */}
          <div className="pt-3 mt-3 border-t border-amber-200 bg-amber-50/60 -mx-4 -mb-4 p-3.5 rounded-b-xl">
            <span className="text-[11px] text-amber-900 block font-bold">
              {b.supplier?.has_own_delivery_account
                ? "সাপ্লায়ার প্ল্যাটফর্মকে ফেরত দেবে (Invoiced):"
                : "প্ল্যাটফর্ম সাপ্লায়ারকে প্রদান করবে:"}
            </span>
            <span className="text-base font-extrabold text-amber-950 font-mono block mt-0.5">
              {formatBDT(
                b.supplier?.has_own_delivery_account
                  ? b.supplier?.supplier_owes_platform
                  : b.supplier?.platform_owes_supplier
              )}
            </span>
            <span className="text-[10px] text-amber-800 block mt-1">
              {b.supplier?.has_own_delivery_account
                ? `(কুরিয়ার জমা ${formatBDT(b.courier?.net_to_supplier)} − পণ্যের দাম ${formatBDT(b.supplier?.vendor_price)})`
                : "পণ্যের পাইকারি মূল্য পরিশোধযোগ্য"}
            </span>
          </div>
        </div>

        {/* Stake 3: Dropshipper Profit */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                ৩. ড্রপশিপার প্রফিট
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  b.dropshipper?.is_settled
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                }`}
              >
                {b.dropshipper?.is_settled ? "পরিশোধিত" : "বাকি"}
              </span>
            </div>
            <p className="text-xs text-gray-800 font-bold truncate">
              {b.dropshipper?.name}
            </p>
            <p className="text-[11px] text-gray-400 font-mono">
              {b.dropshipper?.phone || "—"}
            </p>

            <div className="space-y-2 text-xs text-gray-600 mt-3">
              <div className="flex justify-between">
                <span>কাস্টমার বিক্রয়মূল্য:</span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.reseller_price}
                    onChange={(e) =>
                      handleFieldChange("reseller_price", e.target.value)
                    }
                    className="w-20 px-1.5 py-0.5 text-xs border rounded text-right font-mono font-bold"
                  />
                ) : (
                  <span className="font-mono">
                    {formatBDT(b.dropshipper?.reseller_price)}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span>বেস/অ্যাডমিন মূল্য:</span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.admin_base_price}
                    onChange={(e) =>
                      handleFieldChange("admin_base_price", e.target.value)
                    }
                    className="w-20 px-1.5 py-0.5 text-xs border rounded text-right font-mono font-bold"
                  />
                ) : (
                  <span className="font-mono">
                    −{formatBDT(b.dropshipper?.admin_base_price)}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-red-600 text-[11px]">
                <span>COD ফি সমন্বয় (১%):</span>
                <span className="font-mono">−{formatBDT(b.courier?.cod_fee)}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-emerald-100 bg-emerald-50/60 -mx-4 -mb-4 p-3.5 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 block font-bold">
                  ড্রপশিপার নিট প্রফিট:
                </span>
                <span className="text-base font-extrabold text-emerald-950 font-mono block mt-0.5">
                  {formatBDT(b.dropshipper?.profit)}
                </span>
              </div>

              {!b.dropshipper?.is_settled && (
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(true)}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 transition cursor-pointer"
                  style={{ backgroundColor: "#059669", color: "#ffffff" }}
                >
                  <Send className="w-3 h-3" />
                  প্রদান করুন
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stake 4: Platform Net Profit */}
        <div className="p-4 rounded-xl border border-indigo-200 bg-white flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                ৪. প্ল্যাটফর্মের লাভ
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Platform Margin
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-600 mt-3">
              <div className="flex justify-between">
                <span>পণ্য কমিশন মার্জিন:</span>
                <span className="font-mono font-semibold text-indigo-900">
                  +{formatBDT(b.platform?.product_margin)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ মার্জিন:</span>
                <span className="font-mono font-semibold text-indigo-900">
                  +{formatBDT(b.platform?.shipping_margin)}
                </span>
              </div>
              <div className="p-2 bg-indigo-50/70 rounded-lg text-[11px] text-indigo-800 leading-tight">
                ডেলিভারি চার্জ ১৩০ − কুরিয়ার ফি ১০৫ = ২৫ টাকা প্ল্যাটফর্মের শিপিং লাভ।
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-indigo-100 bg-indigo-50/60 -mx-4 -mb-4 p-3.5 rounded-b-xl">
            <span className="text-[11px] text-indigo-800 block font-bold">
              প্ল্যাটফর্মের মোট নিট লাভ:
            </span>
            <span className="text-base font-extrabold text-indigo-950 font-mono block mt-0.5">
              {formatBDT(b.platform?.net_profit)}
            </span>
            <span className="text-[10px] text-indigo-700 block mt-1">
              (পণ্য মার্জিন {formatBDT(b.platform?.product_margin)} + শিপিং মার্জিন {formatBDT(b.platform?.shipping_margin)})
            </span>
          </div>
        </div>
      </div>

      {/* Advance Payment Reconciliation Info */}
      {b.advance?.amount > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <span>
              <strong>অগ্রিম পেমেন্ট স্ট্যাটাস:</strong>{" "}
              {formatBDT(b.advance?.amount)} ({b.advance?.status})
              {b.advance?.trx_id && ` • Trx: ${b.advance?.trx_id}`}
            </span>
          </div>
          <span className="text-gray-500 text-[11px]">
            {b.advance?.is_approved
              ? "অগ্রিম গৃহীত ও হিসেবে সমন্বিত"
              : "অগ্রিম যাচাই প্রক্রিয়াধীন"}
          </span>
        </div>
      )}

      {/* Direct Profit Disbursement Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowDisburseModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-1">
              ড্রপশিপারকে সরাসরি প্রফিট প্রদান
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              উইথড্র রিকোয়েস্ট ছাড়াই অ্যাডমিন সরাসরি ড্রপশিপারের অ্যাকাউন্টে টাকা
              পাঠাতে পারেন।
            </p>

            <form onSubmit={handleDisburseProfit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  প্রাপক ড্রপশিপার:
                </label>
                <div className="p-2.5 bg-gray-50 rounded-lg border text-gray-800">
                  <span className="font-bold">{b.dropshipper?.name}</span> (
                  {b.dropshipper?.phone})
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  প্রফিটের পরিমাণ (টাকা):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={disburseForm.amount}
                  onChange={(e) =>
                    setDisburseForm((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  পেমেন্ট মেথড:
                </label>
                <select
                  value={disburseForm.payment_method}
                  onChange={(e) =>
                    setDisburseForm((prev) => ({
                      ...prev,
                      payment_method: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="wallet">ড্রপশিপার ওয়ালেট ব্যালেন্স (Wallet Credit)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="rocket">রকেট (Rocket)</option>
                  <option value="bank_transfer">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                  <option value="cash">নগদ প্রদান (Cash)</option>
                </select>
              </div>

              {disburseForm.payment_method !== "wallet" && (
                <>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      ট্রানজেকশন আইডি (Trx ID / Bank Reference):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BL92KJ189A"
                      value={disburseForm.trx_id}
                      onChange={(e) =>
                        setDisburseForm((prev) => ({
                          ...prev,
                          trx_id: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      প্রাপক ফোন / অ্যাকাউন্ট নম্বর:
                    </label>
                    <input
                      type="text"
                      placeholder={b.dropshipper?.phone || "01XXXXXXXXX"}
                      value={disburseForm.bank_reference}
                      onChange={(e) =>
                        setDisburseForm((prev) => ({
                          ...prev,
                          bank_reference: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  নোট / রিমার্কস:
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: Order #83 direct profit payout"
                  value={disburseForm.admin_note}
                  onChange={(e) =>
                    setDisburseForm((prev) => ({
                      ...prev,
                      admin_note: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isDisbursing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: "#059669", color: "#ffffff" }}
                >
                  {isDisbursing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  নিশ্চিত ও প্রদান করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
