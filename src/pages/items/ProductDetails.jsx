import React, { useState, useEffect } from "react";
import "../../../src/css/ProductDetails.css"; // Custom CSS for styling
import { FaHeart, FaDownload } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { FaYoutube } from 'react-icons/fa';
import { useGetProductDetailsQuery } from "../../redux/features/product";
import { useCreateCartMutation, useGetCartQuery } from "../../redux/features/cart";
import { parse } from "date-fns";
import { imgBaseUrl } from '../../../config';
import JSZip from "jszip";
import { saveAs } from "file-saver";

const ProductDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [seller_price, setSellerPrice] = useState(1);
  const [profit, setProfit] = useState(0);
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const navigate = useNavigate();
  const { cartList, cartListError, cartListLoading, refetch } = useGetCartQuery(1);

  const dataParam = {
    "id": id,
    "seller": 1
  };

  const { data: detail, isLoading, isError, error } = useGetProductDetailsQuery(dataParam);
  const [createCart, { isAddingToCart, isSuccess, cartError }] = useCreateCartMutation();
  const handleDownloadAssets = async (productData) => {
    console.log("i am here");
    const zip = new JSZip();
    
    try {
      // Add images
      for (let index = 0; index < productData.images.length; index++) {
        const imageUrl = productData.images[index].image_url;  // Adjust according to how you access the image URL
        const imageResponse = await fetch(`${imgBaseUrl}${imageUrl}`);
        if (!imageResponse.ok) {
          console.error("Failed to fetch image:", imageUrl);
          continue;
        }
        const imageBlob = await imageResponse.blob();
        zip.file(`${productData.product_name}_image_${index + 1}.jpg`, imageBlob);
      }
  
      // Add video links
      for (let index = 0; index < productData.videos.length; index++) {
        const videoUrl = productData.videos[index].video_link; // Adjust according to how you access the video URL
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
          console.error("Failed to fetch video:", videoUrl);
          continue;
        }
        const videoBlob = await videoResponse.blob();
        zip.file(`${productData.product_name}_video_${index + 1}.mp4`, videoBlob);
      }
  
      // Add product description
      zip.file(`${productData.product_name}_description.txt`, productData.description);
  
      // Generate and download the ZIP file
      zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, `${productData.product_name}_assets.zip`);
      });
    } catch (error) {
      console.error("Error occurred while generating ZIP:", error);
    }
  };
  
  useEffect(() => {
    console.log("product ID from URL:", id);
  }, [id]);

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleSelelrPriceChange = (e) => {
    setSellerPrice(e.target.value);
    setProfit(e.target.value - product.price); // Calculate profit
  };

  const handleAddToCart = async () => {
    if (!product) {
      console.log("Product details are not loaded yet.");
      return;
    }

    const cartItem = {
      user_id: 1,
      product_id: product.id,
      quantity: quantity,
      seller_price: seller_price,
      note: "new calv",
      is_ordered: 0,
      order_id: null,
      seller_total_price: seller_price * quantity,
      product_base_price_total: product.price * quantity,
      profit: seller_price * quantity - product.price * quantity,
    };

    try {
      const res = await createCart(cartItem);
      if (res.data.status === 200) {
        refetch();
        alert('Product added to cart!');
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert('Failed to add product to cart');
    }
  };

  const handleVideoClick = (videoLink) => {
    window.open(videoLink, '_blank');
  };

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const downloadZIP = () => {
    // Generate ZIP logic here. You can use libraries like `jszip` for client-side ZIP creation or implement server-side API to create ZIP
    alert("Downloading ZIP file with product assets...");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const { product } = detail;

  // Example comparison price (you can get this data from an API)
  const comparisonPrice = 150; // Example from a popular site

  return (
    <div className="product-details-container">
      <div className="product-header">
        <div className="product-image-column">
          {/* Product Image */}
          <img
            src={product.main_image_url}
            alt={product.product_name}
            className="product-image"
          />
          {/* Download and Favorite Icons */}
          <div className="product-actions">
            <FaDownload className="download-icon" title="Download" 
            onClick={() => handleDownloadAssets(product)} />
            <FaHeart
              className={`favorite-icon ${product.isFav ? "favorited" : ""} ${product.isFav === 1 ? 'text-red-500' : 'text-gray-400'}`}
              onClick={toggleFavorite}
              title={product.isFav === 1 ? "Remove from Favorites" : "Add to Favorites"}
            />
          </div>
        </div>

        <div className="product-info-column">
          {/* Product Name */}
          <h1 className="product-name">{product.product_name}</h1>

          {/* SKU */}
          <p className="product-sku">SKU: {product.sku}</p>

          {/* Price */}
          <div className="price-info">
            <p>Base Price: ৳{product.price}</p>
            <p>Suggested Price (from popular sites): ৳{comparisonPrice}</p>
          </div>

          {/* Sell Price */}
          <div className="quantity-selection">
            <label>Set Your Sell Price: </label>
            <input
              type="number"
              value={seller_price}
              onChange={handleSelelrPriceChange}
              min="0"
              className="quantity-input"
            />
            <p>Profit: ৳{profit}</p>
          </div>

          {/* Quantity */}
          <div className="quantity-selection">
            <label>Quantity: </label>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              className="quantity-input"
            />
          </div>

          {/* Add to Order Button */}
          <button
  onClick={handleAddToCart}
  disabled={isAddingToCart}
  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
    isAddingToCart
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  } text-white font-semibold transition duration-300`}
>
  {isAddingToCart ? (
    <>
      <svg
        className="animate-spin h-5 w-5 text-white"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0116 0H4z"
        ></path>
      </svg>
      Adding...
    </>
  ) : (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l1.68 12.39a1 1 0 001 .89h10.72a1 1 0 001-.89L21 3H3zm3 16a2 2 0 104 0H6zm10 0a2 2 0 104 0h-4z"
        />
      </svg>
      Add to Cart
    </>
  )}
</button>

        </div>
      </div>

      {/* Product Description Section */}
      <div className="product-description">
        <h2>Description</h2>
        <p>{product.description}</p>
      </div>

      {/* Product Tabs */}
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
                  <button className="download-btn">
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
          {activeTab === "videos" && (
            <div className="videos-tab-content">
              {product.videos.map((video) => (
                <div className="video-item" key={video.id}>
                  <FaYoutube
                    className="youtube-icon"
                    title="Watch Video"
                    onClick={() => handleVideoClick(video.video_link)}
                  />
                  <p className="video-file-name">{video.file_name}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="reviews-tab-content">
              {product.review && product.review.length > 0 ? (
                product.review.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <h3 className="review-title">Customer Reviews</h3>
                      <div className="review-rating">
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

export default ProductDetails;
