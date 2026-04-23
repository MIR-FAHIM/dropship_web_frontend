import React, { useState, useEffect } from "react";
import "../../../src/css/ProductDetails.css";
import { FaHeart } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { useGetProductDetailsQuery } from "../../redux/features/product";
import { imgBaseUrl } from "../../../config";
const ProductDetailsHomePage = () => {
  const { id } = useParams();
 const  navigate = useNavigate();
  const { data: detail, isLoading, isError, error } = useGetProductDetailsQuery(id);
  const [activeTab, setActiveTab] = useState("images");
  const [selectedImage, setSelectedImage] = useState(null);
  const handleTabClick = (tab) => setActiveTab(tab);
  useEffect(() => {
    setSelectedImage(null);
  }, [id]);

  if (isLoading) {
    return <div className="product-details-loading">Loading...</div>;
  }

  if (isError) {
    return <div className="product-details-error">Error: {error.message}</div>;
  }

  const product = detail?.data;
  const galleryImages = product?.images && product.images.length > 0
    ? product.images.map(img => img.image?.file_name ? `${imgBaseUrl}/${img.image.file_name}` : null).filter(Boolean)
    : [];
  const primaryImageUrl = product?.primary_image?.file_name
    ? `${imgBaseUrl}/${product.primary_image.file_name}`
    : "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
  const mainImageUrl = selectedImage || primaryImageUrl;
  const goToLogin = () => {
    navigate("/");
  };
  return (
    <div className="product-details-container">
      <div className="product-header">
        <div className="product-image-column">
          <div className="main-image-container" style={{ width: 340, height: 340, borderRadius: 16, overflow: "hidden", background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb", marginBottom: 16 }}>
            <img
              src={mainImageUrl}
              alt={product?.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              className="product-image"
            />
          </div>
          {galleryImages.length > 0 && (
            <div className="gallery-thumbnails" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {[primaryImageUrl, ...galleryImages].map((img, idx) => (
                <img
                  key={img + idx}
                  src={img}
                  alt={`Gallery ${idx}`}
                  style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: mainImageUrl === img ? "2px solid #2563eb" : "1px solid #e5e7eb", cursor: "pointer", boxShadow: mainImageUrl === img ? "0 0 0 2px #2563eb33" : "none" }}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          )}
          <div className="product-actions">
            <p className="download-info">Marketing kits can be downloaded after login</p>
            <FaHeart
              className={`favorite-icon ${product?.is_fav ? "text-red-500" : "text-gray-400"}`}
              title={product?.is_fav ? "Remove from Favorites" : "Add to Favorites"}
            />
          </div>
        </div>
        <div className="product-info-column">
          <h1 className="product-name text-2xl font-bold mb-2">{product?.name}</h1>
          <p className="product-sku text-sm text-gray-500 mb-1">SKU: {product?.barcode || "N/A"}</p>
          <div
            className="product-description text-base mb-3"
            dangerouslySetInnerHTML={{ __html: product?.description || "" }}
          />
          <div className="product-details grid grid-cols-2 gap-4 mb-3">
            <p className="product-price text-md font-semibold text-green-300">Base Price: ৳ {product?.unit_price ?? 0}</p>
            <p className="product-stock text-md font-semibold text-blue-300">Stock: {product?.current_stock ?? 0}</p>
          </div>
          <p className="product-price text-lg font-semibold text-green-600">You can set your own sell price which will be collected from your customer and will add the profit to your balance after delivery.</p>
          <p className="login-info text-sm text-center text-gray-700 italic mb-4">
            For more information and access, please login to ResellerBrain.
          </p>
          <button onClick={goToLogin} className="login-btn">Login</button>
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
            className={`tab ${activeTab === "details" ? "active" : ""}`}
            onClick={() => handleTabClick("details")}
          >
            Details
          </button>
        </div>
        <div className="tab-content">
          {activeTab === "images" && (
            <div className="images-tab-content">
              <div className="image-container" key={product?.id}>
                <img
                  src={mainImageUrl}
                  alt={`Product Image ${product?.id}`}
                  className="tab-image"
                  style={{ width: 340, height: 340, objectFit: "cover", borderRadius: 16, border: "1px solid #e5e7eb" }}
                />
                <p className="download-info">Marketing kits can be downloaded after login</p>
              </div>
              {galleryImages.length > 0 && (
                <div className="gallery-thumbnails" style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {[primaryImageUrl, ...galleryImages].map((img, idx) => (
                    <img
                      key={img + idx}
                      src={img}
                      alt={`Gallery ${idx}`}
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: mainImageUrl === img ? "2px solid #2563eb" : "1px solid #e5e7eb", cursor: "pointer", boxShadow: mainImageUrl === img ? "0 0 0 2px #2563eb33" : "none" }}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}
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

export default ProductDetailsHomePage;
