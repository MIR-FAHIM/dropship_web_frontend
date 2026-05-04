import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Divider,
	Grid,
	IconButton,
	Paper,
	Snackbar,
	Alert,
	Stack,
	TextField,
	Tooltip,
	Typography,
	useTheme,
	Avatar,
	Badge,
	Fade,
	LinearProgress,
} from "@mui/material";
import {
	Add as AddIcon,
	AddCircleOutline as AddCircleOutlineIcon,
	ArrowBack as ArrowBackIcon,
	DeleteOutline as DeleteOutlineIcon,
	LocalShipping as LocalShippingIcon,
	Lock as LockIcon,
	Notes as NotesIcon,
	RemoveCircleOutline as RemoveCircleOutlineIcon,
	ShoppingCart as ShoppingCartIcon,
	CheckCircle as CheckCircleIcon,
	LocationOn as LocationOnIcon,
	Inventory2 as Inventory2Icon,
	TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCheckoutOrderMutation } from "../../redux/features/order";
import {
	useGetCartQuery,
	useUpdateCartMutation,
	useDeleteCartMutation,
} from "../../redux/features/cart";
import CustomerAddress from "./address/customer_address";
import { imgBaseUrl } from "../../../config";

const safeArray = (value) => (Array.isArray(value) ? value : []);

/* ── Step indicator ── */
const steps = ["Address", "Review", "Confirm"];

const StepBar = ({ active }) => {
	const theme = useTheme();
	return (
		<Stack direction="row" alignItems="center" spacing={0} sx={{ mt: 0.5 }}>
			{steps.map((label, i) => {
				const done = i < active;
				const current = i === active;
				return (
					<React.Fragment key={label}>
						<Stack alignItems="center" spacing={0.4}>
							<Box
								sx={{
									width: 28,
									height: 28,
									borderRadius: "50%",
									display: "grid",
									placeItems: "center",
									fontWeight: 900,
									fontSize: 12,
									background: done
										? theme.palette.success.main
										: current
										? theme.palette.primary.main
										: theme.palette.action.hover,
									color: done || current ? "#fff" : theme.palette.text.disabled,
									border: current ? `2px solid ${theme.palette.primary.light}` : "2px solid transparent",
									transition: "all .3s",
								}}
							>
								{done ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : i + 1}
							</Box>
							<Typography
								sx={{
									fontSize: 10,
									fontWeight: current ? 900 : 700,
									color: current ? theme.palette.primary.main : theme.palette.text.disabled,
									whiteSpace: "nowrap",
								}}
							>
								{label}
							</Typography>
						</Stack>
						{i < steps.length - 1 && (
							<Box
								sx={{
									flex: 1,
									height: 2,
									mx: 0.5,
									mb: 2,
									borderRadius: 1,
									background: done ? theme.palette.success.main : theme.palette.divider,
									transition: "background .3s",
									minWidth: 24,
								}}
							/>
						)}
					</React.Fragment>
				);
			})}
		</Stack>
	);
};

/* ── Stat card ── */
const StatCard = ({ icon, label, value, color }) => {
	const theme = useTheme();
	return (
		<Box
			sx={{
				flex: 1,
				p: 1.5,
				borderRadius: 3,
				border: `1px solid ${color}30`,
				background: `linear-gradient(135deg, ${color}0d 0%, ${color}05 100%)`,
				display: "flex",
				alignItems: "center",
				gap: 1.2,
				transition: "box-shadow .2s",
				"&:hover": { boxShadow: `0 4px 16px ${color}22` },
			}}
		>
			<Box
				sx={{
					width: 38,
					height: 38,
					borderRadius: 2.5,
					display: "grid",
					placeItems: "center",
					background: `${color}22`,
					color: color,
					flexShrink: 0,
					border: `1px solid ${color}30`,
				}}
			>
				{icon}
			</Box>
			<Box sx={{ minWidth: 0 }}>
				<Typography sx={{ fontSize: 10, fontWeight: 800, color: `${color}cc`, textTransform: "uppercase", letterSpacing: 0.6 }}>
					{label}
				</Typography>
				<Typography sx={{ fontWeight: 950, fontSize: 14, color: color, lineHeight: 1.2 }}>
					{value}
				</Typography>
			</Box>
		</Box>
	);
};

