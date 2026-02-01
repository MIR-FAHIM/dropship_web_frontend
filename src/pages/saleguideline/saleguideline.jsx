import React from 'react';
import { Link } from 'react-router-dom';

const SalesGuidelines = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Sales Guidelines for Resellers</h1>
        <p className="text-lg text-gray-600">
          Follow these guidelines to get better results and boost your sales performance!
        </p>
      </header>

      {/* Sales Journey Visualization */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sales Journey Steps</h2>
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="p-4 bg-blue-500 text-white rounded-full w-16 h-16 mx-auto mb-4">1</div>
            <p className="font-medium text-lg">Select Verified Products</p>
            <p className="text-sm text-gray-500">Choose quality products with ratings for guaranteed satisfaction.</p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-blue-500 text-white rounded-full w-16 h-16 mx-auto mb-4">2</div>
            <p className="font-medium text-lg">Add to Cart & Confirm Orders</p>
            <p className="text-sm text-gray-500">Make sure to confirm with customers before placing orders to avoid fake orders.</p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-blue-500 text-white rounded-full w-16 h-16 mx-auto mb-4">3</div>
            <p className="font-medium text-lg">Process Delivery with Advance Charges</p>
            <p className="text-sm text-gray-500">Ensure delivery charges are paid in advance to prevent unnecessary losses.</p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-blue-500 text-white rounded-full w-16 h-16 mx-auto mb-4">4</div>
            <p className="font-medium text-lg">Deliver & Follow Up</p>
            <p className="text-sm text-gray-500">Ensure customer satisfaction, gather feedback, and handle returns as necessary.</p>
          </div>
        </div>
      </section>

      {/* Product Quality and Verified Products */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Quality and Verification</h2>
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            When selling products, it is essential to focus on verified products for better customer satisfaction and
            consistent sales. Products are rated as:
          </p>
          <div className="space-y-4">
            <div>
              <span className="font-bold">★★★★★ 5 Star Products:</span>
              <p className="text-gray-600">These are high-quality products that guarantee 100% positive reviews from customers. Sell these with confidence!</p>
            </div>
            <div>
              <span className="font-bold">★★★★ 4 Star Products:</span>
              <p className="text-gray-600">These products have great quality and will receive positive feedback. You can sell them without worry about quality concerns.</p>
            </div>
            <div>
              <span className="font-bold">★★★ 3 Star Products:</span>
              <p className="text-gray-600">These products offer good value for their price. Adjust the price accordingly and communicate quality expectations with customers.</p>
            </div>
            <div>
              <span className="font-bold">★★ 2 Star Products:</span>
              <p className="text-gray-600">These are lower-budget items and may not always meet customer expectations. Sell carefully, making sure customers are aware of the lower quality.</p>
            </div>
            <div>
              <span className="font-bold">Low Budget Products:</span>
              <p className="text-gray-600">These are mostly copy products. We do not suggest selling them frequently due to potential poor reviews.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Order Guidelines */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Guidelines</h2>
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            It's crucial to follow proper order procedures to reduce fake orders and ensure a smooth process:
          </p>
          <ul className="list-disc list-inside text-gray-700">
            <li><strong>Order Confirmation:</strong> Always confirm the order with the customer via phone before placing it in the app.</li>
            <li><strong>Delivery Charges:</strong> Always request advance delivery charges from customers to reduce the chances of fake orders.</li>
            <li><strong>Order Verification:</strong> For customers who haven’t paid advance charges, verify their order before proceeding with delivery.</li>
          </ul>
        </div>
      </section>

      {/* Account Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Account Security</h2>
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            Protect your account and ensure safe transactions:
          </p>
          <ul className="list-disc list-inside text-gray-700">
            <li><strong>Secure Password:</strong> Never share your account password with anyone.</li>
            <li><strong>Link Payment Methods:</strong> Always link your payment numbers (e.g., Bkash) to prevent unauthorized withdrawals.</li>
            <li><strong>Support Contact:</strong> For any issues, reach out to the support team immediately for assistance.</li>
          </ul>
        </div>
      </section>

      {/* Conclusion */}
      <section>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Final Tips</h2>
          <p className="text-lg text-gray-700 mb-6">
            Follow these guidelines, and you'll be on your way to becoming a successful reseller! Stay focused, keep learning, and provide excellent customer service.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full text-lg hover:bg-blue-700"
          >
            Start Selling Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SalesGuidelines;
