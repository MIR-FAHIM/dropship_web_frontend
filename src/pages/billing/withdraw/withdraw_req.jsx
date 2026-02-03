import React, { useState, useEffect } from 'react';
import { useGetPaymentAccountByUserQuery, useAddWithdrawReqMutation,useGetWithdrawReqByUserQuery } from '../../../redux/features/withdraw';

const WithdrawPage = () => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [withdrawType, setWithdrawType] = useState('');
  const [isPaid, setIsPaid] = useState(0);

  const sellerId = 1; // Assume the seller ID is stored in the auth state.

  // Fetching the withdrawal history for the user
  const { data: historyData, error: historyError, isLoading: historyLoading } = useGetWithdrawReqByUserQuery(sellerId);

  // Fetching the user's payment accounts
  const { data: accountsData, error: accountsError, isLoading: accountsLoading } = useGetPaymentAccountByUserQuery(sellerId);

  // Mutation hook for making a withdrawal
  const [addWithdraw, { isLoading: withdrawLoading, error: withdrawError }] = useAddWithdrawReqMutation();

  // Set default account on page load
  useEffect(() => {
    if (accountsData?.data) {
      const defaultAccount = accountsData.data.find((account) => account.isDefault === 1);
      if (defaultAccount) {
        setSelectedAccountId(defaultAccount.id); // Set default account ID
      }
    }
  }, [accountsData]);

  const handleWithdrawSubmit = async (e) => {

    
    e.preventDefault();

    if (!withdrawAmount || !selectedAccountId ) {
      alert('Please fill all fields');
      return;
    }

    try {
      await addWithdraw({
        withdraw_amount: withdrawAmount,
        seller_id: 1,
        payment_method: String(selectedAccountId), // Use selected account ID as payment method
        type: "mfs",
        isPaid: 0,
      }).unwrap();

     

      // Reset form
      setWithdrawAmount('');
      setSelectedAccountId('');
      setWithdrawType('');
      setIsPaid(0);
    } catch (error) {
      console.error('Error during withdrawal:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Withdraw Page</h1>

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
          
          {/* Payment Account Dropdown (List of payment accounts) */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="border p-2 w-84"
            required
          >
            <option value="">Select Payment Account</option>
            {accountsData?.data?.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_name} ({account.account_number})
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
              <th className="border p-2">Withdraw Amount</th>
              <th className="border p-2">Previous Amount</th>
             
              <th className="border p-2">Payment Method</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Paid Status</th>
              <th className="border p-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {historyData?.data?.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">{item.id}</td>
                <td className="border p-2">${item.withdraw_amount}</td>
                <td className="border p-2">${item.previous_amount}</td>
           
                <td className="border p-2">{item.payment_method.payment_method_name}</td>
              
                <td className="border p-2">{item.type}</td>
                <td className="border p-2">{item.isPaid === 0 ? 'Not Paid' : 'Paid'}</td>
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
