import React, { useState, useEffect } from 'react';
import { useGetAddBalanceDataUserQuery } from '../../redux/features/accounting';

const SalesAndProfit = () => {
  // Fetch data from the API using the custom hook
  const { data, isLoading, isError } = useGetAddBalanceDataUserQuery(1);

  // Error handling for the API response
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data.</div>;
  }

  // Function to calculate the balance change for each transaction
  const calculateBalanceChange = (previousBalance, addedAmount) => {
    return parseFloat(addedAmount) - parseFloat(previousBalance);
  };

  // Function to calculate overall report
  const calculateOverallReport = () => {
    const totalAddedAmount = data.data.reduce((total, transaction) => total + parseFloat(transaction.added_amount), 0);
    const totalTransactions = data.data.length;
    const totalBalanceChange = data.data.reduce((total, transaction) => total + calculateBalanceChange(transaction.previous_balance, transaction.added_amount), 0);

    return {
      totalAddedAmount: totalAddedAmount.toFixed(2),
      totalBalanceChange: totalBalanceChange.toFixed(2),
      totalTransactions,
    };
  };

  const report = calculateOverallReport();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white p-6 shadow-lg rounded-lg">
        {/* Overall Report Section */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Overall Report</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-white rounded-lg shadow-md">
              <span className="text-sm text-gray-600">Total Added Amount</span>
              <h4 className="text-xl font-bold text-green-600">${report.totalAddedAmount}</h4>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-md">
              <span className="text-sm text-gray-600">Total Balance Change</span>
              <h4 className="text-xl font-bold text-green-600">${report.totalBalanceChange}</h4>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-md">
              <span className="text-sm text-gray-600">Total Transactions</span>
              <h4 className="text-xl font-bold text-blue-600">{report.totalTransactions} transactions</h4>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Transactions Overview</h2>
        
        {/* Transactions Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Transaction ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Order ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Transaction Code</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Previous Balance</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Added Amount</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Updated Balance</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Time</th>
            
              </tr>
            </thead>
            <tbody>
              {data.data.map((transaction) => {
                const balanceChange = calculateBalanceChange(transaction.previous_balance, transaction.added_amount);
                return (
                  <tr key={transaction.id} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-700">{transaction.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{transaction.order_id}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{transaction.trx_code}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">${parseFloat(transaction.previous_balance).toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">${parseFloat(transaction.added_amount).toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">${parseFloat(transaction.updated_balance).toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">
  {new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(transaction.created_at))}
</td>
                   
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesAndProfit;
