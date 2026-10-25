import React, { useState, useEffect } from 'react';
import { 
  useAddWithdrawRequestMutation, 
  useGetUserWithdrawRequestsQuery 
} from '../../../redux/features/withdraw';
import { 
  useGetUserBankAccountQuery, 
  useGetResellerTransactionsQuery 
} from '../../../redux/features/accounting';
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { 
  Wallet, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle, 
  Loader2 
} from "lucide-react";

const statusColors = {
  transferred: "bg-green-100 text-green-800 border-green-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const WithdrawPage = () => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const userId = getFromLocalstorage("userId");

  // Fetch user balances
  const { data: balanceData, refetch: refetchBalances } = useGetResellerTransactionsQuery(
    { reseller_id: userId },
    { skip: !userId }
  );

  const availableBalance = balanceData?.data?.available_balance ?? balanceData?.data?.balance ?? 0;
  const pendingReserved = balanceData?.data?.pending_reserved ?? 0;
  const totalBalance = balanceData?.data?.balance ?? 0;

  // Fetching the user's bank/payment accounts
  const { data: accountsData, error: accountsError, isLoading: accountsLoading } = useGetUserBankAccountQuery(userId, { skip: !userId });

  // Fetching the withdrawal history for the user
  const { data: historyData, error: historyError, isLoading: historyLoading, refetch } = useGetUserWithdrawRequestsQuery(userId, { skip: !userId });

  // Mutation hook for making a withdrawal
  const [addWithdraw, { isLoading: withdrawLoading }] = useAddWithdrawRequestMutation();

  // Set default bank on page load
  useEffect(() => {
    if (accountsData?.data && accountsData.data.length > 0) {
      setSelectedBankId(accountsData.data[0].id);
    }
  }, [accountsData]);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const amountNum = Number(withdrawAmount);
    if (!amountNum || amountNum <= 0) {
      setErrorMessage('সঠিক অ্যামাউন্ট লিখুন।');
      return;
    }

    if (!selectedBankId) {
      setErrorMessage('পেমেন্ট অ্যাকাউন্ট নির্বাচন করুন।');
      return;
    }

    if (amountNum > Number(availableBalance)) {
      setErrorMessage(`আপনার উইথড্রযোগ্য ব্যালেন্সের বেশি টাকা তুলতে পারবেন না (সর্বোচ্চ ৳${availableBalance})।`);
      return;
    }

    try {
      await addWithdraw({
        user_id: userId,
        amount: amountNum,
        bank_id: selectedBankId,
      }).unwrap();

      setSuccessMessage('উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে এবং অ্যামাউন্টটি সংরক্ষিত রাখা হয়েছে।');
      setWithdrawAmount('');
      refetch();
      if (refetchBalances) refetchBalances();
    } catch (error) {
      setErrorMessage(error?.data?.message || error?.message || 'উইথড্র রিকোয়েস্ট ব্যর্থ হয়েছে।');
    }
  };

  const formatCurrency = (val) =>
    `৳${Number(val || 0).toLocaleString("bn-BD", { minimumFractionDigits: 2 })}`;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">উইথড্র পেজ (Withdrawal)</h1>
        <p className="text-sm text-gray-500 mt-1">
          আপনার অর্জিত প্রফিট ও কমিশন নিরাপদে আপনার একাউন্টে উইথড্র করুন।
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-emerald-900 font-bold block">উইথড্রযোগ্য ব্যালেন্স</span>
              <span className="text-[11px] text-gray-500">Available to Withdraw</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            {formatCurrency(availableBalance)}
          </p>
        </div>

        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-amber-900 font-bold block">পেন্ডিং সংরক্ষিত ব্যালেন্স</span>
              <span className="text-[11px] text-gray-500">Reserved in Pending Requests</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700">
            {formatCurrency(pendingReserved)}
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-blue-900 font-bold block">মোট ওয়ালেট ব্যালেন্স</span>
              <span className="text-[11px] text-gray-500">Total Wallet Balance</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(totalBalance)}
          </p>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Withdrawal Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-800">নতুন উইথড্র রিকোয়েস্ট তৈরি করুন</h2>
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                উইথড্র অ্যামাউন্ট (৳) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="যেমন: ৫০০"
                className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                সর্বোচ্চ উইথড্রযোগ্য: {formatCurrency(availableBalance)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                পেমেন্ট একাউন্ট নির্বাচন করুন <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">অ্যাকাউন্ট নির্বাচন করুন</option>
                {accountsData?.data?.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bank_name || 'Bank'} ({account.account_no}) {account.account_holder_name ? '- ' + account.account_holder_name : ''}
                  </option>
                ))}
              </select>
              {(accountsData?.data || []).length === 0 && !accountsLoading && (
                <p className="text-[11px] text-red-500 mt-1">
                  কোনো সেভ করা অ্যাকাউন্ট নেই। প্রোফাইল থেকে অ্যাকাউন্ট যোগ করুন।
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
            disabled={withdrawLoading || Number(availableBalance) <= 0}
          >
            {withdrawLoading ? 'প্রসেসিং হচ্ছে...' : 'উইথড্র নিশ্চিত করুন'}
          </button>
        </form>
      </div>

      {/* Withdrawal History Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">উইথড্র ইতিহাস (Withdrawal History)</h2>
          <span className="text-xs text-gray-500">
            মোট {(historyData?.data || []).length} টি রিকোয়েস্ট
          </span>
        </div>

        {historyLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          </div>
        ) : historyError ? (
          <div className="p-6 text-center text-red-500 text-sm">
            ইতিহাস লোড করতে ত্রুটি হয়েছে।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Bank / Account</th>
                  <th className="py-3 px-4">Bank Reference</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(historyData?.data || []).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      কোনো পূর্ববর্তী উইথড্রয়াল রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  historyData?.data?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-gray-700">
                        #{item.id}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${
                            statusColors[item.status] || "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700">
                        <p className="font-semibold text-gray-800">
                          {item.bank?.bank_name || item.payment_method || "Bank"}
                        </p>
                        <p className="font-mono text-gray-500">
                          {item.bank?.account_no || "-"}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {item.bank_reference ? (
                          <span className="font-mono font-semibold text-green-700">
                            {item.bank_reference}
                          </span>
                        ) : item.note ? (
                          <span className="text-gray-500 italic">{item.note}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawPage;
