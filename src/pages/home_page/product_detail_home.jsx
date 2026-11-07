import { useEffect } from "react";
import {
  ArrowLeft, ArrowUpRight, Calculator, Copy, Download, FileText, Heart, LayoutTemplate,
  LockKeyhole, MessageCircleQuestion, Package, Share2, ShoppingCart, Tag, Video,
} from "lucide-react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import { useGetProductDetailsQuery } from "../../redux/features/product";
import { HomeProductImage } from "./HomeProductCard";
import { formatProductNumber, productImageUrl } from "./homeProductUtils";

const marketingTools = [
  { icon: Download, label: "ছবি ডাউনলোড", description: "পণ্যের ছবি নিয়ে নিজের পেজে পোস্ট করুন।" },
  { icon: Copy, label: "নাম ও বিবরণ কপি", description: "তৈরি করা পণ্যের তথ্য দিয়ে দ্রুত পোস্ট লিখুন।" },
  { icon: Video, label: "ভিডিও লিংক", description: "ভিডিও থাকলে তার লিংক কপি করে শেয়ার করুন।" },
  { icon: Share2, label: "সোশ্যাল মিডিয়া কনটেন্ট", description: "পণ্যের জন্য তৈরি ক্যাপশন ও পোস্টের লেখা দেখুন।" },
  { icon: MessageCircleQuestion, label: "প্রশ্নোত্তর সহায়ক", description: "ক্রেতাদের সাধারণ প্রশ্নের উত্তর দেখে নিন।" },
  { icon: LayoutTemplate, label: "নিজস্ব পণ্য পেজ", description: "নিজের দামে পণ্য সাজিয়ে ক্রেতার সঙ্গে লিংক শেয়ার করুন।" },
];

function descriptionText(value) {
  if (!value) return "";
  const template = document.createElement("template");
  template.innerHTML = String(value);
  template.content.querySelectorAll("script, style, template").forEach((node) => node.remove());
  template.content.querySelectorAll("br, p, div, li, h1, h2, h3, h4").forEach((node) => node.after("\n"));
  return template.content.textContent.trim().replace(/\n{3,}/g, "\n\n");
}

