import React, { useEffect, useMemo, useState } from "react";
import {
	ArrowLeft,
	CheckCircle2,
	Edit3,
	FileText,
	Printer,
	Receipt,
	ShoppingBag,
	Truck,
	User,
	Phone,
	MapPin,
	AlertCircle,
	Calendar,
	ShieldCheck,
	HelpCircle,
	Clock,
	Sparkles,
	Package,
	Wallet,
	Banknote,
	Check,
	Loader2,
	Trash2,
} from "lucide-react";
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
		<Box sx={{ minHeight: "100vh", background: "#f1f5f9", p: { xs: 1.5, sm: 3 } }}>
			<CheckoutOrderGuide onBack={handleBackToEdit} quick />

			{/* ════════ TOP SMART ACTION BAR (CONFIRM BUTTON AT TOP) ════════ */}
			<div className="sticky top-2 z-30 mb-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 border-2 border-slate-300 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleBackToEdit}
						className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer shadow-xs active:scale-95"
					>
						<ArrowLeft className="w-4 h-4 text-slate-700" />
						<span>আগের পেজে</span>
					</button>

					<div>
						<div className="flex items-center gap-2">
							<span className="font-black text-slate-900 text-sm">অর্ডার ইনভয়েস সামারি</span>
							<span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full border border-blue-300">
								PRE-ORDER DRAFT
							</span>
						</div>
						<p className="text-[11px] text-slate-500 font-medium">
							চূড়ান্ত অনুমোদনের জন্য তথ্য ও হিসাব মিলিয়ে নিন
						</p>
					</div>
				</div>

				<div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
					{/* Estimated Profit Pill */}
					<div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950">
						<span className="text-emerald-800">নিট লাভ:</span>
						<span className="text-emerald-700 font-black text-sm">
							{quickOrderData.estimatedProfit >= 0 ? "+" : ""}{money(quickOrderData.estimatedProfit)}
						</span>
					</div>

					{/* Secondary Edit Details Button */}
					<button
						type="button"
						onClick={handleOpenEdit}
						disabled={loadingCheckout}
						className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
					>
						<Edit3 className="w-3.5 h-3.5 text-slate-600" />
						<span>তথ্য পরিবর্তন</span>
					</button>

					{/* ── TOP CONFIRM BUTTON ── */}
					<button
						type="button"
						disabled={loadingCheckout}
						onClick={handleConfirmAndPlaceOrder}
						className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
					>
						{loadingCheckout ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin text-white" />
								<span>জমা হচ্ছে...</span>
							</>
						) : (
							<>
								<CheckCircle2 className="w-4 h-4 text-white" />
								<span>অর্ডার নিশ্চিত করুন (Confirm)</span>
							</>
						)}
					</button>
				</div>
			</div>

			{/* ════════ MAIN INVOICE DOCUMENT SHEET ════════ */}
			<div className="max-w-5xl mx-auto bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden mb-8">
				{/* Top Security & Branding Accent Stripe */}
				<div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

				<div className="p-6 sm:p-8 space-y-6">
					{/* INVOICE HEADER BAR */}
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-200">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
									RB
								</div>
								<span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
									ResellerBrain Dropship Network
								</span>
							</div>
							<h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
								ORDER INVOICE & SETTLEMENT BILL
							</h1>
							<p className="text-xs text-slate-600 font-semibold">
								অর্ডার ইনভয়েস ও রিসেলার আর্থিক হিসাব বিবরণী
							</p>
						</div>

						<div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200 text-right sm:min-w-[240px] space-y-1.5 shadow-xs">
							<div className="flex items-center justify-between gap-4 text-xs">
								<span className="text-slate-500 font-semibold">Invoice Draft No:</span>
								<span className="font-mono font-bold text-slate-900">
									INV-{quickOrderData.product?.id || "ORD"}-{(quickOrderData.customerPhone || "0000").slice(-4)}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4 text-xs">
								<span className="text-slate-500 font-semibold">Issue Date:</span>
								<span className="font-bold text-slate-800">
									{new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4 text-xs">
								<span className="text-slate-500 font-semibold">Payment Mode:</span>
								<span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px] border border-emerald-300">
									Cash On Delivery (COD)
								</span>
							</div>
						</div>
					</div>

					{/* 2-COLUMN PARTY & LOGISTICS DETAILS */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Bill To: Customer Details */}
						<div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-200 space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
									<User className="w-4 h-4 text-blue-600" />
									BILL TO / CUSTOMER (গ্রাহকের তথ্য)
								</span>
								<button
									type="button"
									onClick={handleOpenEdit}
									className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
								>
									<Edit3 className="w-3.5 h-3.5" />
									<span>সম্পাদনা করুন</span>
								</button>
							</div>

							<div className="space-y-1.5">
								<p className="text-base font-black text-slate-900">{quickOrderData.customerName}</p>
								<p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-mono">
									<Phone className="w-3.5 h-3.5 text-slate-500" />
									{quickOrderData.customerPhone}
								</p>
								<p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
									<MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
									<span>{quickOrderData.divisionName} ➔ {quickOrderData.districtName} ➔ {quickOrderData.thanaName}</span>
								</p>
								<p className="text-xs text-slate-700 font-medium leading-relaxed pl-5">
									{quickOrderData.address}
								</p>
								{quickOrderData.note && (
									<div className="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
										<strong>অর্ডার নোট:</strong> {quickOrderData.note}
									</div>
								)}
							</div>
						</div>

						{/* Logistics & Reseller Details */}
						<div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-200 space-y-3">
							<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
								<Truck className="w-4 h-4 text-indigo-600" />
								LOGISTICS & ATTRIBUTION (ডেলিভারি বিবরণী)
							</span>

							<div className="space-y-2 text-xs">
								<div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
									<span className="text-slate-600 font-semibold">Billed By / Reseller:</span>
									<span className="font-bold text-slate-900">Reseller #{userId || "N/A"}</span>
								</div>
								<div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
									<span className="text-slate-600 font-semibold">Courier Partner:</span>
									<span className="font-bold text-slate-900 flex items-center gap-1.5">
										<span className="w-2 h-2 rounded-full bg-emerald-500" />
										Carrybee Courier Express
									</span>
								</div>
								<div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
									<span className="text-slate-600 font-semibold">Delivery Zone:</span>
									<span className="font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
										{quickOrderData.deliveryZone || "Standard Delivery Zone"}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-slate-600 font-semibold">Estimated Transit:</span>
									<span className="font-bold text-slate-800">২–৪ কার্যদিবস (Standard Transit)</span>
								</div>
							</div>
						</div>
					</div>

					{/* ITEMIZED INVOICE TABLE */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
								<Receipt className="w-4 h-4 text-blue-600" />
								অর্ডারের পণ্য তালিকা (ITEMIZED ORDER STATEMENT)
							</h3>
							<span className="text-xs text-slate-500 font-semibold">
								১টি আইটেম • {quickOrderData.quantity} পিস
							</span>
						</div>

						<div className="overflow-x-auto rounded-2xl border-2 border-slate-200">
							<table className="w-full text-left text-xs">
								<thead className="bg-slate-100 border-b-2 border-slate-200 text-slate-700 uppercase font-black tracking-wider text-[11px]">
									<tr>
										<th className="px-4 py-3 text-center w-12">#</th>
										<th className="px-4 py-3">পণ্যের বিবরণ (Item Details)</th>
										<th className="px-4 py-3 text-center">পরিমাণ (Qty)</th>
										<th className="px-4 py-3 text-right">বেস রেট (Base)</th>
										<th className="px-4 py-3 text-right">পণ্যের মোট খরচ (Cost)</th>
										<th className="px-4 py-3 text-right">কাস্টমার প্রদেয় (COD)</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200 bg-white">
									<tr className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-3.5 text-center font-bold text-slate-500">01</td>
										<td className="px-4 py-3.5">
											<div className="flex items-center gap-3">
												{prodImg ? (
													<img
														src={prodImg}
														alt={quickOrderData.product?.name}
														className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
													/>
												) : (
													<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0">
														📦
													</div>
												)}
												<div>
													<p className="font-bold text-slate-900 text-sm leading-tight">
														{quickOrderData.product?.name || "Product"}
													</p>
													<div className="flex flex-wrap items-center gap-2 mt-1">
														<span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
															SKU: {quickOrderData.product?.sku || quickOrderData.product?.id || "N/A"}
														</span>
														{quickOrderData.selectedAttributeLabel && (
															<span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
																{quickOrderData.selectedAttributeLabel}
															</span>
														)}
													</div>
												</div>
											</div>
										</td>
										<td className="px-4 py-3.5 text-center font-black text-slate-900">
											{quickOrderData.quantity} পিস
										</td>
										<td className="px-4 py-3.5 text-right font-bold text-slate-600 font-mono">
											{money(quickOrderData.basePrice)}
										</td>
										<td className="px-4 py-3.5 text-right font-black text-slate-900 font-mono">
											{money(quickOrderData.productCost)}
										</td>
										<td className="px-4 py-3.5 text-right font-black text-blue-900 font-mono text-sm">
											{money(quickOrderData.collectionAmount)}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					{/* FINANCIAL SUMMARY & SETTLEMENT BREAKDOWN (INVOICE LEDGER) */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
						{/* Left: Reliability & Terms Statement */}
						<div className="space-y-4">
							{/* Reliability & Security Balance Card */}
							<div className="bg-amber-50/70 rounded-2xl p-5 border-2 border-amber-300 space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
										<ShieldCheck className="w-4 h-4 text-amber-700" />
										রিলায়েবিলিটি ও সিকিউরিটি ব্যালেন্স
									</span>
									<span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
										{completedOrdersCount}/{minOrdersThreshold} অর্ডার সম্পন্ন
									</span>
								</div>

								<div className="grid grid-cols-2 gap-2 text-center text-xs">
									<div className="bg-white p-2.5 rounded-xl border border-amber-200">
										<span className="text-slate-500 font-semibold block text-[11px]">বর্তমান ওয়ালেট</span>
										<strong className="text-slate-900 font-black text-sm">{money(availableWalletBalance)}</strong>
									</div>
									<div className="bg-white p-2.5 rounded-xl border border-amber-200">
										<span className="text-slate-500 font-semibold block text-[11px]">প্রয়োজনীয় ব্যালেন্স</span>
										<strong className="text-slate-900 font-black text-sm">{money(requiredMinimumBalance)}</strong>
									</div>
								</div>

								{requiresAdvance && (
									<div className="space-y-2 pt-1">
										<span className="text-xs font-bold text-slate-800 block">
											অগ্রিম ডেলিভারি ফি পরিশোধের পদ্ধতি:
										</span>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
											<label className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${advancePaymentChoice === "later" ? "bg-indigo-50 border-indigo-600 text-indigo-950" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
												<input
													type="radio"
													name="advance_choice"
													value="later"
													checked={advancePaymentChoice === "later"}
													onChange={(e) => setAdvancePaymentChoice(e.target.value)}
													className="accent-indigo-600"
												/>
												<div className="text-xs">
													<strong className="block font-bold">পরে পরিশোধ (Pay Later)</strong>
													<span className="text-[10px] text-slate-500">অর্ডার প্লেস করে ২৪ ঘণ্টার মধ্যে পরিশোধ</span>
												</div>
											</label>

											<label className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${canPayFromWallet ? "cursor-pointer" : "opacity-50 cursor-not-allowed"} ${advancePaymentChoice === "wallet" ? "bg-indigo-50 border-indigo-600 text-indigo-950" : "bg-white border-slate-200 text-slate-700"}`}>
												<input
													type="radio"
													name="advance_choice"
													value="wallet"
													disabled={!canPayFromWallet}
													checked={advancePaymentChoice === "wallet"}
													onChange={(e) => setAdvancePaymentChoice(e.target.value)}
													className="accent-indigo-600"
												/>
												<div className="text-xs">
													<strong className="block font-bold">ওয়ালেট থেকে কর্তন</strong>
													<span className="text-[10px] text-slate-500">মজুদ: {money(availableWalletBalance)}</span>
												</div>
											</label>
										</div>
									</div>
								)}

								<p className="text-[11px] text-amber-900 leading-relaxed font-medium bg-amber-100/60 p-2.5 rounded-xl border border-amber-200/80">
									ℹ️ <strong>পলিসি নিশ্চয়তা:</strong> রিলায়েবিলিটি ব্যালেন্স কোনো চার্জ নয়। ডেলিভারি সম্পন্ন হলে এটি সম্পূর্ণ ফেরত পাবেন অথবা যেকোনো সময় উইথড্র করতে পারবেন।
								</p>
							</div>
						</div>

						{/* Right: Formal Ledger Breakdown */}
						<div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-300 space-y-3">
							<span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between pb-2 border-b-2 border-slate-200">
								<span>আর্থিক হিসাব বিবরণী (SETTLEMENT BREAKDOWN)</span>
								<span className="text-blue-700 font-bold">ইনভয়েস সমাপনী</span>
							</span>

							<div className="space-y-2 text-xs">
								<div className="flex items-center justify-between py-1 border-b border-slate-200 font-semibold">
									<span className="text-slate-700">কাস্টমার যে টাকা দেবেন (COD Collection):</span>
									<span className="font-mono font-black text-slate-900 text-sm">{money(quickOrderData.collectionAmount)}</span>
								</div>

								<div className="flex items-center justify-between py-1 border-b border-slate-200 font-semibold">
									<span className="text-slate-700">বাদ: পণ্যের পাইকারি খরচ (Product Cost):</span>
									<span className="font-mono font-bold text-rose-700">- {money(quickOrderData.productCost)}</span>
								</div>

								<div className="flex items-center justify-between py-1 border-b border-slate-200 font-semibold">
									<span className="text-slate-700">বাদ: কুরিয়ার ডেলিভারি চার্জ ({quickOrderData.deliveryZone || "ডেলিভারি"}):</span>
									<span className="font-mono font-bold text-rose-700">- {money(quickOrderData.deliveryCharge)}</span>
								</div>

								<div className="flex items-center justify-between py-1 border-b border-slate-200 font-semibold">
									<span className="text-slate-700">বাদ: COD প্রসেসিং ফি (১%):</span>
									<span className="font-mono font-bold text-rose-700">- {money(quickOrderData.codFee)}</span>
								</div>
							</div>

							{/* Highlighted Profit Margin Card */}
							<div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-emerald-500 flex items-center justify-between gap-3 shadow-xs">
								<div>
									<div className="flex items-center gap-1.5">
										<span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
											আপনার আনুমানিক নিট লাভ
										</span>
										<span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">
											NET MARGIN
										</span>
									</div>
									<p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
										[COD - প্রোডাক্ট খরচ - ডেলিভারি - COD ফি]
									</p>
								</div>

								<p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight">
									{quickOrderData.estimatedProfit >= 0 ? "+" : ""}{money(quickOrderData.estimatedProfit)}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* ════════ BOTTOM ACTION BAR (CONFIRM BUTTON AT BOTTOM) ════════ */}
				<div className="bg-slate-100 p-5 sm:p-6 border-t-2 border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="space-y-0.5 text-xs">
						<p className="font-bold text-slate-800">
							কাস্টমারের নাম, ফোন নম্বর, ডেলিভারি ঠিকানা ও COD মিলিয়ে অর্ডার নিশ্চিত করুন।
						</p>
						<p className="text-slate-500 font-medium">
							অর্ডার প্লেস করার পর প্রথমে অ্যাডমিন ভেরিফাই করবেন, এরপর ভেন্ডরের কাছে যাবে।
						</p>
					</div>

					<div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
						<button
							type="button"
							disabled={loadingCheckout}
							onClick={handleOpenEdit}
							className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border-2 border-slate-300 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
						>
							<Edit3 className="w-3.5 h-3.5 text-slate-600" />
							<span>তথ্য পরিবর্তন করুন</span>
						</button>

						{/* ── BOTTOM CONFIRM BUTTON ── */}
						<button
							type="button"
							disabled={loadingCheckout}
							onClick={handleConfirmAndPlaceOrder}
							className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
						>
							{loadingCheckout ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin text-white" />
									<span>অর্ডার জমা হচ্ছে...</span>
								</>
							) : (
								<>
									<CheckCircle2 className="w-5 h-5 text-white" />
									<span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
								</>
							)}
						</button>
					</div>
				</div>
			</div>

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
   STANDARD MULTI-ITEM CART CHECKOUT VIEW (INVOICE PATTERN)
══════════════════════════════════════════════════════════ */
const StandardCartCheckoutView = ({
	userId,
	eligibility,
	requiresAdvance,
	completedOrdersCount,
	availableWalletBalance = 0,
	minOrdersThreshold = 5,
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
	const [note, setNote] = useState("");
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
		<div className="min-h-screen bg-slate-100/80 py-6 px-3 sm:px-6">
			{/* ════════ TOP STICKY BAR WITH TOP CONFIRM BUTTON ════════ */}
			<div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-sm px-4 py-3 mb-6 rounded-2xl flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
						title="পেছনে ফিরে যান"
					>
						<ArrowLeft className="w-5 h-5" />
					</button>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
								কার্ট চেকআউট ও ইনভয়েস
							</span>
							<span className="text-xs text-slate-500 font-semibold hidden sm:inline">
								Cart Invoice Summary
							</span>
						</div>
						<h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
							অর্ডার ইনভয়েস ও হিসাব বিবরণী
						</h2>
					</div>
				</div>

				<div className="flex items-center gap-2.5 sm:gap-3">
					{resellerProfit > 0 && (
						<div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black">
							<Sparkles className="w-3.5 h-3.5 text-emerald-600" />
							<span>আনুমানিক লাভ: +{money(resellerProfit)}</span>
						</div>
					)}

					<div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
						<ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
						<span>{cartItems.length} টি পণ্য</span>
					</div>

					{/* ── TOP CONFIRM BUTTON ── */}
					<button
						type="button"
						disabled={loadingCheckout || !cartItems.length}
						onClick={handlePlaceOrder}
						className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
					>
						{loadingCheckout ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin text-white" />
								<span>জমা হচ্ছে...</span>
							</>
						) : (
							<>
								<CheckCircle2 className="w-4 h-4 text-white" />
								<span>অর্ডার নিশ্চিত করুন (Confirm)</span>
							</>
						)}
					</button>
				</div>
			</div>

			{/* Top guide banner */}
			<div className="max-w-5xl mx-auto mb-6">
				<CheckoutOrderGuide onBack={() => navigate(-1)} />
			</div>

			{/* ════════ MAIN INVOICE DOCUMENT SHEET ════════ */}
			<div className="max-w-5xl mx-auto bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden mb-8">
				{/* Top Security & Branding Accent Stripe */}
				<div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

				<div className="p-6 sm:p-8 space-y-6">
					{/* INVOICE HEADER BAR */}
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-200">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
									RB
								</div>
								<span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
									ResellerBrain Dropship Network
								</span>
							</div>
							<h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
								CART ORDER INVOICE & SETTLEMENT BILL
							</h1>
							<p className="text-xs text-slate-600 font-semibold">
								কার্ট অর্ডার ইনভয়েস ও রিসেলার আর্থিক হিসাব বিবরণী
							</p>
						</div>

						<div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200 text-right sm:min-w-[240px] space-y-1.5 shadow-xs">
							<div className="flex items-center justify-between gap-4 text-xs">
								<span className="text-slate-500 font-semibold">Invoice Draft No:</span>
								<span className="font-mono font-bold text-slate-900">
									INV-CART-#{userId || "0000"}-{cartItems.length}ITM
								</span>
							</div>
							<div className="flex items-center justify-between gap-4 text-xs">
								<span className="text-slate-500 font-semibold">Issue Date:</span>
								<span className="font-bold text-slate-800">
									{new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
								</span>
							</div>
							<div className="flex items-center justify-between gap-4 text-xs">
								<span className="text-slate-500 font-semibold">Payment Mode:</span>
								<span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px] border border-emerald-300">
									Cash On Delivery (COD)
								</span>
							</div>
						</div>
					</div>

					{/* 2-COLUMN PARTY & LOGISTICS DETAILS */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						{/* Left: Customer Information & Delivery Form */}
						<div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-200 space-y-4">
							<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-200">
								<User className="w-4 h-4 text-blue-600" />
								BILL TO / CUSTOMER (গ্রাহকের তথ্য ও ঠিকানা)
							</span>

							<div className="space-y-3">
								<div>
									<label className="block text-xs font-bold text-slate-700 mb-1">
										কাস্টমারের পুরো নাম <span className="text-rose-500">*</span>
									</label>
									<div className="relative">
										<User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
										<input
											type="text"
											placeholder="কাস্টমারের পুরো নাম লিখুন"
											value={fullName}
											onChange={(e) => setFullName(e.target.value)}
											className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-900"
										/>
									</div>
								</div>

								<div>
									<label className="block text-xs font-bold text-slate-700 mb-1">
										কাস্টমারের ফোন নম্বর <span className="text-rose-500">*</span>
									</label>
									<div className="relative">
										<Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
										<input
											type="tel"
											placeholder="যেমন: 01XXXXXXXXX"
											value={phone}
											onChange={(e) => setPhone(e.target.value)}
											className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium font-mono text-slate-900"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									<div>
										<label className="block text-xs font-bold text-slate-700 mb-1">
											বিভাগ <span className="text-rose-500">*</span>
										</label>
										<select
											value={selectedDivisionId}
											onChange={(e) => {
												setSelectedDivisionId(e.target.value);
												setSelectedDistrictId("");
											}}
											className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-900"
										>
											<option value="" disabled>বিভাগ নির্বাচন করুন</option>
											{divisions.map((d) => (
												<option key={d.id} value={d.id}>{d.name}</option>
											))}
										</select>
									</div>

									<div>
										<label className="block text-xs font-bold text-slate-700 mb-1">
											জেলা <span className="text-rose-500">*</span>
										</label>
										<select
											value={selectedDistrictId}
											disabled={!selectedDivisionId}
											onChange={(e) => setSelectedDistrictId(e.target.value)}
											className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-900 disabled:opacity-50"
										>
											<option value="" disabled>জেলা নির্বাচন করুন</option>
											{districts.map((d) => (
												<option key={d.id} value={d.id}>{d.name}</option>
											))}
										</select>
									</div>
								</div>

								<div>
									<label className="block text-xs font-bold text-slate-700 mb-1">
										সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
									</label>
									<div className="relative">
										<MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
										<textarea
											rows={2}
											placeholder="বাড়ি, ফ্ল্যাট, রাস্তা বা এলাকার স্পষ্ট ঠিকানা দিন"
											value={address}
											onChange={(e) => setAddress(e.target.value)}
											onBlur={() => {
												const distObj = districts.find((d) => String(d.id) === String(selectedDistrictId));
												if (address.trim() && distObj?.name) {
													setAddress(appendLocationToAddress(address, "", distObj.name));
												}
											}}
											className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium resize-none text-slate-900"
										/>
									</div>
								</div>

								<div>
									<label className="block text-xs font-bold text-slate-700 mb-1">
										অর্ডার নোট (ঐচ্ছিক)
									</label>
									<input
										type="text"
										placeholder="যেমন: ডেলিভারির আগে কল দিন"
										value={note}
										onChange={(e) => setNote(e.target.value)}
										className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-900"
									/>
								</div>
							</div>
						</div>

						{/* Right: Logistics, Courier Attribution & Live Status */}
						<div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-200 space-y-4">
							<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-200">
								<Truck className="w-4 h-4 text-indigo-600" />
								LOGISTICS & ATTRIBUTION (ডেলিভারি ও কুরিয়ার বিবরণ)
							</span>

							<div className="space-y-2.5 text-xs">
								<div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
									<span className="text-slate-600 font-semibold">Billed By / Reseller:</span>
									<span className="font-bold text-slate-900">Reseller #{userId || "N/A"}</span>
								</div>

								<div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
									<span className="text-slate-600 font-semibold">Courier Partner:</span>
									<span className="font-bold text-slate-900 flex items-center gap-1.5">
										<span className="w-2 h-2 rounded-full bg-emerald-500" />
										Carrybee Courier Express
									</span>
								</div>

								{vendorDistrictName && (
									<div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
										<span className="text-slate-600 font-semibold">ভেন্ডরের জেলা:</span>
										<span className="font-bold text-slate-800 bg-slate-200/80 px-2 py-0.5 rounded">
											{vendorDistrictName}
										</span>
									</div>
								)}

								<div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
									<span className="text-slate-600 font-semibold">Delivery Zone:</span>
									<span className="font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
										{deliveryZone || "জেলা নির্বাচন করুন"}
									</span>
								</div>

								<div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
									<span className="text-slate-600 font-semibold">Estimated Transit:</span>
									<span className="font-bold text-slate-800">২–৪ কার্যদিবস (Standard Transit)</span>
								</div>

								<div className="flex items-center justify-between">
									<span className="text-slate-600 font-semibold">Payment Option:</span>
									<span className="font-bold text-slate-900">ক্যাশ অন ডেলিভারি (COD)</span>
								</div>
							</div>

							{/* Delivery Calculation Live Indicator Card */}
							<div className={`p-3 rounded-xl border-2 transition-all ${
								isCalculatingCharge
									? "bg-slate-100 border-slate-300"
									: hasCalculatedDelivery
									? "bg-indigo-50 border-indigo-300"
									: "bg-amber-50 border-amber-300"
							}`}>
								{isCalculatingCharge ? (
									<div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
										<Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
										<span>ডেলিভারি চার্জ হিসাব করা হচ্ছে…</span>
									</div>
								) : hasCalculatedDelivery ? (
									<div className="flex items-center justify-between text-xs">
										<div className="flex items-center gap-1.5">
											<Truck className="w-4 h-4 text-indigo-600" />
											<span className="font-bold text-indigo-950">
												ডেলিভারি ফি ({deliveryZone || "Standard"}):
											</span>
										</div>
										<span className="font-black text-indigo-900 text-sm font-mono">
											{money(deliveryCharge)}
										</span>
									</div>
								) : (
									<div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
										<AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
										<span>ডেলিভারি চার্জ হিসাবের জন্য জেলা নির্বাচন করুন।</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* ITEMIZED INVOICE TABLE */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
								<Receipt className="w-4 h-4 text-blue-600" />
								অর্ডারের পণ্য তালিকা (ITEMIZED ORDER STATEMENT)
							</h3>
							<span className="text-xs text-slate-500 font-semibold">
								{cartItems.length} টি আইটেম
							</span>
						</div>

						{cartLoading ? (
							<div className="p-8 text-center text-slate-500 font-bold">
								<Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
								কার্টের পণ্য লোড হচ্ছে...
							</div>
						) : cartItems.length === 0 ? (
							<div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
								<ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
								<p className="font-bold text-slate-600 text-sm">আপনার কার্টে কোনো পণ্য নেই।</p>
								<button
									type="button"
									onClick={() => navigate("/app/products")}
									className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
								>
									পণ্য ব্রাউজ করুন
								</button>
							</div>
						) : (
							<div className="overflow-x-auto rounded-2xl border-2 border-slate-200">
								<table className="w-full text-left text-xs">
									<thead className="bg-slate-100 border-b-2 border-slate-200 text-slate-700 uppercase font-black tracking-wider text-[11px]">
										<tr>
											<th className="px-4 py-3 text-center w-12">#</th>
											<th className="px-4 py-3">পণ্যের বিবরণ (Item Details)</th>
											<th className="px-4 py-3 text-center">পরিমাণ (Qty)</th>
											<th className="px-4 py-3 text-right">একক মূল্য (Unit Rate)</th>
											<th className="px-4 py-3 text-right">মোট প্রদেয় (Line Total)</th>
											<th className="px-4 py-3 text-center w-16">অ্যাকশন</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200 bg-white">
										{cartItems.map((it, idx) => {
											const imgSrc = it?.product?.primary_image?.file_name
												? `${imgBaseUrl}/${it.product.primary_image.file_name}`
												: null;
											const unitPrice = getResellerSellingPrice(it);
											const linePrice = it?.line_total ?? it?.total ?? (it?.qty || 1) * unitPrice;
											const isProc = processing[it.id];

											return (
												<tr key={it.id || idx} className="hover:bg-slate-50 transition-colors">
													<td className="px-4 py-3.5 text-center font-bold text-slate-500">
														{String(idx + 1).padStart(2, "0")}
													</td>
													<td className="px-4 py-3.5">
														<div className="flex items-center gap-3">
															{imgSrc ? (
																<img
																	src={imgSrc}
																	alt={it.product?.name}
																	className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
																/>
															) : (
																<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0">
																	📦
																</div>
															)}
															<div>
																<p className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
																	{it.product?.name || "Product Item"}
																</p>
																<div className="flex flex-wrap items-center gap-2 mt-1">
																	<span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
																		SKU: {it.product?.sku || it.product?.id || "N/A"}
																	</span>
																	{it.variation_label && (
																		<span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
																			{it.variation_label}
																		</span>
																	)}
																</div>
															</div>
														</div>
													</td>
													<td className="px-4 py-3.5 text-center">
														<div className="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
															<button
																type="button"
																disabled={isProc || (it.qty || 1) <= 1}
																onClick={() => handleUpdateQty(it, (it.qty || 1) - 1)}
																className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition disabled:opacity-40 cursor-pointer"
															>
																-
															</button>
															<span className="px-2.5 py-1 text-xs font-black text-slate-900 min-w-[28px] text-center">
																{it.qty || 1}
															</span>
															<button
																type="button"
																disabled={isProc}
																onClick={() => handleUpdateQty(it, (it.qty || 1) + 1)}
																className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition disabled:opacity-40 cursor-pointer"
															>
																+
															</button>
														</div>
													</td>
													<td className="px-4 py-3.5 text-right font-bold text-slate-700 font-mono">
														{money(unitPrice)}
													</td>
													<td className="px-4 py-3.5 text-right font-black text-blue-950 font-mono text-sm">
														{money(linePrice)}
													</td>
													<td className="px-4 py-3.5 text-center">
														<button
															type="button"
															disabled={isProc}
															onClick={() => handleDeleteItem(it)}
															className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
															title="মুছে ফেলুন"
														>
															<Trash2 className="w-4 h-4" />
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</div>

					{/* FINANCIAL SUMMARY & SETTLEMENT BREAKDOWN (INVOICE LEDGER) */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
						{/* Left: Reliability & Terms Statement */}
						<div className="space-y-4">
							{requiresAdvance && (
								<div className="bg-amber-50/70 rounded-2xl p-5 border-2 border-amber-300 space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
											<ShieldCheck className="w-4 h-4 text-amber-700" />
											অগ্রিম ডেলিভারি চার্জ আবশ্যক ({money(advanceAmount)})
										</span>
										<span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
											{completedOrdersCount}/{minOrdersThreshold} সম্পন্ন
										</span>
									</div>

									<p className="text-xs text-amber-900 leading-relaxed font-medium">
										নতুন ড্রপশিপার হিসেবে প্রথম ৫টি অর্ডারের ডেলিভারি ফি অগ্রিম প্রদান আবশ্যক। আপনার সম্পন্ন অর্ডার: <strong>{completedOrdersCount}/{minOrdersThreshold}</strong>
									</p>

									<div className="bg-white p-3 rounded-xl border border-amber-300 text-xs">
										<span className="font-bold text-slate-900 block mb-0.5">পরে পরিশোধ করুন (Pay Later)</span>
										<span className="text-slate-600 text-[11px]">
											অর্ডারটি জমা হবে এবং আপনি Order Details পেজ থেকে ২৪ ঘণ্টার মধ্যে অগ্রিম ডেলিভারি চার্জ পরিশোধ করতে পারবেন।
										</span>
									</div>
								</div>
							)}

							<div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
								<p className="font-bold text-slate-800 flex items-center gap-1.5">
									<HelpCircle className="w-4 h-4 text-indigo-600" />
									অর্ডার প্রক্রিয়া ও লাভ পাওয়ার নিয়ম:
								</p>
								<p>
									১. অর্ডার সাবমিট করার পর আমাদের অ্যাডমিন টিম কাস্টমার ও ডেলিভারি তথ্য যাচাই করবেন।
								</p>
								<p>
									২. ডেলিভারি সম্পন্ন হলে সংগৃহীত COD টাকা থেকে পাইকারি খরচ ও ডেলিভারি ফি বাদ দিয়ে বাকি নিট লাভ সরাসরি আপনার ড্রপশিপার ওয়ালেটে জমা হবে।
								</p>
							</div>
						</div>

						{/* Right: Formal Ledger Breakdown */}
						<div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-300 space-y-3">
							<span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between pb-2 border-b-2 border-slate-200">
								<span>আর্থিক হিসাব বিবরণী (SETTLEMENT BREAKDOWN)</span>
								<span className="text-blue-700 font-bold">ইনভয়েস সমাপনী</span>
							</span>

							<div className="space-y-2 text-xs">
								<div className="flex items-center justify-between py-1 border-b border-slate-200 font-semibold">
									<span className="text-slate-700">পণ্যের মোট বিক্রয় মূল্য (Subtotal):</span>
									<span className="font-mono font-black text-slate-900 text-sm">{money(subtotal)}</span>
								</div>

								{discount > 0 && (
									<div className="flex items-center justify-between py-1 border-b border-slate-200 font-semibold">
										<span className="text-slate-700">বাদ: বিশেষ ছাড় (Discount):</span>
										<span className="font-mono font-bold text-rose-700">- {money(discount)}</span>
									</div>
								)}

								<div className="flex items-center justify-between py-1 border-b border-slate-200 font-semibold">
									<span className="text-slate-700">কুরিয়ার ডেলিভারি চার্জ ({deliveryZone || "ডেলিভারি"}):</span>
									<span className="font-mono font-bold text-indigo-700">
										{isCalculatingCharge ? "হিসাব করা হচ্ছে…" : hasCalculatedDelivery ? `+ ${money(deliveryCharge)}` : "জেলা নির্বাচন করুন"}
									</span>
								</div>

								<div className="flex items-center justify-between py-1 border-b border-slate-200 font-semibold">
									<span className="text-slate-700">বাদ: ভেন্ডর পাইকারি খরচ (Product Cost):</span>
									<span className="font-mono font-bold text-rose-700">- {money(calculatedBaseTotal)}</span>
								</div>
							</div>

							{/* Highlighted Profit Margin Card */}
							{resellerProfit > 0 && (
								<div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-emerald-500 flex items-center justify-between gap-3 shadow-xs">
									<div>
										<div className="flex items-center gap-1.5">
											<span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
												আপনার আনুমানিক নিট লাভ
											</span>
											<span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">
												NET MARGIN
											</span>
										</div>
										<p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
											[মোট বিক্রয় মূল্য - ভেন্ডর পাইকারি খরচ]
										</p>
									</div>

									<p className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
										+{money(resellerProfit)}
									</p>
								</div>
							)}

							{/* Grand Total COD Collection */}
							<div className="mt-2 p-3.5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-between">
								<div>
									<span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
										কাস্টমারের সর্বমোট প্রদেয় টাকা (COD)
									</span>
									<span className="text-[10px] text-indigo-700 font-semibold">
										ডেলিভারি কর্মী এই টাকা সংগ্রহ করবেন
									</span>
								</div>
								<span className="text-xl font-black text-indigo-700 font-mono">
									{hasCalculatedDelivery ? money(grandTotal) : "ডেলিভারি চার্জের অপেক্ষায়"}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* ════════ BOTTOM ACTION BAR (CONFIRM BUTTON AT BOTTOM) ════════ */}
				<div className="bg-slate-100 p-5 sm:p-6 border-t-2 border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="space-y-0.5 text-xs">
						<p className="font-bold text-slate-800">
							কাস্টমারের নাম, ফোন নম্বর, ডেলিভারি ঠিকানা ও পণ্য তালিকা মিলিয়ে অর্ডার নিশ্চিত করুন।
						</p>
						<p className="text-slate-500 font-medium">
							অর্ডার জমা হলে অ্যাডমিন যাচাই করবেন। এরপর অর্ডার তালিকা থেকে অগ্রগতি দেখতে পারবেন।
						</p>
					</div>

					<div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
						{/* ── BOTTOM CONFIRM BUTTON ── */}
						<button
							type="button"
							disabled={loadingCheckout || !cartItems.length}
							onClick={handlePlaceOrder}
							className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
						>
							{loadingCheckout ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin text-white" />
									<span>অর্ডার জমা হচ্ছে...</span>
								</>
							) : (
								<>
									<CheckCircle2 className="w-5 h-5 text-white" />
									<span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
								</>
							)}
						</button>
					</div>
				</div>
			</div>

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
		</div>
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
