import React, { useState } from 'react';
import { useGetFavProductsQuery } from "../../redux/features/product"; // Assuming this query is defined in your redux slice

const FavProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetching favorite products from the API (assuming the API returns an array of products)
  const { data: products, isLoading, isError, error } = useGetFavProductsQuery(1); // Replace with actual parameters if needed

  // Handle the loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle the error state
  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Favorite Products</h2>

        {/* Grid Layout for Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products?.data.map((product) => (
            <div
              key={product.product_id}
              onClick={() => setSelectedProduct(product)}
              className="group relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
            >
              {/* Product Image */}
              <div className="h-32 bg-gray-200">
                <img
                  src={product.product.main_image_url} // Replace with actual product image field
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
                  {/* Stock */}
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    {product.product.stock} in stock
                  </span>

                  {/* Winning Rate */}
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {product.product.winning_rate} Winning Rate
                  </span>
                </div>

                {/* Verified Badge */}
                <div className="mt-2">
                  {product.verified ? (
                    <span className="px-3 py-1 text-xs text-white bg-blue-600 rounded-full">
                      Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs text-gray-500 bg-gray-300 rounded-full">
                      Not Verified
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => handleDownloadImage(product.image)}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                  >
                    Download Image
                  </button>
                  <button
                    className="w-full px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                  >
                    Remove from Fav
                  </button>
                  <button
                    className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
                  >
                    Strategy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Product Panel (for demo purposes) */}
        {selectedProduct && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-blue-600">
                {selectedProduct.name}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-blue-400 hover:text-blue-600"
              >
                ×
              </button>
            </div>

            {/* Detailed Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-600 font-medium">Price</p>
                <p className="text-2xl text-blue-700">{selectedProduct.price}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-600 font-medium">Stock</p>
                <p className="text-2xl text-blue-700">{selectedProduct.stock} units</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-600 font-medium">Winning Rate</p>
                <p className="text-2xl text-blue-700">{selectedProduct.winningRate}</p>
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

export default FavProducts;
