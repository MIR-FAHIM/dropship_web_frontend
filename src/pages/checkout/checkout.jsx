import React, { useEffect, useMemo, useState } from "react";
import {
	Alert,
	Avatar,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
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
	DeleteOutline as DeleteOutlineIcon,
	LocalShipping as LocalShippingIcon,
	Person as PersonIcon,
	Phone as PhoneIcon,
	LocationOn as LocationOnIcon,
	Edit as EditIcon,
	CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { Chip } from "@mui/material";
import { toast } from "sonner";
import {
	useCheckoutOrderMutation,
	useCheckAdvanceRequirementQuery,
} from "../../redux/features/order";
import {
	useGetCartQuery,
	useUpdateCartMutation,
	useDeleteCartMutation,
} from "../../redux/features/cart";
import { imgBaseUrl } from "../../../config";
import {
	useGetDivisionsQuery,
	useGetDistrictsQuery,
	useGetUpazilasQuery,
	useCalculateDeliveryChargeQuery,
} from "../../redux/features/address";
import { getAdminBasePrice, getResellerSellingPrice } from "../../utils/pricing.utils";
import { appendLocationToAddress } from "../../utils/address.utils";
import CheckoutOrderGuide from "./CheckoutOrderGuide";

const safeArray = (v) => (Array.isArray(v) ? v : []);

/* ══════════════════════════════════════
   Main Checkout Component
══════════════════════════════════════ */
const CheckoutPage = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const userId = useMemo(() => {
		const id = localStorage.getItem("userId");
		return id ? String(id) : null;
	}, []);

	// Phase 5: Quick Order state detection (from router state or sessionStorage fallback)
	const [quickOrderData, setQuickOrderData] = useState(() => {
		if (location.state?.quickOrderData) {
			return location.state.quickOrderData;
		}
		try {
			const saved = sessionStorage.getItem("quickOrderData");
			return saved ? JSON.parse(saved) : null;
		} catch {
			return null;
		}
	});

	// If quickOrderData was in router state, sync to sessionStorage
	useEffect(() => {
		if (location.state?.quickOrderData) {
			sessionStorage.setItem("quickOrderData", JSON.stringify(location.state.quickOrderData));
			setQuickOrderData(location.state.quickOrderData);
		}
	}, [location.state?.quickOrderData]);

	/* ── advance eligibility & states ── */
	const { data: advanceReqData } = useCheckAdvanceRequirementQuery(userId, { skip: !userId });
	const eligibility = advanceReqData?.data || {};
	const requiresAdvance = Boolean(eligibility.requires_advance);
	const completedOrdersCount = eligibility.completed_orders_count ?? 0;
	const availableWalletBalance = Number(eligibility.available_wallet_balance ?? 0);
	const minOrdersThreshold = eligibility.min_orders_threshold ?? 5;

	// Checkout mutation
	const [checkoutOrder, { isLoading: loadingCheckout }] = useCheckoutOrderMutation();

	// Alert / notification snackbar
	const [msg, setMsg] = useState({ text: "", severity: "info" });
	const notify = (text, severity = "info") => setMsg({ text, severity });

	/* ══════════════════════════════════════════════════════════
	   PHASE 5: TWO-STEP ORDER SUMMARY & CONFIRMATION VIEW
	══════════════════════════════════════════════════════════ */
	if (quickOrderData) {
		return (
			<QuickOrderConfirmationView
				quickOrderData={quickOrderData}
				setQuickOrderData={setQuickOrderData}
				userId={userId}
				eligibility={eligibility}
				requiresAdvance={requiresAdvance}
				completedOrdersCount={completedOrdersCount}
				availableWalletBalance={availableWalletBalance}
				minOrdersThreshold={minOrdersThreshold}
				checkoutOrder={checkoutOrder}
				loadingCheckout={loadingCheckout}
				notify={notify}
				msg={msg}
				setMsg={setMsg}
				navigate={navigate}
			/>
		);
	}

	/* ══════════════════════════════════════════════════════════
	   STANDARD MULTI-ITEM CART CHECKOUT VIEW (FALLBACK)
	══════════════════════════════════════════════════════════ */
	return (
		<StandardCartCheckoutView
			userId={userId}
			eligibility={eligibility}
			requiresAdvance={requiresAdvance}
			completedOrdersCount={completedOrdersCount}
			checkoutOrder={checkoutOrder}
			loadingCheckout={loadingCheckout}
			notify={notify}
			msg={msg}
			setMsg={setMsg}
			navigate={navigate}
		/>
	);
};

