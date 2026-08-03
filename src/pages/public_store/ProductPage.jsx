import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  BadgeCheck,
  Check,
  Loader2,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import { imgBaseUrl } from "../../../config";
import { getFromLocalstorage } from "../../utils/localstorage.utils";
import { useGetDistrictsQuery, useGetDivisionsQuery, useGetUpazilasQuery } from "../../redux/features/address";
import { useAddLandingPageOrderMutation } from "../../redux/features/landingPageOrder";
import { useGetResellerProductPageBySlugQuery } from "../../redux/features/resellerProductPage";
import { getAdminBasePrice } from "../../utils/pricing.utils";
import { getFontFamily, getProductPageDesign } from "../../utils/resellerProductPageDesign.utils";

const DELIVERY_INSIDE_DHAKA = 80;
const DELIVERY_OUTSIDE_DHAKA = 130;

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

const sanitizeHtml = (value) => {
  if (!value) return "";
  if (typeof document === "undefined") return String(value);

  const template = document.createElement("template");
  template.innerHTML = String(value);
  template.content.querySelectorAll("script, iframe, object, embed, form, input, button, link, meta").forEach((node) => {
    node.remove();
  });

  template.content.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const attrValue = String(attribute.value || "").trim();

      if (name.startsWith("on")) {
        node.removeAttribute(attribute.name);
        return;
      }

      if ((name === "href" || name === "src") && /^(javascript:|data:text\/html)/i.test(attrValue)) {
        node.removeAttribute(attribute.name);
      }

      if (name === "style" && /(expression|javascript:|data:text\/html)/i.test(attrValue)) {
        node.removeAttribute(attribute.name);
      }
    });
  });

  return template.innerHTML;
};

const stripHtml = (value) => String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatMoney = (value) => {
  const numericValue = Number(value || 0);
  return `৳ ${numericValue.toLocaleString("en-BD", {
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

const withAlpha = (color, alpha = "18") => {
  const value = String(color || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return `${value}${alpha}`;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const expanded = value
      .slice(1)
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
    return `#${expanded}${alpha}`;
  }
  return "rgba(232, 93, 61, 0.1)";
};

