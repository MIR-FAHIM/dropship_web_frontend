import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "sonner";
import { getFullImageUrl } from "./FeedImageGrid";

const FeedImageLightbox = ({
  images = [],
  currentIndex = 0,
  isOpen = false,
  onClose,
  onNext,
  onPrev,
  onSelectIndex,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const validImages = images.map(getFullImageUrl).filter(Boolean);
  const currentSrc = validImages[currentIndex] || validImages[0];

  const handleDownload = async () => {
    try {
      const response = await fetch(currentSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facebook-feed-photo-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("ছবি ডাউনলোড সম্পন্ন হয়েছে!");
    } catch {
      window.open(currentSrc, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between backdrop-blur-sm animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="text-white text-xs sm:text-sm font-semibold tracking-wide">
          Photo {currentIndex + 1} of {validImages.length}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Download image"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Close viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container with Nav Buttons */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition cursor-pointer border border-white/10"
            title="Previous (Left arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          src={currentSrc}
          alt={`Preview ${currentIndex + 1}`}
          className="max-h-[78vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-200 select-none"
        />

        {validImages.length > 1 && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition cursor-pointer border border-white/10"
            title="Next (Right arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="px-4 py-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-2 overflow-x-auto z-10">
          {validImages.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex?.(idx)}
              className={`h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                idx === currentIndex
                  ? "border-blue-500 scale-105 shadow-md"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt="Thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedImageLightbox;
