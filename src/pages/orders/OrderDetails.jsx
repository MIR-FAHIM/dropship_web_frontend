import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGetOrderDetailsQuery } from "../../redux/features/order";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetOrderDetailsQuery(id);
  const order = data?.data;

  const money = useMemo(
    () =>
      (n) =>
        new Intl.NumberFormat("en-BD", {
          style: "currency",
          currency: "BDT",
          maximumFractionDigits: 0,
        }).format(Number(n || 0)),
    []
  );

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  // Function to get the status steps for the delivery
  

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Order overview</p>
            <h1 className="text-3xl font-bold text-slate-900">Order Details</h1>
            <p className="text-sm text-slate-500">Order #{order?.order_number || "N/A"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Status: {order?.status || "N/A"}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Payment: {order?.payment_status || "N/A"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order & Customer</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Customer</p>
                <p className="text-base font-semibold text-slate-900">{order?.customer_name || "N/A"}</p>
                <p className="text-sm text-slate-500">{order?.customer_phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Shipping address</p>
                <p className="text-sm text-slate-700">{order?.shipping_address || "N/A"}</p>
                <p className="text-xs text-slate-500">Zone: {order?.zone || "N/A"}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">Subtotal</p>
                <p className="text-lg font-bold text-slate-900">{money(order?.subtotal)}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">Your Profit</p>
                <p className="text-lg font-bold text-slate-900">{money(order?.reseller_profit)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Created</p>
                <p className="text-sm text-slate-700">{formatDate(order?.created_at)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Note</p>
                <p className="text-sm text-slate-700">{order?.note || "N/A"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Status History</h2>
            {order?.status_history?.length ? (
              <div className="space-y-4">
                {order.status_history.map((entry, index) => {
                  const isCurrent = index === 0;
                  return (
                    <div key={entry.id} className="flex gap-3">
                      <div
                        className={`mt-1 h-3 w-3 rounded-full ${
                          isCurrent ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <div className="flex-1 border-l border-slate-200 pl-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {entry?.status?.name || entry?.status_id || "Status update"}
                          </p>
                          {isCurrent ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                              Current status
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500">{formatDate(entry?.created_at)}</p>
                        {entry?.note ? (
                          <p className="text-sm text-slate-600 mt-1">{entry.note}</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No status history available yet.
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>
            <span className="text-xs font-semibold text-slate-500">
              {order?.items?.length || 0} item{order?.items?.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2 px-4">Product</th>
                  <th className="py-2 px-4">Qty</th>
                  <th className="py-2 px-4">Unit Price</th>
                  <th className="py-2 px-4">Line Total</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order?.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{item.product_name}</p>
                      <p className="text-xs text-slate-500">SKU: {item.sku || "N/A"}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{item.qty}</td>
                    <td className="py-3 px-4 text-slate-700">{money(item.unit_price)}</td>
                    <td className="py-3 px-4 text-slate-700">{money(item.line_total)}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
