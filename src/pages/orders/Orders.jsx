import React, { useState } from 'react';
import { useGetOrderBySellerQuery, useGetUserBalanceQuery } from "../../redux/features/order";
import { useNavigate } from "react-router-dom";

const statusLabels = [
  "Order Placed", "Order Validity Check", "Order Approved", "Packaging",
  "Package Complete", "Shipping Started", "Delivered", "Balance Added"
];

const Order = () => {
  const navigate = useNavigate();
  const { data: ordersData, error, isLoading } = useGetOrderBySellerQuery(1);
  const { data: balance, e, l } = useGetUserBalanceQuery(1);

  const [filter, setFilter] = useState('All');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading orders: {error.message}</div>;
  }

  const orders = ordersData?.data || [];
  const filteredOrders = filter === 'All' ? orders : orders.filter(order => order.order_status.toString() === filter);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order List</h2>

        {/* Filter Buttons */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setFilter('All')}
            className={`px-4 py-2 rounded-md ${filter === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          {statusLabels.map((label, index) => (
            <button
              key={index}
              onClick={() => setFilter(index.toString())}
              className={`px-4 py-2 rounded-md ${filter === index.toString() ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No orders found</div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Order ID</th>
                  <th className="px-4 py-2 text-left">Customer Name</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Address</th>
                  <th className="px-4 py-2 text-left">Profit for seller</th>
                  <th className="px-4 py-2 text-left">Total Cart</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-2">{order.id}</td>
                    <td className="px-4 py-2">{order.customer_name}</td>
                    <td className="px-4 py-2">{order.customer_phone}</td>
                    <td className="px-4 py-2">{order.customer_address}</td>
                    <td className="px-4 py-2">{order.profit_for_seller}</td>
                    <td className="px-4 py-1">{order.cart_list.length}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-4 py-2 rounded-full ${
                          order.order_status === 0
                            ? 'bg-yellow-300 text-yellow-800'
                            : order.order_status === 1
                            ? 'bg-blue-300 text-blue-800'
                            : order.order_status === 2
                            ? 'bg-green-300 text-green-800'
                            : order.order_status === 3
                            ? 'bg-orange-300 text-orange-800'
                            : order.order_status === 4
                            ? 'bg-purple-300 text-purple-800'
                            : order.order_status === 5
                            ? 'bg-teal-300 text-teal-800'
                            : order.order_status === 6
                            ? 'bg-indigo-300 text-indigo-800'
                            : 'bg-gray-300 text-gray-800'
                        }`}
                      >
                        {statusLabels[order.order_status] || 'Unknown Status'}
                      </span>
                    </td>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                      onClick={() => navigate(`/orders-details/${order.id}`, { state: { order } })}
                    >
                      View Details
                    </button>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
