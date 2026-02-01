import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { FaHeart, FaDownload, FaLightbulb } from "react-icons/fa";
import { useGetProductByProductCategoryQuery } from "../../redux/features/product"; // Assuming this query is defined in your redux slice

const ProductsList = () => {
  const { id } = useParams();  // Assuming categoryId is passed in the route
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  // Use the query hook to fetch products by category
  const paramData = {
    "cat_id": id,
    "seller":1
  }
  const { data: products, isLoading, isError, error } = useGetProductByProductCategoryQuery(paramData);
  useEffect(() => {
    console.log("Category ID from URL:", id);
    // Now you can fetch products using this id
  }, [id]);  // Log the category ID whenever it changes (i.e., on navigation)
  const handleDownloadImage = (image) => {
    const link = document.createElement('a');
    link.href = image;
    link.download = 'product-image';
    link.click();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-center text-blue-600 font-bold text-lg mb-6">Product List</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products?.data.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/productdetails/${product.id}`)} 
           
            className="group relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all bg-white"
          >
            {/* Product Image */}
            <div className="h-32 bg-gray-100 flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src={product.main_image_url || 'default-image-url'}  // Use default image if no image URL
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info Section */}
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-800">{product.product_name}</h3>
              <div className="text-xs text-gray-500 font-medium">{product.price}</div>
              <div className="border-t border-gray-200 my-2"></div>

              {/* Stock and Winning Rate */}
              <div className="flex justify-between items-center text-xs text-gray-700 space-x-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {product.total_stock} in stock
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  {product.winning_rate}
                </span>
              </div>

              {/* Icons for Actions */}
              <div className="mt-2 flex justify-between items-center text-gray-600 text-base bg-gray-50 p-2 rounded-lg shadow-md">
                <FaHeart className={`cursor-pointer ${product.isFav == true ? 'text-red-500' : 'text-gray-400'} hover:scale-110 transition-transform`} />
                <FaLightbulb 
         
        className={`cursor-pointer transition-transform  hover:scale-110`} 
      />
                <FaDownload className="cursor-pointer text-blue-500 hover:scale-110 transition-transform" onClick={() => handleDownloadImage(product.main_image_url)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