function GuestProductPreview({ product }) {
  const imageFiles = [
    product.primary_image?.file_name,
    ...(product.images ?? []).map((item) => item?.image?.file_name ?? item?.file_name ?? item?.image_file_name ?? item),
  ];
  const images = [...new Set(imageFiles.map(productImageUrl).filter(Boolean))];
  const description = descriptionText(product.description);
  const sku = product.sku || product.barcode;
  const stock = product.current_stock == null ? null : Number(product.current_stock);
  const attributes = (product.product_attributes ?? [])
    .filter(({ attribute, value }) => attribute?.name && value?.value);
  const specifications = [
    ["ক্যাটাগরি", product.category?.name],
    ["সাবক্যাটাগরি", product.sub_category?.id !== product.category?.id && product.sub_category?.name],
    ["ব্র্যান্ড", product.brand?.name],
    ["সরবরাহকারী", product.vendor?.shop_name || product.shop?.name],
    ...attributes.map(({ attribute, value }) => [attribute.name, value.value]),
  ].filter(([, value]) => value);

  return (
    <>
      <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-8">
        <section aria-label="পণ্যের ছবি" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
          <div className="mx-auto aspect-square max-w-md overflow-hidden rounded-xl bg-slate-50 p-4">
            <HomeProductImage src={images[0]} alt={product.name} eager />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {images.slice(1).map((src, index) => (
                <div key={src} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1 sm:h-20 sm:w-20">
                  <HomeProductImage src={src} alt={`পণ্যের ছবি ${formatProductNumber(index + 2)}`} />
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
              <Heart className="h-4 w-4" aria-hidden="true" /> পছন্দের তালিকায় রাখুন
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
              <Download className="h-4 w-4" aria-hidden="true" /> ছবি ডাউনলোড
            </Link>
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {product.category?.name && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                <Tag className="h-3 w-3" aria-hidden="true" /> {product.category.name}
              </span>
            )}
            {Number.isFinite(stock) && (
              <span className={`rounded-full px-2.5 py-1 ${stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {stock > 0 ? "স্টকে আছে" : "স্টক শেষ"}
              </span>
            )}
          </div>
          <h1 className="mt-3 break-words text-2xl font-black leading-tight text-slate-900 sm:text-3xl">{product.name}</h1>
          {sku && <p className="mt-2 break-words text-sm text-slate-500">পণ্য কোড {sku}</p>}

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Calculator className="h-5 w-5 text-blue-700" aria-hidden="true" /> নিজের বিক্রয়মূল্য ঠিক করুন
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">লগইন করে পণ্যের মূল দাম দেখুন, নিজের বিক্রয়মূল্য ও পরিমাণ ঠিক করুন এবং অর্ডারের আগে সম্ভাব্য লাভ হিসাব করুন।</p>
            <div className="mt-3 grid gap-2 min-[360px]:grid-cols-3">
              {["মূল দাম", "আপনার বিক্রয়মূল্য", "সম্ভাব্য লাভ"].map((label) => (
                <Link key={label} to="/login" className="flex items-center gap-1.5 rounded-lg bg-white p-2 text-xs font-semibold text-slate-700 hover:text-blue-700">
                  <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" /> {label}
                </Link>
              ))}
            </div>
          </div>
          <Link to="/login" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-800">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" /> লগইন করে অর্ডার করুন
          </Link>
          <p className="mt-3 text-center text-xs text-slate-500">সফল ডেলিভারির পর লাভ আপনার ব্যালেন্সে যোগ হয়।</p>
        </section>
      </div>

      <section aria-labelledby="product-tools-heading" className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 id="product-tools-heading" className="text-lg font-bold text-slate-900 sm:text-xl">এই পণ্য বিক্রির জন্য যা পাবেন</h2>
        <p className="mt-1 text-sm text-slate-600">মার্কেটিং টুল ও বিক্রির সুবিধাগুলো ব্যবহার করতে লগইন করুন।</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {marketingTools.map(({ icon: Icon, label, description }) => (
            <li key={label}>
              <Link to="/login" className="group flex h-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-blue-300 hover:bg-blue-50">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-900">{label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">{description}</span>
                </span>
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-700" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="product-description-heading" className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="product-description-heading" className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
            <FileText className="h-5 w-5 text-blue-700" aria-hidden="true" /> পণ্যের বিবরণ
          </h2>
          {description && <Link to="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">বিবরণ কপি করুন <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
        </div>
        <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-700">{description || "এই পণ্যের বিবরণ এখনো যোগ করা হয়নি।"}</p>
        {specifications.length > 0 && (
          <dl className="mt-5 grid gap-2 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {specifications.map(([label, value], index) => (
              <div key={`${label}-${index}`} className="min-w-0 rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-medium text-slate-500">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </>
  );
}

GuestProductPreview.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    sku: PropTypes.string,
    barcode: PropTypes.string,
    description: PropTypes.string,
    current_stock: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    primary_image: PropTypes.shape({ file_name: PropTypes.string }),
    images: PropTypes.array,
    product_attributes: PropTypes.array,
    category: PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }),
    sub_category: PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }),
    brand: PropTypes.shape({ name: PropTypes.string }),
    vendor: PropTypes.shape({ shop_name: PropTypes.string }),
    shop: PropTypes.shape({ name: PropTypes.string }),
  }).isRequired,
};

export default function ProductDetailsHomePage() {
  const { id } = useParams();
  const { currentData, isFetching, isError, error, refetch } = useGetProductDetailsQuery(id);
  const product = currentData?.data;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <main lang="bn" className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/#product-catalog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> পণ্য সংগ্রহে ফিরুন
          </Link>
          <Link to="/login" className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100">
            লগইন <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        {isFetching && !product ? (
          <p role="status" className="rounded-2xl border bg-white p-6 text-sm text-slate-600">পণ্যের তথ্য লোড হচ্ছে…</p>
        ) : product ? (
          <GuestProductPreview product={product} />
        ) : (
          <div role="status" className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
            <Package className="mb-3 h-6 w-6 text-slate-400" aria-hidden="true" />
            {error?.status === 404 || !isError ? "পণ্যটি পাওয়া যায়নি।" : (
              <>
                পণ্যের তথ্য লোড করা যায়নি।{" "}
                <button type="button" className="font-semibold text-blue-700 underline" onClick={refetch}>আবার চেষ্টা করুন</button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
