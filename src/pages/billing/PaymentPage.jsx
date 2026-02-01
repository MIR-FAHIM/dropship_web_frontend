import React, { useState } from 'react';

const PaymentPage = () => {
  // Orders data with different statuses
  const ordersData = [
    { id: 1, customerName: 'John Doe', status: 'Pending', product: 'Smartphone', price: '$499.99' },
    { id: 2, customerName: 'Jane Smith', status: 'Processing', product: 'Laptop', price: '$899.99' },
    { id: 3, customerName: 'Sam Wilson', status: 'Delivered', product: 'Headphones', price: '$199.99' },
    { id: 4, customerName: 'Emma White', status: 'Completed', product: 'Smartwatch', price: '$199.99' },
    { id: 5, customerName: 'Mike Johnson', status: 'Pending', product: 'Tablet', price: '$299.99' },
    { id: 6, customerName: 'Chris Brown', status: 'Delivered', product: 'Smartphone', price: '$499.99' },
  ];

  // State for the current filter
  const [filter, setFilter] = useState('All');

  // Filtered orders based on the current filter
  const filteredOrders = filter === 'All' ? ordersData : ordersData.filter(order => order.status === filter);

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
          <button
            onClick={() => setFilter('Pending')}
            className={`px-4 py-2 rounded-md ${filter === 'Pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('Processing')}
            className={`px-4 py-2 rounded-md ${filter === 'Processing' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilter('Delivered')}
            className={`px-4 py-2 rounded-md ${filter === 'Delivered' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Delivered
          </button>
          <button
            onClick={() => setFilter('Completed')}
            className={`px-4 py-2 rounded-md ${filter === 'Completed' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Completed
          </button>
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
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-2">{order.id}</td>
                    <td className="px-4 py-2">{order.customerName}</td>
                    <td className="px-4 py-2">{order.product}</td>
                    <td className="px-4 py-2">{order.price}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          order.status === 'Pending'
                            ? 'bg-yellow-300 text-yellow-800'
                            : order.status === 'Processing'
                            ? 'bg-blue-300 text-blue-800'
                            : order.status === 'Delivered'
                            ? 'bg-green-300 text-green-800'
                            : 'bg-gray-300 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
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

export default PaymentPage;
