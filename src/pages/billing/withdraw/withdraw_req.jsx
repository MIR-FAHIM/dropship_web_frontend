import React, { useState, useEffect } from 'react';
import { useAddWithdrawRequestMutation, useGetUserWithdrawRequestsQuery } from '../../../redux/features/withdraw';
import { useGetUserBankAccountQuery } from '../../../redux/features/accounting';
import { getFromLocalstorage } from "../../../utils/localstorage.utils";


const WithdrawPage = () => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');

  const userId = getFromLocalstorage("userId"); // Assume the user ID is stored in the auth state.

  // Fetching the user's bank/payment accounts
  const { data: accountsData, error: accountsError, isLoading: accountsLoading } = useGetUserBankAccountQuery(userId);

  // Fetching the withdrawal history for the user
  const { data: historyData, error: historyError, isLoading: historyLoading, refetch } = useGetUserWithdrawRequestsQuery(userId);

  // Mutation hook for making a withdrawal
  const [addWithdraw, { isLoading: withdrawLoading, error: withdrawError }] = useAddWithdrawRequestMutation();

  // Set default bank on page load
  useEffect(() => {
    if (accountsData?.data && accountsData.data.length > 0) {
      setSelectedBankId(accountsData.data[0].id);
    }
  }, [accountsData]);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || !selectedBankId) {
      alert('Please fill all fields');
      return;
    }
    try {
      await addWithdraw({
        user_id: userId,
        amount: withdrawAmount,
        bank_id: selectedBankId,
      }).unwrap();
      setWithdrawAmount('');
      setSelectedBankId(accountsData?.data?.[0]?.id || '');
      refetch();
    } catch (error) {
      console.error('Error during withdrawal:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Withdraw Page</h1>

      {/* Withdraw Information Notes */}
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-gray-800 rounded">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold">বিকাশ ইনস্ট্যান্ট পেমেন্ট</span><br />
            মিনিমাম উইথড্র অ্যামাউন্ট ৫০ টাকা।<br />
            ১,০০০ টাকা পর্যন্ত চার্জ শুধুমাত্র ৫ টাকা।<br />
            ১,০০০ টাকার বেশি হলে চার্জ শুধুমাত্র ১০ টাকা।
          </li>
          <li>
            <span className="font-semibold">নগদ ইনস্ট্যান্ট পেমেন্ট</span><br />
            মিনিমাম উইথড্র অ্যামাউন্ট ৫০ টাকা।<br />
            ১,০০০ টাকা পর্যন্ত চার্জ শুধুমাত্র ৫ টাকা।<br />
            ১,০০০ টাকার বেশি হলে চার্জ প্রতি হাজারে ৫ টাকা।
          </li>
          <li>
            <span className="font-semibold">ব্যাংক পেমেন্ট রেগুলার</span><br />
            মিনিমাম উইথড্র অ্যামাউন্ট ৫,০০০ টাকা।<br />
            ব্যাংক পেমেন্টে কোন চার্জ নেই।<br />
            সময় ২৪ ঘণ্টা, দ্রুত পেতে রিকোয়েস্ট দেওয়ার পর সাপোর্টে জানাবেন।
          </li>
        </ul>
      </div>

      {/* Withdrawal Form */}
      <form onSubmit={handleWithdrawSubmit} className="mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Withdraw Amount"
            className="border p-2 w-64"
            required
          />
          {/* Bank Account Dropdown */}
          <select
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            className="border p-2 w-84"
            required
          >
            <option value="">Select Bank Account</option>
            {accountsData?.data?.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bank_name} ({account.account_no})
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={withdrawLoading}
        >
          {withdrawLoading ? 'Processing...' : 'Withdraw'}
        </button>
      </form>

      {/* Error handling */}
      {withdrawError && <p className="text-red-500">{withdrawError.message}</p>}

      {/* Withdrawal History Table */}
      <h2 className="text-xl font-bold mb-4">Withdrawal History</h2>
      {historyLoading ? (
        <p>Loading history...</p>
      ) : historyError ? (
        <p className="text-red-500">Error fetching history</p>
      ) : (
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Bank Name</th>
              <th className="border p-2">Account No</th>
              <th className="border p-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {historyData?.data?.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">{item.id}</td>
                <td className="border p-2">{item.amount}</td>
                <td className="border p-2">{item.status}</td>
                <td className="border p-2">{item.bank?.bank_name}</td>
                <td className="border p-2">{item.bank?.account_no}</td>
                <td className="border p-2">{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WithdrawPage;
