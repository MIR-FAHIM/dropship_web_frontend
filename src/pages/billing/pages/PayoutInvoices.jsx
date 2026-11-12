import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Loader2, Receipt, X } from "lucide-react";
import { useGetPayoutInvoiceQuery, useListPayoutInvoicesQuery } from "../../../redux/features/dropshipperPayout";
import PayoutInvoiceDocument, { METHOD_LABELS, PayoutStatusPill, bdt, fmtDateTime } from "../../../components/shared/PayoutInvoiceDocument";

/* eslint-disable react/prop-types */
const InvoiceDialog = ({ invoiceId, onClose }) => {
  const { data, isFetching } = useGetPayoutInvoiceQuery(invoiceId);
  const invoice = data?.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true">
      <div className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-gray-50 p-5 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        {isFetching && !invoice ? (
          <div className="flex items-center gap-2 p-6 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> ইনভয়েস লোড হচ্ছে…</div>
        ) : !invoice ? (
          <p className="p-6 text-sm text-red-600">ইনভয়েস পাওয়া যায়নি।</p>
        ) : (
          <div className="pt-4"><PayoutInvoiceDocument invoice={invoice} /></div>
        )}
      </div>
    </div>
  );
};
/* eslint-enable react/prop-types */

/**
 * Dropshipper's payout invoices: every profit payment ResellerBrain made to them,
 * with the orders it covered. Server returns only their own invoices.
 */
const PayoutInvoices = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState(null);
  const { data, isLoading, isFetching } = useListPayoutInvoicesQuery({ page });
  const pageData = data?.data?.invoices || {};
  const invoices = pageData.data || [];
  const summary = data?.data?.summary || {};

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Back">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-800"><Receipt className="h-5 w-5 text-emerald-600" /> প্রফিট পেআউট ইনভয়েস</h1>
          <p className="text-xs text-gray-500">আপনার অর্ডারের প্রফিট কবে, কীভাবে এবং কোন অর্ডারের জন্য পরিশোধ করা হয়েছে।</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">মোট পরিশোধিত</p>
          <p className="mt-1 font-mono text-lg font-bold text-emerald-700">{bdt(summary.paid_total)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">ইনভয়েস হয়েছে, পেমেন্ট বাকি</p>
          <p className="mt-1 font-mono text-lg font-bold text-amber-700">{bdt(summary.pending_total)}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[620px] text-left text-sm tabular-nums">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">ইনভয়েস</th>
              <th className="px-4 py-3 font-semibold">অর্ডার</th>
              <th className="px-4 py-3 text-right font-semibold">পরিমাণ</th>
              <th className="px-4 py-3 font-semibold">পেমেন্ট</th>
              <th className="px-4 py-3 font-semibold">স্ট্যাটাস</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className={isFetching ? "opacity-60" : ""}>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">এখনো কোনো পেআউট ইনভয়েস নেই। অর্ডার ডেলিভারি ও কুরিয়ার পেমেন্টের পর প্রফিট পরিশোধ হলে এখানে দেখা যাবে।</td></tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setViewId(inv.id)} className="font-mono text-xs font-semibold text-blue-600 hover:underline">{inv.invoice_number}</button>
                    <p className="text-[11px] text-gray-400">{fmtDateTime(inv.paid_at || inv.created_at)}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{inv.orders_count}টি</td>
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
                      <Eye className="h-3.5 w-3.5" /> দেখুন
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
          <span>Page {pageData.current_page} / {pageData.last_page}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">আগের</button>
            <button type="button" disabled={page >= pageData.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">পরের</button>
          </div>
        </div>
      )}

      {viewId && <InvoiceDialog invoiceId={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
};

export default PayoutInvoices;
