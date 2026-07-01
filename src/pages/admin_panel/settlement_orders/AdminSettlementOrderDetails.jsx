import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  Store,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  useAddSettledTrxIdOrderSettlementMutation,
  useGetOrderSettlementByOrderQuery,
  useSettleNowOrderSettlementMutation,
} from "../../../redux/features/orderSettlement";
import {
  formatDateTime,
  formatMoney,
  formatSettlementLabel,
  getPayableName,
  getSettlementStatusClass,
  isSettlementSettled,
} from "./settlementUtils";

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-800 mt-1 break-words">
      {value || "-"}
    </p>
  </div>
);

const getApiErrorMessage = (error, fallback = "Something went wrong.") => {
  const errors = error?.data?.errors;
  if (errors && typeof errors === "object") {
    const firstError = Object.values(errors).flat().find(Boolean);
    if (firstError) return firstError;
  }

  return error?.data?.message || fallback;
};

const canAddSettledTrxId = (settlement) =>
  !(
    settlement?.settlement_type === "reseller_profit" &&
    settlement?.user_type === "dropshipper"
  );

const AdminSettlementOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [settlingId, setSettlingId] = useState(null);
  const [trxEditorId, setTrxEditorId] = useState(null);
  const [trxValues, setTrxValues] = useState({});
  const [trxErrors, setTrxErrors] = useState({});
  const [savingTrxId, setSavingTrxId] = useState(null);

  const { data, isLoading, isError, refetch } =
    useGetOrderSettlementByOrderQuery(orderId);
  const [settleNow] = useSettleNowOrderSettlementMutation();
  const [addSettledTrxId] = useAddSettledTrxIdOrderSettlementMutation();

  const payload = data?.data || {};
  const order = payload.order || null;
  const settlements = payload.settlements || [];
  const summary = payload.summary || {};
  const settlementStatus = payload.settlement_status || {};

  const fallbackSummary = useMemo(() => {
    return settlements.reduce(
      (acc, settlement) => {
        const amount = Number(settlement?.settleable_amount || 0);
        acc.total += amount;
        if (isSettlementSettled(settlement)) {
          acc.settled += amount;
        } else {
          acc.pending += amount;
        }
        return acc;
      },
      { total: 0, pending: 0, settled: 0 }
    );
  }, [settlements]);

  const openTrxEditor = (settlement) => {
    if (!canAddSettledTrxId(settlement)) return;

    setTrxEditorId(settlement.id);
    setTrxValues((prev) => ({
      ...prev,
      [settlement.id]: settlement.settled_trx_id || prev[settlement.id] || "",
    }));
  };

  const closeTrxEditor = (settlementId) => {
    setTrxEditorId(null);
    setTrxErrors((prev) => ({ ...prev, [settlementId]: "" }));
  };

  const handleTrxInputChange = (settlementId, value) => {
    setTrxValues((prev) => ({ ...prev, [settlementId]: value }));
    setTrxErrors((prev) => ({ ...prev, [settlementId]: "" }));
  };

  const handleSettleNow = async (settlement) => {
    if (!settlement?.id || isSettlementSettled(settlement)) return;

    const confirmed = window.confirm(
      `Settle ${formatSettlementLabel(settlement.settlement_type)} for ${formatMoney(
        settlement.settleable_amount,
        settlement.currency
      )}?`
    );

    if (!confirmed) return;

    setSettlingId(settlement.id);
    try {
      const response = await settleNow(settlement.id).unwrap();
      toast.success(response?.message || "Settlement completed.");
      refetch();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, "Failed to settle now.");
      if (
        canAddSettledTrxId(settlement) &&
        errorMessage.toLowerCase().includes("settled_trx_id is required")
      ) {
        openTrxEditor(settlement);
        toast.error("Add settled transaction id before settling.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSettlingId(null);
    }
  };

  const handleSaveTrxAndSettle = async (settlement) => {
    if (!canAddSettledTrxId(settlement)) return;

    const settledTrxId = String(trxValues[settlement.id] || "").trim();

    if (!settledTrxId) {
      setTrxErrors((prev) => ({
        ...prev,
        [settlement.id]: "Settled transaction id is required.",
      }));
      return;
    }

    setSavingTrxId(settlement.id);
    setTrxErrors((prev) => ({ ...prev, [settlement.id]: "" }));

    try {
      const userId = localStorage.getItem("userId");
      await addSettledTrxId({
        id: settlement.id,
        settled_trx_id: settledTrxId,
        ...(userId ? { created_by: Number(userId) } : {}),
      }).unwrap();

      const response = await settleNow(settlement.id).unwrap();
      toast.success(response?.message || "Settlement completed.");
      setTrxEditorId(null);
      setTrxValues((prev) => {
        const next = { ...prev };
        delete next[settlement.id];
        return next;
      });
      refetch();
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        "Failed to save transaction id."
      );
      setTrxErrors((prev) => ({ ...prev, [settlement.id]: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setSavingTrxId(null);
    }
  };

  const renderSettlementAction = (settlement, fullWidth = false) => {
    const settled = isSettlementSettled(settlement);
    const isCurrentSettling = settlingId === settlement.id;
    const isEditingTrx = trxEditorId === settlement.id;
    const canUseTrxEditor = canAddSettledTrxId(settlement);
    const isSavingTrx = savingTrxId === settlement.id;
    const actionDisabled = settled || isCurrentSettling || isSavingTrx;
    const trxValue = trxValues[settlement.id] || "";
    const trxError = trxErrors[settlement.id];

    return (
      <div
        className={`${fullWidth ? "w-full" : "inline-block min-w-[230px]"} space-y-2 text-left`}
      >
        <button
          type="button"
          disabled={actionDisabled}
          onClick={() => handleSettleNow(settlement)}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            fullWidth ? "w-full" : "w-full"
          } ${
            settled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
          }`}
        >
          {isCurrentSettling && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          {settled ? "Settled" : isCurrentSettling ? "Settling..." : "Settle Now"}
        </button>

        {canUseTrxEditor && isEditingTrx && !settled && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-2 shadow-sm">
            <label className="text-[11px] font-semibold text-red-700">
              Settled TRX ID
            </label>
            <input
              type="text"
              value={trxValue}
              onChange={(event) =>
                handleTrxInputChange(settlement.id, event.target.value)
              }
              placeholder="Enter settled trx id"
              className="mt-1 w-full rounded-md border border-red-200 bg-white px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
            {trxError && (
              <p className="mt-1 text-[11px] font-medium text-red-600">
                {trxError}
              </p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                disabled={isSavingTrx}
                onClick={() => handleSaveTrxAndSettle(settlement)}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-blue-600 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
              >
                {isSavingTrx && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                Save & Settle
              </button>
              <button
                type="button"
                disabled={isSavingTrx}
                onClick={() => closeTrxEditor(settlement.id)}
                className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-32 space-y-3">
        <ClipboardList className="w-14 h-14 text-red-300 mx-auto" />
        <p className="text-sm font-medium text-red-500">
          Failed to load settlement details.
        </p>
        <button
          type="button"
          onClick={refetch}
          className="text-sm font-medium text-red-600 underline hover:text-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const totalAmount =
    summary.total_settleable_amount ?? fallbackSummary.total ?? 0;
  const pendingAmount =
    summary.total_pending_amount ?? fallbackSummary.pending ?? 0;
  const settledAmount =
    summary.total_settled_amount ?? fallbackSummary.settled ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin-panel/settlement-orders")}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {order.order_number || `Order #${order.id}`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Settlement details for order #{order.id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Payment: {order.payment_status || "-"}
          </span>
          <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            Status: {order.status || "-"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Total Settleable</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {formatMoney(totalAmount)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Pending Amount</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {formatMoney(pendingAmount)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Settled Amount</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {formatMoney(settledAmount)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Settlements
              </h2>
              <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                {settlements.length} rows
              </span>
            </div>

            {settlements.length === 0 ? (
              <div className="text-center py-16">
                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">
                  No settlement rows found.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Payable</th>
                        <th className="text-right py-3 px-4 font-semibold">Amount</th>
                        <th className="text-center py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Settled At</th>
                        <th className="text-right py-3 px-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {settlements.map((settlement) => {
                        return (
                          <tr
                            key={settlement.id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="py-3 px-4">
                              <p className="font-semibold text-gray-800">
                                {formatSettlementLabel(settlement.settlement_type)}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {settlement.trx_id || `#${settlement.id}`}
                              </p>
                              {settlement.settled_trx_id && (
                                <p className="text-xs font-medium text-green-600 mt-0.5">
                                  Settled TRX: {settlement.settled_trx_id}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-700">
                                {getPayableName(settlement)}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">
                                {settlement.user_type || "-"}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-gray-800">
                              {formatMoney(
                                settlement.settleable_amount,
                                settlement.currency
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold capitalize ${getSettlementStatusClass(
                                  settlement.status
                                )}`}
                              >
                                {settlement.status || "-"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                              {formatDateTime(settlement.settled_at)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {renderSettlementAction(settlement)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden divide-y divide-gray-100">
                  {settlements.map((settlement) => {
                    return (
                      <div key={settlement.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {formatSettlementLabel(settlement.settlement_type)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {settlement.trx_id || `#${settlement.id}`}
                            </p>
                            {settlement.settled_trx_id && (
                              <p className="text-xs font-medium text-green-600 mt-0.5">
                                Settled TRX: {settlement.settled_trx_id}
                              </p>
                            )}
                          </div>
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold capitalize shrink-0 ${getSettlementStatusClass(
                              settlement.status
                            )}`}
                          >
                            {settlement.status || "-"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-400">Payable</p>
                            <p className="font-medium text-gray-700">
                              {getPayableName(settlement)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Amount</p>
                            <p className="font-bold text-gray-800">
                              {formatMoney(
                                settlement.settleable_amount,
                                settlement.currency
                              )}
                            </p>
                          </div>
                        </div>

                        {renderSettlementAction(settlement, true)}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Order Info
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4">
              <DetailItem label="Customer" value={order.customer_name} />
              <DetailItem label="Phone" value={order.customer_phone} />
              <DetailItem label="Address" value={order.shipping_address} />
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Subtotal" value={formatMoney(order.subtotal)} />
                <DetailItem label="Shipping Fee" value={formatMoney(order.shipping_fee)} />
                <DetailItem label="Discount" value={formatMoney(order.discount)} />
                <DetailItem label="Total" value={formatMoney(order.total)} />
                <DetailItem
                  label="Reseller Profit"
                  value={formatMoney(order.reseller_profit)}
                />
                <DetailItem label="Created" value={formatDateTime(order.created_at)} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Settlement Status
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {Object.entries(settlementStatus).length === 0 ? (
                <p className="text-sm text-gray-500">No status summary found.</p>
              ) : (
                Object.entries(settlementStatus).map(([type, status]) => (
                  <div
                    key={type}
                    className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {formatSettlementLabel(type)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatMoney(status?.settleable_amount)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full border text-[11px] font-semibold capitalize shrink-0 ${getSettlementStatusClass(
                        status?.status
                      )}`}
                    >
                      {status?.status || "-"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {settlements.some((settlement) => settlement.payable_user) && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Payable Users
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {settlements
                  .filter((settlement) => settlement.payable_user)
                  .map((settlement) => (
                    <div key={settlement.id} className="space-y-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {settlement.payable_user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {settlement.payable_user.email || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {settlement.payable_user.phone || "-"}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {settlements.some((settlement) => settlement.vendor) && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Vendor
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {settlements
                  .filter((settlement) => settlement.vendor)
                  .map((settlement) => (
                    <div key={settlement.id} className="space-y-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {settlement.vendor.shop_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Contact: {settlement.vendor.contact_person || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Phone: {settlement.vendor.emergency_contact || "-"}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettlementOrderDetails;
