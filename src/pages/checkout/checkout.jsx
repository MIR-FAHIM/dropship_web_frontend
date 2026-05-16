import React, { useEffect, useMemo, useState } from "react";
import {
	Alert,
	Avatar,
	Box,
	Button,
	CircularProgress,
	Divider,
	FormControlLabel,
	Grid,
	IconButton,
	InputAdornment,
	LinearProgress,
	MenuItem,
	Paper,
	Radio,
	RadioGroup,
	Select,
	Snackbar,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	DeleteOutline as DeleteOutlineIcon,
	LocalShipping as LocalShippingIcon,
	Person as PersonIcon,
	Phone as PhoneIcon,
	LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCheckoutOrderMutation } from "../../redux/features/order";
import {
	useGetCartQuery,
	useUpdateCartMutation,
	useDeleteCartMutation,
} from "../../redux/features/cart";
import { imgBaseUrl } from "../../../config";

const safeArray = (v) => (Array.isArray(v) ? v : []);

const DELIVERY_AREAS = [
	{ label: "Inside Dhaka", charge: 100 },
	{ label: "Outside Dhaka", charge: 150 },
	{ label: "Chittagong", charge: 120 },
	{ label: "Sylhet", charge: 130 },
	{ label: "Rajshahi", charge: 130 },
	{ label: "Khulna", charge: 130 },
	{ label: "Barishal", charge: 130 },
	{ label: "Rangpur", charge: 140 },
	{ label: "Mymensingh", charge: 120 },
];

