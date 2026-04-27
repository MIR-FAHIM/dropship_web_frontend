import React from 'react';
import { useGetResellerTransactionsQuery } from '../../../redux/features/accounting';
import { getFromLocalstorage } from "../../../utils/localstorage.utils";


const Payments = () => {

    const userId = getFromLocalstorage("userId") || 0;
  // Fetch reseller transactions
  const { data, error, isLoading } = useGetResellerTransactionsQuery(1, userId);

  // Loading and error states
  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error loading transactions.</div>;
  }

  // Extract data according to API response
  const report = data?.data || {};
  const items = report.items?.data || [];
  const debit = report.debit ?? 0;
  const credit = report.credit ?? 0;
  const balance = report.balance ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Balance Statement</h2>
        {/* Debit, Credit, Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col items-center shadow">
            <span className="text-lg font-semibold text-blue-700">Debit</span>
            <span className="text-2xl font-bold text-blue-900 mt-2">${debit}</span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center shadow">
            <span className="text-lg font-semibold text-green-700">Credit</span>
            <span className="text-2xl font-bold text-green-900 mt-2">${credit}</span>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex flex-col items-center shadow">
            <span className="text-lg font-semibold text-yellow-700">Balance</span>
            <span className="text-2xl font-bold text-yellow-900 mt-2">${balance}</span>
          </div>
        </div>
        {/* Transaction Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Details</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Type</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-gray-400">No transactions found.</td>
                </tr>
              ) : (
                items.map((trx) => (
                  <tr key={trx.id} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-700">{new Date(trx.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{trx.note || trx.source}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 capitalize">{trx.trx_type}</td>
                    <td className={`px-4 py-2 text-sm ${trx.trx_type === 'debit' ? 'text-red-500' : 'text-green-500'}`}>{trx.trx_type === 'debit' ? '-' : '+'}${trx.amount}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{trx.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
