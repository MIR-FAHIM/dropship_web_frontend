import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "sonner";
import {
  BadgeCheck,
  ExternalLink,
  Facebook,
  Globe2,
  Loader2,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { imgBaseUrl } from "../../../config";
import { getFromLocalstorage } from "../../utils/localstorage.utils";
import { useGetDistrictsQuery, useGetDivisionsQuery, useGetUpazilasQuery } from "../../redux/features/address";
import { useAddLandingPageOrderMutation } from "../../redux/features/landingPageOrder";
import { useGetResellerProductPageBySlugQuery } from "../../redux/features/resellerProductPage";

const getPayload = (response) => response?.data?.data || response?.data || response;

const assetUrl = (value) => {
  if (!value || typeof value === "number") return null;
  if (typeof value === "object") {
    return assetUrl(
      value.url ||
        value.file_name ||
        value.path ||
        value.file_path ||
        value.image?.url ||
        value.image?.file_name ||
        value.upload?.url ||
        value.upload?.file_name,
    );
  }

  const path = String(value);
  if (!path || /^\d+$/.test(path)) return null;
  if (/^https?:\/\//i.test(path)) return path;

  return `${String(imgBaseUrl).replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

const normalizePhone = (phone) => String(phone || "").replace(/[^\d]/g, "");

const stripHtml = (value) => {
  if (!value) return "";
  const withoutTags = String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  if (typeof document === "undefined") return withoutTags.replace(/&amp;/g, "&");

  const textarea = document.createElement("textarea");
  textarea.innerHTML = withoutTags;
  return textarea.value;
};

const formatMoney = (value) => {
  const numericValue = Number(value || 0);
  return `Tk ${numericValue.toLocaleString("en-BD", {
    maximumFractionDigits: Number.isInteger(numericValue) ? 0 : 2,
  })}`;
};

const getCollection = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const parseMaybeJson = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const makeWhatsAppLink = ({ phone, title, price, storeName }) => {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const message = encodeURIComponent(
    `Hello ${storeName || ""}, I want to order: ${title || "this product"} (${formatMoney(price)}).`,
  );

  return `https://wa.me/${normalized}?text=${message}`;
};

const pushGalleryImage = (list, candidate, altText = "") => {
  const url = assetUrl(candidate);
  if (!url || list.some((item) => item.url === url)) return;

  list.push({
    url,
    alt: altText || candidate?.alt_text || candidate?.file_original_name || "Product image",
  });
};

const DetailPill = ({ icon: Icon, title, value }) => {
  if (!value && value !== 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
        <p className="truncate text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

DetailPill.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const initialOrderForm = {
  customer_name: "",
  customer_phone: "",
  customer_address: "",
  division_id: "",
  district_id: "",
  upozella_id: "",
  variant_id: "",
  quantity: 1,
  is_outside_dhaka: false,
};

const ProductPage = () => {
  const { slug } = useParams();
  const userId = getFromLocalstorage("userId");
  const { data, isLoading, isError, error } = useGetResellerProductPageBySlugQuery(slug, { skip: !slug });
  const page = getPayload(data);
  const product = useMemo(() => page?.product || {}, [page?.product]);
  const storeProfile =
    page?.reseller ||
    page?.store_profile ||
    page?.reseller_store_profile ||
    page?.reseller?.store_profile ||
    page?.reseller_store ||
    {};
  const [selectedImage, setSelectedImage] = useState(null);
  const title = page?.custom_title || product?.name || "Product";
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState(initialOrderForm);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [addOrder, { isLoading: placingOrder }] = useAddLandingPageOrderMutation();
  const { data: divisionsData, isLoading: divisionsLoading } = useGetDivisionsQuery(undefined, {
    skip: !orderModalOpen,
  });
  const { data: districtsData, isLoading: districtsLoading } = useGetDistrictsQuery(orderForm.division_id, {
    skip: !orderModalOpen || !orderForm.division_id,
  });
  const { data: upazilasData, isLoading: upazilasLoading } = useGetUpazilasQuery(orderForm.district_id, {
    skip: !orderModalOpen || !orderForm.district_id,
  });

  const galleryImages = useMemo(() => {
    const list = [];
    const candidates = [
      product?.thumbnail_image,
      product?.primary_image?.image,
      product?.primary_image?.upload,
      product?.primary_image?.file,
      product?.primary_image,
      page?.primary_image,
      product?.meta_img,
    ];

    candidates.forEach((candidate) => {
      pushGalleryImage(list, candidate, title);
    });

    [...(product?.images || page?.images || [])]
      .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0))
      .forEach((item) => {
        pushGalleryImage(
          list,
          item?.image_file || item?.uploaded_image || item?.upload || item?.file || item?.image || item,
          item?.alt_text || title,
        );
      });

    return list;
  }, [product, page, title]);

  const mainImage = selectedImage || galleryImages[0]?.url || "https://placehold.co/900x900/f8fafc/64748b?text=Product";
  const mainImageAlt = galleryImages.find((item) => item.url === mainImage)?.alt || title;
  const isOwner = userId && Number(userId) === Number(page?.reseller_id);
  const isPublished = page?.published_status === "published";
  const shopName = storeProfile?.shop_name || page?.shop_name || "Store";
  const description = stripHtml(page?.custom_description || product?.description);
  const phone = storeProfile?.phone || page?.phone;
  const whatsapp = storeProfile?.whatsapp || page?.whatsapp || phone;
  const logo = assetUrl(storeProfile?.logo || page?.logo);
  const salePrice = page?.discount_price || page?.selling_price || product?.unit_price;
  const hasDiscount = Number(page?.discount_price) > 0 && Number(page?.discount_price) < Number(page?.selling_price);
  const whatsappLink = makeWhatsAppLink({ phone: whatsapp, title, price: salePrice, storeName: shopName });
  const productUrl = typeof window !== "undefined" ? window.location.href : "";
  const stockLabel = Number(product?.current_stock) > 0 ? `${product.current_stock} in stock` : "Stock not confirmed";
  const divisions = getCollection(divisionsData);
  const districts = getCollection(districtsData);
  const upazilas = getCollection(upazilasData);
  const variants = parseMaybeJson(product?.variations);
  const selectedVariant = variants.find((variant) => String(variant?.id || variant?.variant || variant?.sku) === String(orderForm.variant_id));
  const orderQuantity = Math.max(1, Number(orderForm.quantity || 1));
  const orderUnitPrice = Number(selectedVariant?.price || salePrice || 0);
  const orderDeliveryCharge = Number(page?.delivery_charge || 0);
  const orderTotal = orderUnitPrice * orderQuantity + orderDeliveryCharge;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: productUrl });
      return;
    }

    await navigator.clipboard?.writeText(productUrl);
  };

  const updateOrderField = (event) => {
    const { name, value, type, checked } = event.target;
    setOrderForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "division_id") {
        next.district_id = "";
        next.upozella_id = "";
      }

      if (name === "district_id") {
        next.upozella_id = "";
      }

      if (name === "quantity") {
        next.quantity = Math.max(1, Number(value || 1));
      }

      return next;
    });
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setCreatedOrder(null);

    if (!orderForm.customer_name.trim()) return toast.error("Customer name is required");
    if (!orderForm.customer_phone.trim()) return toast.error("Customer phone is required");
    if (!orderForm.customer_address.trim()) return toast.error("Customer address is required");
    if (!orderForm.division_id) return toast.error("Please select division");
    if (!orderForm.district_id) return toast.error("Please select district");
    if (!orderForm.upozella_id) return toast.error("Please select upazila");
    if (variants.length > 0 && !orderForm.variant_id) return toast.error("Please select a variant");

    const payload = {
      reseller_product_page_id: page.id,
      reseller_id: page.reseller_id,
      product_id: page.product_id || product.id,
      customer_name: orderForm.customer_name.trim(),
      customer_phone: orderForm.customer_phone.trim(),
      customer_address: orderForm.customer_address.trim(),
      division_id: Number(orderForm.division_id),
      district_id: Number(orderForm.district_id),
      upozella_id: Number(orderForm.upozella_id),
      variant_id: orderForm.variant_id || null,
      quantity: orderQuantity,
      selling_price: orderUnitPrice,
      delivery_charge: orderDeliveryCharge,
      total_amount: orderTotal,
      is_outside_dhaka: Boolean(orderForm.is_outside_dhaka),
      source: "public_product_page",
    };

    try {
      const response = await addOrder(payload).unwrap();
      const order = response?.data?.data || response?.data || response;
      setCreatedOrder(order);
      setOrderForm(initialOrderForm);
      toast.success("Order placed successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Order placement failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm font-semibold text-slate-700">Loading product page...</span>
        </div>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-black text-slate-900">Product page not found</h1>
          <p className="mt-2 text-sm text-red-600">{error?.data?.message || "This product page is unavailable."}</p>
        </div>
      </div>
    );
  }

  if (!isPublished && !isOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-black text-slate-900">This product page is not published</h1>
          <p className="mt-2 text-sm text-slate-500">Please check again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {logo ? (
              <img src={logo} alt={shopName} className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Store className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-black text-slate-950">{shopName}</h1>
                {storeProfile?.status === "active" && <BadgeCheck className="h-4 w-4 shrink-0 text-green-600" />}
              </div>
              <p className="truncate text-xs font-medium text-slate-500">{storeProfile?.address || "Bangladesh"}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              title="Share product"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="hidden items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:inline-flex"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            )}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:py-8 lg:pb-10">
        {isOwner && !isPublished && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
            Preview mode: this page is currently saved as draft.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex h-[320px] items-center justify-center bg-slate-100 p-4 sm:h-[420px] lg:h-[480px]">
                <img src={mainImage} alt={mainImageAlt} className="max-h-full max-w-full object-contain" />
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t border-slate-200 p-3">
                  {galleryImages.map((image, index) => (
                    <button
                      key={image.url}
                      type="button"
                      onClick={() => setSelectedImage(image.url)}
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-white p-1 ${
                        mainImage === image.url ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
                      }`}
                      aria-label={`Show image ${index + 1}`}
                    >
                      <img src={image.url} alt={image.alt} className="h-full w-full rounded-md object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DetailPill icon={PackageCheck} title="Stock" value={stockLabel} />
              <DetailPill icon={ShieldCheck} title="Status" value={isPublished ? "Published" : "Draft preview"} />
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-black text-slate-950">Product Details</h2>
              <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                {description || "No product details available."}
              </div>
            </section>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700">
                  {product?.category?.name || "Product"}
                </span>
                {product?.sku && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">SKU {product.sku}</span>
                )}
              </div>

              <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{title}</h2>
              {product?.name && page?.custom_title !== product.name && (
                <p className="mt-2 text-sm font-medium text-slate-500">{product.name}</p>
              )}

              <div className="mt-5 rounded-lg bg-slate-50 p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-3xl font-black text-blue-700">{formatMoney(salePrice)}</span>
                  {hasDiscount && (
                    <span className="pb-1 text-base font-bold text-slate-400 line-through">{formatMoney(page.selling_price)}</span>
                  )}
                </div>
                {hasDiscount && (
                  <p className="mt-1 text-sm font-semibold text-green-700">
                    You save {formatMoney(Number(page.selling_price) - Number(page.discount_price))}
                  </p>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Make Order
                </button>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-black text-white hover:bg-green-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Order on WhatsApp
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                  >
                    <Phone className="h-4 w-4" />
                    Call Seller
                  </a>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt={shopName} className="h-12 w-12 rounded-lg border border-slate-200 object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Store className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-slate-950">{shopName}</h3>
                  {storeProfile?.details && <p className="line-clamp-1 text-sm text-slate-500">{storeProfile.details}</p>}
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                {storeProfile?.address && (
                  <div className="flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>{storeProfile.address}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>{phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {storeProfile?.facebook_url && (
                  <a
                    href={storeProfile.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                )}
                {storeProfile?.website && (
                  <a
                    href={storeProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Globe2 className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-lg sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setOrderModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-black text-white"
          >
            <ShoppingBag className="h-4 w-4" />
            Make Order
          </button>
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-black text-slate-700"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          ) : whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-black text-white"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>

      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">Make Order</h3>
                <p className="text-sm text-slate-500">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close order form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitOrder} className="space-y-4 p-5">
              {createdOrder && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  <p className="font-black">Order placed successfully</p>
                  {(createdOrder?.tracking_code || createdOrder?.data?.tracking_code) && (
                    <p className="mt-1">
                      Tracking code:{" "}
                      <span className="font-mono font-bold">
                        {createdOrder?.tracking_code || createdOrder?.data?.tracking_code}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Customer Name</label>
                  <input
                    name="customer_name"
                    value={orderForm.customer_name}
                    onChange={updateOrderField}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Customer Phone</label>
                  <input
                    name="customer_phone"
                    value={orderForm.customer_phone}
                    onChange={updateOrderField}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Customer Address</label>
                  <textarea
                    name="customer_address"
                    value={orderForm.customer_address}
                    onChange={updateOrderField}
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Full delivery address"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Division</label>
                  <select
                    name="division_id"
                    value={orderForm.division_id}
                    onChange={updateOrderField}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">{divisionsLoading ? "Loading..." : "Select division"}</option>
                    {divisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.name || division.bn_name || division.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">District</label>
                  <select
                    name="district_id"
                    value={orderForm.district_id}
                    onChange={updateOrderField}
                    disabled={!orderForm.division_id}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="">{districtsLoading ? "Loading..." : "Select district"}</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name || district.bn_name || district.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Upazila</label>
                  <select
                    name="upozella_id"
                    value={orderForm.upozella_id}
                    onChange={updateOrderField}
                    disabled={!orderForm.district_id}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="">{upazilasLoading ? "Loading..." : "Select upazila"}</option>
                    {upazilas.map((upazila) => (
                      <option key={upazila.id} value={upazila.id}>
                        {upazila.name || upazila.bn_name || upazila.title}
                      </option>
                    ))}
                  </select>
                </div>
                {variants.length > 0 && (
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Variant</label>
                    <select
                      name="variant_id"
                      value={orderForm.variant_id}
                      onChange={updateOrderField}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select variant</option>
                      {variants.map((variant, index) => {
                        const value = variant.id || variant.variant || variant.sku || index;
                        return (
                          <option key={value} value={value}>
                            {variant.variant || variant.name || variant.sku || `Variant ${index + 1}`}
                            {variant.price ? ` - ${formatMoney(variant.price)}` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    value={orderForm.quantity}
                    onChange={updateOrderField}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    name="is_outside_dhaka"
                    checked={orderForm.is_outside_dhaka}
                    onChange={updateOrderField}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  Outside Dhaka
                </label>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Product price x {orderQuantity}</span>
                  <span>{formatMoney(orderUnitPrice * orderQuantity)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-slate-600">
                  <span>Delivery charge</span>
                  <span>{formatMoney(orderDeliveryCharge)}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-950">
                  <span>Total</span>
                  <span>{formatMoney(orderTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                {placingOrder ? "Placing order..." : "Submit Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
