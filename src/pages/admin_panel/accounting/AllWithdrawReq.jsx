import React, { useState } from "react";
import { 
  useGetAllWithdrawsQuery, 
  useChangeWithdrawStatusMutation 
} from "../../../redux/features/withdraw";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowUpRight, 
  Building2, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

const statusColors = {
  transferred: "bg-green-100 text-green-800 border-green-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const AllWithdrawReq = () => {
  const { data, error, isLoading, refetch } = useGetAllWithdrawsQuery();
  const [changeStatus, { isLoading: statusLoading }] = useChangeWithdrawStatusMutation();

  const [activeModal, setActiveModal] = useState(null); // { type: 'transferred' | 'rejected', item }
  const [bankRef, setBankRef] = useState("");
  const [note, setNote] = useState("");
  const [actionError, setActionError] = useState("");

  const handleOpenTransferModal = (item) => {
    setActiveModal({ type: 'transferred', item });
    setBankRef("");
    setNote("");
    setActionError("");
  };

  const handleOpenRejectModal = (item) => {
    setActiveModal({ type: 'rejected', item });
    setBankRef("");
    setNote("");
    setActionError("");
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setBankRef("");
    setNote("");
    setActionError("");
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this withdrawal request?")) {
      return;
    }
    try {
      await changeStatus({ id, status: "approved" }).unwrap();
      refetch();
    } catch (err) {
      alert(err?.data?.message || "Failed to approve request");
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!activeModal) return;

    if (activeModal.type === 'transferred' && !bankRef.trim()) {
      setActionError("Please provide a bank reference or transaction ID.");
      return;
    }

    try {
      const payload = {
        id: activeModal.item.id,
        status: activeModal.type,
        note: note.trim() || undefined,
      };

      if (activeModal.type === 'transferred') {
        payload.bank_reference = bankRef.trim();
      }

      await changeStatus(payload).unwrap();
      handleCloseModal();
      refetch();
    } catch (err) {
      setActionError(err?.data?.message || "Failed to process withdrawal action.");
    }
  };

  const formatCurrency = (val) =>
    `৳${Number(val || 0).toLocaleString("bn-BD", { minimumFractionDigits: 2 })}`;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            উইথড্র রিকোয়েস্ট তালিকা (Withdraw Requests)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            রিসেলারদের ফান্ড উইথড্রয়াল অনুমোদন ও ব্যাংক ট্রান্সফার সম্পন্ন করুন।
          </p>
        </div>
        <button
          onClick={refetch}
          className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
        >
          রিফ্রেশ
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
          উইথড্র রিকোয়েস্ট লোড করতে ব্যর্থ হয়েছে।
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Reseller</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Account / Bank Details</th>
                  <th className="py-3.5 px-4">Reference & Notes</th>
                  <th className="py-3.5 px-4">Requested At</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.data || []).length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-400">
                      কোনো উইথড্র রিকোয়েস্ট নেই।
                    </td>
                  </tr>
                ) : (
                  data?.data?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                        #{item.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-800">{item.user?.name || "N/A"}</p>
                        <p className="text-xs text-gray-500">{item.user?.email || item.user?.phone || "-"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-gray-900 block">
                          {formatCurrency(item.amount)}
                        </span>
                        {Number(item.reserved_amount || 0) > 0 && item.status === 'pending' && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded block mt-0.5">
                            Reserved: {formatCurrency(item.reserved_amount)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${
                            statusColors[item.status] || "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-700">
                        {item.bank ? (
                          <div className="space-y-0.5">
                            <p className="font-semibold text-gray-900">
                              {item.bank?.bank_name || item.payment_method || "Bank"}
                            </p>
                            <p className="font-mono text-gray-600">
                              A/C: {item.bank?.account_no || "-"}
                            </p>
                            {item.bank?.account_holder_name && (
                              <p className="text-[11px] text-gray-500">
                                Name: {item.bank.account_holder_name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-medium">
                            {item.payment_method || "Manual"}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {item.bank_reference ? (
                          <p className="font-mono text-green-700 font-bold">
                            Ref: {item.bank_reference}
                          </p>
                        ) : null}
                        {item.note ? (
                          <p className="text-gray-500 italic mt-0.5">{item.note}</p>
                        ) : (
                          !item.bank_reference && <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {item.status === "pending" && (
                            <>
                              <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 text-xs font-semibold rounded shadow-sm disabled:opacity-50"
                                disabled={statusLoading}
                                onClick={() => handleApprove(item.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 text-xs font-semibold rounded shadow-sm disabled:opacity-50"
                                disabled={statusLoading}
                                onClick={() => handleOpenTransferModal(item)}
                              >
                                Transfer
                              </button>
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 text-xs font-semibold rounded shadow-sm disabled:opacity-50"
                                disabled={statusLoading}
                                onClick={() => handleOpenRejectModal(item)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {item.status === "approved" && (
                            <>
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs font-semibold rounded shadow-sm disabled:opacity-50"
                                disabled={statusLoading}
                                onClick={() => handleOpenTransferModal(item)}
                              >
                                Complete Transfer
                              </button>
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 text-xs font-semibold rounded shadow-sm disabled:opacity-50"
                                disabled={statusLoading}
                                onClick={() => handleOpenRejectModal(item)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {item.status === "transferred" && (
                            <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Transferred
                            </span>
                          )}
                          {item.status === "rejected" && (
                            <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Modal (Transfer with Bank Ref or Reject with Note) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-800">
              {activeModal.type === 'transferred' ? 'Complete Bank Transfer' : 'Reject Withdraw Request'}
            </h3>
            <p className="text-sm text-gray-600">
              Request #{activeModal.item.id} for{' '}
              <strong className="text-gray-900">{formatCurrency(activeModal.item.amount)}</strong>{' '}
              by {activeModal.item.user?.name}.
            </p>

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-3">
              {activeModal.type === 'transferred' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bank Reference / Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="e.g. bKash TrxID: 9J4K2L8, Bank Ref: TR-1092"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    This will permanently debit the reseller's wallet and clear reservation.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {activeModal.type === 'transferred' ? 'Admin Note (Optional)' : 'Rejection Reason / Note'}
                </label>
                <textarea
                  rows="2"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    activeModal.type === 'transferred'
                      ? "Optional remarks..."
                      : "Reason for rejection (e.g. Incorrect bank account number)"
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusLoading}
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition ${
                    activeModal.type === 'transferred'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {statusLoading ? 'Processing...' : activeModal.type === 'transferred' ? 'Confirm Transfer' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWithdrawReq;
