import React, {useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // If you're using react-router for navigation
import { useGetCartQuery, useDeleteCartMutation, useUpdateCartMutation } from "../../redux/features/cart";

const SuccessPage = () => {
  const navigate = useNavigate();
const location = useLocation();
const order = location.state?.order;
const { data: cartList, error, isLoading, refetch } = useGetCartQuery(1);
  const handleGoHome = () => {
    refetch();
    // Navigate back to the homepage or orders list page
    navigate('/');
  };
  useEffect(() => {
    // Refetch cart data whenever the page is loaded
    refetch();
  }, [refetch]); 
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Order Successfully Placed!</h2>

        {/* Order Details Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Order Details</h3>
          <div className="mb-2">
            <strong>Order ID: </strong>{order.id}
          </div>
          <div className="mb-2">
            <strong>Customer Name: </strong>{order.customer_name}
          </div>
          <div className="mb-2">
            <strong>Product: </strong>{order.product_name}
          </div>
          <div className="mb-2">
            <strong>Total Price: </strong>৳{order.total_cart}
          </div>
          <div className="mb-2">
            <strong>Status: </strong>
            <span className={`px-2 py-1 rounded-full ${
              order.order_status === '0' ? 'bg-yellow-300 text-yellow-800' :
              order.order_status === '1' ? 'bg-blue-300 text-blue-800' :
              order.order_status === '2' ? 'bg-green-300 text-green-800' : 'bg-gray-300 text-gray-800'
            }`}>
              {order.order_status === '0' ? 'Pending' :
               order.order_status === '1' ? 'Processing' :
               order.order_status === '2' ? 'Delivered' : 'Completed'}
            </span>
          </div>
        </div>

        {/* Next Steps Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Next Steps</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Wait for the seller to process the order.</li>
            <li>Once processed, you'll receive a notification about your order status.</li>
            <li>If there are any issues, you will be contacted by our support team.</li>
            <li>For any queries, contact our customer support at support@company.com.</li>
          </ul>
        </div>

        {/* Call to Action Button */}
        <div className="mt-4">
          <button 
            onClick={handleGoHome}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full hover:bg-blue-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
