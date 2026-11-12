import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FileText, Loader2, Send, X } from "lucide-react";
import { toast } from "react-toastify";
import { useCreatePayoutInvoiceMutation, useGetPayableOrdersQuery } from "../../../redux/features/dropshipperPayout";
import { DropshipperFilter } from "./OrderListFilters";
import DropshipperPayoutReview from "./DropshipperPayoutReview";
import { METHOD_LABELS, bdt } from "../../../components/shared/PayoutInvoiceDocument";

const METHODS = ["wallet", "bkash", "nagad", "rocket", "bank_transfer", "cash"];

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short" });
};

/**
 * Bulk profit payout for one dropshipper: pick the dropshipper, tick the payable
 * orders (CarryBee paid, not on hold, profit not paid yet), review their balance
 * and withdraw requests, then pay everything with one invoice.
 */
const DropshipperPayoutModal = ({ initialDropshipper = null, preselectedOrderIds = [], onClose, onCreated }) => {
  const [dropshipper, setDropshipper] = useState(initialDropshipper);
  const [selected, setSelected] = useState([]);
  const [touched, setTouched] = useState(false);
  const [method, setMethod] = useState("wallet");
  const [trxId, setTrxId] = useState("");
  const [account, setAccount] = useState("");
  const [note, setNote] = useState("");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const { data, isFetching, isError } = useGetPayableOrdersQuery(dropshipper?.id, { skip: !dropshipper?.id });
  const [createInvoice, { isLoading: saving }] = useCreatePayoutInvoiceMutation();

  const rows = useMemo(() => data?.data?.rows || [], [data]);
  const payableRows = useMemo(() => rows.filter((r) => r.payable), [rows]);

  // Default selection: the orders ticked on the list (if payable), else every payable order.
  // Runs once per loaded dropshipper (defaultedFor), never after the admin changes a tick.
  const [defaultedFor, setDefaultedFor] = useState(null);
  useEffect(() => {
    const loadedId = data?.data?.dropshipper?.id;
    if (touched || !loadedId || defaultedFor === loadedId) return;
    const payableIds = payableRows.map((r) => r.order_id);
    const wanted = preselectedOrderIds.map(Number).filter((id) => payableIds.includes(id));
    setSelected(wanted.length ? wanted : payableIds);
    setDefaultedFor(loadedId);
  }, [data, payableRows, preselectedOrderIds, touched, defaultedFor]);

  const changeDropshipper = (user) => {
    setDropshipper(user);
    setSelected([]);
    setTouched(false);
    setDefaultedFor(null);
    setReviewConfirmed(false);
  };

  const toggle = (id) => {
    setTouched(true);
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleAll = () => {
    setTouched(true);
    setSelected(selected.length === payableRows.length ? [] : payableRows.map((r) => r.order_id));
  };

  const total = useMemo(
    () => rows.filter((r) => selected.includes(r.order_id)).reduce((sum, r) => sum + Number(r.profit || 0), 0),
    [rows, selected]
  );
  const needsTrx = method !== "wallet" && method !== "cash";
  const canPay = dropshipper?.id && selected.length > 0 && reviewConfirmed && (!needsTrx || trxId.trim()) && !saving;
  const canIssue = dropshipper?.id && selected.length > 0 && !saving;

  const submit = async (status) => {
    try {
      const res = await createInvoice({
        dropshipper_id: dropshipper.id,
        order_ids: selected,
        status,
        payment_method: method,
        trx_id: trxId.trim() || undefined,
        receiver_account: account.trim() || undefined,
        note: note.trim() || undefined,
        payout_review_confirmed: status === "paid" ? true : undefined,
      }).unwrap();
      toast.success(status === "paid" ? `Paid ${bdt(total)} — invoice ${res?.data?.invoice_number}` : `Invoice ${res?.data?.invoice_number} issued (unpaid)`);
      onCreated?.(res?.data);
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Could not create the payout invoice");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true">
      <div className="relative flex max-h-[94vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Dropshipper payout invoice</h3>
            <p className="text-xs text-gray-500">Pay one dropshipper&apos;s profit for many orders with a single invoice.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4 text-xs">
          {/* 1. Dropshipper */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-gray-700">Dropshipper</span>
            <DropshipperFilter selected={dropshipper} onSelect={changeDropshipper} />
            {dropshipper?.phone && <span className="font-mono text-gray-500">{dropshipper.phone}</span>}
          </div>

          {!dropshipper?.id ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">Choose a dropshipper to see their payable orders.</p>
          ) : isFetching && !data ? (
            <div className="flex items-center gap-2 rounded-lg border bg-gray-50 p-4 text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading orders…</div>
          ) : isError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">Could not load this dropshipper&apos;s orders.</p>
          ) : rows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">No unpaid profit: every delivered order of this dropshipper is already paid.</p>
          ) : (
            <>
              {/* 2. Orders */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[620px] text-left tabular-nums">
                  <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2">
                        <input
                          id="payout-select-all"
                          type="checkbox"
                          aria-label="Select all payable orders"
                          checked={payableRows.length > 0 && selected.length === payableRows.length}
                          onChange={toggleAll}
                          disabled={payableRows.length === 0}
                          className="h-4 w-4 accent-emerald-600"
                        />
                      </th>
                      <th className="px-2 py-2 font-semibold">Order</th>
                      <th className="px-2 py-2 font-semibold">Customer</th>
                      <th className="px-2 py-2 font-semibold">Status</th>
                      <th className="px-2 py-2 text-right font-semibold">Collected</th>
                      <th className="px-3 py-2 text-right font-semibold">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.order_id} className={`border-t border-gray-100 ${r.payable ? "" : "bg-gray-50/70 text-gray-400"}`}>
                        <td className="px-3 py-2">
                          <input
                            id={`payout-order-${r.order_id}`}
                            type="checkbox"
                            aria-label={`Select order ${r.order_number}`}
                            checked={selected.includes(r.order_id)}
                            onChange={() => toggle(r.order_id)}
                            disabled={!r.payable}
                            className="h-4 w-4 accent-emerald-600"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <span className="font-semibold text-gray-800">{r.order_number}</span>
                          <span className="ml-1.5 text-[10px] text-gray-400">{fmtDate(r.ordered_at)}</span>
                          {!r.payable && <p className="text-[10px] font-medium text-amber-700">Not payable: {r.reason}</p>}
                        </td>
                        <td className="px-2 py-2">{r.customer_name || "—"}</td>
                        <td className="px-2 py-2">{r.status_name}</td>
                        <td className="px-2 py-2 text-right">{bdt(r.collected)}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${r.payable ? "text-gray-900" : ""}`}>{bdt(r.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <span className="text-gray-700">
                  <b>{selected.length}</b> of {payableRows.length} payable order{payableRows.length === 1 ? "" : "s"} selected
                  {rows.length > payableRows.length ? ` · ${rows.length - payableRows.length} not payable yet` : ""}
                </span>
                <span className="text-sm font-extrabold text-emerald-800">Total payout {bdt(total)}</span>
              </div>

              {/* 3. Payment */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="font-semibold text-gray-700" htmlFor="payout-method">
                  Payment method
                  <select
                    id="payout-method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
                  >
                    {METHODS.map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
                  </select>
                </label>
                {method === "wallet" ? (
                  <p className="self-end rounded-lg bg-gray-50 px-3 py-2 text-gray-600">The total is added to the dropshipper&apos;s wallet balance. They can withdraw it later.</p>
                ) : (
                  <label className="font-semibold text-gray-700" htmlFor="payout-trx">
                    Transaction ID{needsTrx ? " *" : ""}
                    <input
                      id="payout-trx"
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. BL92KJ189A"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono font-normal"
                    />
                  </label>
                )}
                {method !== "wallet" && (
                  <label className="font-semibold text-gray-700" htmlFor="payout-account">
                    Sent to (phone / account number)
                    <input
                      id="payout-account"
                      type="text"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      placeholder={dropshipper?.phone || "01XXXXXXXXX"}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono font-normal"
                    />
                  </label>
                )}
                <label className={`font-semibold text-gray-700 ${method === "wallet" ? "sm:col-span-2" : ""}`} htmlFor="payout-note">
                  Note (shown on the invoice)
                  <input
                    id="payout-note"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Weekly payout, 5–11 Nov"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
                  />
                </label>
              </div>

              {/* 4. Review balance / withdraws / advances (required to pay) */}
              <DropshipperPayoutReview userId={dropshipper.id} confirmed={reviewConfirmed} onConfirmChange={setReviewConfirmed} />
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button
            type="button"
            onClick={() => submit("pending")}
            disabled={!canIssue}
            title="Create the invoice now and pay it later"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText className="h-4 w-4" /> Issue unpaid invoice
          </button>
          <button
            type="button"
            onClick={() => submit("paid")}
            disabled={!canPay}
            title={!reviewConfirmed ? "Tick the review checkbox first" : needsTrx && !trxId.trim() ? "Enter the transaction ID" : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Pay {bdt(total)} &amp; create invoice
          </button>
        </div>
      </div>
    </div>
  );
};

DropshipperPayoutModal.propTypes = {
  initialDropshipper: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), name: PropTypes.string, phone: PropTypes.string }),
  preselectedOrderIds: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
};

export default DropshipperPayoutModal;
