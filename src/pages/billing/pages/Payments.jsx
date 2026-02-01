import React, { useState } from 'react';

const Payments = () => {
  // Initial transactions (example data)
  const initialTransactions = [
    { id: 1, date: '2025-02-01', details: 'Deposit', amount: 500, balance: 500 },
    { id: 2, date: '2025-02-02', details: 'Withdrawal', amount: -200, balance: 300 },
    { id: 3, date: '2025-02-03', details: 'Deposit', amount: 150, balance: 450 },
    { id: 4, date: '2025-02-04', details: 'Withdrawal', amount: -100, balance: 350 },
  ];

  // State to hold the transactions and balance
  const [transactions, setTransactions] = useState(initialTransactions);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Balance Statement</h2>

        {/* Balance Statement Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Transaction Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Transaction Details</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-700">{transaction.date}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{transaction.details}</td>
                  <td className={`px-4 py-2 text-sm ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {transaction.amount < 0 ? `- $${Math.abs(transaction.amount)}` : `+ $${transaction.amount}`}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{`$${transaction.balance}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
