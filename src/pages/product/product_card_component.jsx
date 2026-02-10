import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	IconButton,
	Chip,
	Stack,
	Tooltip,
	Rating,
	useTheme,
} from "@mui/material";
import {
	FavoriteBorder,
	Favorite,
	ShoppingCartOutlined,
	ShoppingCart,
	LocalOffer,
	VisibilityOutlined,
	Download,
} from "@mui/icons-material";
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
	onToggleWish,
	onAddToCart,
}) => {
	const theme = useTheme();
	const [userId, setUserId] = useState(() => {
		const id = localStorage.getItem("userId");
		return id ? String(id) : null;
	});
	const [inWish, setInWish] = useState(false);
	const [inCart, setInCart] = useState(false);

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

	const handleAddToCart = useCallback(
		async (event) => {
			event.stopPropagation();
			if (!product?.id) return;
			if (onAddToCart) {
				onAddToCart(product);
				return;
			}
			if (!userId) {
				alert("Please login to add to cart.");
				return;
			}

			try {
				const res = await createCart({
					user_id: userId,
					product_id: product.id,
					qty: 1,
				});

				if (res?.data?.status === 200 || res?.data?.status === "success") {
					const current = safeArray(readJson("cartItems", []));
					const next = Array.from(new Set([...current, product.id]));
					writeJson("cartItems", next);
					writeJson("cart", next.length);
					setInCart(true);
					window.dispatchEvent(new Event("cart-updated"));
				} else {
					alert(res?.data?.message || "Failed to add to cart");
				}
			} catch (err) {
				console.error("add to cart error:", err);
				alert("Error adding to cart");
			}
		},
		[createCart, onAddToCart, product, userId]
	);

	const handleView = (e) => {
		e?.stopPropagation?.();
		onView?.(product);
		onClick?.(product);
	};

	return (
		<Card
			onClick={() => onClick?.(product)}
			sx={{
				borderRadius: 3,
				overflow: "hidden",
				border: `1px solid ${theme.palette.divider}`,
				background: theme.palette.background.paper,
				transition: "transform 140ms ease, box-shadow 220ms ease, border-color 220ms ease",
				position: "relative",
				cursor: "pointer",
				"&:hover": {
					transform: "translateY(-3px)",
					boxShadow:
						theme.palette.mode === "dark"
							? "0 14px 32px rgba(0,0,0,0.32)"
							: "0 14px 32px rgba(0,0,0,0.1)",
					borderColor: theme.palette.primary.main,
				},
			}}
		>
			<Box sx={{ p: 1 }}>
				<Box
					sx={{
						height: 150,
						borderRadius: 2.5,
						overflow: "hidden",
						border: `1px solid ${theme.palette.divider}`,
						background: theme.palette.action.hover,
						display: "grid",
						placeItems: "center",
						position: "relative",
					}}
				>
					<Box
						component="img"
						src={imageUrl}
						alt={product?.name || "product"}
						loading="lazy"
						onError={(event) => {
							event.currentTarget.onerror = null;
							event.currentTarget.src = defaultImageUrl;
						}}
						sx={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							transition: "transform 240ms ease",
							".MuiCard-root:hover &": { transform: "scale(1.05)" },
						}}
					/>

					<Stack direction="row" spacing={0.5} sx={{ position: "absolute", left: 8, top: 8 }}>
						{discountLabel ? (
							<Chip
								icon={<LocalOffer fontSize="small" />}
								label={discountLabel}
								size="small"
								sx={{
									borderRadius: 999,
									fontWeight: 800,
									background: theme.palette.primary.main,
									color: "#fff",
									border: `1px solid ${theme.palette.divider}`,
								}}
							/>
						) : null}

						{outOfStock ? (
							<Chip
								label="Out of stock"
								size="small"
								color="error"
								sx={{ borderRadius: 999, fontWeight: 800 }}
							/>
						) : (
							<Chip
								label="In stock"
								size="small"
								variant="outlined"
								sx={{
									borderRadius: 999,
									fontWeight: 800,
									color: theme.palette.text.secondary,
									borderColor: theme.palette.divider,
									background: theme.palette.background.paper,
								}}
							/>
						)}
					</Stack>
				</Box>
			</Box>

			<CardContent sx={{ p: 1.5 }}>
				<Stack spacing={0.75}>
					<Typography
						fontWeight={900}
						sx={{
							lineHeight: 1.2,
							fontSize: 14,
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
							overflow: "hidden",
						}}
					>
						{product?.name || "Unnamed product"}
					</Typography>

					<Typography variant="caption" color="text.secondary">
						{categoryLabel}
					</Typography>

					<Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
						<Typography fontWeight={900} sx={{ fontSize: 16, color: theme.palette.primary.main }}>
							৳ {hasSale ? salePrice : price}
						</Typography>
						{hasSale ? (
							<Typography
								variant="caption"
								sx={{
									fontWeight: 800,
									color: theme.palette.text.secondary,
									textDecoration: "line-through",
								}}
							>
								৳ {price}
							</Typography>
						) : null}
					</Box>

					<Stack direction="row" spacing={0.75} alignItems="center">
						<Rating value={ratingValue} precision={0.5} size="small" readOnly />
						<Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
							({reviewsCount})
						</Typography>
					</Stack>

					<Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between">
						<Stack direction="row" spacing={0.5} alignItems="center">
							<Tooltip title={inWish ? "Already in wishlist" : "Add to wishlist"}>
								<span>
									<IconButton
										onClick={handleToggleWish}
										sx={{
											size: "small",
											width: 32,
											height: 32,
											borderRadius: 2,
											border: `1px solid ${theme.palette.divider}`,
											background: theme.palette.background.paper,
											"&:hover": { background: theme.palette.action.hover },
										}}
									>
										{inWish ? <Favorite color="error" fontSize="small" /> : <FavoriteBorder fontSize="small" />}
									</IconButton>
								</span>
							</Tooltip>

							<Tooltip title="Quick view">
								<IconButton
									onClick={handleView}
									sx={{
										width: 32,
										height: 32,
										borderRadius: 2,
										border: `1px solid ${theme.palette.divider}`,
										background: theme.palette.background.paper,
										"&:hover": { background: theme.palette.action.hover },
									}}
								>
									<VisibilityOutlined fontSize="small" />
								</IconButton>
							</Tooltip>

							<Tooltip title="Download image">
								<IconButton
									onClick={(event) => {
									event.stopPropagation();
									onDownload?.(imageUrl);
								}}
									sx={{
										width: 32,
										height: 32,
										borderRadius: 2,
										border: `1px solid ${theme.palette.divider}`,
										background: theme.palette.background.paper,
										"&:hover": { background: theme.palette.action.hover },
									}}
								>
									<Download fontSize="small" />
								</IconButton>
							</Tooltip>
						</Stack>

						<Tooltip title={outOfStock ? "Out of stock" : inCart ? "In cart" : "Add to cart"}>
							<span>
								<IconButton
									disabled={outOfStock}
									onClick={handleAddToCart}
									sx={{
										width: 36,
										height: 36,
										borderRadius: 2.5,
										border: `1px solid ${theme.palette.divider}`,
										background: theme.palette.background.paper,
										"&:hover": { background: theme.palette.action.hover },
										"&.Mui-disabled": { opacity: 0.5 },
									}}
								>
									{inCart ? <ShoppingCart fontSize="small" /> : <ShoppingCartOutlined fontSize="small" />}
								</IconButton>
							</span>
						</Tooltip>
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
};

export default ProductCard;
