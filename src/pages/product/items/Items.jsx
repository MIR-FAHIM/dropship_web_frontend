import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useListCategoriesQuery } from "../../../redux/features/category";
import { imgBaseUrl } from "../../../../config";

const Items = () => {
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  // Default image URL (use your own placeholder image)
  const defaultImageUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';  // You can use a generic placeholder image

  // Fetching data using the useListCategoriesQuery hook
  const { data, error, isLoading } = useListCategoriesQuery();

  // Check for loading or error states
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching categories.</div>;
  }

  // Handle image error (fallback to default image)
  const handleImageError = (event) => {
    event.target.src = defaultImageUrl; // Set to the default image if it fails to load
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data?.data?.data?.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(`/productlist/${category.id}`)}
              className="group relative cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="aspect-square bg-gray-200 h-30 border-4 border-gray-300 rounded-lg">
                <img
                  src={category?.banner?.file_name ? `${imgBaseUrl}/${category.banner.file_name}` : defaultImageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={handleImageError}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-blue-200 text-black p-2">
                  <h3 className="text-sm font-semibold text-center">{category.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Items;
