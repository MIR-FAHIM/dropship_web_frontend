import React from "react";

export function Avatar({ className, children }) {
  return <div className={`w-12 h-12 rounded-full overflow-hidden ${className}`}>{children}</div>;
}

export function AvatarImage({ src, alt }) {
  return <img src={src} alt={alt} className="w-full h-full object-cover" />;
}

export function AvatarFallback({ children }) {
  return <div className="w-full h-full flex items-center justify-center bg-gray-300">{children}</div>;
}
