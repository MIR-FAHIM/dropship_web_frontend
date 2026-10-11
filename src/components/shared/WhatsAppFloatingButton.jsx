import React, { useState, useEffect, useRef } from "react";
import { FaWhatsapp, FaCheckCircle, FaPaperPlane, FaTimes } from "react-icons/fa";

// Team member avatars for rotation
const supportAvatars = [
  {
    name: "তানজিলা",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
  },
  {
    name: "আরিফ",
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80",
  },
  {
    name: "নুসরাত",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
  },
  {
    name: "রাহাত",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
];

const ADMIN_WHATSAPP_NUMBER = "8801941606310"; // 01941606310

const WhatsAppFloatingButton = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
  const [isAvatarVisible, setIsAvatarVisible] = useState(true);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Avatar rotation every 2.4 seconds with smooth fade
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAvatarVisible(false);
      setTimeout(() => {
        setCurrentAvatarIndex((prev) => (prev + 1) % supportAvatars.length);
        setIsAvatarVisible(true);
      }, 400);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Handle direct WhatsApp redirection
  const handleSendMessage = (textToSend) => {
    const finalMsg = (textToSend || message).trim();
    if (!finalMsg) return;

    const encoded = encodeURIComponent(finalMsg);
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
    setMessage("");
  };

  const handleQuickPrompt = (promptText) => {
    setMessage(promptText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const productName = product?.name || "";
  const productSku = product?.sku || product?.barcode || "";

  return (
    <>
      <style>{`
        @keyframes waSubtlePulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7), 0 10px 25px -5px rgba(37, 211, 102, 0.5);
          }
          50% {
            transform: scale(1.06);
            box-shadow: 0 0 0 12px rgba(37, 211, 102, 0), 0 12px 28px -5px rgba(37, 211, 102, 0.6);
          }
        }

        .wa-floating-btn {
          background-color: #25D366 !important;
          color: #ffffff !important;
          width: 60px !important;
          height: 60px !important;
          border-radius: 9999px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          position: relative !important;
          cursor: pointer !important;
          border: none !important;
          outline: none !important;
          animation: waSubtlePulse 2.2s infinite ease-in-out !important;
          transition: transform 0.2s ease, background-color 0.2s ease !important;
          user-select: none !important;
        }
        .wa-floating-btn:hover {
          background-color: #20bd5a !important;
          transform: scale(1.08) !important;
        }
        .wa-floating-btn:active {
          transform: scale(0.95) !important;
        }

        .wa-chat-header {
          background: linear-gradient(135deg, #075E54 0%, #128C7E 100%) !important;
          color: #ffffff !important;
          padding: 16px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
        }

        .wa-close-btn {
          color: rgba(255, 255, 255, 0.85) !important;
          background: transparent !important;
          border: none !important;
          padding: 6px !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s !important;
        }
        .wa-close-btn:hover {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.2) !important;
        }

        .wa-body {
          background-color: #f8fafc !important;
          background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px) !important;
          background-size: 16px 16px !important;
          padding: 16px !important;
        }

        .wa-msg-bubble {
          background-color: #ffffff !important;
          padding: 12px !important;
          border-radius: 16px !important;
          border-top-left-radius: 4px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
          color: #334155 !important;
          font-size: 12px !important;
          line-height: 1.5 !important;
          max-width: 90% !important;
        }

        .wa-chip-btn {
          font-size: 11px !important;
          font-weight: 500 !important;
          background-color: #ffffff !important;
          border: 1px solid #86efac !important;
          color: #065f46 !important;
          padding: 6px 11px !important;
          border-radius: 9999px !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
          transition: all 0.15s ease !important;
          cursor: pointer !important;
          text-align: left !important;
          line-height: 1.3 !important;
        }
        .wa-chip-btn:hover {
          background-color: #ecfdf5 !important;
          border-color: #22c55e !important;
          transform: translateY(-1px) !important;
        }
        .wa-chip-btn:active {
          transform: scale(0.96) !important;
        }

        .wa-input-field {
          flex: 1 !important;
          background-color: #f8fafc !important;
          border: 1px solid #cbd5e1 !important;
          color: #0f172a !important;
          font-size: 12px !important;
          border-radius: 12px !important;
          padding: 10px 14px !important;
          outline: none !important;
          transition: all 0.2s !important;
        }
        .wa-input-field:focus {
          background-color: #ffffff !important;
          border-color: #128C7E !important;
          box-shadow: 0 0 0 3px rgba(18, 140, 126, 0.15) !important;
        }

        .wa-send-btn {
          background-color: #128C7E !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          padding: 10px 16px !important;
          border-radius: 12px !important;
          font-size: 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          border: none !important;
          cursor: pointer !important;
          box-shadow: 0 2px 6px rgba(18, 140, 126, 0.3) !important;
          transition: all 0.2s ease !important;
          flex-shrink: 0 !important;
        }
        .wa-send-btn:hover {
          background-color: #075E54 !important;
          box-shadow: 0 4px 10px rgba(7, 94, 84, 0.35) !important;
        }
        .wa-send-btn:active {
          transform: scale(0.96) !important;
        }
      `}</style>

      <div
        ref={containerRef}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end pointer-events-none"
        style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999 }}
      >
        {/* WhatsApp Business Support Direct Chat Popup */}
        <div
          className={`pointer-events-auto mb-3 w-[calc(100vw-40px)] max-w-sm sm:w-84 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 origin-bottom-right ${
            isOpen
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 translate-y-2 pointer-events-none hidden"
          }`}
          style={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Business Chat Header */}
          <div
            className="wa-chat-header"
            style={{
              background: "linear-gradient(135deg, #075E54 0%, #128C7E 100%)",
              color: "#ffffff",
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative flex-shrink-0">
                <div
                  className="w-11 h-11 rounded-full p-0.5 border-2 shadow-md flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: "#000000",
                    borderColor: "#34d399",
                  }}
                >
                  <img
                    src="https://i.ibb.co/L9H3K2q/Logo-Reseller-Brain-transparent.jpg"
                    alt="Reseller Brain Support"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/200x200/10b981/ffffff?text=RB";
                    }}
                  />
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3.5 h-3.5 border-2 rounded-full"
                  style={{ backgroundColor: "#4ade80", borderColor: "#075E54" }}
                ></span>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4
                    className="font-bold text-sm tracking-wide text-white"
                    style={{ color: "#ffffff" }}
                  >
                    Reseller Brain Support
                  </h4>
                  <FaCheckCircle
                    size={13}
                    color="#34d399"
                    style={{ color: "#34d399", fill: "#34d399" }}
                    title="Verified Business"
                  />
                </div>
                <p
                  className="text-[11px] flex items-center space-x-1"
                  style={{ color: "#dcfce7" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse mr-1"
                    style={{ backgroundColor: "#4ade80" }}
                  ></span>
                  <span>অনলাইনে আছেন • ১ মিনিটে উত্তর দিন</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="wa-close-btn"
              aria-label="Close Chat"
              style={{ color: "#ffffff" }}
            >
              <FaTimes size={16} color="#ffffff" style={{ color: "#ffffff" }} />
            </button>
          </div>

          {/* Chat Body Area */}
          <div className="wa-body space-y-3">
            {/* Incoming Message Bubble */}
            <div className="flex items-start space-x-2">
              <div className="wa-msg-bubble space-y-1">
                <p
                  className="font-bold text-[11px]"
                  style={{ color: "#075E54" }}
                >
                  Reseller Brain Helpdesk
                </p>
                <p className="leading-relaxed" style={{ color: "#334155" }}>
                  আসসালামু আলাইকুম! 👋 আমাদের হেল্পডেস্কে আপনাকে স্বাগতম। প্রোডাক্ট সম্পর্কিত বা অর্ডারের কোন তথ্যের জন্য মেসেজ পাঠাতে পারেন।
                </p>
                <span
                  className="text-[9px] block text-right mt-1"
                  style={{ color: "#94a3b8" }}
                >
                  এখনই
                </span>
              </div>
            </div>

            {/* Quick Pre-filled Action Buttons */}
            <div className="space-y-1.5 pt-1">
              <p
                className="text-[10px] font-semibold uppercase tracking-wider px-1"
                style={{ color: "#64748b" }}
              >
                দ্রুত বার্তা পাঠান:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      productName
                        ? `হ্যালো! আমি "${productName}"${productSku ? ` (SKU: ${productSku})` : ""} প্রোডাক্টটি অর্ডার করতে চাই।`
                        : "হ্যালো! আমি প্রোডাক্টটি অর্ডার করতে চাই।"
                    )
                  }
                  className="wa-chip-btn"
                >
                  🛒 অর্ডার করতে চাই
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      productName
                        ? `হ্যালো! "${productName}" প্রোডাক্টটির দাম ও পাইকারি অফার সম্পর্কে জানতে চাই।`
                        : "হ্যালো! প্রোডাক্টটির দাম ও অফার সম্পর্কে জানতে চাই।"
                    )
                  }
                  className="wa-chip-btn"
                >
                  🏷️ অফার ও দাম
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPrompt(
                      productName
                        ? `হ্যালো! "${productName}" প্রোডাক্টটির স্টক এবং ডেলিভারি সংক্রান্ত তথ্য জানতে চাই।`
                        : "হ্যালো! প্রোডাক্টটির স্টক এবং ডেলিভারি সংক্রান্ত তথ্য জানতে চাই।"
                    )
                  }
                  className="wa-chip-btn"
                >
                  📦 স্টক ও ডেলিভারি
                </button>
              </div>
            </div>
          </div>

          {/* Chat Message Input & Direct Redirect Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t flex items-center space-x-2"
            style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e2e8f0" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="আপনার মেসেজ লিখুন..."
              required
              className="wa-input-field"
            />
            <button
              type="submit"
              className="wa-send-btn"
              style={{
                backgroundColor: "#128C7E",
                color: "#ffffff",
              }}
            >
              <span style={{ color: "#ffffff" }}>পাঠান</span>
              <FaPaperPlane
                size={11}
                color="#ffffff"
                style={{ color: "#ffffff", fill: "#ffffff" }}
              />
            </button>
          </form>
        </div>

        {/* Floating Trigger Button */}
        <div className="pointer-events-auto relative flex items-center">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="wa-floating-btn"
            aria-label="Open WhatsApp Chat"
            title="হোয়াটসঅ্যাপে যোগাযোগ করুন"
            style={{
              backgroundColor: "#25D366",
              color: "#ffffff",
              width: "60px",
              height: "60px",
            }}
          >
            {/* WhatsApp Main Icon */}
            <FaWhatsapp
              size={34}
              color="#ffffff"
              style={{ color: "#ffffff", fill: "#ffffff", minWidth: "34px", minHeight: "34px" }}
            />

            {/* Cycling Team Member Avatar Bubble Overlay */}
            <div
              className="absolute -top-1.5 -left-1.5 w-8 h-8 rounded-full border-2 border-white bg-white shadow-md overflow-hidden flex items-center justify-center ring-2"
              style={{
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                borderColor: "#ffffff",
                outline: "2px solid #25D366",
              }}
            >
              <img
                src={supportAvatars[currentAvatarIndex].url}
                alt={supportAvatars[currentAvatarIndex].name}
                className={`w-full h-full object-cover transition-all duration-400 ${
                  isAvatarVisible
                    ? "opacity-100 scale-100 rotate-0"
                    : "opacity-0 scale-75 -rotate-12"
                }`}
              />
            </div>

            {/* Glowing/Pulsing Green Status Dot */}
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: "#22c55e" }}
              ></span>
              <span
                className="relative inline-flex rounded-full h-4 w-4 border-2 border-white"
                style={{ backgroundColor: "#16a34a" }}
              ></span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default WhatsAppFloatingButton;