/* ══════════════════════════════════════════════════════════
   PHASE 5: STEP 3 CONFIRMATION VIEW COMPONENT
══════════════════════════════════════════════════════════ */
const QuickOrderConfirmationView = ({
	quickOrderData,
	setQuickOrderData,
	userId,
	requiresAdvance,
	completedOrdersCount,
	availableWalletBalance,
	minOrdersThreshold,
	checkoutOrder,
	loadingCheckout,
	notify,
	msg,
	setMsg,
	navigate,
}) => {
	const money = (n) => `৳${Number(n || 0).toLocaleString()}`;

	// Selected advance payment method: "later" or "wallet"
	const [advancePaymentChoice, setAdvancePaymentChoice] = useState("later");

	// In-place Edit Modal State
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editName, setEditName] = useState(quickOrderData.customerName || "");
	const [editPhone, setEditPhone] = useState(quickOrderData.customerPhone || "");
	const [editDivisionId, setEditDivisionId] = useState(quickOrderData.divisionId ? String(quickOrderData.divisionId) : "");
	const [editDistrictId, setEditDistrictId] = useState(quickOrderData.districtId ? String(quickOrderData.districtId) : "");
	const [editThanaId, setEditThanaId] = useState(quickOrderData.thanaId ? String(quickOrderData.thanaId) : "");
	const [editAddress, setEditAddress] = useState(quickOrderData.address || "");
	const [editNote, setEditNote] = useState(quickOrderData.note || "");
	const [editCollectionAmount, setEditCollectionAmount] = useState(String(quickOrderData.collectionAmount || ""));

	// Address cascades for Edit Modal
	const { data: divisionsData } = useGetDivisionsQuery();
	const divisions = safeArray(divisionsData?.data ?? divisionsData ?? []);

	const { data: districtsData } = useGetDistrictsQuery(editDivisionId, {
		skip: !editModalOpen || !editDivisionId,
	});
	const districts = safeArray(districtsData?.data ?? districtsData ?? []);

	const { data: upazilasData } = useGetUpazilasQuery(editDistrictId, {
		skip: !editModalOpen || !editDistrictId,
	});
	const upazilas = safeArray(upazilasData?.data ?? upazilasData ?? []);

	// Recalculate delivery charge in Edit Modal if district changes
	const vendorDistrictId =
		quickOrderData.product?.shop?.district_id ??
		quickOrderData.product?.vendor?.district_id ??
		quickOrderData.product?.vendor?.district?.id ??
		null;

	const {
		data: editChargeData,
		isLoading: editLoadingCharge,
		isFetching: editFetchingCharge,
	} = useCalculateDeliveryChargeQuery(
		{
			vendor_district_id: vendorDistrictId || undefined,
			customer_district_id: editDistrictId,
			division_id: editDivisionId,
		},
		{ skip: !editModalOpen || !editDistrictId }
	);

	const isEditCalculatingCharge = Boolean(editDistrictId && (editLoadingCharge || editFetchingCharge));
	const editHasCalculatedDelivery = Boolean(
		editDistrictId && !isEditCalculatingCharge && editChargeData?.data?.charge !== undefined
	);
	const activeEditDeliveryCharge = editHasCalculatedDelivery
		? Number(editChargeData?.data?.charge)
		: quickOrderData.deliveryCharge;
	const activeEditZone = editHasCalculatedDelivery
		? editChargeData?.data?.zone ?? ""
		: quickOrderData.deliveryZone;

	// Open Edit Modal
	const handleOpenEdit = () => {
		setEditName(quickOrderData.customerName || "");
		setEditPhone(quickOrderData.customerPhone || "");
		setEditDivisionId(quickOrderData.divisionId ? String(quickOrderData.divisionId) : "");
		setEditDistrictId(quickOrderData.districtId ? String(quickOrderData.districtId) : "");
		setEditThanaId(quickOrderData.thanaId ? String(quickOrderData.thanaId) : "");
		setEditAddress(quickOrderData.address || "");
		setEditNote(quickOrderData.note || "");
		setEditCollectionAmount(String(quickOrderData.collectionAmount || ""));
		setEditModalOpen(true);
	};

	// Save Edited Details
	const handleSaveEdit = () => {
		if (!editName.trim()) return notify("কাস্টমারের নাম প্রদান করুন", "warning");
		const cleanPhone = editPhone.trim();
		if (!cleanPhone || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
			return notify("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)", "warning");
		}
		if (!editDivisionId) return notify("বিভাগ নির্বাচন করুন", "warning");
		if (!editDistrictId) return notify("জেলা নির্বাচন করুন", "warning");
		if (!editThanaId) return notify("থানা / উপজেলা নির্বাচন করুন", "warning");
		if (!editAddress.trim() || editAddress.trim().length < 5) {
			return notify("বিস্তারিত ঠিকানা লিখুন (কমপক্ষে ৫ অক্ষর)", "warning");
		}

		const numCod = Number(editCollectionAmount) || 0;
		const numCodFee = Math.round(numCod * 0.01);
		const newProfit = numCod - quickOrderData.productCost - activeEditDeliveryCharge - numCodFee;

		if (numCod <= 0) return notify("কাস্টমার কালেকশন এমাউন্ট (COD) লিখুন", "warning");
		if (newProfit < 0) {
			return notify("কালেকশন এমাউন্ট প্রোডাক্ট ও ডেলিভারি খরচের চেয়ে বেশি হতে হবে", "warning");
		}

		const selDiv = divisions.find((d) => String(d.id) === String(editDivisionId));
		const selDist = districts.find((d) => String(d.id) === String(editDistrictId));
		const selThana = upazilas.find((u) => String(u.id) === String(editThanaId));

		const finalAddress = appendLocationToAddress(
			editAddress.trim(),
			selThana?.name || "",
			selDist?.name || ""
		);

		const updated = {
			...quickOrderData,
			customerName: editName.trim(),
			customerPhone: cleanPhone,
			divisionId: editDivisionId,
			divisionName: selDiv?.name || quickOrderData.divisionName,
			districtId: editDistrictId,
			districtName: selDist?.name || quickOrderData.districtName,
			thanaId: editThanaId,
			thanaName: selThana?.name || quickOrderData.thanaName,
			address: finalAddress,
			note: editNote.trim(),
			collectionAmount: numCod,
			deliveryCharge: activeEditDeliveryCharge,
			deliveryZone: activeEditZone,
			codFee: numCodFee,
			estimatedProfit: newProfit,
		};

		sessionStorage.setItem("quickOrderData", JSON.stringify(updated));
		setQuickOrderData(updated);
		setEditModalOpen(false);
		notify("অর্ডার তথ্য আপডেট করা হয়েছে!", "success");
	};

	// Reliability Balance Calculation
	const requiredMinimumBalance = requiresAdvance ? quickOrderData.deliveryCharge : 0;
	const shortfall = requiresAdvance ? Math.max(0, requiredMinimumBalance - availableWalletBalance) : 0;
	const canPayFromWallet = availableWalletBalance >= requiredMinimumBalance && requiredMinimumBalance > 0;

	// Final Confirmation: Submit Order
	const handleConfirmAndPlaceOrder = async () => {
		if (!userId) return notify("দয়া করে লগইন করুন।", "warning");
		if (loadingCheckout) return;

		try {
			const payload = {
				user_id: userId,
				customer_name: quickOrderData.customerName,
				customer_phone: quickOrderData.customerPhone,
				shipping_address: quickOrderData.address,
				division: quickOrderData.divisionName,
				district: quickOrderData.districtName,
				area: quickOrderData.thanaName,
				thana: quickOrderData.thanaName,
				zone: quickOrderData.deliveryZone,
				delivery_charge: quickOrderData.deliveryCharge,
				customer_collection_amount: quickOrderData.collectionAmount,
				collection_amount: quickOrderData.collectionAmount,
				note: quickOrderData.note || "",
				product_id: quickOrderData.product?.id,
				qty: quickOrderData.quantity || 1,
				attribute_id: quickOrderData.selectedAttributeId || null,
				items: [
					{
						product_id: quickOrderData.product?.id,
						qty: quickOrderData.quantity || 1,
						attribute_id: quickOrderData.selectedAttributeId || null,
					},
				],
			};

			if (requiresAdvance) {
				if (advancePaymentChoice === "wallet" && canPayFromWallet) {
					payload.advance_payment_method = "wallet";
					payload.pay_from_wallet = true;
					payload.advance_amount = quickOrderData.deliveryCharge;
				} else {
					payload.advance_payment_method = "pay_later";
					payload.pay_from_wallet = false;
					payload.advance_amount = quickOrderData.deliveryCharge;
				}
			}

			const res = await checkoutOrder(payload);
			const ok = res?.data?.status === "success" || res?.status === "success" || res?.status === 200 || res?.status === 201;

			if (ok) {
				const createdOrder = res?.data?.data || res?.data || {};
				const orderNum = createdOrder.order_number || "ORD";

				sessionStorage.removeItem("quickOrderData");
				notify(`অর্ডার জমা হয়েছে (#${orderNum})। এখন অ্যাডমিন যাচাই করবেন।`, "success");
				toast.success(`অর্ডার #${orderNum} যাচাইয়ের জন্য জমা হয়েছে।`);

				setTimeout(() => {
					navigate("/app/order");
				}, 1200);
			} else {
				const errMsg = res?.data?.message || res?.error?.data?.message || "অর্ডার প্লেস করা সম্ভব হয়নি।";
				notify(errMsg, "error");
				toast.error(errMsg);
			}
		} catch (err) {
			console.error("Quick order checkout error:", err);
			notify("অর্ডার প্লেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
		}
	};

	// Back to Edit: Returns to product/modal with state preserved
	const handleBackToEdit = () => {
		navigate(-1);
	};

	const prodImg = (() => {
		if (quickOrderData.product?.primary_image?.url) return quickOrderData.product.primary_image.url;
		if (quickOrderData.product?.primary_image?.file_name)
			return `${imgBaseUrl}/${quickOrderData.product.primary_image.file_name}`;
		if (typeof quickOrderData.product?.thumbnail_img === "string")
			return quickOrderData.product.thumbnail_img;
		return null;
	})();

	return (
		<Box sx={{ minHeight: "100vh", background: "#f8fafc", p: { xs: 1.5, sm: 3 } }}>
			<CheckoutOrderGuide onBack={handleBackToEdit} quick />

			<Grid container spacing={3}>
				{/* ════════ LEFT COLUMN: Summary Sections A, B & D ════════ */}
				<Grid item xs={12} lg={7} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
					{/* SECTION A: PRODUCT SUMMARY */}
					<Paper
						elevation={0}
						sx={{
							borderRadius: 3,
							border: "1px solid #e2e8f0",
							p: 2.5,
							background: "#ffffff",
						}}
					>
						<Typography sx={{ fontSize: 14, fontWeight: 900, color: "#1e293b", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
							অর্ডারের পণ্য
						</Typography>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }} sx={{ p: 2, borderRadius: 2, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
							{prodImg ? (
								<Avatar
									src={prodImg}
									variant="rounded"
									sx={{ width: 72, height: 72, borderRadius: 2, border: "1px solid #e2e8f0" }}
								/>
							) : (
								<Box sx={{ width: 72, height: 72, borderRadius: 2, background: "#e2e8f0", display: "grid", placeItems: "center" }}>
									📦
								</Box>
							)}

							<Box sx={{ flex: 1 }}>
								<Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.4 }}>
									{quickOrderData.product?.name || "Product"}
								</Typography>
								<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 0.8 }}>
									<Typography sx={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "#e2e8f0", px: 1, py: 0.3, borderRadius: 1 }}>
										SKU: {quickOrderData.product?.sku || quickOrderData.product?.id || "N/A"}
									</Typography>
									{quickOrderData.selectedAttributeLabel && (
										<Typography sx={{ fontSize: 11, fontWeight: 700, color: "#4338ca", background: "#ede9fe", px: 1, py: 0.3, borderRadius: 1 }}>
											{quickOrderData.selectedAttributeLabel}
										</Typography>
									)}
								</Stack>
							</Box>

							<Box sx={{ textAlign: { xs: "left", sm: "right" }, minWidth: 120 }}>
								<Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>
									বেস প্রাইস: {money(quickOrderData.basePrice)} × {quickOrderData.quantity}
								</Typography>
								<Typography sx={{ fontSize: 15, fontWeight: 900, color: "#0f172a", mt: 0.2 }}>
									মোট খরচ: {money(quickOrderData.productCost)}
								</Typography>
							</Box>
						</Stack>
					</Paper>

					{/* SECTION B: CUSTOMER & DELIVERY SUMMARY */}
					<Paper
						elevation={0}
						sx={{
							borderRadius: 3,
							border: "1px solid #e2e8f0",
							p: 2.5,
							background: "#ffffff",
						}}
					>
						<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
							<Typography sx={{ fontSize: 14, fontWeight: 900, color: "#1e293b", display: "flex", alignItems: "center", gap: 1 }}>
								কাস্টমারের তথ্য ও ডেলিভারি
							</Typography>
							<Button
								size="small"
								startIcon={<EditIcon sx={{ fontSize: 15 }} />}
								onClick={handleOpenEdit}
								sx={{
									textTransform: "none",
									fontSize: 12,
									fontWeight: 800,
									color: "#2563eb",
									background: "#eff6ff",
									borderRadius: 1.5,
									px: 1.5,
									"&:hover": { background: "#dbeafe" },
								}}
							>
								তথ্য বদলান
							</Button>
						</Stack>

						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Box sx={{ p: 1.8, borderRadius: 2, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
									<Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b", mb: 0.5 }}>
										কাস্টমারের নাম
									</Typography>
									<Typography sx={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a" }}>
										{quickOrderData.customerName}
									</Typography>
								</Box>
							</Grid>

							<Grid item xs={12} sm={6}>
								<Box sx={{ p: 1.8, borderRadius: 2, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
									<Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b", mb: 0.5 }}>
										মোবাইল নম্বর
									</Typography>
									<Typography sx={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a" }}>
										{quickOrderData.customerPhone}
									</Typography>
								</Box>
							</Grid>

							<Grid item xs={12}>
								<Box sx={{ p: 1.8, borderRadius: 2, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
									<Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b", mb: 0.5 }}>
										লোকেশন হায়ারার্কি (Division &gt; District &gt; Thana)
									</Typography>
									<Typography sx={{ fontSize: 13, fontWeight: 800, color: "#4338ca" }}>
										{quickOrderData.divisionName} ➔ {quickOrderData.districtName} ➔ {quickOrderData.thanaName}
									</Typography>
								</Box>
							</Grid>

							<Grid item xs={12}>
								<Box sx={{ p: 1.8, borderRadius: 2, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
									<Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b", mb: 0.5 }}>
										সম্পূর্ণ ডেলিভারি ঠিকানা
									</Typography>
									<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
										{quickOrderData.address}
									</Typography>
								</Box>
							</Grid>

							{quickOrderData.note && (
								<Grid item xs={12}>
									<Box sx={{ p: 1.5, borderRadius: 2, background: "#fffbeb", border: "1px solid #fef3c7" }}>
										<Typography sx={{ fontSize: 11, fontWeight: 700, color: "#92400e", mb: 0.3 }}>
											অর্ডার নোট:
										</Typography>
										<Typography sx={{ fontSize: 12, fontWeight: 600, color: "#78350f" }}>
											{quickOrderData.note}
										</Typography>
									</Box>
								</Grid>
							)}
						</Grid>
					</Paper>

					{/* SECTION D: RELIABILITY BALANCE SUMMARY */}
					<Paper
						elevation={0}
						sx={{
							borderRadius: 3,
							border: "1px solid #fed7aa",
							p: 2.5,
							background: "#fffaf5",
						}}
					>
						<Typography sx={{ fontSize: 14, fontWeight: 900, color: "#9a3412", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
							রিলায়েবিলিটি ব্যালেন্স
						</Typography>

						<Grid container spacing={2} sx={{ mb: 2 }}>
							<Grid item xs={6} sm={3}>
								<Box sx={{ p: 1.5, borderRadius: 2, background: "#fff", border: "1px solid #fed7aa", textAlign: "center" }}>
									<Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#78350f" }}>বর্তমান ওয়ালেট ব্যালেন্স</Typography>
									<Typography sx={{ fontSize: 14, fontWeight: 900, color: "#0f172a", mt: 0.3 }}>
										{money(availableWalletBalance)}
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={6} sm={3}>
								<Box sx={{ p: 1.5, borderRadius: 2, background: "#fff", border: "1px solid #fed7aa", textAlign: "center" }}>
									<Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#78350f" }}>প্রয়োজনীয় ব্যালেন্স</Typography>
									<Typography sx={{ fontSize: 14, fontWeight: 900, color: "#0f172a", mt: 0.3 }}>
										{money(requiredMinimumBalance)}
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={6} sm={3}>
								<Box sx={{ p: 1.5, borderRadius: 2, background: "#fff", border: "1px solid #fed7aa", textAlign: "center" }}>
									<Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#78350f" }}>ঘাটতি (Shortfall)</Typography>
									<Typography sx={{ fontSize: 14, fontWeight: 900, color: shortfall > 0 ? "#dc2626" : "#16a34a", mt: 0.3 }}>
										{money(shortfall)}
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={6} sm={3}>
								<Box sx={{ p: 1.5, borderRadius: 2, background: "#fff", border: "1px solid #fed7aa", textAlign: "center" }}>
									<Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#78350f" }}>অর্ডার কাউন্ট</Typography>
									<Typography sx={{ fontSize: 14, fontWeight: 900, color: "#0f172a", mt: 0.3 }}>
										{completedOrdersCount}/{minOrdersThreshold}
									</Typography>
								</Box>
							</Grid>
						</Grid>

						{/* Eligibility Indicator */}
						<Box sx={{ p: 2, borderRadius: 2, mb: 2, background: requiresAdvance ? (shortfall === 0 ? "#f0fdf4" : "#fefce8") : "#f0fdf4", border: `1px solid ${requiresAdvance ? (shortfall === 0 ? "#bbf7d0" : "#fef08a") : "#bbf7d0"}` }}>
							<Typography sx={{ fontSize: 12.5, fontWeight: 800, color: requiresAdvance ? (shortfall === 0 ? "#15803d" : "#854d0e") : "#15803d" }}>
								{!requiresAdvance
									? "✅ অর্ডার করার সম্পূর্ণ উপযুক্ত (Eligible): ৫+ সফল অর্ডার থাকায় আপনি ভেরিফাইড রিসেলার। কোনো সিকিউরিটি ব্যালেন্স প্রযোজ্য নয়।"
									: shortfall === 0
									? `✅ ব্যালেন্স উপযুক্ত (Eligible): ওয়ালেটে পর্যাপ্ত রিলায়েবিলিটি ব্যালেন্স (${money(availableWalletBalance)}) মজুদ রয়েছে।`
									: `⚠️ পে লেটার প্রযোজ্য (Pay Later Eligible): ওয়ালেটে ঘাটতি রয়েছে (${money(shortfall)}), তবে আপনি 'Pay Later' নির্বাচন করে অর্ডার প্লেস করতে পারবেন এবং ২৪ ঘণ্টার মধ্যে ক্লিয়ার করতে পারবেন।`}
							</Typography>
						</Box>

						{/* কাস্টমার যেভাবে টাকা দেবেন Selector for Advance (if required) */}
						{requiresAdvance && (
							<Box sx={{ mb: 2 }}>
								<Typography sx={{ fontSize: 12, fontWeight: 800, color: "#334155", mb: 1 }}>
									অগ্রিম ডেলিভারি ফি অপশন নির্বাচন করুন:
								</Typography>
								<RadioGroup
									row
									value={advancePaymentChoice}
									onChange={(e) => setAdvancePaymentChoice(e.target.value)}
								>
									<Paper
										elevation={0}
										sx={{
											border: `1px solid ${advancePaymentChoice === "later" ? "#6366f1" : "#e2e8f0"}`,
											borderRadius: 2,
											px: 2,
											py: 0.8,
											mr: 1.5,
											mb: 1,
											background: advancePaymentChoice === "later" ? "#f5f3ff" : "#fff",
										}}
									>
										<FormControlLabel
											value="later"
											control={<Radio size="small" sx={{ color: "#6366f1", "&.Mui-checked": { color: "#6366f1" } }} />}
											label={<Typography sx={{ fontSize: 12.5, fontWeight: 800 }}>পরে পরিশোধ (Pay Later)</Typography>}
										/>
									</Paper>

									<Paper
										elevation={0}
										sx={{
											border: `1px solid ${advancePaymentChoice === "wallet" ? "#6366f1" : "#e2e8f0"}`,
											borderRadius: 2,
											px: 2,
											py: 0.8,
											mb: 1,
											opacity: canPayFromWallet ? 1 : 0.5,
											background: advancePaymentChoice === "wallet" ? "#f5f3ff" : "#fff",
										}}
									>
										<FormControlLabel
											value="wallet"
											disabled={!canPayFromWallet}
											control={<Radio size="small" sx={{ color: "#6366f1", "&.Mui-checked": { color: "#6366f1" } }} />}
											label={
												<Typography sx={{ fontSize: 12.5, fontWeight: 800 }}>
													ওয়ালেট থেকে পরিশোধ ({money(availableWalletBalance)})
												</Typography>
											}
										/>
									</Paper>
								</RadioGroup>
							</Box>
						)}

						{/* Explanatory Policy Note */}
						<Box sx={{ p: 2, borderRadius: 2, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
							<Typography sx={{ fontSize: 11.5, color: "#166534", lineHeight: 1.5, fontWeight: 600 }}>
								ℹ️ <strong>গুরুত্বপূর্ণ তথ্য:</strong> রিলায়েবিলিটি ব্যালেন্স কোনো চার্জ বা ফি নয় — এটি আপনার অ্যাকাউন্ট সিকিউরিটি ব্যালেন্স। এটি কাস্টমারের COD থেকে কাটা হয় না এবং আপনার প্রফিট থেকেও কর্তন হয় না। সফল ডেলিভারির পর এই ব্যালেন্সটি সম্পূর্ণ ফেরত পাবেন অথবা সিকিউরিটি হিসেবে জমা রেখে <strong>যেকোনো সময় উইথড্র (উত্তোলন) করে নিতে পারবেন</strong>।
							</Typography>
						</Box>
					</Paper>
				</Grid>

				{/* ════════ RIGHT COLUMN: Financial Summary C & Confirmation E ════════ */}
				<Grid item xs={12} lg={5} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
					{/* SECTION C: FINANCIAL SUMMARY */}
					<Paper
						elevation={0}
						sx={{
							borderRadius: 3,
							border: "1px solid #e2e8f0",
							p: 3,
							background: "#ffffff",
						}}
					>
						<Typography sx={{ fontSize: 14, fontWeight: 900, color: "#1e293b", mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
							টাকার হিসাব
						</Typography>

						<Stack spacing={1.6}>
							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#475569" }}>
									কাস্টমার যে টাকা দেবেন (COD)
								</Typography>
								<Typography sx={{ fontSize: 15, fontWeight: 900, color: "#0f172a" }}>
									{money(quickOrderData.collectionAmount)}
								</Typography>
							</Stack>

							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#475569" }}>
									পণ্যের খরচ
								</Typography>
								<Typography sx={{ fontSize: 14, fontWeight: 800, color: "#dc2626" }}>
									- {money(quickOrderData.productCost)}
								</Typography>
							</Stack>

							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#475569" }}>
									ডেলিভারি চার্জ
								</Typography>
								<Typography sx={{ fontSize: 14, fontWeight: 800, color: "#dc2626" }}>
									- {money(quickOrderData.deliveryCharge)}
								</Typography>
							</Stack>

							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#475569" }}>
									COD ফি (১%)
								</Typography>
								<Typography sx={{ fontSize: 14, fontWeight: 800, color: "#dc2626" }}>
									- {money(quickOrderData.codFee)}
								</Typography>
							</Stack>

							<Divider sx={{ my: 1 }} />

							{/* Estimated Dropshipper Profit Highlight Card */}
							<Box
								sx={{
									p: 2,
									borderRadius: 2.5,
									background: quickOrderData.estimatedProfit >= 0
										? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
										: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
									border: `1.5px solid ${quickOrderData.estimatedProfit >= 0 ? "#86efac" : "#fca5a5"}`,
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<Box>
									<Typography sx={{ fontSize: 12.5, fontWeight: 900, color: quickOrderData.estimatedProfit >= 0 ? "#166534" : "#991b1b" }}>
										আপনার আনুমানিক লাভ
									</Typography>
									<Typography sx={{ fontSize: 10.5, color: quickOrderData.estimatedProfit >= 0 ? "#15803d" : "#b91c1c", mt: 0.2 }}>
										COD - প্রোডাক্ট খরচ - ডেলিভারি - COD ফি
									</Typography>
								</Box>
								<Typography sx={{ fontSize: 20, fontWeight: 900, color: quickOrderData.estimatedProfit >= 0 ? "#16a34a" : "#dc2626" }}>
									{quickOrderData.estimatedProfit >= 0 ? "+" : ""}{money(quickOrderData.estimatedProfit)}
								</Typography>
							</Box>
						</Stack>
					</Paper>

					{/* SECTION E: FINAL CONFIRMATION & ACTIONS */}
					<Paper
						elevation={0}
						sx={{
							borderRadius: 3,
							border: "1px solid #e2e8f0",
							p: 3,
							background: "#ffffff",
						}}
					>
						<Typography sx={{ fontSize: 14, fontWeight: 900, color: "#1e293b", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
							অর্ডার জমা দিন
						</Typography>

						<Typography sx={{ fontSize: 12, color: "#64748b", mb: 2.5, lineHeight: 1.5 }}>
							নাম, ফোন, ঠিকানা ও COD-এর অঙ্ক মিলিয়ে নিন। অর্ডার জমা হলে প্রথমে অ্যাডমিন যাচাই করবেন।
						</Typography>

						<Stack spacing={1.5}>
							{/* Confirm & Place Order Button */}
							<Button
								variant="contained"
								fullWidth
								size="large"
								disabled={loadingCheckout}
								onClick={handleConfirmAndPlaceOrder}
								sx={{
									borderRadius: 2.5,
									textTransform: "none",
									fontWeight: 900,
									fontSize: 15,
									py: 1.6,
									background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
									boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
									"&:hover": {
										background: "linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)",
										boxShadow: "0 6px 20px rgba(99,102,241,0.45)",
									},
									"&.Mui-disabled": {
										opacity: 0.6,
										background: "#e2e8f0",
										color: "#94a3b8",
									},
								}}
							>
								{loadingCheckout ? (
									<Stack direction="row" spacing={1} alignItems="center">
										<CircularProgress size={18} color="inherit" />
										<span>অর্ডার জমা হচ্ছে…</span>
									</Stack>
								) : (
									<Stack direction="row" spacing={1} alignItems="center">
										<span>অর্ডার নিশ্চিত করুন</span>
									</Stack>
								)}
							</Button>

							{/* Back to Edit Button */}
							<Button
								variant="outlined"
								fullWidth
								size="medium"
								disabled={loadingCheckout}
								onClick={handleOpenEdit}
								sx={{
									borderRadius: 2.5,
									textTransform: "none",
									fontWeight: 800,
									fontSize: 13.5,
									py: 1.2,
									color: "#475569",
									borderColor: "#cbd5e1",
									"&:hover": {
										background: "#f1f5f9",
										borderColor: "#94a3b8",
									},
								}}
							>
								তথ্য পরিবর্তন করুন
							</Button>
						</Stack>
					</Paper>
				</Grid>
			</Grid>

			{/* ════════ IN-PLACE EDIT MODAL ════════ */}
			<Dialog
				open={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
			>
				<DialogTitle sx={{ fontWeight: 900, fontSize: 16, color: "#0f172a", pb: 1 }}>
					✏️ কাস্টমারের তথ্য ও ডেলিভারি তথ্য সম্পাদনা করুন
				</DialogTitle>
				<DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
					<TextField
						label="কাস্টমারের পুরো নাম"
						size="small"
						fullWidth
						value={editName}
						onChange={(e) => setEditName(e.target.value)}
					/>
					<TextField
						label="মোবাইল নম্বর (১১ ডিজিট)"
						size="small"
						fullWidth
						value={editPhone}
						onChange={(e) => setEditPhone(e.target.value)}
						placeholder="01XXXXXXXXX"
					/>

					<Grid container spacing={1.5}>
						<Grid item xs={12} sm={4}>
							<Select
								size="small"
								fullWidth
								displayEmpty
								value={editDivisionId}
								onChange={(e) => {
									setEditDivisionId(e.target.value);
									setEditDistrictId("");
									setEditThanaId("");
								}}
							>
								<MenuItem value="" disabled>বিভাগ সিলেক্ট করুন</MenuItem>
								{divisions.map((d) => (
									<MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
								))}
							</Select>
						</Grid>
						<Grid item xs={12} sm={4}>
							<Select
								size="small"
								fullWidth
								displayEmpty
								disabled={!editDivisionId}
								value={editDistrictId}
								onChange={(e) => {
									setEditDistrictId(e.target.value);
									setEditThanaId("");
								}}
							>
								<MenuItem value="" disabled>জেলা সিলেক্ট করুন</MenuItem>
								{districts.map((d) => (
									<MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
								))}
							</Select>
						</Grid>
						<Grid item xs={12} sm={4}>
							<Select
								size="small"
								fullWidth
								displayEmpty
								disabled={!editDistrictId}
								value={editThanaId}
								onChange={(e) => setEditThanaId(e.target.value)}
							>
								<MenuItem value="" disabled>থানা সিলেক্ট করুন</MenuItem>
								{upazilas.map((u) => (
									<MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
								))}
							</Select>
						</Grid>
					</Grid>

					{editDistrictId && (
						<Box sx={{ p: 1.2, borderRadius: 1.5, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
							<span style={{ fontWeight: 600, color: "#64748b" }}>ডেলিভারি চার্জ:</span>
							{isEditCalculatingCharge ? (
								<span style={{ color: "#6366f1", fontWeight: 700 }}>গণনা হচ্ছে…</span>
							) : (
								<span style={{ color: "#4338ca", fontWeight: 800 }}>
									{money(activeEditDeliveryCharge)} ({activeEditZone})
								</span>
							)}
						</Box>
					)}

					<TextField
						label="বিস্তারিত ডেলিভারি ঠিকানা"
						size="small"
						fullWidth
						multiline
						rows={2}
						value={editAddress}
						onChange={(e) => setEditAddress(e.target.value)}
						onBlur={() => {
							const selDist = districts.find((d) => String(d.id) === String(editDistrictId));
							const selThana = upazilas.find((u) => String(u.id) === String(editThanaId));
							if (editAddress.trim() && (selThana?.name || selDist?.name)) {
								setEditAddress(appendLocationToAddress(editAddress, selThana?.name, selDist?.name));
							}
						}}
					/>

					<TextField
						label="অর্ডার নোট (Optional)"
						size="small"
						fullWidth
						value={editNote}
						onChange={(e) => setEditNote(e.target.value)}
					/>

					<TextField
						label="কাস্টমার যে টাকা দেবেন (COD)"
						size="small"
						type="number"
						fullWidth
						value={editCollectionAmount}
						onChange={(e) => setEditCollectionAmount(e.target.value)}
						InputProps={{
							startAdornment: <InputAdornment position="start">৳</InputAdornment>,
						}}
						helperText="নোট: ডেলিভারি চার্জসহ মোট টাকা লিখুন। আলাদা করে যোগ করতে হবে না।"
					/>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setEditModalOpen(false)} sx={{ textTransform: "none", fontWeight: 700 }}>
						বাতিল
					</Button>
					<Button
						variant="contained"
						onClick={handleSaveEdit}
						sx={{
							textTransform: "none",
							fontWeight: 800,
							borderRadius: 2,
							background: "#4f46e5",
							"&:hover": { background: "#4338ca" },
						}}
					>
						পরিবর্তন সংরক্ষণ করুন (Save Changes)
					</Button>
				</DialogActions>
			</Dialog>

			{/* Snackbar */}
			<Snackbar
				open={!!msg.text}
				autoHideDuration={3500}
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

/* ══════════════════════════════════════════════════════════
   STANDARD CART CHECKOUT VIEW (UNCHANGED FALLBACK)
══════════════════════════════════════════════════════════ */
const StandardCartCheckoutView = ({
	userId,
	requiresAdvance,
	completedOrdersCount,
	checkoutOrder,
	loadingCheckout,
	notify,
	msg,
	setMsg,
	navigate,
}) => {
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [selectedDivisionId, setSelectedDivisionId] = useState("");
	const [selectedDistrictId, setSelectedDistrictId] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("cod");
	const [coupon, setCoupon] = useState("");
	const [couponApplied, setCouponApplied] = useState(false);
	const [discount, setDiscount] = useState(0);
	const [note] = useState("");
	const [processing, setProcessing] = useState({});

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
	const calculatedSubtotal = cartItems.reduce(
		(sum, item) => sum + getResellerSellingPrice(item) * Number(item?.qty || 1),
		0
	);
	const calculatedBaseTotal = cartItems.reduce(
		(sum, item) => sum + getAdminBasePrice(item) * Number(item?.qty || 1),
		0
	);
	const subtotal = calculatedSubtotal;
	const resellerProfit = calculatedSubtotal - calculatedBaseTotal;

	const vendorDistrict = useMemo(
		() => cartItems.find((it) => it?.shop?.district)?.shop?.district ?? null,
		[cartItems]
	);
	const vendorDistrictId = vendorDistrict?.id ?? null;
	const vendorDistrictName = vendorDistrict?.name ?? "";

	useEffect(() => {
		const total = cart?.total_items ?? cartItems.length;
		localStorage.setItem("cart", JSON.stringify(Number(total || 0)));
		window.dispatchEvent(new Event("cart-updated"));
	}, [cart?.total_items, cartItems.length]);

	const [updateCart] = useUpdateCartMutation();
	const [deleteCart] = useDeleteCartMutation();

	const { data: divisionsData } = useGetDivisionsQuery();
	const { data: districtsData } = useGetDistrictsQuery(selectedDivisionId, {
		skip: !selectedDivisionId,
	});
	const divisions = divisionsData?.data ?? [];
	const districts = districtsData?.data ?? [];

	const {
		data: deliveryChargeData,
		isLoading: loadingCharge,
		isFetching: fetchingCharge,
		error: chargeError,
	} = useCalculateDeliveryChargeQuery(
		{
			vendor_district_id: vendorDistrictId || undefined,
			customer_district_id: selectedDistrictId,
			division_id: selectedDivisionId,
		},
		{ skip: !selectedDistrictId }
	);
	const isCalculatingCharge = Boolean(selectedDistrictId && (loadingCharge || fetchingCharge));
	const hasCalculatedDelivery = Boolean(
		selectedDistrictId &&
			!isCalculatingCharge &&
			!chargeError &&
			deliveryChargeData?.data?.charge !== undefined
	);
	const deliveryCharge = hasCalculatedDelivery ? Number(deliveryChargeData?.data?.charge) : 0;
	const deliveryZone = deliveryChargeData?.data?.zone ?? "";
	const advanceAmount = deliveryCharge;
	const grandTotal = subtotal - discount + deliveryCharge;

	const handleUpdateQty = async (item, newQty) => {
		if (newQty < 1) return;
		setProcessing((p) => ({ ...p, [item.id]: true }));
		try {
			const res = await updateCart({ itemId: item.id, qty: newQty });
			const ok = res?.data?.status === "success" || res?.status === 200;
			if (ok) await refetchCart();
			else notify(res?.data?.message || "Failed to update", "error");
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
			const ok = res?.data?.status === "success" || res?.status === 200;
			if (ok) await refetchCart();
			else notify(res?.data?.message || "Failed to remove", "error");
		} catch {
			notify("Error removing item", "error");
		} finally {
			setProcessing((p) => ({ ...p, [item.id]: false }));
		}
	};

	const handleApplyCoupon = () => {
		if (!coupon.trim()) return;
		notify("Coupon not recognised", "warning");
	};

	const handlePlaceOrder = async () => {
		if (!userId) return notify("Please login to place an order.", "warning");
		if (!cartItems.length) return notify("আপনার কার্টে কোনো পণ্য নেই।", "warning");
		if (!fullName.trim()) return notify("Please enter Customer full name.", "warning");
		if (!phone.trim()) return notify("Please enter Customer phone number.", "warning");
		if (!address.trim()) return notify("Please enter Customer full address.", "warning");
		if (!selectedDivisionId) return notify("Please select Customer division.", "warning");
		if (!selectedDistrictId) return notify("Please select Customer district.", "warning");
		if (isCalculatingCharge) return notify("Please wait while delivery charge is calculating…", "warning");
		if (!hasCalculatedDelivery || deliveryCharge <= 0) {
			return notify("Please select Customer district to calculate the delivery charge.", "warning");
		}

		try {
			const distObj = districts.find((d) => String(d.id) === String(selectedDistrictId));
			const finalAddress = appendLocationToAddress(address.trim(), "", distObj?.name || "");

			const payload = {
				user_id: userId,
				customer_name: fullName.trim(),
				customer_phone: phone.trim(),
				shipping_address: finalAddress,
				zone: deliveryZone,
				district: distObj?.name || "",
				delivery_charge: deliveryCharge,
				payment_method: paymentMethod,
				note: note || "",
			};

			if (requiresAdvance) {
				payload.advance_payment_method = "pay_later";
				payload.advance_amount = advanceAmount;
			}

			const res = await checkoutOrder(payload);
			const ok = res?.data?.status === "success" || res?.status === "success" || res?.status === 200;

			if (ok) {
				notify("অর্ডার জমা হয়েছে। এখন অ্যাডমিন যাচাই করবেন।", "success");
				localStorage.setItem("cart", JSON.stringify(0));
				window.dispatchEvent(new Event("cart-updated"));
				setTimeout(() => navigate("/app/order"), 1200);
			} else {
				notify(res?.data?.message || "Failed to place order.", "error");
			}
		} catch {
			notify("Error placing order.", "error");
		}
	};

	const money = (n) => `৳${Number(n || 0).toLocaleString()}`;

	return (
		<Box sx={{ minHeight: "100vh", background: "#f5f6fa", p: { xs: 1.5, sm: 2.5 } }}>
			<CheckoutOrderGuide onBack={() => navigate(-1)} />

			<Grid container spacing={3} alignItems="flex-start">
				<Grid item xs={12} md={5} lg={4}>
					<Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e8e8f0", overflow: "hidden", background: "#fff" }}>
						<Box sx={{ background: "linear-gradient(135deg, #5b21b6 0%, #4338ca 100%)", px: 3, py: 2 }}>
							<Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>
								কাস্টমারের তথ্য ও ডেলিভারি
							</Typography>
						</Box>

						<Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
							<Box>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 0.8 }}>
									কাস্টমারের নাম <span style={{ color: "#ef4444" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									size="small"
									placeholder="কাস্টমারের পুরো নাম লিখুন"
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

							<Box>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 0.8 }}>
									কাস্টমারের ফোন নম্বর <span style={{ color: "#ef4444" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									size="small"
									placeholder="যেমন: 01XXXXXXXXX"
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

							<Box>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 0.8 }}>
									সম্পূর্ণ ঠিকানা <span style={{ color: "#ef4444" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									size="small"
									placeholder="বাড়ি, রাস্তা বা গ্রামের নাম লিখুন"
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									onBlur={() => {
										const distObj = districts.find((d) => String(d.id) === String(selectedDistrictId));
										if (address.trim() && distObj?.name) {
											setAddress(appendLocationToAddress(address, "", distObj.name));
										}
									}}
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

							<Box>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 0.8 }}>
									বিভাগ <span style={{ color: "#ef4444" }}>*</span>
								</Typography>
								<Select
									fullWidth
									size="small"
									displayEmpty
									value={selectedDivisionId}
									onChange={(e) => {
										setSelectedDivisionId(e.target.value);
										setSelectedDistrictId("");
									}}
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
									<MenuItem value="" disabled sx={{ fontSize: 14, color: "#9ca3af" }}>বিভাগ নির্বাচন করুন</MenuItem>
									{divisions.map((d) => (
										<MenuItem key={d.id} value={d.id} sx={{ fontSize: 14 }}>{d.name}</MenuItem>
									))}
								</Select>
							</Box>

							<Box>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 0.8 }}>
									জেলা <span style={{ color: "#ef4444" }}>*</span>
								</Typography>
								<Select
									fullWidth
									size="small"
									displayEmpty
									disabled={!selectedDivisionId}
									value={selectedDistrictId}
									onChange={(e) => setSelectedDistrictId(e.target.value)}
									sx={{
										borderRadius: 2,
										fontSize: 14,
										"& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
										"&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
										"&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#6366f1" },
									}}
								>
									<MenuItem value="" disabled sx={{ fontSize: 14, color: "#9ca3af" }}>জেলা নির্বাচন করুন</MenuItem>
									{districts.map((d) => (
										<MenuItem key={d.id} value={d.id} sx={{ fontSize: 14 }}>{d.name}</MenuItem>
									))}
								</Select>
								{vendorDistrictName && (
									<Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.6 }}>
										<Typography sx={{ fontSize: 12, color: "#6b7280" }}>ভেন্ডরের জেলা:</Typography>
										<Typography sx={{ fontSize: 12, fontWeight: 800, color: "#374151" }}>{vendorDistrictName}</Typography>
									</Box>
								)}
								{selectedDistrictId && (
									<Box sx={{
										mt: 1, borderRadius: 2, px: 2, py: 1.2,
										background: isCalculatingCharge ? "#f9fafb" : "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)",
										border: `1px solid ${isCalculatingCharge ? "#e5e7eb" : "#a5b4fc"}`,
										display: "flex", alignItems: "center", justifyContent: "space-between"
									}}>
										{isCalculatingCharge ? (
											<Stack direction="row" spacing={1} alignItems="center">
												<CircularProgress size={14} sx={{ color: "#6366f1" }} />
												<Typography sx={{ fontSize: 13, color: "#6b7280" }}>ডেলিভারি চার্জ হিসাব করা হচ্ছে…</Typography>
											</Stack>
										) : chargeError || !hasCalculatedDelivery ? (
											<Typography sx={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
												ডেলিভারি চার্জ হিসাব করা যায়নি। জেলা আবার নির্বাচন করুন।
											</Typography>
										) : (
											<>
												<Stack direction="row" spacing={0.8} alignItems="center">
													<LocalShippingIcon sx={{ fontSize: 16, color: "#6366f1" }} />
													<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#4338ca" }}>
														{deliveryZone || "ডেলিভারি চার্জ"}
													</Typography>
												</Stack>
												<Typography sx={{ fontSize: 14, fontWeight: 900, color: "#4f46e5" }}>
													{money(deliveryCharge)}
												</Typography>
											</>
										)}
									</Box>
								)}
							</Box>

							<Box>
								<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 1 }}>
									কাস্টমার যেভাবে টাকা দেবেন
								</Typography>
								<RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
									<Paper elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, px: 2, py: 1, mb: 1 }}>
										<FormControlLabel
											value="cod"
											control={<Radio size="small" sx={{ color: "#6366f1", "&.Mui-checked": { color: "#6366f1" } }} />}
											label={<Typography sx={{ fontSize: 14, fontWeight: 700 }}>ক্যাশ অন ডেলিভারি (COD)</Typography>}
										/>
										{paymentMethod === "cod" && (
											<Typography sx={{ fontSize: 12, color: "#6b7280", ml: 4, mb: 0.5 }}>
												পণ্য হাতে পেলে কাস্টমার ডেলিভারি কর্মীকে টাকা দেবেন।
											</Typography>
										)}
									</Paper>
								</RadioGroup>
							</Box>

							{requiresAdvance && (
								<Box sx={{ mb: 2.5, p: 2, borderRadius: 2, border: "1px solid #fed7aa", background: "#fffbeb" }}>
									<Typography sx={{ fontSize: 13, fontWeight: 900, color: "#9a3412", mb: 0.5 }}>
										⚠️ অগ্রিম ডেলিভারি চার্জ আবশ্যক ({money(advanceAmount)})
									</Typography>
									<Typography sx={{ fontSize: 11.5, color: "#78350f", mb: 1.5, lineHeight: 1.4 }}>
										নতুন ড্রপশিপার হিসেবে প্রথম ৫টি অর্ডারের ডেলিভারি ফি অগ্রিম প্রদান আবশ্যক। আপনার সম্পন্ন অর্ডার: <strong>{completedOrdersCount}/5</strong>
									</Typography>
									<Paper elevation={0} sx={{ border: "1px solid #6366f1", borderRadius: 2, px: 1.5, py: 1, background: "#f5f3ff" }}>
										<FormControlLabel
											value="later"
											checked={true}
											control={<Radio size="small" checked sx={{ color: "#6366f1", "&.Mui-checked": { color: "#6366f1" } }} />}
											label={<Typography sx={{ fontSize: 13, fontWeight: 700 }}>পরে পরিশোধ করুন (Pay Later)</Typography>}
										/>
										<Typography sx={{ fontSize: 11, color: "#6b7280", ml: 3.5, mt: 0.2 }}>
											অর্ডারটি জমা হবে এবং আপনি Order Details পেজ থেকে ২৪ ঘণ্টার মধ্যে অগ্রিম ডেলিভারি চার্জ পরিশোধ করতে পারবেন।
										</Typography>
									</Paper>
								</Box>
							)}

							<Typography sx={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
								অর্ডার জমা হলে অ্যাডমিন যাচাই করবেন। এরপর অর্ডার তালিকা থেকে অগ্রগতি দেখতে পারবেন।
							</Typography>
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
										<span>অর্ডার জমা হচ্ছে…</span>
									</Stack>
								) : "অর্ডার নিশ্চিত করুন"}
							</Button>
						</Box>
					</Paper>
				</Grid>

				<Grid item xs={12} md={7} lg={8}>
					<Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e8e8f0", background: "#fff" }}>
						<Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
							<Typography sx={{ fontWeight: 900, fontSize: 17, color: "#1a1a2e" }}>
								অর্ডারের পণ্য ও টাকার হিসাব
							</Typography>
						</Box>

						{cartLoading ? (
							<Box sx={{ p: 3 }}><LinearProgress /></Box>
						) : cartItems.length === 0 ? (
							<Box sx={{ p: 4, textAlign: "center" }}>
								<Typography sx={{ color: "#9ca3af", fontWeight: 700 }}>আপনার কার্টে কোনো পণ্য নেই।</Typography>
							</Box>
						) : (
							<TableContainer>
								<Table size="small">
									<TableHead>
										<TableRow sx={{ background: "#f9fafb" }}>
											{["বাদ দিন", "পণ্য", "পরিমাণ", "দাম"].map((h) => (
												<TableCell key={h} align={h === "দাম" ? "right" : "center"}
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
												(it?.qty || 1) * getResellerSellingPrice(it);
											const isProc = processing[it.id];
											return (
												<TableRow key={it.id} sx={{ "&:hover": { background: "#fafafa" } }}>
													<TableCell align="center" sx={{ borderBottom: "1px solid #f3f4f6", width: 48 }}>
														<IconButton size="small" onClick={() => handleDeleteItem(it)} disabled={isProc}
															sx={{ color: "#ef4444", background: "#fef2f2", borderRadius: 1.5, width: 30, height: 30 }}>
															<DeleteOutlineIcon sx={{ fontSize: 16 }} />
														</IconButton>
													</TableCell>
													<TableCell sx={{ borderBottom: "1px solid #f3f4f6" }}>
														<Stack direction="row" spacing={1.2} alignItems="center">
															<Avatar src={imgSrc} variant="rounded"
																sx={{ width: 44, height: 44, borderRadius: 1.5, border: "1px solid #e5e7eb", background: "#f3f4f6" }} />
															<Box>
																<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1f2937", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
																	{it.product?.name || "Item"}
																</Typography>
															</Box>
														</Stack>
													</TableCell>
													<TableCell align="center" sx={{ borderBottom: "1px solid #f3f4f6", width: 110 }}>
														<Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
															<IconButton size="small" disabled={isProc || (it.qty || 1) <= 1}
																onClick={() => handleUpdateQty(it, (it.qty || 1) - 1)}
																sx={{ width: 26, height: 26, border: "1px solid #e5e7eb", borderRadius: 1 }}>
																−
															</IconButton>
															<Box sx={{ minWidth: 28, height: 26, border: "1px solid #e5e7eb", borderRadius: 1, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 900 }}>
																{it.qty || 1}
															</Box>
															<IconButton size="small" disabled={isProc}
																onClick={() => handleUpdateQty(it, (it.qty || 1) + 1)}
																sx={{ width: 26, height: 26, border: "1px solid #e5e7eb", borderRadius: 1 }}>
																+
															</IconButton>
														</Stack>
													</TableCell>
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

						{cartItems.length > 0 && (
							<Box sx={{ px: 3, pb: 3, pt: 1 }}>
								<Divider sx={{ mb: 2 }} />
								<Stack spacing={1.2} sx={{ mb: 2 }}>
									{[
										{ label: "পণ্যের মোট দাম", value: money(subtotal) },
										{ label: "ছাড়", value: money(discount) },
										{
											label: "ডেলিভারি চার্জ",
											value: isCalculatingCharge
												? "হিসাব করা হচ্ছে…"
												: !selectedDistrictId
												? "জেলা নির্বাচন করুন"
												: hasCalculatedDelivery
												? money(deliveryCharge)
												: "হিসাব পাওয়া যায়নি",
										},
									].map(({ label, value }) => (
										<Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
											<Typography sx={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{label}</Typography>
											<Typography sx={{ fontSize: 14, fontWeight: 800, color: "#1f2937" }}>{value}</Typography>
										</Stack>
									))}

									{resellerProfit > 0 && (
										<Box sx={{
											display: "flex", justifyContent: "space-between", alignItems: "center",
											background: "linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)",
											border: "1px solid #86efac", borderRadius: 2, px: 2, py: 1,
										}}>
											<Typography sx={{ fontSize: 13, fontWeight: 900, color: "#15803d" }}>
												পণ্যে আপনার আনুমানিক লাভ
											</Typography>
											<Typography sx={{ fontSize: 15, fontWeight: 900, color: "#16a34a" }}>
												+{money(resellerProfit)}
											</Typography>
										</Box>
									)}

									<Divider />
									<Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
										<Typography sx={{ fontSize: 15, fontWeight: 900, color: "#1f2937" }}>কাস্টমারের মোট টাকা (COD)</Typography>
										<Typography sx={{ fontSize: 15, fontWeight: 900, color: "#4f46e5", textAlign: "right" }}>
											{hasCalculatedDelivery ? money(grandTotal) : "ডেলিভারি চার্জের অপেক্ষায়"}
										</Typography>
									</Stack>
								</Stack>
							</Box>
						)}
					</Paper>
				</Grid>
			</Grid>

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
