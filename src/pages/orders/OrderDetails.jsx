import React from "react";
import { useLocation } from 'react-router-dom';

const OrderDetailsPage = () => {
  const statusLabels = [
    "Order Placed", "Order Validity Check", "Order Approved", "Packaging",
    "Package Complete", "Shipping Started", "Delivered", "Balance Added"
  ];
  const statusNotes = [
    { time: "2025-02-20 10:30", message: "Order placed and validated." },
    { time: "2025-02-20 12:15", message: "Packaging started." },
    { time: "2025-02-20 14:00", message: "Shipping started." },
    { time: "2025-02-20 16:30", message: "Order shipped and on the way." }
  ];
  const location = useLocation();
  const { order } = location.state || {}; // Safe fallback if no state is passed
  const { customer_name, customer_address, customer_phone, total_cart, order_status, cart_list, note } = order;

  // Function to get the status steps for the delivery
  

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Details</h1>

      {/* Order Details Section */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Customer Information</h2>
        <p className="text-lg text-gray-700"><strong>Name:</strong> {customer_name}</p>
        <p className="text-lg text-gray-700"><strong>Address:</strong> {customer_address}</p>
        <p className="text-lg text-gray-700"><strong>Phone:</strong> {customer_phone}</p>
        <p className="text-lg text-gray-700"><strong>Total Cart Value:</strong> ${total_cart}</p>
        <p className="text-lg text-gray-700"><strong>Note:</strong> {note}</p>
      </section>

      {/* Cart List Section */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cart Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">Product Name</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">Seller Total Price</th>
                <th className="py-2 px-4 border-b">Product Base Price</th>
                <th className="py-2 px-4 border-b">Profit</th>
              </tr>
            </thead>
            <tbody>
              {cart_list.map((cartItem) => (
                <tr key={cartItem.id} className="border-b">
                  <td className="py-2 px-4">{cartItem.product.product_name}</td>
                  <td className="py-2 px-4">{cartItem.quantity}</td>
                  <td className="py-2 px-4">${cartItem.seller_total_price}</td>
                  <td className="py-2 px-4">${cartItem.product_base_price_total}</td>
                  <td className="py-2 px-4">${cartItem.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Order Status and Notes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Delivery Steps Status Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Delivery Status</h2>
          <ul className="space-y-4">
            {statusLabels.map((step, index) => (
              <li
                key={index}
                className={`flex items-center ${order_status >= index ? "text-green-600" : "text-gray-400"}`}
              >
                <span className={`mr-2 w-8 h-8 rounded-full flex justify-center items-center border-2 ${order_status > index ? "bg-green-600 text-white" : "bg-gray-200"}`}>
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-gray-500">
            <span className="font-semibold">Last Updated: </span>
            <span>time</span>
          </div>
        </section>

        {/* Order Status Notes Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Status Notes</h2>
          <div className="space-y-4">
            {statusNotes.map((note, index) => (
              <div key={index} className="flex items-start space-x-4">
               
                <div>
                  <p className="text-sm text-gray-500">{note.time}</p>
                  <p className="text-lg text-gray-700">{note.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default OrderDetailsPage;
