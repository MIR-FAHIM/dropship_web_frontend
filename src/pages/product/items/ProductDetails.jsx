import React, { useState, useEffect } from "react";
import "../../../../src/css/ProductDetails.css"; // Custom CSS for styling
import { FaHeart, FaDownload } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useGetProductDetailsQuery } from "../../../redux/features/product";
import { useCreateCartMutation } from "../../../redux/features/cart";
import { imgBaseUrl } from "../../../../config";

const ProductDetails = () => {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const [quantity, setQuantity] = useState(1);
  const [resellerPrice, setResellerPrice] = useState("");

  const { data: detail, isLoading, isError, error } = useGetProductDetailsQuery(id);
  const [createCart, { isLoading: isAddingToCart }] = useCreateCartMutation();
  const normalizeImageUrl = (rawUrl) => {
    if (!rawUrl) return null;
    let url = String(rawUrl);

    if (url.includes("/storage/app/uploads/") && !url.includes("/storage/app/public/")) {
      url = url.replace("/storage/app/uploads/", "/storage/app/public/uploads/");
    }

    if (url.includes("/storage/app/public/public/")) {
      url = url.replace("/storage/app/public/public/", "/storage/app/public/");
    }

    return url;
  };

  const buildImageUrl = (fileName, fallback) => {
    if (!fileName && fallback) return normalizeImageUrl(fallback);
    if (!fileName) return null;

    try {
      const base = String(imgBaseUrl || "").replace(/\/+$/, "");
      return normalizeImageUrl(new URL(fileName, `${base}/`).toString());
    } catch {
      const base = String(imgBaseUrl || "").replace(/\/+$/, "");
      const path = String(fileName).replace(/^\/+/, "");
      return normalizeImageUrl(`${base}/${path}`);
    }
  };

  const handleDownloadAssets = async (productData, fallbackImageUrl) => {
    const safeName = String(productData?.name || productData?.product_name || "product")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");

    const fileName = productData?.primary_image?.file_name;
    const imageUrl = buildImageUrl(fileName, fallbackImageUrl);

    if (!imageUrl) {
      alert("Image not available");
      return;
    }

    try {
      const response = await fetch(imageUrl, { mode: "cors", cache: "no-store" });
      if (!response.ok) {
        throw new Error("Image request failed");
      }

      const blob = await response.blob();
      const ext = (productData?.primary_image?.extension || "jpg").toLowerCase();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${safeName}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download failed:", error);
      const link = document.createElement("a");
      link.href = imageUrl;
      link.rel = "noopener noreferrer";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };
  
  const product = detail?.data;
  const basePrice = Number(product?.unit_price ?? 0);
  const resellerPriceValue = Number(resellerPrice || 0);
  const profitValue = resellerPriceValue - basePrice;
  const marginValue = basePrice > 0 ? (profitValue / basePrice) * 100 : 0;
  const totalBaseValue = basePrice * quantity;
  const totalSellValue = resellerPriceValue * quantity;
  const totalProfitValue = totalSellValue - totalBaseValue;

  useEffect(() => {
    console.log("product ID from URL:", id);
  }, [id]);

  useEffect(() => {
    if (Number.isFinite(basePrice) && basePrice > 0) {
      setResellerPrice(String(basePrice));
    }
  }, [basePrice]);

  const handleAddToCart = async () => {
    if (!product) {
      console.log("Product details are not loaded yet.");
      return;
    }

    const cartItem = {
      user_id: localStorage.getItem("userId"),
      product_id: product.id,
      qty: quantity,
      reseller_price: resellerPriceValue || basePrice,
    };

    try {
      const res = await createCart(cartItem);
      if (res?.data?.status === 200 || res?.data?.status === "success") {
        alert("Product added to cart!");
        window.dispatchEvent(new Event("cart-updated"));
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

  const handleResellerPriceInput = (event) => {
    const value = event.target.value;
    if (value === "") {
      setResellerPrice("");
      return;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) return;
    setResellerPrice(value);
  };

  const handleCopyText = async (text) => {
    const safeText = String(text || "").trim();
    if (!safeText) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(safeText);
        return;
      }
      const temp = document.createElement("textarea");
      temp.value = safeText;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const primaryImageUrl = buildImageUrl(
    product?.primary_image?.file_name,
    "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  );

  return (
    <div className="product-details-container">
      <div className="product-hero">
        <div className="product-image-column">
          <div className="product-image-wrapper">
            <img
              src={primaryImageUrl}
              alt={product?.name}
              className="product-image"
            />
          </div>

          <div className="product-actions">
            <button
              type="button"
              className="action-btn"
              onClick={() => handleDownloadAssets(product, primaryImageUrl)}
            >
              <FaDownload />
              Download assets
            </button>
            <button
              type="button"
              className="action-btn secondary"
              onClick={() => handleCopyText(product?.name)}
            >
              Copy title
            </button>
            <button
              type="button"
              className="action-btn secondary"
              onClick={() => handleCopyText(product?.description)}
            >
              Copy description
            </button>
          </div>
        </div>

        <div className="product-info-column">
          <div className="product-title-row">
            <div>
              <p className="product-kicker">Reseller workspace</p>
              <h1 className="product-name">{product?.name}</h1>
              <p className="product-sku">SKU: {product?.barcode || "N/A"}</p>
            </div>
            <button
              type="button"
              className={`favorite-toggle ${isFavorite ? "active" : ""}`}
              onClick={toggleFavorite}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <FaHeart />
            </button>
          </div>

          <div className="product-meta-grid">
            <div className="meta-card">
              <p className="meta-label">Base price</p>
              <p className="meta-value">৳ {basePrice}</p>
            </div>
            <div className="meta-card">
              <p className="meta-label">Stock</p>
              <p className="meta-value">{product?.current_stock ?? 0}</p>
            </div>
            <div className="meta-card">
              <p className="meta-label">Category</p>
              <p className="meta-value">{product?.category?.name || "N/A"}</p>
            </div>
            <div className="meta-card">
              <p className="meta-label">Unit</p>
              <p className="meta-value">{product?.unit || "N/A"}</p>
            </div>
          </div>

          <div className="reseller-panel">
            <div className="reseller-head">
              <h2>Set your selling price</h2>
              <p>Use this price on your own store or marketplace.</p>
            </div>

            <div className="price-input-row">
              <label htmlFor="reseller-price">Your price</label>
              <div className="price-input">
                <span>৳</span>
                <input
                  id="reseller-price"
                  type="number"
                  value={resellerPrice}
                  onChange={handleResellerPriceInput}
                  min="0"
                  placeholder="Enter your price"
                />
              </div>
            </div>

            <div className="price-stats">
              <div className={`stat-card ${profitValue >= 0 ? "positive" : "negative"}`}>
                <p>Profit per item</p>
                <strong>৳ {Number.isFinite(profitValue) ? profitValue.toFixed(0) : 0}</strong>
              </div>
              <div className="stat-card">
                <p>Margin on base</p>
                <strong>{Number.isFinite(marginValue) ? marginValue.toFixed(1) : 0}%</strong>
              </div>
            </div>

            <div className="quantity-selection">
              <label>Quantity</label>
              <div className="qty-controls">
                <button type="button" onClick={handleDecreaseQty}>
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQtyInput}
                  min="1"
                  className="quantity-input"
                />
                <button type="button" onClick={handleIncreaseQty}>
                  +
                </button>
              </div>
            </div>

            <div className="price-stats totals">
              <div className="stat-card">
                <p>Total sell value</p>
                <strong>৳ {Number.isFinite(totalSellValue) ? totalSellValue.toFixed(0) : 0}</strong>
              </div>
              <div className="stat-card">
                <p>Total base cost</p>
                <strong>৳ {Number.isFinite(totalBaseValue) ? totalBaseValue.toFixed(0) : 0}</strong>
              </div>
              <div className={`stat-card ${totalProfitValue >= 0 ? "positive" : "negative"}`}>
                <p>Total profit</p>
                <strong>৳ {Number.isFinite(totalProfitValue) ? totalProfitValue.toFixed(0) : 0}</strong>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`primary-btn ${isAddingToCart ? "disabled" : ""}`}
            >
              {isAddingToCart ? "Adding..." : "Add to cart at your price"}
            </button>
          </div>
        </div>
      </div>

      <div className="reseller-steps">
        <div className="step-card">
          <span className="step-number">01</span>
          <h3>Copy & download</h3>
          <p>Grab product title, description, and images for your store.</p>
        </div>
        <div className="step-card">
          <span className="step-number">02</span>
          <h3>Set your price</h3>
          <p>Adjust selling price based on your margin and market.</p>
        </div>
        <div className="step-card">
          <span className="step-number">03</span>
          <h3>Order when sold</h3>
          <p>Come back and place your order using your selling price.</p>
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
            Image assets
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
                <button className="download-btn" onClick={() => handleDownloadAssets(product, primaryImageUrl)}>
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
