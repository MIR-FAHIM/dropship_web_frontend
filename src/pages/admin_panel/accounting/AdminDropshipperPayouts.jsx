import { useState } from "react";
import PropTypes from "prop-types";
import { Eye, FilePlus2, Loader2, Receipt, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  useCancelPayoutInvoiceMutation,
  useGetPayoutInvoiceQuery,
  useListPayoutInvoicesQuery,
  usePayPayoutInvoiceMutation,
} from "../../../redux/features/dropshipperPayout";
import PayoutInvoiceDocument, { METHOD_LABELS, PayoutStatusPill, bdt, fmtDateTime } from "../../../components/shared/PayoutInvoiceDocument";
import DropshipperPayoutModal from "../orders/DropshipperPayoutModal";
import DropshipperPayoutReview from "../orders/DropshipperPayoutReview";
import { ClearFilterChip, DropshipperFilter, OrderDateFilter, describeDateRange } from "../orders/OrderListFilters";

const METHODS = ["wallet", "bkash", "nagad", "rocket", "bank_transfer", "cash"];

const DropshipperBankAccounts = ({ accounts }) => (
  <section className="rounded-xl border border-sky-200 bg-sky-50/70 p-4" aria-labelledby="payout-bank-accounts-title">
    <div className="mb-3">
      <h3 id="payout-bank-accounts-title" className="text-sm font-bold text-gray-900">Dropshipper bank account</h3>
      <p className="mt-0.5 text-xs text-gray-600">Review the saved payout details before paying this invoice.</p>
    </div>
    {!accounts.length ? (
      <p className="rounded-lg border border-dashed border-sky-200 bg-white px-3 py-4 text-sm text-gray-600">No bank account added.</p>
    ) : (
      <ul className="grid gap-3 sm:grid-cols-2">
        {accounts.map((bankAccount) => {
          const details = [
            ["Account name", bankAccount.acc_name],
            ["Account number", bankAccount.account_no],
            ["Account type", bankAccount.type],
            ["Branch", bankAccount.branch],
            ["Routing number", bankAccount.route],
            ["Address", bankAccount.address],
          ];
          const paymentMethod = bankAccount.payment_method?.name
            || bankAccount.payment_method?.title
            || (bankAccount.payment_method_id
              ? `Payment method #${bankAccount.payment_method_id}`
              : null);

          return (
            <li key={bankAccount.id} className="rounded-lg border border-sky-100 bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">{bankAccount.bank_name || "Payment method"}</p>
                  {paymentMethod && <p className="mt-0.5 text-xs text-gray-600">{paymentMethod}</p>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${bankAccount.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                  {bankAccount.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-1 gap-x-3 gap-y-2 text-xs sm:grid-cols-2">
                {details.map(([label, value]) => (
                  <div key={label} className={label === "Address" ? "sm:col-span-2" : ""}>
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="break-words font-medium text-gray-900">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

DropshipperBankAccounts.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/* View one invoice; pay or cancel it while it is unpaid. */
const InvoiceDialog = ({ invoiceId, onClose }) => {
  const { data, isFetching } = useGetPayoutInvoiceQuery(invoiceId);
  const [payInvoice, { isLoading: paying }] = usePayPayoutInvoiceMutation();
  const [cancelInvoice, { isLoading: cancelling }] = useCancelPayoutInvoiceMutation();
  const [method, setMethod] = useState("wallet");
  const [trxId, setTrxId] = useState("");
  const [account, setAccount] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const invoice = data?.data;
  const needsTrx = method !== "wallet" && method !== "cash";

  const handlePay = async () => {
    try {
      await payInvoice({
        id: invoiceId,
        payment_method: method,
        trx_id: trxId.trim() || undefined,
        receiver_account: account.trim() || undefined,
        payout_review_confirmed: true,
      }).unwrap();
      toast.success("Invoice paid");
    } catch (err) {
      toast.error(err?.data?.message || "Could not pay the invoice");
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt("Cancel this unpaid invoice? Its orders become payable again.\n\nReason (optional):", "");
    if (reason === null) return;
    try {
      await cancelInvoice({ id: invoiceId, reason: reason.trim() || undefined }).unwrap();
      toast.success("Invoice cancelled");
    } catch (err) {
      toast.error(err?.data?.message || "Could not cancel the invoice");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true">
      <div className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-gray-50 p-5 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        {isFetching && !invoice ? (
          <div className="flex items-center gap-2 p-6 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading invoice…</div>
        ) : !invoice ? (
          <p className="p-6 text-sm text-red-600">Invoice not found.</p>
        ) : (
          <div className="space-y-4 pt-4">
            <PayoutInvoiceDocument invoice={invoice} />

            {invoice.status === "pending" && (
              <div className="space-y-3">
                <DropshipperBankAccounts accounts={Array.isArray(invoice.dropshipper?.bank_accounts) ? invoice.dropshipper.bank_accounts : []} />
                <div className="space-y-3 rounded-xl border border-amber-200 bg-white p-4 text-xs">
                <p className="text-sm font-bold text-gray-900">Pay this invoice</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="font-semibold text-gray-700" htmlFor="pay-method">
                    Payment method
                    <select id="pay-method" value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal">
                      {METHODS.map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
                    </select>
                  </label>
                  {method !== "wallet" && (
                    <>
                      <label className="font-semibold text-gray-700" htmlFor="pay-trx">
                        Transaction ID{needsTrx ? " *" : ""}
                        <input id="pay-trx" type="text" value={trxId} onChange={(e) => setTrxId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono font-normal" />
                      </label>
                      <label className="font-semibold text-gray-700" htmlFor="pay-account">
                        Sent to
                        <input id="pay-account" type="text" value={account} onChange={(e) => setAccount(e.target.value)} placeholder={invoice.dropshipper?.phone || ""} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono font-normal" />
                      </label>
                    </>
                  )}
                </div>
                <DropshipperPayoutReview userId={invoice.dropshipper_id} confirmed={confirmed} onConfirmChange={setConfirmed} />
                <div className="flex flex-wrap justify-end gap-2">
                  <button type="button" onClick={handleCancel} disabled={cancelling || paying} className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                    Cancel invoice
                  </button>
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={!confirmed || paying || (needsTrx && !trxId.trim())}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 font-bold text-white shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 disabled:text-blue-950 disabled:opacity-100"
                  >
                    {paying && <Loader2 className="h-4 w-4 animate-spin" />} Pay {bdt(invoice.total_dropshipper_payout)}
                  </button>
                </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

InvoiceDialog.propTypes = {
  invoiceId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onClose: PropTypes.func.isRequired,
};

const AdminDropshipperPayouts = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [dropshipper, setDropshipper] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewId, setViewId] = useState(null);

  const params = { page };
  if (status !== "all") params.status = status;
  if (search.trim()) params.search = search.trim();
  if (dropshipper?.id) params.dropshipper_id = dropshipper.id;
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  const { data, isLoading, isFetching } = useListPayoutInvoicesQuery(params);
  const pageData = data?.data?.invoices || {};
  const invoices = pageData.data || [];
  const summary = data?.data?.summary || {};
  const reset = (fn) => (...args) => { fn(...args); setPage(1); };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-800"><Receipt className="h-5 w-5 text-emerald-600" /> Dropshipper payout invoices</h1>
          <p className="text-xs text-gray-500">Pay a dropshipper&apos;s profit for many orders with one invoice. Each invoice is visible to the dropshipper.</p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <FilePlus2 className="h-4 w-4" /> New payout invoice
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Paid (this filter)</p>
          <p className="mt-1 font-mono text-lg font-bold text-emerald-700">{bdt(summary.paid_total)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Issued, not paid yet</p>
          <p className="mt-1 font-mono text-lg font-bold text-amber-700">{bdt(summary.pending_total)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Invoices</p>
          <p className="mt-1 font-mono text-lg font-bold text-gray-900">{pageData.total ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropshipperFilter selected={dropshipper} onSelect={reset(setDropshipper)} />
        <OrderDateFilter dateFrom={dateFrom} dateTo={dateTo} onChange={reset((f, t) => { setDateFrom(f || ""); setDateTo(t || ""); })} />
        <select id="payout-status-filter" value={status} onChange={(e) => reset(setStatus)(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700">
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Unpaid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input id="payout-search" type="text" value={search} onChange={(e) => reset(setSearch)(e.target.value)} placeholder="Invoice no. or trx ID" className="w-56 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm" />
        </div>
        {dropshipper && <ClearFilterChip label={`Dropshipper: ${dropshipper.name || `#${dropshipper.id}`}`} onClear={reset(() => setDropshipper(null))} />}
        {(dateFrom || dateTo) && <ClearFilterChip label={`Date: ${describeDateRange(dateFrom, dateTo)}`} onClear={reset(() => { setDateFrom(""); setDateTo(""); })} />}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm tabular-nums">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Invoice</th>
              <th className="px-4 py-3 font-semibold">Dropshipper</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className={isFetching ? "opacity-60" : ""}>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No payout invoices yet. Use “New payout invoice” to pay a dropshipper.</td></tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setViewId(inv.id)} className="font-mono text-xs font-semibold text-blue-600 hover:underline">{inv.invoice_number}</button>
                    <p className="text-[11px] text-gray-400">{fmtDateTime(inv.created_at)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-gray-800">{inv.dropshipper?.name || `#${inv.dropshipper_id}`}</p>
                    <p className="text-[11px] text-gray-400">{inv.dropshipper?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{inv.orders_count}</td>
                  <td className="px-4 py-3 text-right font-semibold">{bdt(inv.total_dropshipper_payout)}</td>
                  <td className="px-4 py-3 text-xs">
                    {inv.status === "paid" ? (
                      <>
                        <p>{METHOD_LABELS[inv.payment_method] || inv.payment_method}</p>
                        {inv.payment_method !== "wallet" && inv.trx_id && <p className="font-mono text-[11px] text-gray-400">{inv.trx_id}</p>}
                      </>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3"><PayoutStatusPill status={inv.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => setViewId(inv.id)} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100">
                      <Eye className="h-3.5 w-3.5" /> {inv.status === "pending" ? "View / pay" : "View"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageData.last_page > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Page {pageData.current_page} of {pageData.last_page}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button>
            <button type="button" disabled={page >= pageData.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {showCreate && (
        <DropshipperPayoutModal initialDropshipper={dropshipper} onClose={() => setShowCreate(false)} onCreated={(inv) => inv?.id && setViewId(inv.id)} />
      )}
      {viewId && <InvoiceDialog invoiceId={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
};

export default AdminDropshipperPayouts;