/* ── Cart Item Row ── */
const CartItemRow = ({ it, processing, onUpdate, onDelete, money, theme }) => {
	const lineTotal =
		it?.line_total ??
		it?.total ??
		(it?.qty || 1) * (Number(it?.product?.unit_price ?? it?.product?.price ?? 0) || 0);

	const isProcessing = processing[it.id];
	const imgSrc = it?.product?.primary_image?.file_name
		? `${imgBaseUrl}/${it.product.primary_image.file_name}`
		: (it?.product?.image || it?.product?.thumbnail || null);

	return (
		<Fade in>
			<Box
				sx={{
					p: 1.5,
					borderRadius: 3,
					border: `1px solid ${theme.palette.divider}`,
					background: theme.palette.background.paper,
					position: "relative",
					overflow: "hidden",
					transition: "box-shadow .2s, border-color .2s",
					"&:hover": { boxShadow: `0 4px 16px ${theme.palette.primary.main}1a`, borderColor: `${theme.palette.primary.main}44` },
				}}
			>
				{isProcessing && (
					<LinearProgress
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: 2,
							borderRadius: "3px 3px 0 0",
						}}
					/>
				)}

				<Stack direction="row" spacing={1.5} alignItems="center">
					{/* Product image */}
					<Avatar
						src={imgSrc}
						variant="rounded"
						sx={{
							width: 52,
							height: 52,
							borderRadius: 2.5,
							border: `1px solid ${theme.palette.divider}`,
							background: theme.palette.action.hover,
							flexShrink: 0,
							"& img": { objectFit: "cover" },
						}}
					>
						<Inventory2Icon fontSize="small" sx={{ color: theme.palette.text.disabled }} />
					</Avatar>

					{/* Name + price */}
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							sx={{
								fontWeight: 900,
								color: theme.palette.text.primary,
								fontSize: 13,
								lineHeight: 1.3,
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}
						>
							{it.product?.name || "Item"}
						</Typography>
						<Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.3 }}>
							<Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 900, fontSize: 13 }}>
								{money(lineTotal)}
							</Typography>
							{it.qty > 1 && (
								<Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontWeight: 700, fontSize: 11 }}>
									× {it.qty}
								</Typography>
							)}
						</Stack>
					</Box>

					{/* Qty controls */}
					<Stack direction="column" spacing={0.5} alignItems="flex-end" flexShrink={0}>
						<Stack direction="row" spacing={0.4} alignItems="center">
							<IconButton
								size="small"
								onClick={() => onUpdate(it, (it.qty || 1) - 1)}
								disabled={isProcessing || (it.qty || 1) <= 1}
								sx={{
									borderRadius: 2,
									border: `1px solid ${theme.palette.divider}`,
									background: theme.palette.background.paper,
									width: 26,
									height: 26,
									"&:hover": { background: theme.palette.action.hover },
								}}
							>
								<RemoveCircleOutlineIcon sx={{ fontSize: 14 }} />
							</IconButton>

							<Box
								sx={{
									minWidth: 28,
									height: 26,
									borderRadius: 2,
									border: `1px solid ${theme.palette.divider}`,
									background: theme.palette.background.paper,
									display: "grid",
									placeItems: "center",
									fontWeight: 950,
									fontSize: 12,
									color: theme.palette.text.primary,
								}}
							>
								{it.qty || 1}
							</Box>

							<IconButton
								size="small"
								onClick={() => onUpdate(it, (it.qty || 1) + 1)}
								disabled={isProcessing}
								sx={{
									borderRadius: 2,
									border: `1px solid ${theme.palette.divider}`,
									background: theme.palette.background.paper,
									width: 26,
									height: 26,
									"&:hover": { background: theme.palette.action.hover },
								}}
							>
								<AddCircleOutlineIcon sx={{ fontSize: 14 }} />
							</IconButton>
						</Stack>

						<Tooltip title="Remove item" placement="left">
							<IconButton
								size="small"
								onClick={() => onDelete(it)}
								disabled={isProcessing}
								sx={{
									borderRadius: 2,
									width: 26,
									height: 26,
									background: "rgba(250,92,92,0.08)",
									"&:hover": { background: "rgba(250,92,92,0.18)" },
								}}
							>
								<DeleteOutlineIcon sx={{ fontSize: 13, color: theme.palette.error.main }} />
							</IconButton>
						</Tooltip>
					</Stack>
				</Stack>
			</Box>
		</Fade>
	);
};

