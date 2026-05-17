import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, ShoppingCart, Eye, Download, Star, Tag, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { imgBaseUrl } from "../../../config";
import { useAddWishListMutation, useDeleteWishProductMutation } from "../../redux/features/product";
import { useCreateCartMutation } from "../../redux/features/cart";

const defaultImageUrl =
	"https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

const safeArray = (value) => (Array.isArray(value) ? value : []);

const readJson = (key, fallback) => {
	try {
		const raw = localStorage.getItem(key);
		const parsed = raw ? JSON.parse(raw) : fallback;
		return parsed ?? fallback;
	} catch {
		return fallback;
	}
};

const writeJson = (key, value) => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// ignore
	}
};

const ProductCard = ({
	product,
	onClick,
	onDownload,
	onView,
	hideDownload,
	hideFav,
	onToggleWish,
	onAddToCart,
	onQuickOrder,
}) => {
	const navigate = useNavigate();
	const [userId, setUserId] = useState(() => {
		const id = localStorage.getItem("userId");
		return id ? String(id) : null;
	});
	const [inWish, setInWish] = useState(false);
	const [inCart, setInCart] = useState(false);
	const [showTouchActions, setShowTouchActions] = useState(false);
	const touchTimerRef = useRef(null);   // long-press trigger (500ms)
	const dismissTimerRef = useRef(null); // auto-dismiss (3.5s)

	// Reseller price modal
	const [modalOpen, setModalOpen] = useState(false);
	const [modalAction, setModalAction] = useState("cart"); // "cart" | "quickOrder"
	const [resellerPrice, setResellerPrice] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [addWishList] = useAddWishListMutation();
	const [deleteWishProduct] = useDeleteWishProductMutation();
	const [createCart] = useCreateCartMutation();

	const imageUrl = product?.primary_image?.file_name
		? `${imgBaseUrl}/${product.primary_image.file_name}`
		: defaultImageUrl;

	const price = useMemo(
		() => Number(product?.unit_price ?? product?.price ?? 0),
		[product?.unit_price, product?.price]
	);

	const salePrice = useMemo(
		() => Number(product?.sale_price ?? 0),
		[product?.sale_price]
	);

	const hasSale = useMemo(
		() => salePrice > 0 && salePrice < price,
		[salePrice, price]
	);

	const discountLabel = useMemo(() => {
		if (product?.discount_percent) return `${product.discount_percent}% OFF`;
		const d = Number(product?.discount ?? 0);
		const t = String(product?.discount_type ?? "").toLowerCase();
		if (d > 0 && t === "percent") return `${d}% OFF`;
		if (hasSale && price > 0) {
			const pct = Math.round(((price - salePrice) / price) * 100);
			return pct > 0 ? `${pct}% OFF` : null;
		}
		return null;
	}, [product?.discount_percent, product?.discount, product?.discount_type, hasSale, price, salePrice]);

	const ratingValue = useMemo(() => {
		const r = Number(product?.rating);
		if (Number.isFinite(r) && r >= 0) return Math.min(5, r);
		return 4.5;
	}, [product?.rating]);

	const reviewsCount = useMemo(() => {
		const n = Number(product?.reviews_count);
		if (Number.isFinite(n) && n >= 0) return n;
		return 0;
	}, [product?.reviews_count]);

	const outOfStock = useMemo(() => {
		if (typeof product?.current_stock === "number")
			return product.current_stock <= 0;
		if (typeof product?.stock_qty === "number") return product.stock_qty <= 0;
		if (typeof product?.stock === "number") return product.stock <= 0;
		return false;
	}, [product?.current_stock, product?.stock_qty, product?.stock]);

	const categoryLabel =
		product?.category?.name ?? product?.category?.title ?? "Uncategorized";

	const refreshLocalStates = useCallback(() => {
		const ids = safeArray(readJson("wishlist", [])).map(String);
		setInWish(Boolean(product?.id) && ids.includes(String(product?.id)));

		const cartIds = safeArray(readJson("cartItems", [])).map(String);
		setInCart(Boolean(product?.id) && cartIds.includes(String(product?.id)));
	}, [product?.id]);

	useEffect(() => {
		refreshLocalStates();
	}, [refreshLocalStates]);

	useEffect(() => {
		const onAuth = () => {
			const id = localStorage.getItem("userId");
			setUserId(id ? String(id) : null);
		};
		const onWish = () => refreshLocalStates();
		const onCart = () => refreshLocalStates();

		window.addEventListener("auth-changed", onAuth);
		window.addEventListener("wishlist-updated", onWish);
		window.addEventListener("cart-updated", onCart);

		return () => {
			window.removeEventListener("auth-changed", onAuth);
			window.removeEventListener("wishlist-updated", onWish);
			window.removeEventListener("cart-updated", onCart);
		};
	}, [refreshLocalStates]);

	const handleToggleWish = useCallback(
		async (event) => {
			event.stopPropagation();
			if (!product?.id) return;
			if (onToggleWish) {
				onToggleWish(product);
				return;
			}
			if (!userId) {
				alert("Please login to manage wishlist.");
				return;
			}

			try {
				if (!inWish) {
					const res = await addWishList({
						id: product.id,
						user_id: userId,
						product_id: product.id,
					});

					const wishId =
						res?.data?.id ?? res?.id ?? res?.data?.data?.id ?? null;
					if (wishId) {
						const map = readJson("wishlistMap", {});
						writeJson("wishlistMap", { ...map, [String(product.id)]: wishId });
					}

					const current = safeArray(readJson("wishlist", []));
					const next = Array.from(new Set([...current, product.id]));
					writeJson("wishlist", next);
					setInWish(true);
					window.dispatchEvent(new Event("wishlist-updated"));
					return;
				}

				const map = readJson("wishlistMap", {});
				const wishItemId = map?.[String(product.id)] ?? product.id;
				await deleteWishProduct(wishItemId);

				const current = safeArray(readJson("wishlist", []));
				const next = current.filter((x) => String(x) !== String(product.id));
				writeJson("wishlist", next);

				if (map?.[String(product.id)]) {
					const nextMap = { ...map };
					delete nextMap[String(product.id)];
					writeJson("wishlistMap", nextMap);
				}

				setInWish(false);
				window.dispatchEvent(new Event("wishlist-updated"));
			} catch (err) {
				console.error("wishlist toggle error:", err);
			}
		},
		[addWishList, deleteWishProduct, inWish, onToggleWish, product, userId]
	);

	const openModal = useCallback(
		(action, e) => {
			e?.stopPropagation?.();
			setShowTouchActions(false);
			if (!userId) { alert("Please login first."); return; }
			const base = Number(product?.unit_price ?? product?.price ?? 0);
			setResellerPrice(base > 0 ? String(base) : "");
			setQuantity(1);
			setModalAction(action);
			setModalOpen(true);
		},
		[product?.unit_price, product?.price, userId]
	);

	const handleModalSubmit = useCallback(
		async () => {
			if (!product?.id) return;
			const base = Number(product?.unit_price ?? product?.price ?? 0);
			const rPrice = Number(resellerPrice) || base;
			setIsSubmitting(true);
			try {
				if (onAddToCart && modalAction === "cart") { onAddToCart(product); setModalOpen(false); return; }
				if (onQuickOrder && modalAction === "quickOrder") { onQuickOrder(product); setModalOpen(false); return; }
				const res = await createCart({
					user_id: userId,
					product_id: product.id,
					qty: quantity,
					reseller_price: rPrice,
				});
				if (res?.data?.status === 200 || res?.data?.status === "success") {
					const current = safeArray(readJson("cartItems", []));
					const next = Array.from(new Set([...current, product.id]));
					writeJson("cartItems", next);
					writeJson("cart", next.length);
					setInCart(true);
					window.dispatchEvent(new Event("cart-updated"));
					setModalOpen(false);
					if (modalAction === "quickOrder") {
						navigate("/app/checkout");
						return;
					}
				} else {
					alert(res?.data?.message || "Failed to add to cart");
				}
			} catch (err) {
				console.error("cart error:", err);
				alert("Error adding to cart");
			} finally {
				setIsSubmitting(false);
			}
		},
		[createCart, modalAction, onAddToCart, onQuickOrder, product, quantity, resellerPrice, userId]
	);

	const handleAddToCart = useCallback(
		(event) => {
			openModal("cart", event);
		},
		[openModal]
	);

	const handleView = (e) => {
		e?.stopPropagation?.();
		onView?.(product);
		onClick?.(product);
	};

	const handleQuickOrder = useCallback(
		(e) => {
			openModal("quickOrder", e);
		},
		[openModal]
	);

	// Long-press (500ms) → show overlay; quick tap → let onClick navigate
	const handleTouchStart = useCallback(() => {
		if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
		touchTimerRef.current = setTimeout(() => {
			touchTimerRef.current = null;
			setShowTouchActions(true);
			if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
			dismissTimerRef.current = setTimeout(() => setShowTouchActions(false), 3500);
		}, 500);
	}, []);

	const handleTouchEnd = useCallback(() => {
		// Cancel long-press if finger lifted before 500ms threshold
		if (touchTimerRef.current) {
			clearTimeout(touchTimerRef.current);
			touchTimerRef.current = null;
		}
	}, []);

	useEffect(() => {
		return () => {
			if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
			if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
		};
	}, []);

	const ActionBtn = ({ onClick: btnClick, title, children, disabled, active }) => (
		<button
			title={title}
			disabled={disabled}
			onClick={btnClick}
			className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors
				${disabled ? "opacity-40 cursor-not-allowed border-gray-200 bg-white" :
				active ? "border-red-200 bg-red-50 text-red-500" :
				"border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700"}`}
		>
			{children}
		</button>
	);

	const basePrice = Number(product?.unit_price ?? product?.price ?? 0);
	const resellerPriceVal = Number(resellerPrice) || 0;
	const profit = resellerPriceVal - basePrice;
	const margin = basePrice > 0 ? (profit / basePrice) * 100 : 0;
	const totalSell = resellerPriceVal * quantity;
	const totalBase = basePrice * quantity;
	const totalProfit = totalSell - totalBase;

	return (
		<>
		{/* Reseller Price Modal */}
		{modalOpen && (
			<div
				className="fixed inset-0 z-50 flex items-center justify-center p-4"
				style={{ background: "rgba(0,0,0,0.5)" }}
				onClick={() => setModalOpen(false)}
			>
				<div
					className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 flex flex-col gap-4"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="flex items-start justify-between gap-2">
						<div>
							<p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Set Selling Price</p>
							<h3 className="text-sm font-bold text-gray-800 line-clamp-2 mt-0.5">{product?.name}</h3>
						</div>
						<button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none mt-0.5">✕</button>
					</div>

					{/* Base price */}
					<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
						<span className="text-xs text-gray-500">Base Price</span>
						<span className="text-sm font-black text-gray-800">৳{basePrice.toLocaleString()}</span>
					</div>

					{/* Reseller price input */}
					<div className="flex flex-col gap-1">
						<label className="text-xs font-semibold text-gray-600">Your Selling Price</label>
						<div className="flex items-center border-2 border-gray-200 focus-within:border-red-400 rounded-xl overflow-hidden transition-colors">
							<span className="px-3 text-sm font-bold text-gray-500 bg-gray-50 border-r border-gray-200 h-full flex items-center">৳</span>
							<input
								type="number"
								min="0"
								value={resellerPrice}
								onChange={(e) => {
									const v = e.target.value;
									if (v === "" || (!isNaN(Number(v)) && Number(v) >= 0)) setResellerPrice(v);
								}}
								placeholder="Enter your price"
								className="flex-1 px-3 py-2.5 text-sm font-bold text-gray-800 outline-none bg-white"
							/>
						</div>
					</div>

					{/* Profit stats */}
					<div className="grid grid-cols-2 gap-2">
						<div className={`rounded-xl px-3 py-2 text-center ${profit >= 0 ? "bg-green-50" : "bg-red-50"}`}>
							<p className="text-[10px] text-gray-500">Profit / item</p>
							<p className={`text-sm font-black ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>৳{Number.isFinite(profit) ? profit.toFixed(0) : 0}</p>
						</div>
						<div className="rounded-xl px-3 py-2 text-center bg-gray-50">
							<p className="text-[10px] text-gray-500">Margin</p>
							<p className="text-sm font-black text-gray-700">{Number.isFinite(margin) ? margin.toFixed(1) : 0}%</p>
						</div>
					</div>

					{/* Quantity */}
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold text-gray-600">Quantity</span>
						<div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
							<button
								type="button"
								onClick={() => setQuantity((q) => Math.max(1, q - 1))}
								className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
							>−</button>
							<input
								type="number"
								min="1"
								value={quantity}
								onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= 1) setQuantity(v); }}
								className="w-12 text-center text-sm font-bold text-gray-800 outline-none border-x border-gray-200 py-2"
							/>
							<button
								type="button"
								onClick={() => setQuantity((q) => q + 1)}
								className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
							>+</button>
						</div>
					</div>

					{/* Totals */}
					<div className="grid grid-cols-3 gap-2">
						<div className="rounded-xl px-2 py-2 text-center bg-gray-50">
							<p className="text-[10px] text-gray-500">Total Sell</p>
							<p className="text-xs font-black text-gray-800">৳{Number.isFinite(totalSell) ? totalSell.toFixed(0) : 0}</p>
						</div>
						<div className="rounded-xl px-2 py-2 text-center bg-gray-50">
							<p className="text-[10px] text-gray-500">Total Cost</p>
							<p className="text-xs font-black text-gray-800">৳{Number.isFinite(totalBase) ? totalBase.toFixed(0) : 0}</p>
						</div>
						<div className={`rounded-xl px-2 py-2 text-center ${totalProfit >= 0 ? "bg-green-50" : "bg-red-50"}`}>
							<p className="text-[10px] text-gray-500">Total Profit</p>
							<p className={`text-xs font-black ${totalProfit >= 0 ? "text-green-600" : "text-red-500"}`}>৳{Number.isFinite(totalProfit) ? totalProfit.toFixed(0) : 0}</p>
						</div>
					</div>

					{/* Submit */}
					<button
						disabled={isSubmitting || outOfStock}
						onClick={handleModalSubmit}
						className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
							${isSubmitting || outOfStock
								? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400"
								: modalAction === "quickOrder"
								? "bg-black text-white hover:bg-gray-800"
								: "bg-red-600 text-white hover:bg-red-700"}`}
					>
						{isSubmitting ? "Processing…" : modalAction === "quickOrder" ? "⚡ Confirm Quick Order" : "🛒 Add to Cart"}
					</button>
				</div>
			</div>
		)}

		<div
			onClick={() => !showTouchActions && onClick?.(product)}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer
				transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-gray-200 flex flex-col"
		>
			{/* Image — square ratio */}
			<div className="relative overflow-hidden bg-gray-50 w-full" style={{ paddingBottom: "100%" }}>
				<img
					src={imageUrl}
					alt={product?.name || "product"}
					loading="lazy"
					onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultImageUrl; }}
					className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>

				{/* Badges */}
				<div className="absolute top-2 left-2 flex flex-col gap-1">
					{discountLabel && (
						<span className="flex items-center gap-0.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight">
							<Tag className="w-2.5 h-2.5 flex-shrink-0" /> {discountLabel}
						</span>
					)}
					<span className={`text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight
						${outOfStock ? "bg-gray-700 text-white" : "bg-green-500 text-white"}`}>
						{outOfStock ? "Out of stock" : "In stock"}
					</span>
				</div>

				{/* Quick-action overlay — desktop hover only */}
				<div className="absolute top-2 right-2 hidden sm:flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					{!hideFav && (
						<ActionBtn title={inWish ? "Remove from wishlist" : "Add to wishlist"} btnClick={handleToggleWish} active={inWish}>
							<Heart className={`w-3.5 h-3.5 ${inWish ? "fill-current" : ""}`} />
						</ActionBtn>
					)}
					<ActionBtn title="Quick view" btnClick={handleView}>
						<Eye className="w-3.5 h-3.5" />
					</ActionBtn>
					{!hideDownload && (
						<ActionBtn title="Download image" btnClick={(e) => { e.stopPropagation(); onDownload?.(imageUrl); }}>
							<Download className="w-3.5 h-3.5" />
						</ActionBtn>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="p-3 flex flex-col gap-1.5 flex-1">
				<span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide truncate">
					{categoryLabel}
				</span>

				<p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2 min-h-[2.5rem]">
					{product?.name || "Unnamed product"}
				</p>

				<div className="flex items-baseline justify-between gap-1.5">
					<div className="flex items-baseline gap-1.5">
						<span className="text-base font-black text-red-600">
							৳{(hasSale ? salePrice : price).toLocaleString()}
						</span>
						{hasSale && (
							<span className="text-xs text-gray-400 line-through font-medium">
								৳{price.toLocaleString()}
							</span>
						)}
					</div>
					{product?.sku && (
						<span className="text-[10px] text-black-700 font-medium truncate max-w-[80px]" title={product.sku}>
							{product.sku}
						</span>
					)}
				</div>

				<div className="flex items-center gap-1">
					{[1,2,3,4,5].map((s) => (
						<Star key={s} className={`w-3 h-3 ${s <= Math.round(ratingValue) ? "text-amber-400 fill-current" : "text-gray-200 fill-current"}`} />
					))}
					<span className="text-[10px] text-gray-400 ml-0.5">({reviewsCount})</span>
				</div>

				{/* Bottom action bar */}
				<div className="flex flex-col gap-2 mt-auto pt-2 border-t border-gray-50">
					<button
						onClick={handleQuickOrder}
						className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-gray-800 active:scale-95 transition-all shadow-sm"
					>
						<Zap className="w-3.5 h-3.5 text-yellow-400 fill-current" />
						Quick Order
					</button>

					<button
						disabled={outOfStock}
						onClick={handleAddToCart}
						title={outOfStock ? "Out of stock" : inCart ? "In cart" : "Add to cart"}
						className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm
							${outOfStock
								? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400"
								: inCart
								? "bg-green-500 text-white hover:bg-green-600"
								: "bg-red-600 text-white hover:bg-red-700"}`}
					>
						<ShoppingCart className="w-3.5 h-3.5" />
						{inCart ? "In Cart" : "Add to Cart"}
					</button>
				</div>
			</div>
		</div>
		</>
	);
};

export default ProductCard;
