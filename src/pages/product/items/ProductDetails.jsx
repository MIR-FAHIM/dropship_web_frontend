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
import ResellerSocialContent from "./ResellerSocialContent";
import ResellerProductQa from "./ResellerProductQa";

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
  const [selectedImage, setSelectedImage] = useState(null);
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
    const imageUrl = fallbackImageUrl || buildImageUrl(fileName);

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
      const ext = (imageUrl?.split("?")?.[0]?.split(".")?.pop() || productData?.primary_image?.extension || "jpg").toLowerCase().slice(0, 4);
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

  const scrollToSection = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
        toast.success("Copied successfully");
        return;
      }
      const temp = document.createElement("textarea");
      temp.value = safeText;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
      toast.success("Copied successfully");
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Copy failed");
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

  const allImages = [];
  if (primaryImageUrl) {
    allImages.push(primaryImageUrl);
  }
  if (Array.isArray(product?.images)) {
    product.images.forEach((imgObj) => {
      const fileName =
        imgObj?.image?.file_name ||
        imgObj?.file_name ||
        imgObj?.image_file_name ||
        (typeof imgObj === "string" ? imgObj : null);
      if (fileName) {
        const url = buildImageUrl(fileName);
        if (url && !allImages.includes(url)) {
          allImages.push(url);
        }
      }
    });
  }

  const currentDisplayImage = selectedImage || primaryImageUrl;

  return (
    <div className="product-details-container">
      <div className="product-hero">
        <div className="product-image-column">
          <div className="product-image-wrapper">
            <img
              src={currentDisplayImage}
              alt={product?.name}
              className="product-image"
            />
          </div>

          {/* Multiple Image Thumbnails Under Main Thumbnail Image */}
          {allImages.length > 0 && (
            <div className="product-thumbnails-container" style={{ marginTop: "12px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  paddingBottom: "8px",
                  paddingTop: "2px",
                }}
              >
                {allImages.map((imgUrl, index) => {
                  const isSelected = currentDisplayImage === imgUrl;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      style={{
                        position: "relative",
                        flexShrink: 0,
                        width: "72px",
                        height: "72px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        boxShadow: isSelected ? "0 0 0 2px rgba(37, 99, 235, 0.35)" : "none",
                        cursor: "pointer",
                        padding: 0,
                        background: "#fff",
                        transition: "all 0.2s ease",
                        opacity: isSelected ? 1 : 0.7,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.opacity = "0.7";
                      }}
                      title={`View image ${index + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product?.name || "Product"} thumbnail ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="product-actions">
            <button
              type="button"
              className="action-btn"
              onClick={() => handleDownloadAssets(product, currentDisplayImage)}
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
                 Copy
                </button>
              </div>
            )}
          </div>

          {/* Reseller Instruction Note in Bengali */}
          <div
            className="reseller-guideline-card"
            style={{
              marginTop: "16px",
              padding: "14px 16px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "16px" }}>📌</span>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                রিসেলারদের জন্য করণীয় নির্দেশিকা
              </h4>
            </div>

            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", lineHeight: "1.45", color: "#334155" }}>
                <span style={{ background: "#dbeafe", color: "#1d4ed8", width: "20px", height: "20px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>
                  ১
                </span>
                <span>
                  <strong>ডেসক্রিপশন রিসার্চ:</strong> প্রোডাক্ট সম্পর্কে বিস্তারিত জেনে নিন।{" "}
                  <button
                    type="button"
                    onClick={() => scrollToSection("product-description-section")}
                    style={{ background: "none", border: "none", padding: 0, color: "#2563eb", textDecoration: "underline", fontWeight: 600, cursor: "pointer", display: "inline" }}
                  >
                    ডেসক্রিপশন সেকশনে যান ➔
                  </button>
                </span>
              </li>

              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", lineHeight: "1.45", color: "#334155" }}>
                <span style={{ background: "#dbeafe", color: "#1d4ed8", width: "20px", height: "20px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>
                  ২
                </span>
                <span>
                  <strong>সোশ্যাল মিডিয়া কনটেন্ট:</strong> বিজ্ঞাপনের জন্য সঠিক কনটেন্ট ও কপি পেতে{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("social_content");
                      scrollToSection("product-tabs-section");
                    }}
                    style={{ background: "none", border: "none", padding: 0, color: "#2563eb", textDecoration: "underline", fontWeight: 600, cursor: "pointer", display: "inline" }}
                  >
                    সোশ্যাল কনটেন্ট চেক করুন ➔
                  </button>
                </span>
              </li>

              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", lineHeight: "1.45", color: "#334155" }}>
                <span style={{ background: "#dbeafe", color: "#1d4ed8", width: "20px", height: "20px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>
                  ৩
                </span>
                <span>
                  <strong>গ্রাহকের প্রশ্নোত্তর (Q&A):</strong> কাস্টমারের যেকোনো সাধারণ প্রশ্নের সঠিক উত্তর দিতে{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("qa_assistant");
                      scrollToSection("product-tabs-section");
                    }}
                    style={{ background: "none", border: "none", padding: 0, color: "#2563eb", textDecoration: "underline", fontWeight: 600, cursor: "pointer", display: "inline" }}
                  >
                    Product Q&A ট্যাব দেখুন ➔
                  </button>
                </span>
              </li>

              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", lineHeight: "1.45", color: "#334155" }}>
                <span style={{ background: "#dbeafe", color: "#1d4ed8", width: "20px", height: "20px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>
                  ৪
                </span>
                <span>
                  <strong>ছবি ও কনটেন্ট ডাউনলোড:</strong> এই ছবি এবং কনটেন্ট ডাউনলোড করে আপনার নিজস্ব বিক্রয়মূল্য নির্ধারণ করে আপনার পেজ বা প্ল্যাটফর্মে পোস্ট করুন।
                </span>
              </li>

              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", lineHeight: "1.45", color: "#334155" }}>
                <span style={{ background: "#dbeafe", color: "#1d4ed8", width: "20px", height: "20px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>
                  ৫
                </span>
                <span>
                  <strong>নিজস্ব ল্যান্ডিং পেজ তৈরি:</strong> আপনি যদি প্রোডাক্টটির একটি আকর্ষণীয় ল্যান্ডিং পেজ আপনার নিজস্ব প্রাইস ও ব্র্যান্ডিং দিয়ে কাস্টমারের সাথে শেয়ার করতে চান, তবে{" "}
                  <button
                    type="button"
                    onClick={() => {
                      if (currentProductPage?.id) {
                        if (productPageUrl) {
                          window.open(productPageUrl, "_blank");
                        } else {
                          navigate(`/app/store-profile?tab=product-pages&edit_page_id=${currentProductPage.id}`);
                        }
                      } else if (hasStoreProfile) {
                        setProductPageOpen(true);
                      } else {
                        navigate("/app/store-profile");
                      }
                    }}
                    style={{ background: "none", border: "none", padding: 0, color: "#2563eb", textDecoration: "underline", fontWeight: 600, cursor: "pointer", display: "inline" }}
                  >
                    Make Product Page বাটনে ক্লিক করুন ➔
                  </button>
                </span>
              </li>

              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", lineHeight: "1.45", color: "#334155" }}>
                <span style={{ background: "#dbeafe", color: "#1d4ed8", width: "20px", height: "20px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>
                  ৬
                </span>
                <span>
                  <strong>SKU দিয়ে অর্ডার প্লেস:</strong> অর্ডার পেলে এই একই প্রোডাক্টের SKU (
                  <code style={{ background: "#e2e8f0", padding: "1px 5px", borderRadius: "4px", fontWeight: 600, color: "#0f172a", fontSize: "11px" }}>
                    {product?.sku || "N/A"}
                  </code>
                  ) দিয়ে সার্চ করে খুঁজে নিয়ে আপনার প্রাইসে অর্ডারটি প্লেস করুন।
                </span>
              </li>

              <li style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", lineHeight: "1.45", color: "#991b1b", background: "#fef2f2", padding: "8px 10px", borderRadius: "8px", border: "1px solid #fee2e2" }}>
                <span style={{ background: "#fee2e2", color: "#dc2626", width: "20px", height: "20px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>
                  ৭
                </span>
                <span>
                  <strong>রি-কনফার্ম ও ফ্রড চেক:</strong> অর্ডার যাতে রিটার্ন না আসে, সেজন্য অর্ডার প্লেস করার পূর্বে অবশ্যই কাস্টমারকে রি-কনফার্ম করুন এবং ফ্রড চেক সম্পন্ন করুন।
                </span>
              </li>
            </ol>
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
      <div className="product-description" id="product-description-section">
        <h2>{t("product_details.description")}</h2>
        <div dangerouslySetInnerHTML={{ __html: product?.description || "" }} />
      </div>

      {/* Product Tabs */}
      <div className="product-tabs" id="product-tabs-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "images" ? "active" : ""}`}
            onClick={() => setActiveTab("images")}
          >
            {t("product_details.image_assets")}
          </button>
          <button
            className={`tab ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            {t("product_details.details")}
          </button>
          <button
            className={`tab ${activeTab === "social_content" ? "active" : ""}`}
            onClick={() => setActiveTab("social_content")}
          >
            Social Content / মার্কেটিং
          </button>
          <button
            className={`tab ${activeTab === "qa_assistant" ? "active" : ""}`}
            onClick={() => setActiveTab("qa_assistant")}
          >
            Product Q&A / প্রশ্নোত্তর
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
          {activeTab === "social_content" && (
            <div className="social-tab-content">
              <ResellerSocialContent productId={id} />
            </div>
          )}
          {activeTab === "qa_assistant" && (
            <div className="qa-tab-content">
              <ResellerProductQa productId={id} />
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








