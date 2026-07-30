import { useState, useEffect } from "react";
import "../../../../src/css/ProductDetails.css"; // Custom CSS for styling
import { FaHeart, FaDownload } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetProductDetailsQuery } from "../../../redux/features/product";
import { useCreateCartMutation } from "../../../redux/features/cart";
import { useAddResellerProductPageMutation } from "../../../redux/features/resellerProductPage";
import { useGetResellerStoreProfileByResellerQuery } from "../../../redux/features/resellerStoreProfile";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { imgBaseUrl } from "../../../../config";
import ProductGallery from "./product_gallery";
import ResellerProductPageModal from "../../../components/shared/ResellerProductPageModal";
import { toast } from "sonner";
import { getAdminBasePrice } from "../../../utils/pricing.utils";

const getStoreProfile = (response) => {
  const data = response?.data;
  if (!data) return null;
  if (Array.isArray(data)) return data[0] || null;
  if (Array.isArray(data?.data)) return data.data[0] || null;
  return data?.data || data;
};

const ProductDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const [quantity, setQuantity] = useState(1);
  const [resellerPrice, setResellerPrice] = useState("");
  const [productPageOpen, setProductPageOpen] = useState(false);
  const [createdProductPage, setCreatedProductPage] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const userId = getFromLocalstorage("userId");

  const { data: detail, isLoading, isError, error } = useGetProductDetailsQuery({ id, reseller_id: userId }, { skip: !id });
  const { data: storeProfileData, isLoading: storeProfileLoading, isFetching: storeProfileFetching } =
    useGetResellerStoreProfileByResellerQuery(userId, { skip: !userId });
  const [createCart, { isLoading: isAddingToCart }] = useCreateCartMutation();
  const [addProductPage, { isLoading: creatingProductPage }] = useAddResellerProductPageMutation();
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
      alert(t("product_details.image_not_available"));
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
  const currentProductPage = createdProductPage || product?.reseller_product_page || null;
  const productPageSlug = currentProductPage?.slug || "";
  const productPageUrl = productPageSlug ? `${window.location.origin}/store/product/${productPageSlug}` : "";
  const basePrice = getAdminBasePrice(product);
  const resellerPriceValue = Number(resellerPrice || 0);
  const profitValue = resellerPriceValue - basePrice;
  const marginValue = basePrice > 0 ? (profitValue / basePrice) * 100 : 0;
  const totalBaseValue = basePrice * quantity;
  const totalSellValue = resellerPriceValue * quantity;
  const totalProfitValue = totalSellValue - totalBaseValue;
  const storeProfile = getStoreProfile(storeProfileData);
  const hasStoreProfile = Boolean(storeProfile?.id);
  const checkingStoreProfile = storeProfileLoading || storeProfileFetching;

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

    const selectedAttributeId = (() => {
      const valueId = Object.values(selectedAttributes).find((v) => v != null);
      if (valueId == null) return null;
      const match = product.product_attributes?.find(
        (a) => Number(a.attribute_value_id) === Number(valueId)
      );
      return match ? match.id : null;
    })();

    const resolvedResellerPrice = resellerPriceValue || basePrice;
    if (resolvedResellerPrice < basePrice) {
      toast.error(`Selling price must be at least ৳${basePrice.toLocaleString()}`);
      return;
    }

    const cartItem = {
      user_id: localStorage.getItem("userId"),
      product_id: product.id,
      qty: quantity,
      reseller_price: resolvedResellerPrice,
      ...(selectedAttributeId != null && { attribute_id: selectedAttributeId }),
    };

    try {
      const res = await createCart(cartItem);
      if (res?.data?.status === 200 || res?.data?.status === "success") {
        alert(t("product_details.added_to_cart"));
        window.dispatchEvent(new Event("cart-updated"));
        navigate("/app/checkout");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert(t("product_details.add_to_cart_failed"));
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

  const handleCreateProductPage = async (form) => {
    if (currentProductPage?.id) {
      toast.error("Product page already created. Use Edit Product Page instead.");
      return;
    }
    if (!product?.id || !userId) return;
    const sellingPrice = Number(form.selling_price);
    const discountPrice = form.discount_price === "" ? null : Number(form.discount_price);
    if (sellingPrice < basePrice) {
      toast.error(`Selling price must be at least ৳${basePrice.toLocaleString()}`);
      return;
    }
    if (discountPrice !== null && discountPrice < basePrice) {
      toast.error(`Discount price must be at least ৳${basePrice.toLocaleString()}`);
      return;
    }
    try {
      const response = await addProductPage({
        ...form,
        reseller_id: Number(userId),
        product_id: product.id,
        selling_price: sellingPrice,
        discount_price: discountPrice,
        delivery_charge: Number(form.delivery_charge || 0),
        template_id: form.template_id || "default",
      }).unwrap();
      const page = response?.data?.data || response?.data || response;
      setCreatedProductPage(page);
      toast.success("Product page created successfully");
      setProductPageOpen(false);
    } catch (err) {
      const message = err?.data?.message || "Product page creation failed";
      if (/already|exists|duplicate/i.test(message)) {
        toast.error(`${message}. Check Store Profile > Product Pages.`);
        setProductPageOpen(false);
      } else {
        toast.error(message);
      }
    }
  };


  if (isLoading) {
    return <div>{t("product_details.loading")}</div>;
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
              {t("product_details.download_assets")}
            </button>
            <button
              type="button"
              className="action-btn secondary"
              onClick={() => handleCopyText(product?.name)}
            >
              {t("product_details.copy_title")}
            </button>
            <button
              type="button"
              className="action-btn secondary"
              onClick={() => handleCopyText(product?.description)}
            >
              {t("product_details.copy_description")}
            </button>
            {product?.video_link && (
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px", background: "#f1f5f9", borderRadius: "8px", padding: "8px 12px" }}>
                <a
                  href={product.video_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: "#2563eb", wordBreak: "break-all", flex: 1 }}
                >
                  {product.video_link}
                </a>
                <button
                  type="button"
                  className="action-btn secondary"
                  style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                  onClick={() => handleCopyText(product.video_link)}
                >
                  à¦­à¦¿à¦¡à¦¿à¦“ à¦²à¦¿à¦‚à¦• à¦•à¦ªà¦¿
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="product-info-column">
          <div className="product-title-row">
            <div>
              <p className="product-kicker">{t("product_details.reseller_workspace")}</p>
              <h1 className="product-name">{product?.name}</h1>
              
             
              <span className="product-sku" style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#dbeafe", color: "#052c03", fontSize: "11px", fontWeight: 600, padding: "2px 10px", borderRadius: "999px", letterSpacing: "0.03em" }}>
                zone: {product?.vendor?.district?.name || "N/A"}
              </span>

               <span className="product-sku" style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#dbeafe", color: "#d81d55", fontSize: "11px", fontWeight: 600, padding: "2px 10px", borderRadius: "999px", letterSpacing: "0.03em" }}>
                {t("product_details.sku")}: {product?.sku || "N/A"}
              </span>
            </div>
            <button
              type="button"
              className={`favorite-toggle ${isFavorite ? "active" : ""}`}
              onClick={toggleFavorite}
              title={isFavorite ? t("product_details.remove_from_favorites") : t("product_details.add_to_favorites")}
            >
              <FaHeart />
            </button>
          </div>

          <div className="product-meta-grid">
            <div className="meta-card">
              <p className="meta-label">{t("product_details.base_price")}</p>
              <p className="meta-value">৳ {basePrice}</p>
            </div>
            <div className="meta-card">
              <p className="meta-label">{t("product_details.stock")}</p>
              <p className="meta-value">{product?.current_stock ?? 0}</p>
            </div>
            <div className="meta-card">
              <p className="meta-label">{t("product_details.category")}</p>
              <p className="meta-value">{product?.category?.name || "N/A"}</p>
            </div>
            <div className="meta-card">
              <p className="meta-label">{t("product_details.unit")}</p>
              <p className="meta-value">{product?.unit || "N/A"}</p>
            </div>
          </div>

          {/* Product Attributes */}
          {product?.product_attributes?.length > 0 && (() => {
            const grouped = product.product_attributes.reduce((acc, attr) => {
              const name = attr.attribute?.name;
              if (!name) return acc;
              if (!acc[name]) acc[name] = [];
              acc[name].push(attr);
              return acc;
            }, {});
            return (
              <div className="product-attributes" style={{ marginBottom: "16px" }}>
                {Object.entries(grouped).map(([attrName, attrs]) => (
                  <div key={attrName} style={{ marginBottom: "10px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                      {attrName}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {attrs.map((attr) => {
                        const isSelected = selectedAttributes[attrName] === attr.attribute_value_id;
                        const isColor = attr.value?.color_code;
                        return (
                          <button
                            key={attr.id}
                            type="button"
                            onClick={() =>
                              setSelectedAttributes((prev) => ({
                                ...prev,
                                [attrName]: isSelected ? undefined : attr.attribute_value_id,
                              }))
                            }
                            style={{
                              padding: isColor ? "4px" : "4px 14px",
                              borderRadius: isColor ? "50%" : "6px",
                              border: isSelected ? "2px solid #2563eb" : "1.5px solid #d1d5db",
                              background: isColor ? attr.value.color_code : isSelected ? "#eff6ff" : "#f9fafb",
                              color: isColor ? "transparent" : isSelected ? "#1d4ed8" : "#374151",
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: "13px",
                              cursor: attr.stock > 0 ? "pointer" : "not-allowed",
                              opacity: attr.stock > 0 ? 1 : 0.45,
                              width: isColor ? "28px" : "auto",
                              height: isColor ? "28px" : "auto",
                              outline: isSelected && isColor ? "2px solid #2563eb" : "none",
                              outlineOffset: "2px",
                            }}
                            disabled={attr.stock === 0}
                            title={isColor ? attr.value?.value : undefined}
                          >
                            {!isColor && attr.value?.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="reseller-panel">
            <div className="reseller-head">
              <h2>{t("product_details.set_selling_price")}</h2>
              <p>{t("product_details.set_selling_price_sub")} <span style={{ fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "1px 8px", borderRadius: "999px", fontSize: "13px" }}>{product?.max_resell_price}৳</span></p>
            </div>

            <div className="price-input-row">
              <label htmlFor="reseller-price">{t("product_details.your_price")}</label>
              <div className="price-input">
                <span>৳</span>
                <input
                  id="reseller-price"
                  type="number"
                  value={resellerPrice}
                  onChange={handleResellerPriceInput}
                  min={basePrice}
                  placeholder={t("product_details.enter_price_placeholder")}
                />
              </div>
            </div>

            <div className="price-stats">
              <div className={`stat-card ${profitValue >= 0 ? "positive" : "negative"}`}>
                <p>{t("product_details.profit_per_item")}</p>
                <strong>৳ {Number.isFinite(profitValue) ? profitValue.toFixed(0) : 0}</strong>
              </div>
              <div className="stat-card">
                <p>{t("product_details.margin_on_base")}</p>
                <strong>{Number.isFinite(marginValue) ? marginValue.toFixed(1) : 0}%</strong>
              </div>
            </div>

            <div className="quantity-selection">
              <label>{t("product_details.quantity")}</label>
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
                <p>{t("product_details.total_sell_value")}</p>
                <strong>৳ {Number.isFinite(totalSellValue) ? totalSellValue.toFixed(0) : 0}</strong>
              </div>
              <div className="stat-card">
                <p>{t("product_details.total_base_cost")}</p>
                <strong>৳ {Number.isFinite(totalBaseValue) ? totalBaseValue.toFixed(0) : 0}</strong>
              </div>
              <div className={`stat-card ${totalProfitValue >= 0 ? "positive" : "negative"}`}>
                <p>{t("product_details.total_profit")}</p>
                <strong>৳ {Number.isFinite(totalProfitValue) ? totalProfitValue.toFixed(0) : 0}</strong>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`primary-btn ${isAddingToCart ? "disabled" : ""}`}
            >
              {isAddingToCart ? t("product_details.adding") : t("product_details.add_to_cart")}
            </button>

            {currentProductPage && (
              <div style={{ marginTop: "12px", padding: "14px", borderRadius: "12px", border: "1px solid #bfdbfe", background: "#eff6ff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e3a8a" }}>Product Page</div>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#475569" }}>Product page already created</p>
                  </div>
                  <span style={{ borderRadius: "999px", padding: "3px 9px", fontSize: "11px", fontWeight: 800, color: currentProductPage.published_status === "published" ? "#166534" : "#92400e", background: currentProductPage.published_status === "published" ? "#dcfce7" : "#fef3c7" }}>
                    {currentProductPage.published_status || "draft"}
                  </span>
                </div>

                <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", color: "#334155" }}>
                  <div><strong>Title:</strong> {currentProductPage.custom_title || product?.name || "-"}</div>
                  <div><strong>Theme:</strong> {currentProductPage.template_id || "default"}</div>
                  <div><strong>Selling:</strong> ৳{currentProductPage.selling_price || 0}</div>
                  <div><strong>Discount:</strong> ৳{currentProductPage.discount_price || 0}</div>
                </div>

                {productPageUrl && (
                  <button
                    type="button"
                    onClick={() => handleCopyText(productPageUrl)}
                    style={{ marginTop: "10px", color: "#1d4ed8", textDecoration: "underline", wordBreak: "break-all", textAlign: "left", fontSize: "12px" }}
                  >
                    {productPageUrl}
                  </button>
                )}

                <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
                  <button
                    type="button"
                    disabled={!productPageUrl}
                    onClick={() => productPageUrl && window.open(productPageUrl, "_blank")}
                    className="action-btn secondary"
                    style={{ justifyContent: "center", fontSize: "12px", padding: "8px" }}
                  >
                    View Public Page
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/store-profile?tab=product-pages&edit_page_id=${currentProductPage.id}`)}
                    className="action-btn secondary"
                    style={{ justifyContent: "center", fontSize: "12px", padding: "8px" }}
                  >
                    Edit Product Page
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/store-profile?tab=product-pages&design_page_id=${currentProductPage.id}`)}
                    className="action-btn secondary"
                    style={{ justifyContent: "center", fontSize: "12px", padding: "8px" }}
                  >
                    Customize Design
                  </button>
                </div>
              </div>
            )}
            {userId && (
              <div style={{ marginTop: "10px" }}>
                {currentProductPage ? null : checkingStoreProfile ? (
                  <button
                    type="button"
                    disabled
                    className="action-btn secondary"
                    style={{ width: "100%", justifyContent: "center", opacity: 0.65, cursor: "not-allowed" }}
                  >
                    Checking shop setup...
                  </button>
                ) : hasStoreProfile ? (
                  <button
                    type="button"
                    onClick={() => setProductPageOpen(true)}
                    className="action-btn secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Make Product Page
                  </button>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => navigate("/app/store-profile")}
                      className="action-btn secondary"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Setup your own shop
                    </button>
                    <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "13px", lineHeight: 1.5 }}>
                      After Setup your shop you can generate product landing page.
                    </p>
                  </div>
                )}
              </div>
            )}
            {createdProductPage?.slug && (
              <div style={{ marginTop: "10px", padding: "10px", borderRadius: "10px", background: "#eff6ff", color: "#1d4ed8", fontSize: "13px" }}>
                <div style={{ fontWeight: 700, marginBottom: "4px" }}>Public product page</div>
                <button
                  type="button"
                  onClick={() => handleCopyText(`${window.location.origin}/store/product/${createdProductPage.slug}`)}
                  style={{ color: "#1d4ed8", textDecoration: "underline", wordBreak: "break-all", textAlign: "left" }}
                >
                  {window.location.origin}/store/product/{createdProductPage.slug}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="reseller-steps">
        <div className="step-card">
          <span className="step-number">01</span>
          <h3>{t("product_details.step1_title")}</h3>
          <p>{t("product_details.step1_desc")}</p>
        </div>
        <div className="step-card">
          <span className="step-number">02</span>
          <h3>{t("product_details.step2_title")}</h3>
          <p>{t("product_details.step2_desc")}</p>
        </div>
        <div className="step-card">
          <span className="step-number">03</span>
          <h3>{t("product_details.step3_title")}</h3>
          <p>{t("product_details.step3_desc")}</p>
        </div>
      </div>

      {/* Product Description Section */}
      <div className="product-description">
        <h2>{t("product_details.description")}</h2>
        <div dangerouslySetInnerHTML={{ __html: product?.description || "" }} />
      </div>

      {/* Product Tabs */}
      <div className="product-tabs">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "images" ? "active" : ""}`}
            onClick={() => handleTabClick("images")}
          >
            {t("product_details.image_assets")}
          </button>
          <button
            className={`tab ${activeTab === "details" ? "active" : ""}`}
            onClick={() => handleTabClick("details")}
          >
            {t("product_details.details")}
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "images" && (
            <div className="images-tab-content">
              {/* Primary image download */}
              <div className="image-container" key={product?.id}>
                <img
                  src={primaryImageUrl}
                  alt={`Product Image ${product?.id}`}
                  className="tab-image"
                />
                <button className="download-btn" onClick={() => handleDownloadAssets(product, primaryImageUrl)}>
                  {t("product_details.download")}
                </button>
              </div>
              {/* Gallery grid */}
          <ProductGallery
    images={product.images}
    imgBaseUrl={imgBaseUrl}
  />
            </div>
          )}
          {activeTab === "details" && (
            <div className="strategy-tab-content">
              <div className="strategy-card">
                <h3 className="strategy-title">{t("product_details.category")}</h3>
                <p className="strategy-subtitle">{product?.category?.name || "N/A"}</p>
              </div>
              <div className="strategy-card">
                <h3 className="strategy-title">{t("product_details.sub_category")}</h3>
                <p className="strategy-subtitle">{product?.sub_category?.name || "N/A"}</p>
              </div>
              <div className="strategy-card">
                <h3 className="strategy-title">{t("product_details.shop")}</h3>
                <p className="strategy-subtitle">{product?.shop?.name || "N/A"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <ResellerProductPageModal
        open={productPageOpen}
        product={product}
        loading={creatingProductPage}
        title="Make Product Page"
        onClose={() => setProductPageOpen(false)}
        onSubmit={handleCreateProductPage}
      />
    </div>
  );
};

export default ProductDetails;








