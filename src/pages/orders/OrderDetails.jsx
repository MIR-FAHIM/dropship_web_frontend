import React from "react";
import { useParams } from "react-router-dom";
import { useGetOrderDetailsQuery } from "../../redux/features/order";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetOrderDetailsQuery(id);
  const order = data?.data;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  // Function to get the status steps for the delivery
  

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Details</h1>

      {/* Order Details Section */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Customer Information</h2>
  
        <p className="text-lg text-gray-700"><strong>Order Number:</strong> {order?.order_number}</p>
        <p className="text-lg text-gray-700"><strong>Name:</strong> {order?.customer_name}</p>
        <p className="text-lg text-gray-700"><strong>Phone:</strong> {order?.customer_phone}</p>
        <p className="text-lg text-gray-700"><strong>Address:</strong> {order?.shipping_address}</p>
        <p className="text-lg text-gray-700"><strong>Zone:</strong> {order?.zone || "N/A"}</p>
        <p className="text-lg text-gray-700"><strong>Status:</strong> {order?.status}</p>
        <p className="text-lg text-gray-700"><strong>Payment:</strong> {order?.payment_status}</p>
        <p className="text-lg text-gray-700"><strong>Subtotal:</strong> ৳ {order?.subtotal}</p>
        <p className="text-lg text-gray-700"><strong>Total:</strong> ৳ {order?.total}</p>
        <p className="text-lg text-gray-700"><strong>Note:</strong> {order?.note || "N/A"}</p>
      </section>

      {/* Cart List Section */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">Product Name</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">Unit Price</th>
                <th className="py-2 px-4 border-b">Line Total</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {order?.items?.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 px-4">{item.product_name}</td>
                  <td className="py-2 px-4">{item.qty}</td>
                  <td className="py-2 px-4">৳ {item.unit_price}</td>
                  <td className="py-2 px-4">৳ {item.line_total}</td>
                  <td className="py-2 px-4">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default OrderDetailsPage;
