import React, { useState } from 'react';
import { useGetPostByTypeQuery } from '../../redux/features/post';
import {imgBaseUrl} from '../../../config';
import { useNavigate } from "react-router-dom";
const Post = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  // Replace 'type' with the desired type (e.g., "image", "video", etc.)
  const { data, error, isLoading } = useGetPostByTypeQuery('New'); 

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching posts</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Feed</h2>

        <div className="space-y-6">
          {data?.posts?.map((post) => (
            <div key={post.id} className="bg-white shadow-lg rounded-lg overflow-hidden" onClick={() => navigate(`/productdetails/${post.product_id}`)}>
              <div className="flex items-center p-4 border-b border-gray-200">
                <img
                  src={post.product.main_image_url}
                  alt={post.product.product_name}
                  className="h-10 w-10 rounded-full"
                />
                <div className="ml-3">
                  <div className="text-sm font-semibold text-gray-800">{post.product.product_name}</div>
                  <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                  <button 
                    className="text-blue-500 text-xs bg-gray-200 px-2 py-1 rounded" 
                    onClick={() => copyToClipboard(post.title)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">{post.post_content}</p>
                  <button 
                    className="text-blue-500 text-xs bg-gray-200 px-2 py-1 rounded" 
                    onClick={() => copyToClipboard(post.post_content)}
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Product Code: {post.product.product_code}</p>
              </div>

              <div className="p-4">
                <div className="flex space-x-4 overflow-x-scroll pb-4">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={`${imgBaseUrl}${image.image_url}`}
                      alt={`Post image ${index + 1}`}
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between p-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">Price: {post.product.price}</div>
                <div className="flex items-center space-x-2">
                  {post.product.is_verified && (
                    <span className="px-2 py-1 text-xs text-white bg-blue-600 rounded-full">Verified</span>
                  )}
                  <span className="text-xs text-gray-500">Winning Rate: {post.product.winning_rate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Post;
