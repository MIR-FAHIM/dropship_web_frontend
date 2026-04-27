import React, { useState, useEffect } from 'react';
import { useListCompletedOrdersByUserQuery } from '../../../redux/features/order';
import { getFromLocalstorage } from "../../../utils/localstorage.utils";


const SalesAndProfit = () => {
  const userId = getFromLocalstorage("userId") || 1;
  const { data, isLoading, isError } = useListCompletedOrdersByUserQuery(userId);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError || !data || !data.data) {
    return <div>Error fetching data.</div>;
  }

  // Defensive: handle paginated API response
  const orders = Array.isArray(data.data.data) ? data.data.data : [];

  // Calculate total profit
  const totalProfit = orders.reduce((sum, order) => sum + (parseFloat(order.reseller_profit) || 0), 0);
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 shadow-lg rounded-lg">
        {/* Summary Section */}
        <div className="mb-8 p-4 bg-gray-100 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 md:gap-8 justify-between items-center">
          <div className="flex-1 text-center">
            <div className="text-sm text-gray-600">Total Sales</div>
            <div className="text-2xl font-bold text-blue-700">৳{totalSales.toFixed(2)}</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm text-gray-600">Total Profit Earned</div>
            <div className="text-2xl font-bold text-green-600">৳{totalProfit.toFixed(2)}</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm text-gray-600">Completed Orders</div>
            <div className="text-2xl font-bold text-indigo-600">{totalOrders}</div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Completed Orders & Profit Details</h2>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Order #</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Total</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Profit</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Profit Margin</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No completed orders found.</td></tr>
              )}
              {orders.map((order) => {
                const profit = parseFloat(order.reseller_profit) || 0;
                const total = parseFloat(order.total) || 0;
                const profitMargin = total > 0 ? ((profit / total) * 100).toFixed(2) : "0.00";
                return (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-blue-700 font-semibold">{order.order_number}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      <div>{order.customer_name}</div>
                      <div className="text-xs text-gray-400">{order.customer_phone}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">৳{total.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-green-600 font-bold">৳{profit.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-indigo-600">{profitMargin}%</td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false
                      }).format(new Date(order.created_at))}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <ul className="list-disc ml-4">
                        {order.items && order.items.map(item => (
                          <li key={item.id}>
                            <span className="font-medium">{item.product_name}</span> x{item.qty} <span className="text-gray-400">(৳{parseFloat(item.reseller_price).toFixed(2)})</span>
                            <span className="ml-2 text-green-500">+৳{parseFloat(item.line_total_reseller_profit).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          <strong>Note:</strong> This page shows your completed orders, total sales, and profit earned as a reseller. Track your sales history and profit margin here.
        </div>
      </div>
    </div>
  );
};

export default SalesAndProfit;
