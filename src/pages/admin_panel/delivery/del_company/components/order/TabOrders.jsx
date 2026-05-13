import React, { useState } from "react";
import { X, Package, Phone, User, Banknote, Hash, Loader2 } from "lucide-react";
import { useGetAssignedOrderOfCompanyQuery } from "../../../../../../redux/features/delivery_company";
import { useLazyGetCarryBeeOrderDetailsQuery } from "../../../../../../redux/features/delivery_company/carrybeeStoreApi";

/* ─── Order detail slide-over ─── */
const OrderDetailPanel = ({ companyId, consignmentId, onClose }) => {
  const [fetchDetails, { data, isFetching, isError }] =
    useLazyGetCarryBeeOrderDetailsQuery();

  React.useEffect(() => {
    if (consignmentId) {
      fetchDetails({ companyId, consignmentId });
    }
  }, [companyId, consignmentId, fetchDetails]);

  // response shape: { data: { data: { ...fields } } }
  const detail = data?.data?.data ?? null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Order Details</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{consignmentId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5">
          {isFetching && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            </div>
          )}

          {isError && !isFetching && (
            <div className="text-center py-16 text-red-400 text-sm">
              ডিটেইল লোড করতে সমস্যা হয়েছে।
            </div>
          )}

          {!isFetching && !isError && detail && (
            <div className="space-y-4">
              {/* Transfer status badge */}
              {detail.transfer_status && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {detail.transfer_status}
                  </span>
                  {detail.attempt != null && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                      Attempt: {detail.attempt}
                    </span>
                  )}
                </div>
              )}

              <DetailSection title="Recipient Info" icon={<User className="w-4 h-4" />}>
                <DetailRow label="Name"    value={detail.recipient_name} />
                <DetailRow label="Phone"   value={detail.recipient_phone} />
                <DetailRow label="Address" value={detail.recipient_address} />
              </DetailSection>

              <DetailSection title="Order Info" icon={<Package className="w-4 h-4" />}>
                <DetailRow label="Consignment"    value={detail.consignment_id ?? consignmentId} />
                <DetailRow label="Merchant Order" value={detail.merchant_order_id} />
                <DetailRow label="Store ID"       value={detail.store_id} />
              </DetailSection>

              <DetailSection title="Charges" icon={<Banknote className="w-4 h-4" />}>
                <DetailRow
                  label="Collectable"
                  value={`৳${Number(detail.collectable_amount).toFixed(2)}`}
                />
                <DetailRow
                  label="Collected"
                  value={`৳${Number(detail.collected_amount).toFixed(2)}`}
                />
                <DetailRow
                  label="Delivery Fee"
                  value={`৳${Number(detail.delivery_fee).toFixed(2)}`}
                />
                {detail.cod_fee != null && (
                  <DetailRow
                    label="COD Fee"
                    value={`৳${Number(detail.cod_fee).toFixed(2)}`}
                  />
                )}
              </DetailSection>

              <DetailSection title="Timestamps" icon={<Hash className="w-4 h-4" />}>
                {detail.updated_at && (
                  <DetailRow
                    label="Updated"
                    value={new Date(detail.updated_at).toLocaleString("en-GB")}
                  />
                )}
              </DetailSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailSection = ({ title, icon, children }) => (
  <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-white">
      <span className="text-gray-500">{icon}</span>
      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</span>
    </div>
    <div className="p-4 space-y-2">{children}</div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <span className="text-xs text-gray-500 w-28 shrink-0 pt-0.5">{label}</span>
    <span className="text-xs text-gray-800 font-medium break-all">{value ?? "—"}</span>
  </div>
);

/* ─── Main TabOrders component ─── */
const TabOrders = ({ company }) => {
  const { data, isLoading, isError } = useGetAssignedOrderOfCompanyQuery(company.id);
  const orders = Array.isArray(data?.data) ? data.data : [];

  const [selectedConsignmentId, setSelectedConsignmentId] = useState(null);

  if (isLoading)
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (isError)
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-red-400 text-sm">
        অর্ডার লোড করতে সমস্যা হয়েছে।
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
        কোনো অর্ডার পাওয়া যায়নি।
      </div>
    );

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "#",
                  "Order ID",
                  "Consignment",
                  "Merchant Order",
                  "Recipient",
                  "Phone",
                  "Address",
                  "Collectable",
                  "Delivery Fee",
                  "Total Fee",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order, idx) => (
                <tr
                  key={order.id}
                  className="hover:bg-red-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedConsignmentId(order.consignment_id)}
                >
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {order.order_id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-xs text-blue-600 hover:underline">
                      {order.consignment_id}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {order.merchant_order_id}
                  </td>
                  <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                    {order.recipient_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {order.recipient_phone}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                    {order.recipient_address}
                  </td>
                  <td className="px-4 py-3 text-green-700 font-medium whitespace-nowrap">
                    ৳{Number(order.collectable_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    ৳{Number(order.delivery_fee).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    ৳{Number(order.total_fee).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedConsignmentId && (
        <OrderDetailPanel
          companyId={company.id}
          consignmentId={selectedConsignmentId}
          onClose={() => setSelectedConsignmentId(null)}
        />
      )}
    </>
  );
};

export default TabOrders;
