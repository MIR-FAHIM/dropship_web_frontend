import React, { useState, useEffect } from "react";
import "../../../src/css/ProductDetails.css"; // Custom CSS for styling
import { FaHeart, FaDownload } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useGetProductDetailsQuery } from "../../redux/features/product";
import { useCreateCartMutation } from "../../redux/features/cart";
import { imgBaseUrl } from "../../../config";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const ProductDetails = () => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const [quantity, setQuantity] = useState(1);

  const { data: detail, isLoading, isError, error } = useGetProductDetailsQuery(id);
  const [createCart, { isLoading: isAddingToCart }] = useCreateCartMutation();
  const handleDownloadAssets = async (productData) => {
    console.log("i am here");
    const zip = new JSZip();
    
    try {
      // Add primary image
      if (productData?.primary_image?.file_name) {
        const imageUrl = `${imgBaseUrl}/${productData.primary_image.file_name}`;
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          zip.file(`${productData.name}_image_1.jpg`, imageBlob);
        }
      }
  
      // Add product description
      zip.file(`${productData.name}_description.html`, productData.description || "");
  
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

  const handleAddToCart = async () => {
    if (!product) {
      console.log("Product details are not loaded yet.");
      return;
    }

    const cartItem = {
      user_id: localStorage.getItem("userId"),
      product_id: product.id,
      qty: quantity,
    };

    try {
      const res = await createCart(cartItem);
      if (res?.data?.status === 200 || res?.data?.status === "success") {
        alert("Product added to cart!");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert('Failed to add product to cart');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleDecreaseQty = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncreaseQty = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleQtyInput = (event) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    setQuantity(value < 1 ? 1 : value);
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const product = detail?.data;
  const primaryImageUrl = product?.primary_image?.file_name
    ? `${imgBaseUrl}/${product.primary_image.file_name}`
    : "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

  // Example comparison price (you can get this data from an API)
  const comparisonPrice = 150; // Example from a popular site

  return (
    <div className="product-details-container">
      <div className="product-header">
        <div className="product-image-column">
          {/* Product Image */}
          <img
            src={primaryImageUrl}
            alt={product?.name}
            className="product-image"
          />
          {/* Download and Favorite Icons */}
          <div className="product-actions">
            <FaDownload className="download-icon" title="Download" 
            onClick={() => handleDownloadAssets(product)} />
            <FaHeart
              className={`favorite-icon ${isFavorite ? "favorited" : ""} ${isFavorite ? "text-red-500" : "text-gray-400"}`}
              onClick={toggleFavorite}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            />
          </div>
        </div>

        <div className="product-info-column">
          {/* Product Name */}
          <h1 className="product-name">{product?.name}</h1>

          {/* SKU */}
          <p className="product-sku">SKU: {product?.barcode || "N/A"}</p>

          {/* Price */}
          <div className="price-info">
            <p>Base Price: ৳{product?.unit_price ?? 0}</p>
            <p>Suggested Price (from popular sites): ৳{comparisonPrice}</p>
          </div>

          <div className="quantity-selection">
            <p>Category: {product?.category?.name || "N/A"}</p>
            <p>Stock: {product?.current_stock ?? 0}</p>
            <p>Unit: {product?.unit || "N/A"}</p>
          </div>

          <div className="quantity-selection">
            <label>Quantity:</label>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={handleDecreaseQty}
                className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQtyInput}
                min="1"
                className="quantity-input text-center w-20"
              />
              <button
                type="button"
                onClick={handleIncreaseQty}
                className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                +
              </button>
            </div>
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
        <div dangerouslySetInnerHTML={{ __html: product?.description || "" }} />
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
            className={`tab ${activeTab === "details" ? "active" : ""}`}
            onClick={() => handleTabClick("details")}
          >
            Details
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "images" && (
            <div className="images-tab-content">
              <div className="image-container" key={product?.id}>
                <img
                  src={primaryImageUrl}
                  alt={`Product Image ${product?.id}`}
                  className="tab-image"
                />
                <button className="download-btn" onClick={() => handleDownloadAssets(product)}>
                  Download
                </button>
              </div>
            </div>
          )}
          {activeTab === "details" && (
            <div className="strategy-tab-content">
              <div className="strategy-card">
                <h3 className="strategy-title">Category</h3>
                <p className="strategy-subtitle">{product?.category?.name || "N/A"}</p>
              </div>
              <div className="strategy-card">
                <h3 className="strategy-title">Sub Category</h3>
                <p className="strategy-subtitle">{product?.sub_category?.name || "N/A"}</p>
              </div>
              <div className="strategy-card">
                <h3 className="strategy-title">Shop</h3>
                <p className="strategy-subtitle">{product?.shop?.name || "N/A"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
