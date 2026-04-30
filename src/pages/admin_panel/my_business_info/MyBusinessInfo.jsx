import React, { useState } from "react";

const sectionMeta = [
  { emoji: "🏢", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  { emoji: "⚙️", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
  { emoji: "💳", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
  { emoji: "🚚", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  { emoji: "↩️", color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
  { emoji: "🏪", color: "#06b6d4", bg: "#ecfeff", border: "#a5f3fc" },
  { emoji: "🤝", color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  { emoji: "🔒", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  { emoji: "🍪", color: "#84cc16", bg: "#f7fee7", border: "#d9f99d" },
  { emoji: "⚖️", color: "#ec4899", bg: "#fdf2f8", border: "#fbcfe8" },
];

const info = [
  {
    title: "Basic Business Info",
    subtitle: "Core identity & contact details",
    items: [
      { label: "Brand Name", value: "Reseller Brain", highlight: true },
      { label: "Owners / Partners", value: "MD. IBRAHIM & Mir Fahim Rahman" },
      { label: "Business Type", value: "B2B2C Dropshipping & Reseller Marketplace — Vendors list products, Resellers (Dropshippers) sell to end customers without holding stock." },
      { label: "Country", value: "Bangladesh 🇧🇩" },
      { label: "Support Email", value: "Support@resellerbrain.com", type: "email" },
      { label: "Phone", value: "+8801941606310", type: "phone" },
      { label: "Address", value: "House 1, Road 13, Sector 13, Garib E Nawaz Avenue, Uttara, Dhaka-1230" },
      { label: "Used In", value: "Privacy Policy + Terms & Conditions", type: "badge" },
    ],
  },
  {
    title: "Platform Model",
    subtitle: "Who does what on the platform",
    items: [
      { label: "Vendor Role", value: "Vendors list and sell their products on the platform. They may sell on multiple platforms simultaneously, and manage their stock count based on sales rate here." },
      { label: "Reseller Role", value: "Resellers set their own profit margin on top of the vendor's price. They market and sell to their own customers without holding any physical stock." },
      { label: "Admin Role", value: "The admin team oversees all operations. Staff roles include: Data Entry, Vendor Support, Reseller Support, Marketing, and Platform Development." },
      { label: "Responsibility Split", value: "Vendor → product quality & stock. Reseller → customer marketing & order accuracy. Admin → platform operations, dispute resolution, payouts.", type: "highlight-box" },
    ],
  },
  {
    title: "Order & Payment System",
    subtitle: "How money flows on the platform",
    items: [
      { label: "Primary Payment Method", value: "Cash on Delivery (COD). If a vendor requires advance payment, reseller must pay the specified advance % before placing the order." },
      { label: "Payment Flow", value: "Customer → Admin Panel → Reseller profit + Vendor sale price distributed. Platform deducts a category-based commission from the vendor's earnings." },
      { label: "Payout Schedule", value: "Daily automatic payouts to both vendors and resellers. Payment window: 4:00 PM – 10:00 PM (end of day)." },
      { label: "Commission Model", value: "Category-based commission — deducted from vendor only. Specific percentages per category to be defined separately.", type: "badge" },
    ],
  },
  {
    title: "Delivery & Courier Info",
    subtitle: "Logistics, zones & charge structure",
    items: [
      { label: "Primary Couriers", value: "Carrybee & Pathao (80% of deliveries). Steadfast or Redx may be used in some cases.", highlight: true },
      { label: "Delivery Zones", value: "Within same district: ৳70. Outside district: ৳130. ~90% of vendors are based in Dhaka." },
      { label: "Delivery Charge Structure", value: "Reseller adds delivery charge into their selling price (e.g. vendor price ৳500 + profit ৳300 + delivery ৳130 = ৳930 total). Platform deducts vendor price + courier charge; remainder is reseller profit paid after successful delivery." },
      { label: "Failed Delivery", value: "If customer refuses or parcel returns — the delivery charge is deducted as a negative balance from the reseller's wallet." },
      { label: "Return Charge", value: "No extra charge on returns, but the original delivery charge is deducted from reseller wallet." },
    ],
  },
  {
    title: "Return, Refund & Cancellation",
    subtitle: "Rules for all three parties",
    items: [
      { label: "Customer Return", value: "Customer must return while the delivery person is present, with a valid reason. If product is refused, the customer should pay the delivery charge directly to the delivery person." },
      { label: "Refund Policy", value: "If reseller collected extra charges beyond the delivery fee from customer, and product is refused, reseller is solely responsible for refunding the excess amount to the customer." },
      { label: "Vendor Fault (Wrong Product)", value: "Delivery charge (whether delivered or not) will be deducted from the vendor's balance — per courier policy terms.", type: "alert" },
      { label: "Reseller Fault (Wrong Order)", value: "Delivery charge (whether delivered or not) will be added as negative balance in reseller's wallet — per courier policy terms.", type: "alert" },
    ],
  },
  {
    title: "Vendor Rules",
    subtitle: "Upload standards & quality enforcement",
    items: [
      { label: "What Vendors Can Upload", value: "Product title, description, tags, multiple 1:1 images, video uploads (any size), or video links. No phone numbers or branding allowed in media — violating this may cause resellers to bypass the platform and contact vendors directly." },
      { label: "Fake / Low Quality Product", value: "If reported via resellers: vendor is contacted, product may be flagged as 'duplicate' or removed from the platform listing." },
      { label: "Stock Management", value: "When stock drops to 10 units, resellers are strongly advised to confirm availability via the platform's internal messaging system before accepting orders." },
      { label: "Late Delivery Penalty", value: "Delays due to natural/logistical issues are exempted. Rider-caused delays must be reported to support immediately for resolution." },
    ],
  },
  {
    title: "Reseller Rules",
    subtitle: "Pricing, marketing & customer conduct",
    items: [
      { label: "Price Change Policy", value: "Price cannot be changed once a product is dispatched for delivery. Any discount to the customer must be handled via the reseller's personal mobile banking (cashback) after delivery is confirmed." },
      { label: "Fake Marketing", value: "Fake marketing leads to high return rates. Reseller receives a warning first. If a customer is defrauded, full legal and financial liability falls on the reseller. Reseller Brain bears zero responsibility.", type: "alert" },
      { label: "Customer Misleading", value: "If a reseller misleads or defrauds a customer in any way that constitutes a legal offense, the reseller bears full legal responsibility.", type: "alert" },
    ],
  },
  {
    title: "Data Collection",
    subtitle: "What we collect, why & where",
    items: [
      { label: "Data Collected", value: "Name, phone number, delivery address, payment information." },
      { label: "Purpose", value: "To process courier handoffs for reseller orders, and to maintain investigation records in case of disputes between any parties." },
      { label: "Storage", value: "Stored on our private software server. Regular server backups are maintained." },
      { label: "Third-Party Sharing", value: "Courier companies (for delivery), Payment gateways (for transaction processing) only.", type: "badge" },
    ],
  },
  {
    title: "Cookies & Tracking",
    subtitle: "Session, analytics & user experience",
    items: [
      { label: "Cookies Used For", value: "Login session management, user preferences, cart & wishlist persistence, security & fraud prevention." },
      { label: "Analytics", value: "Google Analytics or similar tools may be used to monitor traffic, analyze user behavior, and improve the platform. All data is anonymized and aggregate — not personally identifiable." },
      { label: "User Control", value: "Cookies can be disabled via browser settings. Some platform features may not function properly without cookies. Continued use of the platform implies consent.", type: "highlight-box" },
    ],
  },
  {
    title: "Risk & Liability",
    subtitle: "Accountability, downtime & legal limits",
    items: [
      { label: "Product Quality Liability", value: "Ultimate responsibility lies with the Vendor. Reseller Brain acts only as a marketplace intermediary.", highlight: true },
      { label: "Delivery Delay Liability", value: "Delay liability is assessed case-by-case. Reseller Brain investigates and takes responsibility when the delay is caused by the platform or its courier partners. Force majeure events are exempt." },
      { label: "Platform Downtime", value: "Reseller Brain does not guarantee 100% uptime. The platform is not liable for missed orders or business losses due to downtime. Orders affected during verified downtime will be reviewed and compensated at the platform's discretion.", type: "alert" },
      { label: "⚠️ Missing Info", value: "Commission % per category not yet defined — needs to be added before publishing T&C.", type: "missing" },
    ],
  },
];

const BadgeItem = ({ value }) => (
  <span style={{
    display: "inline-block",
    background: "#f0fdf4",
    color: "#166534",
    border: "1px solid #bbf7d0",
    borderRadius: "6px",
    padding: "2px 10px",
    fontSize: "0.78rem",
    fontWeight: 600,
  }}>{value}</span>
);

const AlertItem = ({ value, color }) => (
  <div style={{
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderLeft: "3px solid #ef4444",
    borderRadius: "6px",
    padding: "8px 12px",
    color: "#7f1d1d",
    fontSize: "0.85rem",
    lineHeight: 1.6,
  }}>{value}</div>
);

const MissingItem = ({ value }) => (
  <div style={{
    background: "#fefce8",
    border: "1px dashed #fbbf24",
    borderRadius: "6px",
    padding: "8px 12px",
    color: "#92400e",
    fontSize: "0.82rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }}>⚠️ {value}</div>
);

const HighlightBox = ({ value }) => (
  <div style={{
    background: "#f8faff",
    border: "1px solid #c7d2fe",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#1e1b4b",
    fontSize: "0.85rem",
    lineHeight: 1.7,
  }}>{value}</div>
);

const InfoRow = ({ item }) => {
  const renderValue = () => {
    if (item.type === "badge") return <BadgeItem value={item.value} />;
    if (item.type === "alert") return <AlertItem value={item.value} />;
    if (item.type === "missing") return <MissingItem value={item.value} />;
    if (item.type === "highlight-box") return <HighlightBox value={item.value} />;
    if (item.type === "email") return (
      <a href={`mailto:${item.value}`} style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>{item.value}</a>
    );
    if (item.type === "phone") return (
      <a href={`tel:${item.value}`} style={{ color: "#10b981", textDecoration: "none", fontWeight: 500 }}>{item.value}</a>
    );
    return (
      <span style={{
        color: item.highlight ? "#1e40af" : "#374151",
        fontWeight: item.highlight ? 700 : 400,
        fontSize: "0.88rem",
        lineHeight: 1.6,
      }}>{item.value}</span>
    );
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "200px 1fr",
      gap: "12px",
      padding: "10px 0",
      borderBottom: "1px solid #f3f4f6",
      alignItems: "start",
    }}>
      <span style={{
        fontSize: "0.78rem",
        fontWeight: 600,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        paddingTop: "2px",
      }}>{item.label}</span>
      <div>{renderValue()}</div>
    </div>
  );
};

const SectionCard = ({ section, meta, index }) => {
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      background: "#ffffff",
      borderRadius: "16px",
      border: `1px solid ${meta.border}`,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"}
    >
      {/* Section header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          background: meta.bg,
          cursor: "pointer",
          borderBottom: open ? `1px solid ${meta.border}` : "none",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Number badge */}
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: meta.color,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            fontWeight: 800,
            flexShrink: 0,
            fontFamily: "'DM Mono', monospace",
          }}>
            {String(index + 1).padStart(2, "0")}
          </div>
          <div>
            <div style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.02em",
              fontFamily: "'Sora', sans-serif",
            }}>
              {meta.emoji} {section.title}
            </div>
            <div style={{
              fontSize: "0.75rem",
              color: "#9ca3af",
              marginTop: "1px",
              fontWeight: 500,
            }}>
              {section.subtitle}
            </div>
          </div>
        </div>
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          background: "rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          fontSize: "0.8rem",
          color: "#6b7280",
        }}>▼</div>
      </div>

      {/* Section body */}
      {open && (
        <div style={{ padding: "4px 24px 16px" }}>
          {section.items.map((item, i) => (
            <InfoRow key={i} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

const MyBusinessInfo = () => {
  const missingItems = [
    "Commission % per product category (mentioned as TBD)",
    "Registered trade license or business registration number",
    "Governing law / jurisdiction clause (for T&C)",
    "Account suspension / termination policy",
    "Dispute resolution process (arbitration or court?)",
    "Age restriction / eligibility to register",
    "Intellectual property clause (who owns uploaded content?)",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #f9fafb; }
      `}</style>

      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px 20px 80px",
        fontFamily: "'Sora', sans-serif",
      }}>

        {/* Hero header */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 60%, #3730a3 100%)",
          borderRadius: "20px",
          padding: "40px",
          marginBottom: "32px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* decorative circles */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: -20, right: 80, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "999px",
              padding: "4px 14px",
              fontSize: "0.72rem",
              color: "#93c5fd",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}>
              📋 Internal Reference Document
            </div>

            <h1 style={{
              margin: "0 0 8px",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}>
              Reseller Brain
            </h1>
            <p style={{
              margin: "0 0 24px",
              color: "#93c5fd",
              fontSize: "1rem",
              fontWeight: 500,
            }}>
              Business Information — Privacy Policy & Terms & Conditions Source
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["10 Sections", "Privacy Policy", "Terms & Conditions"].map(tag => (
                <span key={tag} style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#e0f2fe",
                  borderRadius: "8px",
                  padding: "4px 12px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Missing info alert */}
        <div style={{
          background: "#fffbeb",
          border: "1px solid #fcd34d",
          borderLeft: "4px solid #f59e0b",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "32px",
        }}>
          <div style={{
            fontWeight: 700,
            color: "#92400e",
            fontSize: "0.9rem",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            ⚠️ Items Pending / Missing — Must Complete Before Publishing
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
            {missingItems.map((item, i) => (
              <li key={i} style={{
                color: "#78350f",
                fontSize: "0.82rem",
                lineHeight: 1.8,
                fontWeight: 500,
              }}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Section cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {info.map((section, idx) => (
            <SectionCard
              key={idx}
              section={section}
              meta={sectionMeta[idx]}
              index={idx}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "40px",
          textAlign: "center",
          color: "#9ca3af",
          fontSize: "0.75rem",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "20px",
        }}>
          Reseller Brain — Internal Business Info Document · Support@resellerbrain.com · +8801941606310
        </div>
      </div>
    </>
  );
};

export default MyBusinessInfo;