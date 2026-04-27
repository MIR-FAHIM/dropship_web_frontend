import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaTag, FaBoxOpen, FaStore, FaLayerGroup, FaThLarge } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { useGetProductDetailsQuery } from "../../redux/features/product";
import { imgBaseUrl } from "../../../config";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --cream: #faf7f4;
    --warm-white: #fff9f5;
    --ink: #1a1410;
    --muted: #7a6e65;
    --accent: #c9622f;
    --accent-light: #f0d5c8;
    --accent-pale: #fdf0ea;
    --border: #e8e0d8;
    --shadow-sm: 0 2px 8px rgba(26,20,16,0.06);
    --shadow-md: 0 8px 32px rgba(26,20,16,0.10);
    --shadow-lg: 0 24px 64px rgba(26,20,16,0.13);
    --radius: 16px;
    --radius-sm: 8px;
  }

  .pdp-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  .pdp-wrap {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    min-height: 100vh;
    color: var(--ink);
    animation: pdpFadeIn 0.5s ease both;
  }

  @keyframes pdpFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ─── Hero ─── */
  .pdp-hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    min-height: 78vh;
    background: var(--warm-white);
    border-bottom: 1px solid var(--border);
  }

  /* ─── Image Panel ─── */
  .pdp-image-panel {
    position: relative;
    background: #f0ebe5;
    padding: 40px 32px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    border-right: 1px solid var(--border);
  }

  .pdp-main-img-wrap {
    width: 100%;
    aspect-ratio: 1;
    max-width: 420px;
    border-radius: 20px;
    overflow: hidden;
    background: #e8e2db;
    position: relative;
    box-shadow: var(--shadow-lg);
  }

  .pdp-main-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    display: block;
  }

  .pdp-main-img-wrap:hover img {
    transform: scale(1.035);
  }

  .pdp-gallery {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .pdp-thumb {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    background: #e8e2db;
  }

  .pdp-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .pdp-thumb:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201,98,47,0.2);
  }

  .pdp-thumb.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }

  .pdp-fav-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(8px);
    border-radius: 50%;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: var(--shadow-sm);
  }

  .pdp-fav-btn:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-md);
  }

  .pdp-kit-badge {
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(6px);
    border: 1px solid var(--border);
    border-radius: 40px;
    padding: 7px 16px;
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.02em;
  }

  /* ─── Info Panel ─── */
  .pdp-info-panel {
    padding: 52px 48px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 20px;
  }

  .pdp-category-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--accent-pale);
    color: var(--accent);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 40px;
    width: fit-content;
  }

  .pdp-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 700;
    line-height: 1.15;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .pdp-sku {
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .pdp-divider {
    height: 1px;
    background: var(--border);
    border: none;
  }

  .pdp-description {
    font-size: 14.5px;
    line-height: 1.7;
    color: #4a4039;
  }

  .pdp-description * {
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }

  .pdp-stats {
    display: flex;
    gap: 16px;
  }

  .pdp-stat-card {
    flex: 1;
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pdp-stat-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .pdp-stat-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.7rem;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .pdp-stat-card.price .pdp-stat-value { color: var(--accent); }

  .pdp-profit-banner {
    background: linear-gradient(135deg, #1a3a2a 0%, #1f4a35 100%);
    border-radius: 12px;
    padding: 14px 18px;
    color: #a8d5b5;
    font-size: 13px;
    line-height: 1.55;
    border: 1px solid #2a5a3f;
  }

  .pdp-profit-banner strong { color: #c8f0d8; }

  .pdp-login-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 4px;
  }

  .pdp-login-note {
    font-size: 13px;
    color: var(--muted);
    text-align: center;
    font-style: italic;
  }

  .pdp-login-btn {
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 16px 32px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(201,98,47,0.3);
  }

  .pdp-login-btn:hover {
    background: #b5531f;
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(201,98,47,0.4);
  }

  .pdp-login-btn:active { transform: translateY(0); }

  /* ─── Tabs ─── */
  .pdp-tabs-section {
    max-width: 1100px;
    margin: 48px auto;
    padding: 0 40px 64px;
  }

  .pdp-tab-bar {
    display: flex;
    gap: 4px;
    background: var(--warm-white);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 4px;
    width: fit-content;
    margin-bottom: 32px;
  }

  .pdp-tab {
    background: none;
    border: none;
    padding: 9px 22px;
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    color: var(--muted);
    transition: all 0.2s;
    letter-spacing: 0.01em;
  }

  .pdp-tab.active {
    background: var(--accent);
    color: #fff;
    box-shadow: 0 2px 10px rgba(201,98,47,0.25);
  }

  .pdp-tab:hover:not(.active) {
    background: var(--border);
    color: var(--ink);
  }

  /* ─── Images Tab ─── */
  .pdp-images-tab {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    animation: tabReveal 0.3s ease both;
  }

  @keyframes tabReveal {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .pdp-tab-main-img {
    width: 360px;
    height: 360px;
    object-fit: cover;
    border-radius: 18px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
  }

  /* ─── Details Tab ─── */
  .pdp-details-tab {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    animation: tabReveal 0.3s ease both;
  }

  .pdp-detail-card {
    background: var(--warm-white);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: box-shadow 0.2s, transform 0.2s;
  }

  .pdp-detail-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-3px);
  }

  .pdp-detail-icon {
    width: 36px;
    height: 36px;
    background: var(--accent-pale);
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    font-size: 14px;
    margin-bottom: 4px;
  }

  .pdp-detail-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .pdp-detail-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--ink);
  }

  /* ─── Loading / Error ─── */
  .pdp-loading, .pdp-error {
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    font-size: 16px;
    color: var(--muted);
  }

  .pdp-error { color: var(--accent); }

  /* ─── Responsive ─── */
  @media (max-width: 900px) {
    .pdp-hero { grid-template-columns: 1fr; min-height: unset; }
    .pdp-image-panel { border-right: none; border-bottom: 1px solid var(--border); }
    .pdp-info-panel { padding: 32px 24px; }
    .pdp-tabs-section { padding: 0 20px 48px; }
    .pdp-details-tab { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 560px) {
    .pdp-name { font-size: 1.8rem; }
    .pdp-stats { flex-direction: column; }
    .pdp-details-tab { grid-template-columns: 1fr; }
    .pdp-tab-main-img { width: 100%; height: auto; }
  }
`;

const ProductDetailsHomePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: detail, isLoading, isError, error } = useGetProductDetailsQuery(id);
  const [activeTab, setActiveTab] = useState("images");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => { setSelectedImage(null); }, [id]);

  if (isLoading) return <div className="pdp-loading">Loading product…</div>;
  if (isError) return <div className="pdp-error">Error: {error?.message}</div>;

  const product = detail?.data;
  const galleryImages = product?.images?.length > 0
    ? product.images.map(img => img.image?.file_name ? `${imgBaseUrl}/${img.image.file_name}` : null).filter(Boolean)
    : [];
  const primaryImageUrl = product?.primary_image?.file_name
    ? `${imgBaseUrl}/${product.primary_image.file_name}`
    : "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
  const allThumbs = [primaryImageUrl, ...galleryImages];
  const mainImageUrl = selectedImage || primaryImageUrl;

  const detailItems = [
    { icon: <FaThLarge />, label: "Category", value: product?.category?.name || "N/A" },
    { icon: <FaLayerGroup />, label: "Sub Category", value: product?.sub_category?.name || "N/A" },
    { icon: <FaStore />, label: "Shop", value: product?.shop?.name || "N/A" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="pdp-wrap">

        {/* ─── Hero ─── */}
        <div className="pdp-hero">

          {/* Image Panel */}
          <div className="pdp-image-panel">
            <div className="pdp-main-img-wrap">
              <img src={mainImageUrl} alt={product?.name} />
              <button className="pdp-fav-btn" title={product?.is_fav ? "Remove from Favorites" : "Add to Favorites"}>
                {product?.is_fav
                  ? <FaHeart size={18} color="#c9622f" />
                  : <FaRegHeart size={18} color="#7a6e65" />}
              </button>
            </div>

            {allThumbs.length > 1 && (
              <div className="pdp-gallery">
                {allThumbs.map((img, idx) => (
                  <div
                    key={img + idx}
                    className={`pdp-thumb ${mainImageUrl === img ? "active" : ""}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`View ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}

            <div className="pdp-kit-badge">📦 Marketing kit available after login</div>
          </div>

          {/* Info Panel */}
          <div className="pdp-info-panel">
            {product?.category?.name && (
              <span className="pdp-category-chip">
                <FaTag size={9} /> {product.category.name}
              </span>
            )}

            <h1 className="pdp-name">{product?.name}</h1>
            <p className="pdp-sku">SKU: {product?.barcode || "N/A"}</p>

            <hr className="pdp-divider" />

            {product?.description && (
              <div
                className="pdp-description"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            <div className="pdp-stats">
              <div className="pdp-stat-card price">
                <span className="pdp-stat-label"><FaTag size={10} /> Base Price</span>
                <span className="pdp-stat-value">৳{product?.unit_price ?? 0}</span>
              </div>
              <div className="pdp-stat-card">
                <span className="pdp-stat-label"><FaBoxOpen size={10} /> In Stock</span>
                <span className="pdp-stat-value">{product?.current_stock ?? 0}</span>
              </div>
            </div>

            <div className="pdp-profit-banner">
              <strong>Set your own sell price.</strong> The profit is added to your balance automatically after each successful delivery.
            </div>

            <div className="pdp-login-section">
              <p className="pdp-login-note">Login to ResellerBrain for full access & marketing kits</p>
              <button className="pdp-login-btn" onClick={() => navigate("/")}>
                Login to Continue →
              </button>
            </div>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="pdp-tabs-section">
          <div className="pdp-tab-bar">
            {["images", "details"].map(tab => (
              <button
                key={tab}
                className={`pdp-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "images" && (
            <div className="pdp-images-tab">
              <img src={mainImageUrl} alt={product?.name} className="pdp-tab-main-img" />
              {allThumbs.length > 1 && (
                <div className="pdp-gallery">
                  {allThumbs.map((img, idx) => (
                    <div
                      key={img + idx}
                      className={`pdp-thumb ${mainImageUrl === img ? "active" : ""}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`View ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              )}
              <div className="pdp-kit-badge">📦 Marketing kit available after login</div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="pdp-details-tab">
              {detailItems.map(item => (
                <div className="pdp-detail-card" key={item.label}>
                  <div className="pdp-detail-icon">{item.icon}</div>
                  <span className="pdp-detail-label">{item.label}</span>
                  <span className="pdp-detail-value">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default ProductDetailsHomePage;