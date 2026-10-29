import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  FileText,
  DollarSign,
  Store,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
  Hash,
  Truck,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  calculateOrderStakeBreakdown,
  formatBDT,
} from "../../../utils/orderBreakdown.utils";
import { useCreateVendorInvoiceMutation, useGetAdminPaymentAccountsQuery } from "../../../redux/features/orderSettlement";

export default function VendorSettlementInvoiceModal({
  selectedOrders = [],
  vendor,
  onClose,
  onSuccess,
}) {
  const [createInvoice, { isLoading: isSubmitting }] =
    useCreateVendorInvoiceMutation();
  const { data: accountsData } = useGetAdminPaymentAccountsQuery();
  const adminAccounts = accountsData?.data || [];
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [isPaidDirectly, setIsPaidDirectly] = useState(false);

  useEffect(() => {
    if (adminAccounts.length > 0 && selectedAccountIds.length === 0) {
      setSelectedAccountIds(adminAccounts.map((a) => a.id));
    }
  }, [adminAccounts]);

  const [enrichedOrders, setEnrichedOrders] = useState(selectedOrders);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Automatically fetch full details for any selected order missing delivery_information
  useEffect(() => {
    let isMounted = true;
    const needsDetails = selectedOrders.filter(
      (o) => !o.delivery_information && !o.deliveryInformation
    );

    if (needsDetails.length === 0) {
      setEnrichedOrders(selectedOrders);
      return;
    }

    setIsLoadingDetails(true);
    const token = localStorage.getItem("token") || "";
    const baseUrl = "https://apidropship.resellerbrain.com/public/api";

    Promise.all(
      selectedOrders.map(async (order) => {
        if (order.delivery_information || order.deliveryInformation) {
          return order;
        }
        try {
          const res = await fetch(`${baseUrl}/orders/details/${order.id}`, {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.data) {
              return { ...order, ...data.data };
            }
          }
        } catch (e) {
          console.error("Failed to fetch full order details for order", order.id, e);
        }
        return order;
      })
    )
      .then((updated) => {
        if (isMounted) {
          setEnrichedOrders(updated);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedOrders]);

  // Compute breakdown for each selected order using enriched data
  const orderBreakdowns = useMemo(() => {
    return enrichedOrders.map((order) => ({
      order,
      breakdown: calculateOrderStakeBreakdown(order),
    }));
  }, [enrichedOrders]);

  // Aggregate sums matching Google Doc "Sum — Supplier V41"
  const totals = useMemo(() => {
    return orderBreakdowns.reduce(
      (acc, { breakdown: b }) => {
        if (!b) return acc;
        acc.collectable += b.courier?.collectable_amount || 0;
        acc.delivery_fee += b.courier?.delivery_fee || 0;
        acc.cod_fee += b.courier?.cod_fee || 0;
        acc.total_courier_fee += b.courier?.total_fee || 0;
        acc.courier_net += b.courier?.net_to_supplier || 0;
        acc.vendor_price += b.supplier?.vendor_price || 0;
        acc.supplier_owes += b.supplier?.supplier_owes_platform || 0;
        acc.dropshipper_profit += b.dropshipper?.profit || 0;
        acc.platform_profit += b.platform?.net_profit || 0;
        return acc;
      },
      {
        collectable: 0,
        delivery_fee: 0,
        cod_fee: 0,
        total_courier_fee: 0,
        courier_net: 0,
        vendor_price: 0,
        supplier_owes: 0,
        dropshipper_profit: 0,
        platform_profit: 0,
      }
    );
  }, [orderBreakdowns]);

  // Generate suggested invoice number
  const defaultInvoiceNumber = useMemo(() => {
    const vId = vendor?.id || "V";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `INV-V${vId}-${dateStr}-${randomSuffix}`;
  }, [vendor]);

  const [form, setForm] = useState({
    invoice_number: defaultInvoiceNumber,
    payment_method: "bank_transfer",
    trx_id: "",
    admin_note: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isPaidDirectly && !form.trx_id.trim()) {
      toast.error("সরাসরি পেইড হিসেবে রেকর্ড করতে ট্রানজেকশন আইডি (Trx ID) আবশ্যক");
      return;
    }

    if (!form.invoice_number.trim()) {
      toast.error("ইনভয়েস নম্বর প্রদান করুন");
      return;
    }

    try {
      const attachedAccounts = adminAccounts.filter((a) =>
        selectedAccountIds.includes(a.id)
      );

      const payload = {
        vendor_id: vendor?.id || enrichedOrders[0]?.vendor?.id,
        order_ids: enrichedOrders.map((o) => o.id),
        invoice_number: form.invoice_number.trim(),
        payment_method: form.payment_method,
        trx_id: form.trx_id.trim() || null,
        status: isPaidDirectly ? "paid" : "pending",
        admin_payment_details: attachedAccounts.length > 0 ? attachedAccounts : adminAccounts,
        total_amount_owed: totals.supplier_owes,
        note: form.admin_note,
      };

      const res = await createInvoice(payload).unwrap();
      toast.success(
        res?.message ||
          `ইনভয়েস ${payload.invoice_number} সফলভাবে তৈরি ও সেটেলমেন্ট রেকর্ড হয়েছে`
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "ইনভয়েস তৈরি করতে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-8 p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">
                ভেন্ডর মাল্টি-অর্ডার সেটেলমেন্ট ইনভয়েস (Settlement Invoice)
              </h2>
              {isLoadingDetails && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  CarryBee ডেলিভারি তথ্য লোড হচ্ছে...
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              নির্বাচিত {enrichedOrders.length}টি অর্ডারের জন্য সমন্বিত সেটেলমেন্ট
              ও ট্রানজেকশন ইনভয়েস রেকর্ড
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 my-4">
          {/* Vendor Details Banner */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold text-amber-900">
                  {vendor?.shop_name || "Unknown Supplier"}
                </span>{" "}
                <span className="font-mono text-amber-800">
                  (Vendor ID: {vendor?.id || "N/A"})
                </span>
                <p className="text-amber-700 text-[11px] mt-0.5">
                  {vendor?.has_own_delivery_account
                    ? "সাপ্লায়ারের নিজস্ব CarryBee অ্যাকাউন্ট — কুরিয়ারের সংগৃহীত টাকা সরাসরি সাপ্লায়ারের অ্যাকাউন্টে জমা হয়েছে।"
                    : "প্ল্যাটফর্মের সেন্ট্রাল ডেলিভারি অ্যাকাউন্ট"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-amber-700 block">
                সাপ্লায়ার প্ল্যাটফর্মকে দেবে (Invoiced Amount):
              </span>
              <span className="text-base font-extrabold text-amber-950 font-mono">
                {formatBDT(totals.supplier_owes)}
              </span>
            </div>
          </div>

          {/* Courier Deduction Pre-settled Notice */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                কুরিয়ার ফি পূর্বেই কর্তনকৃত ও নিষ্পন্ন (Auto-Settled at Courier Source):
              </span>{" "}
              CarryBee ডেলিভারি কোম্পানি কনসাইনমেন্টভিত্তিক ডেলিভারি ফি (মোট{" "}
              <strong>{formatBDT(totals.delivery_fee)}</strong>) এবং ১% COD ফি (মোট{" "}
              <strong>{formatBDT(totals.cod_fee)}</strong>) তাদের সিস্টেমে পূর্বেই
              স্বয়ংক্রিয়ভাবে কেটে রেখে অবশিষ্ট নিট অর্থ (মোট{" "}
              <strong>{formatBDT(totals.courier_net)}</strong>) অ্যাকাউন্টে প্রদান করেছে।
              তাই এই ইনভয়েসে কুরিয়ার ফি অলরেডি নিষ্পন্ন (Already Settled) হিসেবে
              সমন্বয় করা হয়েছে এবং কেবল অ্যাকাউন্টে জমাকৃত নিট টাকা থেকে সাপ্লায়ারের
              ইনভয়েস পরিমাণ নির্ধারিত হয়েছে।
            </div>
          </div>

          {/* Orders Breakdown Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 text-xs font-semibold text-gray-700 flex items-center justify-between">
              <span>অর্ডারভিত্তিক আর্থিক ব্রেকডাউন তালিকা</span>
              <span className="text-[11px] text-gray-500 font-normal">
                {selectedOrders.length}টি অর্ডার
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100/60 text-gray-600 border-b">
                    <th className="py-2.5 px-3 text-left">অর্ডার নম্বর</th>
                    <th className="py-2.5 px-3 text-left">কাস্টমার</th>
                    <th className="py-2.5 px-3 text-right">কুরিয়ার সংগৃহীত</th>
                    <th className="py-2.5 px-3 text-right" title="CarryBee সিস্টেমে পূর্বেই কেটে রাখা হয়েছে">
                      কুরিয়ার ফি (কাটতি)
                    </th>
                    <th className="py-2.5 px-3 text-right text-gray-800 font-semibold" title="কুরিয়ার থেকে অ্যাকাউন্টে জমাকৃত নিট টাকা">
                      কুরিয়ার নিট জমাকৃত
                    </th>
                    <th className="py-2.5 px-3 text-right">পাইকারি মূল্য</th>
                    <th className="py-2.5 px-3 text-right font-bold text-amber-900 bg-amber-50/60">
                      সাপ্লায়ার দেবে
                    </th>
                    <th className="py-2.5 px-3 text-right text-emerald-800">
                      ড্রপশিপার লাভ
                    </th>
                    <th className="py-2.5 px-3 text-right text-indigo-800">
                      প্ল্যাটফর্ম লাভ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orderBreakdowns.map(({ order, breakdown: b }) => (
                    <tr key={order.id} className="hover:bg-gray-50/80">
                      <td className="py-2 px-3 font-medium text-gray-900">
                        <div>{order.order_number}</div>
                        {b?.consignment_id && (
                          <div className="text-[10px] font-mono text-gray-400">
                            {b.consignment_id}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        <div>{order.customer_name}</div>
                        <div className="text-[10px] text-gray-400">
                          {order.customer_phone}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {formatBDT(b?.courier?.collectable_amount)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-red-600">
                        <div>−{formatBDT(b?.courier?.total_fee)}</div>
                        <div className="text-[9px] text-gray-400 font-sans">
                          (ডেলিভারি {formatBDT(b?.courier?.delivery_fee)} + COD {formatBDT(b?.courier?.cod_fee)})
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-gray-900 bg-gray-50/40">
                        {formatBDT(b?.courier?.net_to_supplier)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {formatBDT(b?.supplier?.vendor_price)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-900 bg-amber-50/40">
                        {formatBDT(b?.supplier?.supplier_owes_platform)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700">
                        {formatBDT(b?.dropshipper?.profit)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-indigo-700">
                        {formatBDT(b?.platform?.net_profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
                    <td colSpan={2} className="py-2.5 px-3">
                      মোট সমষ্টি (Sum — Supplier V{vendor?.id || "41"})
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatBDT(totals.collectable)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-red-600">
                      <div>−{formatBDT(totals.total_courier_fee)}</div>
                      <div className="text-[9px] text-gray-500 font-sans font-normal">
                        (Already Settled)
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 bg-gray-200/50">
                      {formatBDT(totals.courier_net)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatBDT(totals.vendor_price)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-amber-950 bg-amber-100">
                      {formatBDT(totals.supplier_owes)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-800 bg-emerald-50">
                      {formatBDT(totals.dropshipper_profit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-indigo-800 bg-indigo-50">
                      {formatBDT(totals.platform_profit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Form for Settlement Record */}
          <form id="vendor-settlement-form" onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ইনভয়েস নম্বর (Invoice Number):
                </label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.invoice_number}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, invoice_number: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg font-mono focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  টাকা প্রাপ্তির মাধ্যম (Payment Method):
                </label>
                <select
                  value={form.payment_method}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, payment_method: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="bank_transfer">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="rocket">রকেট (Rocket)</option>
                  <option value="cash">নগদ গ্রহণ (Cash)</option>
                  <option value="adjustment">লেজার সমন্বয় (Adjustment)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ট্রানজেকশন আইডি (Trx ID / Bank Reference) {isPaidDirectly ? "*আবশ্যক" : "(ঐচ্ছিক / ভেন্ডর পরে প্রদান করবে)"}:
                </label>
                <input
                  type="text"
                  required={isPaidDirectly}
                  placeholder={isPaidDirectly ? "e.g. TRX-902481-AYAN" : "পেন্ডিং রাখলে ফাঁকা রাখুন বা রেফারেন্স দিন"}
                  value={form.trx_id}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, trx_id: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs border rounded-lg font-mono focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  মোট ইনভয়েস পরিশোধযোগ্য অর্থ (Net Invoiced Amount):
                </label>
                <div className="px-3 py-2 text-xs font-mono font-bold bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950 flex items-center justify-between">
                  <span>{formatBDT(totals.supplier_owes)}</span>
                  <span className="text-[10px] text-amber-800 font-sans font-normal">
                    (কুরিয়ার ফি কর্তন সমন্বিত)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                অ্যাডমিন নোট / রিমার্কস (ঐচ্ছিক):
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: Supplier V41 settled via City Bank online transfer. CarryBee courier fees already settled at source."
                value={form.admin_note}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, admin_note: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            * নিশ্চিত করলে এই {selectedOrders.length}টি অর্ডারের ভেন্ডর স্টেক
            ইনভয়েস ও Trx ID সহ Settled হিসেবে রেকর্ড হবে।
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              form="vendor-settlement-form"
              disabled={isSubmitting || (isPaidDirectly && !form.trx_id.trim())}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isPaidDirectly ? "ইনভয়েস তৈরি ও সরাসরি সেটেল করুন" : "ভেন্ডরের জন্য ইনভয়েস তৈরি করুন (Pending)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