/* ══════════════════════════════════════
   Main Component
══════════════════════════════════════ */
const CheckoutPage = () => {
	const navigate = useNavigate();

	const userId = useMemo(() => {
		const id = localStorage.getItem("userId");
		return id ? String(id) : null;
	}, []);

	/* ── form state ── */
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [deliveryArea, setDeliveryArea] = useState(DELIVERY_AREAS[0]);
	const [paymentMethod, setPaymentMethod] = useState("cod");
	const [coupon, setCoupon] = useState("");
	const [couponApplied, setCouponApplied] = useState(false);
	const [discount, setDiscount] = useState(0);
	const [note] = useState("");
	const [processing, setProcessing] = useState({});
	const [msg, setMsg] = useState({ text: "", severity: "info" });

	const notify = (text, severity = "info") => setMsg({ text, severity });

	/* ── cart ── */
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
	const subtotal = Number(cart?.subtotal ?? cart?.sub_total ?? 0);
	const resellerProfit = Number(cart?.reseller_profit_total ?? 0);

	useEffect(() => {
		const total = cart?.total_items ?? cartItems.length;
		localStorage.setItem("cart", JSON.stringify(Number(total || 0)));
		window.dispatchEvent(new Event("cart-updated"));
	}, [cart?.total_items, cartItems.length]);

	const [updateCart] = useUpdateCartMutation();
	const [deleteCart] = useDeleteCartMutation();
	const [checkoutOrder, { isLoading: loadingCheckout }] = useCheckoutOrderMutation();

	const grandTotal = subtotal - discount + deliveryArea.charge;

	/* ── handlers ── */
	const handleUpdateQty = async (item, newQty) => {
		if (newQty < 1) return;
		setProcessing((p) => ({ ...p, [item.id]: true }));
		try {
			const res = await updateCart({ itemId: item.id, qty: newQty });
			const ok = res?.data?.status === "success" || res?.status === 200;
			if (ok) await refetchCart();
			else notify(res?.data?.message || "Failed to update", "error");
		} catch { notify("Error updating quantity", "error"); }
		finally { setProcessing((p) => ({ ...p, [item.id]: false })); }
	};

	const handleDeleteItem = async (item) => {
		if (!window.confirm("Remove this item from cart?")) return;
		setProcessing((p) => ({ ...p, [item.id]: true }));
		try {
			const res = await deleteCart(item.id);
			const ok = res?.data?.status === "success" || res?.status === 200;
			if (ok) await refetchCart();
			else notify(res?.data?.message || "Failed to remove", "error");
		} catch { notify("Error removing item", "error"); }
		finally { setProcessing((p) => ({ ...p, [item.id]: false })); }
	};

	const handleApplyCoupon = () => {
		if (!coupon.trim()) return;
		// Placeholder — wire to coupon API when available
		notify("Coupon not recognised", "warning");
	};

	const handlePlaceOrder = async () => {
		if (!userId) return notify("Please login to place an order.", "warning");
		if (!cartItems.length) return notify("Your cart is empty.", "warning");
		if (!fullName.trim()) return notify("Please enter your full name.", "warning");
		if (!phone.trim()) return notify("Please enter your phone number.", "warning");
		if (!address.trim()) return notify("Please enter your full address.", "warning");

		try {
			const payload = {
				user_id: userId,
				customer_name: fullName.trim(),
				customer_phone: phone.trim(),
				shipping_address: `${address.trim()}, ${deliveryArea.label}`,
				zone: deliveryArea.label,
				delivery_charge: deliveryArea.charge,
				payment_method: paymentMethod,
				note: note || "",
			};

			const res = await checkoutOrder(payload);
			const ok = res?.data?.status === "success" || res?.status === "success" || res?.status === 200;

			if (ok) {
				notify(res?.data?.message || "Order placed successfully!", "success");
				localStorage.setItem("cart", JSON.stringify(0));
				window.dispatchEvent(new Event("cart-updated"));
				setTimeout(() => navigate("/app/order"), 1200);
			} else {
				notify(res?.data?.message || "Failed to place order.", "error");
			}
		} catch { notify("Error placing order.", "error"); }
	};

	const money = (n) => `৳${Number(n || 0).toLocaleString()}`;

	/* ── render ── */
	return (
		<Box sx={{ minHeight: "100vh", background: "#f5f6fa", p: { xs: 1.5, sm: 2.5 } }}>

			{/* Back button */}
			<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
				<IconButton
					onClick={() => navigate(-1)}
					sx={{ borderRadius: 2, border: "1px solid #e0e0e0", background: "#fff", "&:hover": { background: "#f0f0f0" } }}
				>
					<ArrowBackIcon fontSize="small" />
				</IconButton>
				<Typography sx={{ fontWeight: 900, fontSize: 20, color: "#1a1a2e" }}>Checkout</Typography>
			</Stack>

			<Grid container spacing={3} alignItems="flex-start">

				{/* ════ LEFT — Address Form ════ */}
				<Grid item xs={12} sm={6} lg={4}>
					<Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e8e8f0", overflow: "hidden", background: "#fff" }}>

						{/* Purple header */}
						<Box sx={{ background: "linear-gradient(135deg, #5b21b6 0%, #4338ca 100%)", px: 3, py: 2 }}>
							<Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>
								Complete your order by filling in the details and clicking the order button.
							</Typography>
						</Box>

						<Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

							{/* Full Name */}
							<Box>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 0.8 }}>
									Full Name <span style={{ color: "#ef4444" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									size="small"
									placeholder="Enter your full name"
									value={fullName}
									onChange={(e) => setFullName(e.target.value)}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<PersonIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
											</InputAdornment>
										),
									}}
									sx={fieldSx}
								/>
							</Box>

							{/* Phone */}
							<Box>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 0.8 }}>
									Phone Number <span style={{ color: "#ef4444" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									size="small"
									placeholder="Enter your mobile number"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<PhoneIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
											</InputAdornment>
										),
									}}
									sx={fieldSx}
								/>
							</Box>

							{/* Address */}
							<Box>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 0.8 }}>
									Full Address <span style={{ color: "#ef4444" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									size="small"
									placeholder="Enter your full address"
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<LocationOnIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
											</InputAdornment>
										),
									}}
									sx={fieldSx}
								/>
							</Box>

							{/* Delivery Area */}
							<Box>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 0.8 }}>
									Select Delivery Area <span style={{ color: "#ef4444" }}>*</span>
								</Typography>
								<Select
									fullWidth
									size="small"
									value={deliveryArea.label}
									onChange={(e) => setDeliveryArea(DELIVERY_AREAS.find((a) => a.label === e.target.value))}
									startAdornment={
										<InputAdornment position="start">
											<LocalShippingIcon sx={{ fontSize: 18, color: "#9ca3af", mr: 0.5 }} />
										</InputAdornment>
									}
									sx={{
										borderRadius: 2,
										fontSize: 14,
										"& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
										"&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
										"&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
									}}
								>
									{DELIVERY_AREAS.map((a) => (
										<MenuItem key={a.label} value={a.label} sx={{ fontSize: 14 }}>
											{a.label} — {money(a.charge)}
										</MenuItem>
									))}
								</Select>
							</Box>

							{/* Payment Method */}
							<Box>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1 }}>
									Payment Method
								</Typography>
								<RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
									<Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, px: 2, py: 1, mb: 1 }}>
										<FormControlLabel
											value="cod"
											control={<Radio size="small" sx={{ color: "#6366f1", "&.Mui-checked": { color: "#6366f1" } }} />}
											label={<Typography sx={{ fontSize: 14, fontWeight: 700 }}>Cash on delivery</Typography>}
										/>
										{paymentMethod === "cod" && (
											<Typography sx={{ fontSize: 12, color: "#6b7280", ml: 4, mb: 0.5 }}>
												Pay with cash upon delivery.
											</Typography>
										)}
									</Paper>
								</RadioGroup>
								<Typography sx={{ fontSize: 11, color: "#6b7280", mt: 0.5 }}>
									This data will be used to process your order, support your experience throughout this website.
								</Typography>
							</Box>

							{/* Place Order */}
							<Button
								variant="contained"
								fullWidth
								size="large"
								disabled={loadingCheckout || !cartItems.length}
								onClick={handlePlaceOrder}
								sx={{
									borderRadius: 2,
									textTransform: "none",
									fontWeight: 900,
									fontSize: 15,
									py: 1.5,
									background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
									boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
									"&:hover": { background: "linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)", boxShadow: "0 6px 20px rgba(99,102,241,0.45)" },
									"&.Mui-disabled": { opacity: 0.5, background: "#e5e7eb", color: "#9ca3af" },
								}}
							>
								{loadingCheckout ? (
									<Stack direction="row" spacing={1} alignItems="center">
										<CircularProgress size={16} color="inherit" />
										<span>Placing Order…</span>
									</Stack>
								) : "Place Order"}
							</Button>

						</Box>
					</Paper>
				</Grid>

				{/* ════ RIGHT — Order Information ════ */}
				<Grid item xs={12} sm={7} lg={8}>
					<Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e8e8f0", background: "#fff" }}>

						<Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
							<Typography sx={{ fontWeight: 900, fontSize: 17, color: "#1a1a2e" }}>
								Order Information
							</Typography>
						</Box>

						{/* Cart table */}
						{cartLoading ? (
							<Box sx={{ p: 3 }}><LinearProgress /></Box>
						) : cartItems.length === 0 ? (
							<Box sx={{ p: 4, textAlign: "center" }}>
								<Typography sx={{ color: "#9ca3af", fontWeight: 700 }}>Your cart is empty.</Typography>
							</Box>
						) : (
							<TableContainer>
								<Table size="small">
									<TableHead>
										<TableRow sx={{ background: "#f9fafb" }}>
											{["Delete", "Product", "Quantity", "Price"].map((h) => (
												<TableCell key={h} align={h === "Price" ? "right" : h === "Quantity" ? "center" : "center"}
													sx={{ fontWeight: 900, fontSize: 13, color: "#374151", borderBottom: "1px solid #e5e7eb", py: 1.5 }}>
													{h}
												</TableCell>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{cartItems.map((it) => {
											const imgSrc = it?.product?.primary_image?.file_name
												? `${imgBaseUrl}/${it.product.primary_image.file_name}`
												: null;
											const linePrice =
												it?.line_total ?? it?.total ??
												(it?.qty || 1) * Number(it?.product?.unit_price ?? it?.product?.price ?? 0);
											const isProc = processing[it.id];
											return (
												<TableRow key={it.id} sx={{ "&:hover": { background: "#fafafa" }, position: "relative" }}>
													{/* Delete */}
													<TableCell align="center" sx={{ borderBottom: "1px solid #f3f4f6", width: 48 }}>
														<IconButton size="small" onClick={() => handleDeleteItem(it)} disabled={isProc}
															sx={{ color: "#ef4444", background: "#fef2f2", borderRadius: 1.5, width: 30, height: 30,
																"&:hover": { background: "#fee2e2" } }}>
															<DeleteOutlineIcon sx={{ fontSize: 16 }} />
														</IconButton>
													</TableCell>

													{/* Product */}
													<TableCell sx={{ borderBottom: "1px solid #f3f4f6" }}>
														<Stack direction="row" spacing={1.2} alignItems="center">
															<Avatar src={imgSrc} variant="rounded"
																sx={{ width: 44, height: 44, borderRadius: 1.5, border: "1px solid #e5e7eb",
																	background: "#f3f4f6", "& img": { objectFit: "cover" } }} />
															<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937",
																maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
																{it.product?.name || "Item"}
															</Typography>
														</Stack>
													</TableCell>

													{/* Quantity */}
													<TableCell align="center" sx={{ borderBottom: "1px solid #f3f4f6", width: 110 }}>
														<Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
															<IconButton size="small" disabled={isProc || (it.qty || 1) <= 1}
																onClick={() => handleUpdateQty(it, (it.qty || 1) - 1)}
																sx={{ width: 26, height: 26, border: "1px solid #e5e7eb", borderRadius: 1,
																	"&:hover": { background: "#f3f4f6" } }}>
																<Typography sx={{ fontSize: 16, lineHeight: 1, color: "#374151" }}>−</Typography>
															</IconButton>
															<Box sx={{ minWidth: 28, height: 26, border: "1px solid #e5e7eb", borderRadius: 1,
																display: "grid", placeItems: "center", fontSize: 13, fontWeight: 900, color: "#1f2937" }}>
																{it.qty || 1}
															</Box>
															<IconButton size="small" disabled={isProc}
																onClick={() => handleUpdateQty(it, (it.qty || 1) + 1)}
																sx={{ width: 26, height: 26, border: "1px solid #e5e7eb", borderRadius: 1,
																	"&:hover": { background: "#f3f4f6" } }}>
																<Typography sx={{ fontSize: 16, lineHeight: 1, color: "#374151" }}>+</Typography>
															</IconButton>
														</Stack>
													</TableCell>

													{/* Price */}
													<TableCell align="right" sx={{ borderBottom: "1px solid #f3f4f6", width: 80 }}>
														<Typography sx={{ fontSize: 13, fontWeight: 900, color: "#1f2937" }}>
															{money(linePrice)}
														</Typography>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</TableContainer>
						)}

						{/* Summary */}
						{cartItems.length > 0 && (
							<Box sx={{ px: 3, pb: 3, pt: 1 }}>
								<Divider sx={{ mb: 2 }} />

								<Stack spacing={1.2} sx={{ mb: 2 }}>
									{[
										{ label: "Subtotal", value: money(subtotal) },
										{ label: "Discount", value: money(discount) },
										{ label: "Delivery Charge", value: money(deliveryArea.charge) },
									].map(({ label, value }) => (
										<Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
											<Typography sx={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{label}</Typography>
											<Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1f2937" }}>{value}</Typography>
										</Stack>
									))}

									{/* Reseller Profit highlight */}
									{resellerProfit > 0 && (
										<Box sx={{
											display: "flex", justifyContent: "space-between", alignItems: "center",
											background: "linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)",
											border: "1px solid #86efac", borderRadius: 2, px: 2, py: 1,
										}}>
											<Stack direction="row" spacing={0.8} alignItems="center">
												<Typography sx={{ fontSize: 13, fontWeight: 900, color: "#15803d" }}>
													💰 Your Profit
												</Typography>
											</Stack>
											<Typography sx={{ fontSize: 15, fontWeight: 900, color: "#16a34a" }}>
												+{money(resellerProfit)}
											</Typography>
										</Box>
									)}

									<Divider />
									<Stack direction="row" justifyContent="space-between" alignItems="center">
										<Typography sx={{ fontSize: 15, fontWeight: 900, color: "#1f2937" }}>Grand Total</Typography>
										<Typography sx={{ fontSize: 15, fontWeight: 900, color: "#4f46e5" }}>{money(grandTotal)}</Typography>
									</Stack>
								</Stack>

								{/* Coupon */}
								<Stack direction="row" spacing={1} alignItems="center">
									<TextField
										fullWidth
										size="small"
										placeholder="Apply Coupon"
										value={coupon}
										onChange={(e) => setCoupon(e.target.value)}
										disabled={couponApplied}
										sx={{
											"& .MuiOutlinedInput-root": {
												borderRadius: 2, fontSize: 14,
												"& fieldset": { borderColor: "#e5e7eb" },
												"&:hover fieldset": { borderColor: "#6366f1" },
												"&.Mui-focused fieldset": { borderColor: "#6366f1" },
											},
										}}
									/>
									<Button
										variant="contained"
										onClick={handleApplyCoupon}
										disabled={couponApplied}
										sx={{
											borderRadius: 2, textTransform: "none", fontWeight: 900, fontSize: 13,
											px: 2.5, whiteSpace: "nowrap", flexShrink: 0,
											background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
											boxShadow: "none", "&:hover": { boxShadow: "none", opacity: 0.9 },
										}}
									>
										APPLY
									</Button>
								</Stack>
							</Box>
						)}
					</Paper>
				</Grid>
			</Grid>

			{/* Snackbar */}
			<Snackbar
				open={!!msg.text}
				autoHideDuration={3000}
				onClose={() => setMsg({ text: "", severity: "info" })}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert severity={msg.severity} onClose={() => setMsg({ text: "", severity: "info" })}
					sx={{ borderRadius: 3, fontWeight: 800, boxShadow: 3 }}>
					{msg.text}
				</Alert>
			</Snackbar>
		</Box>
	);
};

const fieldSx = {
	"& .MuiOutlinedInput-root": {
		borderRadius: 2,
		fontSize: 14,
		"& fieldset": { borderColor: "#e5e7eb" },
		"&:hover fieldset": { borderColor: "#6366f1" },
		"&.Mui-focused fieldset": { borderColor: "#6366f1" },
	},
};


export default CheckoutPage;
