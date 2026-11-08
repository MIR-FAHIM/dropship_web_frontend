import React from "react";
import { imgBaseUrl } from "../../../../config";

export const getFullImageUrl = (img) => {
  if (!img) return "";
  if (typeof img === "object" && img.url) return img.url;
  if (typeof img === "object" && img.file_name) {
    return `${imgBaseUrl}/${img.file_name.replace(/^\//, "")}`;
  }
  if (typeof img === "string") {
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("blob:") || img.startsWith("data:")) {
      return img;
    }
    return `${imgBaseUrl}/${img.replace(/^\//, "")}`;
  }
  return "";
};

const FeedImageGrid = ({ images = [], onImageClick }) => {
  if (!images || images.length === 0) return null;

  const validImages = images.map(getFullImageUrl).filter(Boolean);
  const total = validImages.length;

  if (total === 0) return null;

  if (total === 1) {
    return (
      <div
        className="w-full overflow-hidden rounded-xl bg-gray-100 cursor-pointer group"
        onClick={() => onImageClick?.(0)}
      >
        <img
          src={validImages[0]}
          alt="Post asset"
          loading="lazy"
          className="w-full max-h-[500px] object-cover group-hover:scale-101 transition-transform duration-300"
        />
      </div>
    );
  }

  if (total === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden h-72 sm:h-96">
        {validImages.slice(0, 2).map((src, idx) => (
          <div
            key={idx}
            className="relative h-full overflow-hidden bg-gray-100 cursor-pointer group"
            onClick={() => onImageClick?.(idx)}
          >
            <img
              src={src}
              alt={`Post asset ${idx + 1}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    );
  }

  if (total === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1.5 rounded-xl overflow-hidden h-80 sm:h-96">
        {/* Large Left Image spanning 2 rows */}
        <div
          className="col-span-1 row-span-2 relative h-full overflow-hidden bg-gray-100 cursor-pointer group"
          onClick={() => onImageClick?.(0)}
        >
          <img
            src={validImages[0]}
            alt="Post asset 1"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        </div>

        {/* Stacked Right Images */}
        {validImages.slice(1, 3).map((src, idx) => (
          <div
            key={idx}
            className="col-span-1 row-span-1 relative h-full overflow-hidden bg-gray-100 cursor-pointer group"
            onClick={() => onImageClick?.(idx + 1)}
          >
            <img
              src={src}
              alt={`Post asset ${idx + 2}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    );
  }

  if (total === 4) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1.5 rounded-xl overflow-hidden h-80 sm:h-96">
        {validImages.slice(0, 4).map((src, idx) => (
          <div
            key={idx}
            className="relative h-full overflow-hidden bg-gray-100 cursor-pointer group"
            onClick={() => onImageClick?.(idx)}
          >
            <img
              src={src}
              alt={`Post asset ${idx + 1}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    );
  }

  // 5 or more images: Top 2 images (50/50), Bottom 3 images with +N overlay
  return (
    <div className="space-y-1.5 rounded-xl overflow-hidden">
      <div className="grid grid-cols-2 gap-1.5 h-48 sm:h-56">
        {validImages.slice(0, 2).map((src, idx) => (
          <div
            key={idx}
            className="relative h-full overflow-hidden bg-gray-100 cursor-pointer group"
            onClick={() => onImageClick?.(idx)}
          >
            <img
              src={src}
              alt={`Post asset ${idx + 1}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1.5 h-32 sm:h-40">
        {validImages.slice(2, 5).map((src, idx) => {
          const actualIndex = idx + 2;
          const isLastShown = actualIndex === 4;
          const extraCount = total - 5;

          return (
            <div
              key={actualIndex}
              className="relative h-full overflow-hidden bg-gray-100 cursor-pointer group"
              onClick={() => onImageClick?.(actualIndex)}
            >
              <img
                src={src}
                alt={`Post asset ${actualIndex + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              />

              {/* Facebook +N More Overlay */}
              {isLastShown && extraCount > 0 && (
                <div className="absolute inset-0 bg-black/60 hover:bg-black/70 backdrop-blur-xs flex items-center justify-center text-white text-xl sm:text-2xl font-bold transition">
                  +{extraCount + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeedImageGrid;
