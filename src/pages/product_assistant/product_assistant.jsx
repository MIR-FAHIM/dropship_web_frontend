import React, { useState } from 'react';
import { useGetFavProductsQuery } from "../../redux/features/product"; // Assuming this query is defined in your redux slice
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const queries = [
    "List products with a winning rate of 90% or higher.",
    "Show me products with the best customer reviews.",
    "Which products offer the highest profit potential?",
    "Display the top trending products for this month.",
    "Show Bebsha360’s analysis of products with high sales potential for the next two weeks."
  ];

const ProductAssistantPage = ({ questionId }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeQuery, setActiveQuery] = useState(null);
  const navigate = useNavigate();
  // Fetching assistant products based on questionId from the API
  const { data: products, isLoading, isError, error } = useGetFavProductsQuery(1);

  // Handle the loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle the error state
  if (isError) {
    return <div>Error: {error.message}</div>;
  }
const goToProductDetail = (id)=>{
    navigate(`/productdetails/${id}`);
};
  const handleQueryClick = (query) => {
    setActiveQuery(query);
    // Simulate fetching data based on query (you can modify this to trigger actual data fetching based on the query)
    console.log(`Fetching products for: ${query}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* AI Query Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Filter Products Based on AI Queries</h2>
          <div className="space-y-4">
            {queries.map((query, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="cursor-pointer border-2 hover:border-primary transition duration-300 rounded-lg shadow-md">
                  <div className="p-4">
                    <button
                      className="w-full text-left py-2 px-4 border border-transparent rounded-lg hover:bg-gray-200"
                      onClick={() => handleQueryClick(query)}
                    >
                      {query}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Query Display */}
        {activeQuery && (
          <div className="mt-6 text-center">
            <p className="text-xl font-semibold">Showing products for:</p>
            <p className="text-lg text-primary mt-2">{activeQuery}</p>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-10">Product Suggestions</h2>

        {/* Grid Layout for Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products?.data.map((product) => (
            <div
              key={product.product_id}
              onClick={() => goToProductDetail(product.product_id)}

              className="group relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
            >
              {/* Product Image */}
              <div className="h-60 bg-gray-200">
                <img
                  src={product.product.main_image_url}
                  alt={product.product.product_name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info Section */}
              <div className="p-3 bg-white">
                <h3 className="text-sm font-semibold text-gray-800">{product.product.product_name}</h3>
                <div className="text-xs text-gray-500">{product.product.price}</div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-2"></div>

                {/* Stock, Winning Rate, and Verified Info */}
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    {product.product.stock} in stock
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {product.product.winning_rate} Winning Rate
                  </span>
                </div>

               
              

               
               
              </div>
            </div>
          ))}
        </div>

        {/* Selected Product Panel */}
        {selectedProduct && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-blue-600">
                {selectedProduct.product.product_name}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-blue-400 hover:text-blue-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-600 font-medium">Price</p>
                <p className="text-2xl text-blue-700">{selectedProduct.product.price}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-600 font-medium">Stock</p>
                <p className="text-2xl text-blue-700">{selectedProduct.product.stock} units</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-600 font-medium">Winning Rate</p>
                <p className="text-2xl text-blue-700">{selectedProduct.product.winning_rate}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-600 font-medium">Verified</p>
                <p className="text-2xl text-blue-700">
                  {selectedProduct.verified ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAssistantPage;
