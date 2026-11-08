import { useState } from "react";
import { ArrowUpRight, ImageOff, MousePointer2 } from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatProductNumber, productImageUrl } from "./homeProductUtils";

export function HomeProductImage({ src, alt, eager = false }) {
  const [failedSrc, setFailedSrc] = useState(null);

  return src && src !== failedSrc ? (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className="h-full w-full object-contain"
      onError={() => setFailedSrc(src)}
    />
  ) : (
    <div className="grid h-full w-full place-items-center text-slate-400" role="img" aria-label="ছবি পাওয়া যায়নি">
      <ImageOff className="h-7 w-7" aria-hidden="true" />
    </div>
  );
}

export default function HomeProductCard({ product, rank, clicks, onOpen }) {
  return (
    <Link
      to={`/products-detail-home/${product.id}`}
      onClick={onOpen}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
    >
      <div className="relative aspect-square bg-slate-50 p-2 sm:p-3">
        <HomeProductImage src={productImageUrl(product.primary_image?.file_name)} alt="" />
        {rank != null && (
          <span className="absolute left-2 top-2 rounded-lg bg-slate-900 px-2 py-1 text-xs font-bold text-white">
            #{formatProductNumber(rank)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <h3 className="line-clamp-2 break-words text-sm font-bold leading-5 text-slate-900" title={product.name}>{product.name}</h3>
        <div className="mt-auto flex items-center justify-between gap-1 text-xs font-semibold text-blue-700">
          {clicks == null ? (
            <span>বিস্তারিত দেখুন</span>
          ) : (
            <span className="inline-flex flex-wrap items-center gap-x-1" title="পণ্যের বিস্তারিত পাতায় মোট ক্লিক">
              <MousePointer2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {clicks.toLocaleString("en-US")} sold
            </span>
          )}
          <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

HomeProductImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  eager: PropTypes.bool,
};

HomeProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    primary_image: PropTypes.shape({ file_name: PropTypes.string }),
  }).isRequired,
  rank: PropTypes.number,
  clicks: PropTypes.number,
  onOpen: PropTypes.func,
};