/* ══════════════════════════════════════
   Main Component
══════════════════════════════════════ */
const CheckoutPage = () => {
	const theme = useTheme();
	const navigate = useNavigate();

	const divider = theme.palette.divider;
	const surface = theme.palette.background.paper;
	const surface2 = theme.palette.action.hover;
	const ink = theme.palette.text.primary;
	const subInk = theme.palette.text.secondary;

	const userId = useMemo(() => {
		const id = localStorage.getItem("userId");
		return id ? String(id) : null;
	}, []);

	const money = (n) =>
		new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(Number(n || 0));

	const [selectedAddress, setSelectedAddress] = useState(null);
	const [addresses, setAddresses] = useState([]);
	const [addrLoading, setAddrLoading] = useState(false);
	const [note, setNote] = useState("");
	const [processing, setProcessing] = useState({});
	const [openAddressModal, setOpenAddressModal] = useState(false);
	const [msg, setMsg] = useState({ text: "", severity: "info" });

	const notify = (text, severity = "info") => setMsg({ text, severity });

	/* active step: 0=address, 1=review(has address), 2=ready to place */
	const activeStep = useMemo(() => {
		if (!selectedAddress) return 0;
		return 1;
	}, [selectedAddress]);

	const {
		data: cartResponse,
		isLoading: cartLoading,
		refetch: refetchCart,
	} = useGetCartQuery(userId, { skip: !userId });

	const cart = useMemo(
		() => cartResponse?.data ?? cartResponse?.data?.data ?? cartResponse,
		[cartResponse]
	);

	const cartItems = safeArray(cart?.items ?? cart?.data?.items ?? []);
	const subtotal = cart?.subtotal ?? cart?.sub_total ?? 0;
	const resellerProfitTotal = cart?.reseller_profit_total ?? 0;

	useEffect(() => {
		const total = cart?.total_items ?? cartItems.length;
		localStorage.setItem("cart", JSON.stringify(Number(total || 0)));
		window.dispatchEvent(new Event("cart-updated"));
	}, [cart?.total_items, cartItems.length]);

	const [updateCart] = useUpdateCartMutation();
	const [deleteCart] = useDeleteCartMutation();
	const [checkoutOrder, { isLoading: loadingCheckout }] = useCheckoutOrderMutation();

	const handleUpdateQty = async (item, newQty) => {
		if (newQty < 1) return;
		setProcessing((p) => ({ ...p, [item.id]: true }));
		try {
			const res = await updateCart({ itemId: item.id, qty: newQty });
			const ok = res?.data?.status === "success" || res?.status === "success" || res?.status === 200;
			notify(res?.data?.message || (ok ? "Quantity updated" : "Failed to update"), ok ? "success" : "error");
			if (ok) await refetchCart();
		} catch {
			notify("Error updating quantity", "error");
		} finally {
			setProcessing((p) => ({ ...p, [item.id]: false }));
		}
	};

	const handleDeleteItem = async (item) => {
		if (!window.confirm("Remove this item from cart?")) return;
		setProcessing((p) => ({ ...p, [item.id]: true }));
		try {
			const res = await deleteCart(item.id);
			const ok = res?.data?.status === "success" || res?.status === "success" || res?.status === 200;
			notify(res?.data?.message || (ok ? "Item removed" : "Failed to remove"), ok ? "success" : "error");
			if (ok) await refetchCart();
		} catch {
			notify("Error removing item", "error");
		} finally {
			setProcessing((p) => ({ ...p, [item.id]: false }));
		}
	};

	const handleCheckout = async () => {
		if (!userId) return notify("Please login to place an order.", "warning");
		if (!cartItems.length) return notify("Your cart is empty.", "warning");

		const addrObj = selectedAddress ? addresses.find((a) => String(a.id) === String(selectedAddress)) : null;
		if (!addrObj) return notify("Select or add a shipping address.", "warning");

		try {
			const payload = {
				user_id: userId,
				customer_name: addrObj.name || "",
				customer_phone: addrObj.mobile || "",
				shipping_address: `${addrObj.address}${addrObj.area ? `, ${addrObj.area}` : ""}${addrObj.district ? `, ${addrObj.district}` : ""}`,
				zone: addrObj.district || "",
				note: note || "",
			};

			const res = await checkoutOrder(payload);
			const ok = res?.data?.status === "success" || res?.status === "success" || res?.status === 200;

			if (ok) {
				notify(res?.data?.message || "Order placed successfully!", "success");
				localStorage.setItem("cart", JSON.stringify(0));
				window.dispatchEvent(new Event("cart-updated"));
				setTimeout(() => navigate("/app/order"), 1000);
			} else {
				notify(res?.data?.message || "Failed to place order.", "error");
			}
		} catch {
			notify("Error placing order.", "error");
		}
	};

	return (
		<Box sx={{ minHeight: "100vh", background: theme.palette.background.default, p: { xs: 1.5, md: 2.5 } }}>

			{/* ── Top Header Bar ── */}
			<Paper
				elevation={0}
				sx={{
					mb: 2.5,
					p: { xs: 1.5, md: 2 },
					borderRadius: 4,
					border: `1px solid ${divider}`,
					background: `linear-gradient(135deg, ${surface} 60%, ${theme.palette.primary.main}08 100%)`,
					boxShadow: `0 1px 12px ${theme.palette.primary.main}0e`,
				}}
			>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					alignItems={{ xs: "flex-start", sm: "center" }}
					justifyContent="space-between"
					gap={2}
				>
					{/* Left: back + title + stepper */}
					<Stack direction="row" spacing={1.5} alignItems="flex-start">
						<IconButton
							onClick={() => navigate(-1)}
							sx={{
								borderRadius: 2.5,
								border: `1px solid ${divider}`,
								background: surface,
								mt: 0.3,
								"&:hover": { background: surface2 },
							}}
						>
							<ArrowBackIcon fontSize="small" />
						</IconButton>
						<Box>
							<Stack direction="row" spacing={1} alignItems="center">
								<Typography
									variant="h5"
									sx={{ fontWeight: 950, letterSpacing: -0.5, color: theme.palette.primary.main, lineHeight: 1 }}
								>
									Checkout
								</Typography>
								<Badge
									badgeContent={cartItems.length}
									color="primary"
									sx={{ "& .MuiBadge-badge": { fontWeight: 900, fontSize: 10 } }}
								>
									<ShoppingCartIcon fontSize="small" sx={{ color: subInk }} />
								</Badge>
							</Stack>
							<Typography variant="body2" sx={{ color: subInk, fontWeight: 700, mt: 0.3 }}>
								Complete your order in a few steps
							</Typography>
							<Box sx={{ mt: 1 }}>
								<StepBar active={activeStep} />
							</Box>
						</Box>
					</Stack>

					{/* Right: address chip + add button */}
					<Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
						<Chip
							icon={<LocationOnIcon sx={{ fontSize: "14px !important" }} />}
							label={
								addrLoading
									? "Loading..."
									: addresses.length
									? `${addresses.length} saved address${addresses.length > 1 ? "es" : ""}`
									: "No address saved"
							}
							size="small"
							sx={{
								borderRadius: 999,
								fontWeight: 800,
								fontSize: 11,
								background: surface2,
								border: `1px solid ${divider}`,
								color: ink,
							}}
						/>
						<Button
							onClick={() => setOpenAddressModal(true)}
							startIcon={<AddIcon />}
							variant="contained"
							size="small"
							sx={{
								borderRadius: 999,
								textTransform: "none",
								fontWeight: 900,
								fontSize: 12,
								px: 2,
								boxShadow: "none",
								"&:hover": { opacity: 0.9, boxShadow: "none" },
							}}
						>
							Add Address
						</Button>
					</Stack>
				</Stack>
			</Paper>

			{/* ── Main Grid ── */}
			<Grid container spacing={2.5}>

				{/* Left: Address */}
				<Grid item xs={12} md={7}>
					<CustomerAddress
						userId={userId}
						selectedAddress={selectedAddress}
						onSelectAddress={setSelectedAddress}
						onAddressesChange={setAddresses}
						onLoadingChange={setAddrLoading}
						openAddressModal={openAddressModal}
						setOpenAddressModal={setOpenAddressModal}
						setMsg={(m) => notify(m, "info")}
					/>
				</Grid>

				{/* Right: Order Summary */}
				<Grid item xs={12} md={5}>
					<Paper
						elevation={0}
						sx={{
							p: 2,
							borderRadius: 4,
							border: `1px solid ${theme.palette.primary.main}28`,
							background: `linear-gradient(160deg, ${surface} 70%, ${theme.palette.primary.main}06 100%)`,
							boxShadow: `0 4px 24px ${theme.palette.primary.main}0d`,
							position: { md: "sticky" },
							top: { md: 86 },
						}}
					>
						{/* Summary header */}
						<Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: 3,
									display: "grid",
									placeItems: "center",
									background: `${theme.palette.primary.main}18`,
									color: theme.palette.primary.main,
								}}
							>
								<LockIcon fontSize="small" />
							</Box>
							<Box>
								<Typography variant="h6" sx={{ fontWeight: 950, color: ink, lineHeight: 1.1 }}>
									Order Summary
								</Typography>
								<Typography variant="caption" sx={{ color: subInk, fontWeight: 700 }}>
									Review items before placing order
								</Typography>
							</Box>
						</Stack>

						{!userId ? (
							<Alert severity="warning" sx={{ borderRadius: 3, fontWeight: 800 }}>
								Please login to checkout.
							</Alert>
						) : cartLoading ? (
							<Stack spacing={1}>
								{[1, 2].map((i) => (
									<Box key={i} sx={{ p: 1.5, borderRadius: 3, background: surface2, border: `1px solid ${divider}` }}>
										<LinearProgress sx={{ borderRadius: 2 }} />
									</Box>
								))}
							</Stack>
						) : cartItems.length === 0 ? (
							<Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
								<ShoppingCartIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
								<Typography sx={{ fontWeight: 800, color: subInk }}>Your cart is empty.</Typography>
								<Button variant="outlined" size="small" onClick={() => navigate("/app/items/category")} sx={{ borderRadius: 999, textTransform: "none", fontWeight: 900 }}>
									Browse Products
								</Button>
							</Stack>
						) : (
							<Box>
								{/* Stat row */}
								<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
									<StatCard
										icon={<Inventory2Icon fontSize="small" />}
										label="Items"
										value={cartItems.length}
										color={theme.palette.primary.main}
									/>
									<StatCard
										icon={<TrendingUpIcon fontSize="small" />}
										label="Your Profit"
										value={money(resellerProfitTotal)}
										color={theme.palette.success.main}
									/>
								</Stack>

								{/* Cart items */}
								<Stack spacing={1} sx={{ mb: 2 }}>
									{cartItems.map((it) => (
										<CartItemRow
											key={it.id}
											it={it}
											processing={processing}
											onUpdate={handleUpdateQty}
											onDelete={handleDeleteItem}
											money={money}
											theme={theme}
										/>
									))}
								</Stack>

								<Divider sx={{ my: 1.5, opacity: 0.15 }} />

								{/* Totals */}
									<Box
										sx={{
											mb: 2,
											p: 1.5,
											borderRadius: 3,
											border: `1px solid ${divider}`,
											background: surface2,
										}}
									>
										<Stack spacing={1}>
											<Stack direction="row" justifyContent="space-between" alignItems="center">
												<Typography variant="body2" sx={{ fontWeight: 800, color: subInk }}>Subtotal</Typography>
												<Typography variant="body2" sx={{ fontWeight: 950, color: ink }}>
													{money(subtotal)}
												</Typography>
											</Stack>
											<Stack direction="row" justifyContent="space-between" alignItems="center">
												<Typography variant="body2" sx={{ fontWeight: 800, color: subInk }}>Shipping</Typography>
												<Chip
													label="Free"
													size="small"
													icon={<LocalShippingIcon sx={{ fontSize: "13px !important", color: `${theme.palette.success.main} !important` }} />}
													sx={{
														fontWeight: 900,
														fontSize: 11,
														background: `${theme.palette.success.main}14`,
														color: theme.palette.success.main,
														border: `1px solid ${theme.palette.success.main}30`,
														borderRadius: 999,
													}}
												/>
											</Stack>
											<Divider sx={{ opacity: 0.2 }} />
											<Stack direction="row" justifyContent="space-between" alignItems="center">
												<Typography variant="body1" sx={{ fontWeight: 950, color: ink }}>Total</Typography>
												<Typography variant="body1" sx={{ fontWeight: 950, fontSize: 16, color: theme.palette.primary.main }}>
													{money(subtotal)}
												</Typography>
											</Stack>
											<Stack direction="row" justifyContent="space-between" alignItems="center">
												<Typography variant="caption" sx={{ fontWeight: 800, color: subInk }}>Your Profit</Typography>
												<Chip
													label={`+${money(resellerProfitTotal)}`}
													size="small"
													icon={<TrendingUpIcon sx={{ fontSize: "13px !important", color: `${theme.palette.success.main} !important` }} />}
													sx={{
														fontWeight: 950,
														fontSize: 12,
														background: `${theme.palette.success.main}18`,
														color: theme.palette.success.main,
														border: `1px solid ${theme.palette.success.main}30`,
														borderRadius: 999,
													}}
												/>
											</Stack>
										</Stack>
									</Box>
								{/* Note field */}
								<TextField
									label="Order Note (optional)"
									value={note}
									onChange={(e) => setNote(e.target.value)}
									size="small"
									fullWidth
									multiline
									minRows={2}
									maxRows={4}
									placeholder="Any special instructions for the delivery or packaging..."
									sx={{
										mb: 2,
										"& .MuiOutlinedInput-root": {
											borderRadius: 3,
											background: surface,
											fontSize: 13,
											"& fieldset": { borderColor: divider },
											"&:hover fieldset": { borderColor: theme.palette.primary.main },
											"&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
										},
										"& .MuiInputLabel-root": { fontSize: 13 },
										"& .MuiInputLabel-root.Mui-focused": { color: theme.palette.primary.main },
									}}
									InputProps={{
										startAdornment: (
											<Box sx={{ mr: 1, display: "grid", placeItems: "center", color: theme.palette.primary.main, alignSelf: "flex-start", pt: 1.2 }}>
												<NotesIcon fontSize="small" />
											</Box>
										),
									}}
								/>

								{/* Action buttons */}
								<Stack spacing={1.5}>
									<Button
										variant="contained"
										onClick={handleCheckout}
										disabled={loadingCheckout || !selectedAddress || !cartItems.length}
										startIcon={loadingCheckout ? null : <LockIcon />}
										fullWidth
										size="large"
										sx={{
											borderRadius: 999,
											textTransform: "none",
											fontWeight: 950,
											fontSize: 14,
											py: 1.4,
											background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
											boxShadow: `0 4px 18px ${theme.palette.primary.main}44`,
											"&:hover": { opacity: 0.92, boxShadow: `0 6px 24px ${theme.palette.primary.main}55` },
											"&.Mui-disabled": { opacity: 0.4, background: theme.palette.action.disabledBackground },
										}}
									>
										{loadingCheckout ? (
											<Stack direction="row" spacing={1} alignItems="center">
												<CircularProgress size={14} color="inherit" />
												<span>Placing Order...</span>
											</Stack>
										) : (
											"Place Order"
										)}
									</Button>

									<Button
										variant="outlined"
										onClick={() => navigate(-1)}
										startIcon={<ArrowBackIcon />}
										fullWidth
										sx={{
											borderRadius: 999,
											textTransform: "none",
											fontWeight: 900,
											fontSize: 13,
											borderColor: divider,
											color: ink,
											"&:hover": { background: surface2, borderColor: theme.palette.primary.main },
										}}
									>
										Back to Cart
									</Button>
								</Stack>

								{!selectedAddress && cartItems.length > 0 && (
									<Box
										sx={{
											mt: 1.5,
											p: 1,
											borderRadius: 2.5,
											background: `${theme.palette.warning.main}12`,
											border: `1px solid ${theme.palette.warning.main}30`,
											textAlign: "center",
										}}
									>
										<Typography sx={{ fontSize: 11, color: theme.palette.warning.dark, fontWeight: 800 }}>
											⚠ Please select a shipping address to continue
										</Typography>
									</Box>
								)}

								{/* Secure badge */}
								<Stack direction="row" spacing={0.6} alignItems="center" justifyContent="center" sx={{ mt: 1, opacity: 0.55 }}>
									<LockIcon sx={{ fontSize: 12, color: subInk }} />
									<Typography sx={{ fontSize: 11, fontWeight: 700, color: subInk }}>
										Secure &amp; encrypted checkout
									</Typography>
								</Stack>
							</Box>
						)}
					</Paper>
				</Grid>
			</Grid>

			{/* ── Snackbar ── */}
			<Snackbar
				open={!!msg.text}
				autoHideDuration={3000}
				onClose={() => setMsg({ text: "", severity: "info" })}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					severity={msg.severity}
					onClose={() => setMsg({ text: "", severity: "info" })}
					sx={{ borderRadius: 3, fontWeight: 800, boxShadow: 3 }}
				>
					{msg.text}
				</Alert>
			</Snackbar>
		</Box>
	);
};

export default CheckoutPage;