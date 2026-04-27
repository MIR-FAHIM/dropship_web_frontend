import React, { useState, useCallback, useEffect } from "react";

/* ─────────────────────────────────────────
   ProductGallery
   Props:
     images     – product.images array
     imgBaseUrl – base URL string
   ───────────────────────────────────────── */
const ProductGallery = ({ images = [], imgBaseUrl = "" }) => {
  const [lightbox, setLightbox] = useState(null); // index | null
  const [loaded, setLoaded] = useState({});        // { [index]: true }
  const [failed, setFailed] = useState({});        // { [index]: true }

  const src = (img) => `${imgBaseUrl}/${img.image.file_name}`;

  /* keyboard navigation */
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => {
      if (e.key === "ArrowRight") setLightbox((p) => (p + 1) % images.length);
      if (e.key === "ArrowLeft")  setLightbox((p) => (p - 1 + images.length) % images.length);
      if (e.key === "Escape")     setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, images.length]);

  /* ── empty state ── */
  if (!images || images.length === 0) {
    return (
      <div className="gallery-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
        <p>কোনো গ্যালারি ছবি নেই।</p>
      </div>
    );
  }

  const main   = images[0];
  const thumbs = images.slice(1);

  return (
    <>
      <style>{`
        .pg-wrap { margin-top: 1.5rem; }

        /* ── header ── */
        .pg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: .875rem;
        }
        .pg-title {
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: .4rem;
        }
        .pg-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #374151;
          font-size: .7rem;
          font-weight: 800;
          border-radius: 999px;
          padding: 2px 9px;
        }
        .pg-hint {
          font-size: .7rem;
          color: #9ca3af;
          font-weight: 500;
        }

        /* ── layout: featured + thumbs ── */
        .pg-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: .75rem;
        }
        @media (min-width: 640px) {
          .pg-layout { grid-template-columns: minmax(0,1.6fr) minmax(0,1fr); }
        }

        /* ── featured card ── */
        .pg-featured {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          cursor: zoom-in;
          aspect-ratio: 4/3;
          transition: box-shadow .25s;
        }
        .pg-featured:hover { box-shadow: 0 8px 32px rgba(0,0,0,.12); }
        .pg-featured img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .4s cubic-bezier(.25,.46,.45,.94), opacity .3s;
          display: block;
        }
        .pg-featured:hover img { transform: scale(1.04); }
        .pg-featured .pg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,.28) 0%, transparent 50%);
          opacity: 0;
          transition: opacity .25s;
          display: flex;
          align-items: flex-end;
          padding: 1rem;
        }
        .pg-featured:hover .pg-overlay { opacity: 1; }
        .pg-zoom-hint {
          display: flex;
          align-items: center;
          gap: .35rem;
          color: #fff;
          font-size: .75rem;
          font-weight: 700;
        }
        .pg-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(255,255,255,.88);
          backdrop-filter: blur(4px);
          border-radius: 999px;
          padding: 3px 10px;
          font-size: .68rem;
          font-weight: 800;
          color: #374151;
          border: 1px solid rgba(255,255,255,.6);
        }
        .pg-skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
          background-size: 200% 100%;
          animation: pg-shimmer 1.4s infinite;
        }
        @keyframes pg-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── thumb grid ── */
        .pg-thumbs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: .5rem;
        }

        .pg-thumb {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          cursor: pointer;
          aspect-ratio: 1;
          transition: border-color .2s, box-shadow .2s, transform .2s;
        }
        .pg-thumb:hover {
          border-color: #6366f1;
          box-shadow: 0 4px 14px rgba(99,102,241,.18);
          transform: translateY(-2px);
        }
        .pg-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .35s cubic-bezier(.25,.46,.45,.94);
          display: block;
        }
        .pg-thumb:hover img { transform: scale(1.08); }

        /* +N more overlay */
        .pg-more-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15,15,20,.55);
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 900;
          font-size: 1.4rem;
          gap: .15rem;
          transition: background .2s;
        }
        .pg-more-overlay span { font-size: .65rem; font-weight: 700; opacity: .85; letter-spacing: .05em; }
        .pg-thumb:hover .pg-more-overlay { background: rgba(99,102,241,.65); }

        /* strip fallback for >5 images */
        .pg-strip {
          display: flex;
          gap: .5rem;
          overflow-x: auto;
          padding-bottom: .25rem;
          margin-top: .5rem;
          scrollbar-width: thin;
        }
        .pg-strip-item {
          flex-shrink: 0;
          width: 72px;
          height: 72px;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid #e5e7eb;
          cursor: pointer;
          transition: border-color .2s, transform .2s;
        }
        .pg-strip-item:hover { border-color: #6366f1; transform: scale(1.06); }
        .pg-strip-item img { width:100%; height:100%; object-fit:cover; display:block; }

        /* ── empty ── */
        .gallery-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .75rem;
          padding: 2.5rem 1rem;
          color: #d1d5db;
          text-align: center;
          border: 1.5px dashed #e5e7eb;
          border-radius: 16px;
          margin-top: 1.5rem;
        }
        .gallery-empty p { font-size: .85rem; color: #9ca3af; margin: 0; font-weight: 500; }

        /* ── lightbox ── */
        .lb-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0,0,0,.88);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: lb-in .18s ease;
        }
        @keyframes lb-in { from{opacity:0} to{opacity:1} }
        .lb-inner {
          position: relative;
          max-width: min(90vw, 800px);
          max-height: 88vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .75rem;
        }
        .lb-img-wrap {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,.6);
          max-height: 75vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111;
        }
        .lb-img-wrap img {
          max-width: 100%;
          max-height: 75vh;
          object-fit: contain;
          display: block;
        }
        .lb-close {
          position: absolute;
          top: -42px;
          right: 0;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 999px;
          color: #fff;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          cursor: pointer;
          font-size: 1.1rem;
          transition: background .15s;
        }
        .lb-close:hover { background: rgba(255,255,255,.22); }
        .lb-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 999px;
          color: #fff;
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          cursor: pointer;
          font-size: 1.1rem;
          transition: background .15s;
          backdrop-filter: blur(4px);
        }
        .lb-nav:hover { background: rgba(255,255,255,.24); }
        .lb-nav.prev { left: -52px; }
        .lb-nav.next { right: -52px; }
        @media (max-width: 600px) {
          .lb-nav.prev { left: 4px; }
          .lb-nav.next { right: 4px; }
        }
        .lb-counter {
          font-size: .75rem;
          color: rgba(255,255,255,.65);
          font-weight: 700;
          letter-spacing: .06em;
        }
        .lb-thumbstrip {
          display: flex;
          gap: .4rem;
          overflow-x: auto;
          padding: .2rem .1rem;
          max-width: 100%;
        }
        .lb-thumb-dot {
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color .15s, transform .15s;
          opacity: .65;
        }
        .lb-thumb-dot.active { border-color: #fff; opacity: 1; transform: scale(1.06); }
        .lb-thumb-dot img { width:100%; height:100%; object-fit:cover; display:block; }
      `}</style>

      <div className="pg-wrap">
        {/* Header */}
        <div className="pg-header">
          <div className="pg-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            গ্যালারি
            <span className="pg-count">{images.length}</span>
          </div>
          <span className="pg-hint">ছবিতে ক্লিক করুন বড় দেখতে</span>
        </div>

        {/* Featured + thumb grid */}
        <div className="pg-layout">
          {/* Featured */}
          <div className="pg-featured" onClick={() => setLightbox(0)}>
            {!loaded[0] && !failed[0] && <div className="pg-skeleton" />}
            <img
              src={src(main)}
              alt="featured"
              style={{ opacity: loaded[0] ? 1 : 0 }}
              onLoad={() => setLoaded((p) => ({ ...p, 0: true }))}
              onError={() => setFailed((p) => ({ ...p, 0: true }))}
            />
            <div className="pg-badge">Featured</div>
            <div className="pg-overlay">
              <div className="pg-zoom-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                বড় করে দেখুন
              </div>
            </div>
          </div>

          {/* Thumb grid (max 4 visible) */}
          {thumbs.length > 0 && (
            <div className="pg-thumbs">
              {thumbs.slice(0, 4).map((img, ti) => {
                const realIdx = ti + 1;
                const isLast  = ti === 3 && images.length > 5;
                return (
                  <div
                    key={img.image.id || realIdx}
                    className="pg-thumb"
                    onClick={() => setLightbox(realIdx)}
                  >
                    {!loaded[realIdx] && !failed[realIdx] && <div className="pg-skeleton" />}
                    <img
                      src={src(img)}
                      alt={`photo-${realIdx}`}
                      style={{ opacity: loaded[realIdx] ? 1 : 0 }}
                      onLoad={() => setLoaded((p) => ({ ...p, [realIdx]: true }))}
                      onError={() => setFailed((p) => ({ ...p, [realIdx]: true }))}
                    />
                    {isLast && (
                      <div className="pg-more-overlay">
                        +{images.length - 5}
                        <span>আরও ছবি</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable strip for extra images */}
        {images.length > 5 && (
          <div className="pg-strip">
            {images.slice(5).map((img, si) => {
              const realIdx = si + 5;
              return (
                <div
                  key={img.image.id || realIdx}
                  className="pg-strip-item"
                  onClick={() => setLightbox(realIdx)}
                >
                  <img src={src(img)} alt={`extra-${realIdx}`} loading="lazy" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div className="lb-backdrop" onClick={() => setLightbox(null)}>
          <div className="lb-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>

            {images.length > 1 && (
              <button
                className="lb-nav prev"
                onClick={() => setLightbox((p) => (p - 1 + images.length) % images.length)}
              >‹</button>
            )}


            <div className="lb-img-wrap" style={{ position: 'relative' }}>
              <img
                src={src(images[lightbox])}
                alt={`lightbox-${lightbox}`}
                key={lightbox}
              />
              {/* Download Button */}
              <a
                href={src(images[lightbox])}
                download={images[lightbox]?.image?.file_name || `image-${lightbox + 1}`}
                className="lb-download"
                title="Download image"
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: 'rgba(255,255,255,0.85)',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  zIndex: 2,
                  textDecoration: 'none',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  transition: 'background .18s',
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Download SVG icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14m0 0l-5-5m5 5l5-5" />
                  <rect x="4" y="19" width="16" height="2" rx="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>

            {images.length > 1 && (
              <button
                className="lb-nav next"
                onClick={() => setLightbox((p) => (p + 1) % images.length)}
              >›</button>
            )}

            <div className="lb-counter">{lightbox + 1} / {images.length}</div>

            {/* Thumbnail strip inside lightbox */}
            <div className="lb-thumbstrip">
              {images.map((img, i) => (
                <div
                  key={img.image.id || i}
                  className={`lb-thumb-dot ${i === lightbox ? "active" : ""}`}
                  onClick={() => setLightbox(i)}
                >
                  <img src={src(img)} alt={`lb-thumb-${i}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductGallery;

/* ── Usage ──────────────────────────────────
  <ProductGallery
    images={product.images}
    imgBaseUrl={imgBaseUrl}
  />
  ─────────────────────────────────────────── */