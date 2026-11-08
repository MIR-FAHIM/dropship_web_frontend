import React, { useState, useRef, useEffect } from "react";
import { ThumbsUp } from "lucide-react";

export const REACTIONS = {
  like: {
    key: "like",
    label: "Like",
    emoji: "👍",
    color: "text-[#1877F2]",
    activeBg: "bg-blue-50",
    badgeBg: "bg-[#1877F2]",
  },
  love: {
    key: "love",
    label: "Love",
    emoji: "❤️",
    color: "text-[#F33E5B]",
    activeBg: "bg-rose-50",
    badgeBg: "bg-[#F33E5B]",
  },
  care: {
    key: "care",
    label: "Care",
    emoji: "🤗",
    color: "text-[#F7B125]",
    activeBg: "bg-amber-50",
    badgeBg: "bg-[#F7B125]",
  },
  haha: {
    key: "haha",
    label: "Haha",
    emoji: "😂",
    color: "text-[#F7B125]",
    activeBg: "bg-amber-50",
    badgeBg: "bg-[#F7B125]",
  },
  wow: {
    key: "wow",
    label: "Wow",
    emoji: "😮",
    color: "text-[#F7B125]",
    activeBg: "bg-amber-50",
    badgeBg: "bg-[#F7B125]",
  },
  sad: {
    key: "sad",
    label: "Sad",
    emoji: "😢",
    color: "text-[#F7B125]",
    activeBg: "bg-amber-50",
    badgeBg: "bg-[#F7B125]",
  },
  angry: {
    key: "angry",
    label: "Angry",
    emoji: "😡",
    color: "text-[#E9710F]",
    activeBg: "bg-orange-50",
    badgeBg: "bg-[#E9710F]",
  },
};

const FeedReactionPicker = ({ currentReaction, onSelectReaction, disabled }) => {
  const [showPicker, setShowPicker] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setShowPicker(true), 250);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setShowPicker(false), 300);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMainClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    setShowPicker(false);
    onSelectReaction(currentReaction ? currentReaction : "like");
  };

  const handlePickReaction = (e, type) => {
    e.stopPropagation();
    if (disabled) return;
    setShowPicker(false);
    onSelectReaction(type);
  };

  const activeConfig = currentReaction ? REACTIONS[currentReaction] : null;

  return (
    <div
      ref={containerRef}
      className="relative flex-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showPicker && (
        <div
          className="absolute bottom-full left-0 mb-2 z-30 bg-white rounded-full shadow-2xl border border-gray-200/80 px-2.5 py-1.5 flex items-center gap-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          role="dialog"
        >
          {Object.values(REACTIONS).map((r) => {
            const isSelected = currentReaction === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={(e) => handlePickReaction(e, r.key)}
                className={`relative group p-1 text-2xl transition-all duration-200 hover:scale-135 active:scale-95 cursor-pointer rounded-full ${
                  isSelected ? "bg-gray-100 ring-2 ring-blue-400" : ""
                }`}
                title={r.label}
              >
                <span className="inline-block transform transition-transform group-hover:-translate-y-1">
                  {r.emoji}
                </span>
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={handleMainClick}
        disabled={disabled}
        className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition cursor-pointer select-none ${
          activeConfig
            ? `${activeConfig.color} ${activeConfig.activeBg} hover:opacity-90`
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {activeConfig ? (
          <>
            <span className="text-base sm:text-lg leading-none">{activeConfig.emoji}</span>
            <span className="font-bold">{activeConfig.label}</span>
          </>
        ) : (
          <>
            <ThumbsUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span>Like</span>
          </>
        )}
      </button>
    </div>
  );
};

export default FeedReactionPicker;
