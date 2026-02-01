import React, { useState,useEffect } from "react";
import "/Volumes/fahim/react_project/dropship/src/css/ProductDetails.css"; // Custom CSS for styling
import { FaHeart } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useGetProductDetailsQuery } from "../../redux/features/product";
import { imgBaseUrl } from '../../../config';
import { useNavigate } from "react-router-dom";
const ProductDetailsHomePage = () => {
  const { id } = useParams();
 const  navigate = useNavigate();
  const { data: detail, isLoading, isError, error } = useGetProductDetailsQuery({ id: id, seller: 1 });
  const [activeTab, setActiveTab] = useState("images");
  useEffect(() => {
    console.log("product ID from URL:", id);
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const { product } = detail;
  const goToLogin = () => {
    navigate("/");
  };
  return (
    <div className="product-details-container">
      <div className="product-header">
        <div className="product-image-column">
          <img
            src={product.main_image_url}
            alt={product.product_name}
            className="product-image"
          />
          <div className="product-actions">
            <p className="download-info">Marketing kits can be downloaded after login</p>
            <FaHeart
              className={`favorite-icon ${product.isFav == 1 ? 'text-red-500' : 'text-gray-400'}`}
              title={product.isFav == 1 ? "Remove from Favorites" : "Add to Favorites"}
            />
          </div>
        </div>
        <div className="product-info-column">
          <h1 className="product-name text-2xl font-bold mb-2">{product.product_name}</h1>
          <p className="product-sku text-sm text-gray-500 mb-1">SKU: {product.sku}</p>
          <p className="product-description text-base mb-3">{product.description}</p>
          <div className="product-details grid grid-cols-2 gap-4 mb-3">
            <p className="product-price text-md font-semibold text-green-300">Base Price: ${product.price}</p>
            <p className="product-stock text-md font-semibold text-blue-300">Stock: 1000</p>
          </div>
          <p className="product-price text-lg font-semibold text-green-600">You can set your own sell price which will be collected from your customer and will add the profit to your balance after delivery.</p>

          <p className="login-info text-sm text-center text-gray-700 italic mb-4">
            For more information and access, please login to Bebsha360.
          </p>
          <button
           
            onClick={goToLogin}
          >
            Login
          </button>
        </div>
        

      </div>

     {/* Product Images, Reviews, and Strategy Tabs */}
           <div className="product-tabs">
             <div className="tabs">
               <button
                 className={`tab ${activeTab === "images" ? "active" : ""}`}
                 onClick={() => handleTabClick("images")}
               >
                 Images
               </button>
               <button
                 className={`tab ${activeTab === "videos" ? "active" : ""}`}
                 onClick={() => handleTabClick("videos")}
               >
                 Videos
               </button>
               <button
                 className={`tab ${activeTab === "reviews" ? "active" : ""}`}
                 onClick={() => handleTabClick("reviews")}
               >
                 Reviews
               </button>
               <button
                 className={`tab ${activeTab === "strategy" ? "active" : ""}`}
                 onClick={() => handleTabClick("strategy")}
               >
                 Strategy
               </button>
             </div>
     
             {/* Tab Content */}
                {/* Tab image */}
             <div className="tab-content">
               {activeTab === "images" && (
                 <div className="images-tab-content">
                   {product.images.map((image) => (
                     <div className="image-container" key={image.id}>
                       <img
                        src={`${imgBaseUrl}${image.image_url}`}
                         alt={`Product Image ${image.id}`}
                         className="tab-image"
                       />
                         <p className="download-info">Marketing kits can be downloaded after login</p>
                     </div>
                   ))}
                 </div>
               )}
             {/* Tab videos */}
               {activeTab === "videos" && (
                <div className="videos-tab-content">
                <div className="video-grid">
                  {product.videos.map((video) => (
                    <div className="video-item" key={video.id}>
                      {/* YouTube Icon with onClick handler */}
                      <FaYoutube
                        className="youtube-icon"
                        title="Watch Video"
                        onClick={() => handleVideoClick(video.video_link)} // Pass video_link to handler
                      />
                      
                      {/* Video File Name */}
                      <p className="video-file-name">{video.file_name}</p>
                    </div>
                  ))}
                </div>
              </div>
                 
               )}
        {/* Tab review */}
               {activeTab === "reviews" && (
                 <div className="reviews-tab-content">
                 {product.review && product.review.length > 0 ? (
                   product.review.map((review) => (
                     <div key={review.id} className="review-card">
                       <div className="review-header">
                         <h3 className="review-title">Customer Reviews</h3>
                         <div className="review-rating">
                           {/* Dynamically display star rating */}
                           {Array.from({ length: 5 }).map((_, index) => (
                             <span
                               key={index}
                               className={`star ${index < review.review_count ? "filled" : ""}`}
                             >
                               ⭐
                             </span>
                           ))}
                           <span className="review-rating-text">
                             ({review.review_count}/5)
                           </span>
                         </div>
                       </div>
                       <p className="review-text">{review.review_text}</p>
                     </div>
                   ))
                 ) : (
                   <p>No reviews available for this product.</p>
                 )}
               </div>
               )}
        {/* Tab strategy */}
               {activeTab === "strategy" && (
                <div className="strategy-tab-content">
                {product.strategy && product.strategy.length > 0 ? (
                  product.strategy.map((st) => (
                    <div key={st.id} className="strategy-card">
                      <h3 className="strategy-title">{st.strategy_title}</h3>
                      <p className="strategy-subtitle">{st.strategy_subtitle}</p>
                    </div>
                  ))
                ) : (
                  <p>No strategies available for this product.</p>
                )}
              </div>
               )}
             </div>
           </div>
    </div>
  );
};

export default ProductDetailsHomePage;
