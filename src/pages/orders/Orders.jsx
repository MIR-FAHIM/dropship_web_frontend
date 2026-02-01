import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListOrdersByUserQuery } from "../../redux/features/order";
import { getFromLocalstorage } from "../../utils/localstorage.utils";
import Pagination from "../../components/shared/Pagination";

const Order = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const userId = getFromLocalstorage("userId") || 1;
  const { data: ordersData, error, isLoading } = useListOrdersByUserQuery({
    userId,
    page,
  });

  const orders = ordersData?.data?.data || [];
  const totalPages = ordersData?.data?.last_page || 1;
  const statuses = [
    "all",
    ...Array.from(new Set(orders.map((order) => order.status).filter(Boolean))),
  ];
  const filteredOrders =
    filter === "all" ? orders : orders.filter((order) => order.status === filter);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading orders: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order List</h2>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md capitalize ${
                filter === status ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {status}
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
                  <th className="px-4 py-2 text-left">Order</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Payment</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="font-semibold">{order.order_number}</div>
                      <div className="text-xs text-gray-500">#{order.id}</div>
                    </td>
                    <td className="px-4 py-2">{order.customer_name}</td>
                    <td className="px-4 py-2">{order.customer_phone}</td>
                    <td className="px-4 py-2">৳ {order.total}</td>
                    <td className="px-4 py-2">
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 capitalize">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-full ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                        onClick={() => navigate(`/orders-details/${order.id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 ? (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={ordersData?.data?.current_page || 1}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Order;