const pushGalleryImage = (list, candidate, altText = "") => {
  const url = assetUrl(candidate);
  if (!url || list.some((item) => item.url === url)) return;

  list.push({
    url,
    alt: altText || candidate?.alt_text || candidate?.file_original_name || "Product image",
  });
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
  const checkoutRef = useRef(null);
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
  const [orderForm, setOrderForm] = useState(initialOrderForm);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [addOrder, { isLoading: placingOrder }] = useAddLandingPageOrderMutation();
  const { data: divisionsData, isLoading: divisionsLoading } = useGetDivisionsQuery();
  const { data: districtsData, isLoading: districtsLoading } = useGetDistrictsQuery(orderForm.division_id, {
    skip: !orderForm.division_id,
  });
  const { data: upazilasData, isLoading: upazilasLoading } = useGetUpazilasQuery(orderForm.district_id, {
    skip: !orderForm.district_id,
  });

  const title = page?.custom_title || product?.name || "Product";
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

    candidates.forEach((candidate) => pushGalleryImage(list, candidate, title));

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

  const mainImage = selectedImage || galleryImages[0]?.url || "https://placehold.co/900x720/fff4e8/6b6660?text=Product";
  const isOwner = userId && Number(userId) === Number(page?.reseller_id);
  const isPublished = page?.published_status === "published";
  const shopName = storeProfile?.shop_name || page?.shop_name || "Store";
  const descriptionHtml = sanitizeHtml(page?.custom_description || product?.description || "");
  const descriptionText = stripHtml(descriptionHtml);
  const phone = storeProfile?.phone || page?.phone;
  const whatsapp = storeProfile?.whatsapp || page?.whatsapp || phone;
  const logo = assetUrl(storeProfile?.logo || page?.logo);
  const design = useMemo(() => getProductPageDesign(page), [page]);
  const salePrice = Number(page?.discount_price || page?.selling_price || getAdminBasePrice(product) || 0);
  const regularPrice = Number(page?.selling_price || salePrice || 0);
  const hasDiscount = Number(page?.discount_price) > 0 && Number(page?.discount_price) < regularPrice;
  const saveAmount = hasDiscount ? regularPrice - salePrice : 0;
  const discountPercent = hasDiscount && regularPrice > 0 ? Math.round((saveAmount / regularPrice) * 100) : 0;
  const whatsappLink = makeWhatsAppLink({ phone: whatsapp, title, price: salePrice, storeName: shopName });
  const productUrl = typeof window !== "undefined" ? window.location.href : "";
  const divisions = getCollection(divisionsData);
  const districts = getCollection(districtsData);
  const upazilas = getCollection(upazilasData);
  const variants = parseMaybeJson(product?.variations);
  const selectedVariant = variants.find((variant) => String(variant?.id || variant?.variant || variant?.sku) === String(orderForm.variant_id));
  const orderQuantity = Math.max(1, Number(orderForm.quantity || 1));
  const orderUnitPrice = Number(selectedVariant?.price || salePrice || 0);
  const orderDeliveryCharge = orderForm.is_outside_dhaka ? DELIVERY_OUTSIDE_DHAKA : DELIVERY_INSIDE_DHAKA;
  const orderSubtotal = orderUnitPrice * orderQuantity;
  const orderTotal = orderSubtotal + orderDeliveryCharge;
  const heroBadgeText = hasDiscount ? `${discountPercent}% OFF` : design.hero?.badge_text;
  const ctaText = design.hero?.cta_text || "Order Now";
  const heroSubtitle = design.hero?.subtitle;
  const benefitItems = design.benefits?.length ? design.benefits : ["High quality product", "Fast delivery", "Cash on delivery available"];
  const frameStyle = {
    "--rb-bg": design.background_color,
    "--rb-ink": design.text_color,
    "--rb-muted": "#6B6660",
    "--rb-accent": design.button_color,
    "--rb-secondary": design.accent_color,
    "--rb-card": design.card_background,
    "--rb-line": withAlpha(design.primary_color, "24"),
    "--rb-soft": withAlpha(design.primary_color, "14"),
    color: design.text_color,
    fontFamily: getFontFamily(design.font_style),
  };

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: productUrl });
      return;
    }

    await navigator.clipboard?.writeText(productUrl);
    toast.success("Product link copied");
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

  const adjustQuantity = (amount) => {
    setOrderForm((prev) => ({
      ...prev,
      quantity: Math.max(1, Number(prev.quantity || 1) + amount),
    }));
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
      <div className="flex min-h-screen items-center justify-center bg-[#efe6da]">
        <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
          <span className="text-sm font-semibold text-slate-700">Loading product page...</span>
        </div>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#efe6da] p-4">
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
      <div className="flex min-h-screen items-center justify-center bg-[#efe6da] p-4">
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
    <div className="min-h-screen bg-[#efe6da] pb-28" style={frameStyle}>
      <div className="bg-[var(--rb-ink)] px-4 py-2.5 text-center text-xs font-semibold text-white">
        {shopName} {storeProfile?.status === "active" ? "verified store" : "product landing page"}
      </div>

      <main className="mx-auto flex w-full max-w-[454px] justify-center px-3 py-6">
        <div className="w-full max-w-[430px] overflow-hidden rounded-[26px] bg-[var(--rb-bg)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35),0_0_0_8px_rgba(28,28,28,0.95)]">
          {isOwner && !isPublished && (
            <div className="bg-blue-50 px-4 py-3 text-center text-xs font-bold text-blue-800">
              Preview mode: this page is currently saved as draft.
            </div>
          )}

          <section className="p-4 pb-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {logo ? (
                  <img src={logo} alt={shopName} className="h-10 w-10 rounded-xl border border-[var(--rb-line)] object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--rb-soft)] text-[var(--rb-accent)]">
                    <Store className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-black">{shopName}</p>
                    {storeProfile?.status === "active" && <BadgeCheck className="h-4 w-4 shrink-0 text-[var(--rb-secondary)]" />}
                  </div>
                  <p className="truncate text-xs text-[var(--rb-muted)]">{storeProfile?.address || "Bangladesh"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleShare}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--rb-line)] bg-white text-[var(--rb-ink)]"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[18px] bg-[var(--rb-soft)]">
              <img src={mainImage} alt={title} className="h-full w-full object-contain" />
              {heroBadgeText && (
                <span className="absolute left-3 top-3 rounded-xl bg-[var(--rb-secondary)] px-3 py-1.5 text-xs font-black text-white">
                  {heroBadgeText}
                </span>
              )}
              <span className="absolute right-3 top-3 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-black text-[var(--rb-ink)]">
                4.8 Rating
              </span>
            </div>
          </section>

          <section className="px-4 pb-4">
            <h1 className="text-[21px] font-black leading-snug">{title}</h1>
            {heroSubtitle && <p className="mt-1 text-sm leading-6 text-[var(--rb-muted)]">{heroSubtitle}</p>}
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <span className="text-[28px] font-black text-[var(--rb-accent)]">{formatMoney(salePrice)}</span>
              {hasDiscount && <span className="pb-1 text-sm font-bold text-[var(--rb-muted)] line-through">{formatMoney(regularPrice)}</span>}
              {hasDiscount && (
                <span className="mb-1 rounded-lg bg-[var(--rb-soft)] px-2 py-1 text-xs font-bold text-[var(--rb-accent)]">
                  Save {formatMoney(saveAmount)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-semibold text-[var(--rb-muted)]">Fast delivery available across Bangladesh</p>
          </section>

          <div className="h-2 bg-[#efe6da]" />

          {design.sections.show_benefits && benefitItems.length > 0 && (
            <section className="px-4 py-4">
              <div className="rounded-2xl border border-[var(--rb-line)] bg-[var(--rb-card)] p-4">
                <h2 className="mb-3 text-lg font-black">Why choose this product?</h2>
                <ul className="grid gap-3">
                  {benefitItems.map((benefit, index) => (
                    <li key={`${benefit}-${index}`} className="flex items-start gap-3 text-sm leading-6">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--rb-secondary)] text-white">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {design.sections.show_gallery && galleryImages.length > 1 && (
            <>
              <div className="h-2 bg-[#efe6da]" />
              <section className="py-4">
                <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {galleryImages.map((image, index) => (
                    <button
                      key={image.url}
                      type="button"
                      onClick={() => setSelectedImage(image.url)}
                      className={`relative h-[170px] w-[132px] shrink-0 overflow-hidden rounded-2xl border ${
                        mainImage === image.url ? "border-[var(--rb-accent)]" : "border-[var(--rb-line)]"
                      } bg-white`}
                    >
                      <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 left-2 rounded-lg bg-black/40 px-2 py-1 text-[11px] font-bold text-white">
                        Image {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          <div className="h-2 bg-[#efe6da]" />

          <section className="px-4 py-4">
            <div className="rounded-2xl border border-[var(--rb-line)] bg-[var(--rb-card)] p-4">
              <h2 className="mb-3 text-lg font-black">Product Details</h2>
              {descriptionText ? (
                <div
                  className="text-sm leading-7 text-[var(--rb-ink)] [&_a]:text-[var(--rb-accent)] [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_strong]:font-bold [&_ul]:list-disc"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : (
                <p className="text-sm leading-7 text-[var(--rb-muted)]">No product details available.</p>
              )}
            </div>
          </section>

          {design.sections.show_reviews && (
            <>
              <div className="h-2 bg-[#efe6da]" />
              <section className="py-4">
                <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {[
                    ["R", "Verified customer", "Good quality and fast delivery."],
                    ["S", "Happy buyer", "Price was reasonable and packaging was nice."],
                    ["N", "Repeat customer", "Product matched the description."],
                  ].map(([initial, name, review], index) => (
                    <div key={index} className="w-[84%] shrink-0 rounded-2xl border border-[var(--rb-line)] bg-[var(--rb-card)] p-4">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--rb-accent)] text-sm font-black text-white">
                          {initial}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{name}</p>
                          <p className="text-xs font-bold text-yellow-600">5.0 Rating</p>
                        </div>
                      </div>
                      <p className="text-sm leading-6 text-[var(--rb-muted)]">{review}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {design.sections.show_faq && design.faq.length > 0 && (
            <>
              <div className="h-2 bg-[#efe6da]" />
              <section className="px-4 py-4">
                <div className="rounded-2xl border border-[var(--rb-line)] bg-[var(--rb-card)] p-4">
                  <h2 className="mb-3 text-lg font-black">FAQ</h2>
                  <div className="grid gap-3">
                    {design.faq.map((item, index) => (
                      <div key={`${item.question}-${index}`} className="rounded-xl bg-[var(--rb-soft)] px-3 py-3">
                        <p className="text-sm font-black">{item.question}</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--rb-muted)]">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          <div className="h-2 bg-[#efe6da]" />

          <section ref={checkoutRef} className="px-4 py-4">
            <form onSubmit={submitOrder} className="rounded-2xl border border-[var(--rb-line)] bg-[var(--rb-card)] p-4">
              <h2 className="text-lg font-black">Complete Your Order</h2>
              <p className="mb-4 mt-1 text-xs text-[var(--rb-muted)]">Fill in your details. The seller will verify your order.</p>

              {createdOrder && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  <p className="font-black">Order placed successfully</p>
                  {(createdOrder?.tracking_code || createdOrder?.data?.tracking_code) && (
                    <p className="mt-1">
                      Tracking code: <span className="font-mono font-bold">{createdOrder?.tracking_code || createdOrder?.data?.tracking_code}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold">Customer Name</span>
                  <input
                    name="customer_name"
                    value={orderForm.customer_name}
                    onChange={updateOrderField}
                    className="w-full rounded-xl border border-[var(--rb-line)] bg-[#fffcf8] px-3 py-3 text-sm outline-none focus:border-[var(--rb-accent)]"
                    placeholder="Customer name"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold">Mobile Number</span>
                  <input
                    name="customer_phone"
                    value={orderForm.customer_phone}
                    onChange={updateOrderField}
                    className="w-full rounded-xl border border-[var(--rb-line)] bg-[#fffcf8] px-3 py-3 text-sm outline-none focus:border-[var(--rb-accent)]"
                    placeholder="01XXXXXXXXX"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold">Full Address</span>
                  <textarea
                    name="customer_address"
                    value={orderForm.customer_address}
                    onChange={updateOrderField}
                    rows={2}
                    className="w-full rounded-xl border border-[var(--rb-line)] bg-[#fffcf8] px-3 py-3 text-sm outline-none focus:border-[var(--rb-accent)]"
                    placeholder="House/road/area/district"
                  />
                </label>

                <div className="grid grid-cols-1 gap-3">
                  <select
                    name="division_id"
                    value={orderForm.division_id}
                    onChange={updateOrderField}
                    className="w-full rounded-xl border border-[var(--rb-line)] bg-[#fffcf8] px-3 py-3 text-sm outline-none focus:border-[var(--rb-accent)]"
                  >
                    <option value="">{divisionsLoading ? "Loading divisions..." : "Select division"}</option>
                    {divisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.name || division.bn_name || division.title}
                      </option>
                    ))}
                  </select>
                  <select
                    name="district_id"
                    value={orderForm.district_id}
                    onChange={updateOrderField}
                    disabled={!orderForm.division_id}
                    className="w-full rounded-xl border border-[var(--rb-line)] bg-[#fffcf8] px-3 py-3 text-sm outline-none focus:border-[var(--rb-accent)] disabled:bg-slate-100"
                  >
                    <option value="">{districtsLoading ? "Loading districts..." : "Select district"}</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name || district.bn_name || district.title}
                      </option>
                    ))}
                  </select>
                  <select
                    name="upozella_id"
                    value={orderForm.upozella_id}
                    onChange={updateOrderField}
                    disabled={!orderForm.district_id}
                    className="w-full rounded-xl border border-[var(--rb-line)] bg-[#fffcf8] px-3 py-3 text-sm outline-none focus:border-[var(--rb-accent)] disabled:bg-slate-100"
                  >
                    <option value="">{upazilasLoading ? "Loading upazilas..." : "Select upazila"}</option>
                    {upazilas.map((upazila) => (
                      <option key={upazila.id} value={upazila.id}>
                        {upazila.name || upazila.bn_name || upazila.title}
                      </option>
                    ))}
                  </select>
                </div>

                {variants.length > 0 && (
                  <select
                    name="variant_id"
                    value={orderForm.variant_id}
                    onChange={updateOrderField}
                    className="w-full rounded-xl border border-[var(--rb-line)] bg-[#fffcf8] px-3 py-3 text-sm outline-none focus:border-[var(--rb-accent)]"
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
                )}

                <div className="flex items-center justify-between rounded-xl bg-[var(--rb-soft)] px-3 py-3">
                  <span className="text-sm font-bold">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => adjustQuantity(-1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--rb-accent)] text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-6 text-center font-black">{orderQuantity}</span>
                    <button
                      type="button"
                      onClick={() => adjustQuantity(1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--rb-accent)] text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-[var(--rb-line)] bg-[#fffcf8] px-3 py-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    name="is_outside_dhaka"
                    checked={orderForm.is_outside_dhaka}
                    onChange={updateOrderField}
                    className="h-4 w-4 rounded border-slate-300 text-orange-600"
                  />
                  Outside Dhaka
                </label>
              </div>

              <div className="mt-4 rounded-xl bg-[var(--rb-soft)] px-3 py-3">
                <div className="flex justify-between py-1 text-sm text-[var(--rb-muted)]">
                  <span>Product price x {orderQuantity}</span>
                  <span>{formatMoney(orderSubtotal)}</span>
                </div>
                <div className="flex justify-between py-1 text-sm text-[var(--rb-muted)]">
                  <span>Delivery charge</span>
                  <span>{formatMoney(orderDeliveryCharge)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-dashed border-[var(--rb-line)] pt-3 text-base font-black">
                  <span>Total</span>
                  <span>{formatMoney(orderTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--rb-accent)] px-4 py-4 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                {placingOrder ? "Placing order..." : ctaText}
              </button>
            </form>
          </section>

          <div className="h-5" />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2">
        <div className="grid w-full max-w-[430px] grid-cols-2 gap-2 rounded-2xl border border-[var(--rb-line)] bg-white p-2 shadow-[0_-6px_24px_rgba(0,0,0,0.14)]">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#f3efe9] px-3 py-3 text-sm font-black text-[var(--rb-ink)]"
              onClick={() => setTimeout(scrollToCheckout, 150)}
            >
              <Phone className="h-4 w-4" />
              Call Now
            </a>
          ) : design.sections.show_whatsapp_button && whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#f3efe9] px-3 py-3 text-sm font-black text-[var(--rb-ink)]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          ) : (
            <button type="button" onClick={handleShare} className="flex items-center justify-center gap-2 rounded-xl bg-[#f3efe9] px-3 py-3 text-sm font-black text-[var(--rb-ink)]">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          )}
          <button
            type="button"
            onClick={scrollToCheckout}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--rb-accent)] px-3 py-3 text-sm font-black text-white"
          >
            <ShoppingBag className="h-4 w-4" />
            {ctaText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
