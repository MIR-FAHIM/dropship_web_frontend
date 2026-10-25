import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Search,
	Store,
	Loader2,
	ArrowRight,
	MapPin,
	Package,
	CheckCircle2,
	Clock,
	Sparkles,
} from "lucide-react";
import { useGetResellerStoresQuery } from "../../../redux/features/vendor_api";

const getStores = (data) => data?.data?.data || data?.data || [];

const getStoreInitials = (codeOrName) => {
	if (!codeOrName) return "ST";
	const trimmed = String(codeOrName).trim();
	return trimmed.slice(0, 3).toUpperCase();
};

const getVendorTypeBadge = (type) => {
	const t = (type || "").toLowerCase();
	if (t.includes("wholesal")) {
		return { label: type || "Wholesaler", style: "bg-indigo-50 text-indigo-700 border-indigo-200" };
	}
	if (t.includes("manufactur")) {
		return { label: type || "Manufacturer", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
	}
	if (t.includes("distribut")) {
		return { label: type || "Distributor", style: "bg-purple-50 text-purple-700 border-purple-200" };
	}
	if (t.includes("import")) {
		return { label: type || "Importer", style: "bg-amber-50 text-amber-700 border-amber-200" };
	}
	return { label: type || "Supplier Store", style: "bg-blue-50 text-blue-700 border-blue-200" };
};

const AllStore = () => {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [selectedType, setSelectedType] = useState("all");

	// Call dedicated reseller stores API (returns only active vendors with > 1 product)
	const { data, isLoading, isError, refetch } = useGetResellerStoresQuery();

	const allStores = useMemo(() => getStores(data), [data]);

	// Extract unique vendor types for quick filter pills
	const vendorTypes = useMemo(() => {
		const types = new Set();
		allStores.forEach((s) => {
			if (s.vendortype) types.add(s.vendortype);
		});
		return Array.from(types);
	}, [allStores]);

	// Filter stores by search query and vendor type
	const filteredStores = useMemo(() => {
		let list = allStores;

		if (selectedType !== "all") {
			list = list.filter((s) => (s.vendortype || "").toLowerCase() === selectedType.toLowerCase());
		}

		const q = search.trim().toLowerCase();
		if (!q) return list;

		return list.filter((store) => {
			const values = [
				store.code,
				store.vendortype,
				store.district,
				store.zone,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			return values.includes(q);
		});
	}, [allStores, search, selectedType]);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] py-16 space-y-3">
				<Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
				<p className="text-sm font-medium text-gray-500">লোড হচ্ছে স্টোর তালিকা...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="text-center py-16 space-y-4 max-w-md mx-auto">
				<div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
					<Store className="w-8 h-8" />
				</div>
				<div>
					<h3 className="text-base font-semibold text-gray-800">স্টোর লোড করা যায়নি</h3>
					<p className="text-sm text-gray-500 mt-1">দয়া করে আপনার ইন্টারনেট সংযোগ চেক করুন এবং পুনরায় চেষ্টা করুন।</p>
				</div>
				<button
					onClick={refetch}
					className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
				>
					আবার চেষ্টা করুন
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
			{/* Header & Search */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
				<div>
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold text-gray-900">All Stores</h1>
						<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
							<Sparkles className="w-3 h-3" /> {allStores.length} Verified Stores
						</span>
					</div>
					<p className="text-sm text-gray-500 mt-1">
						আপনার পছন্দের ভেন্ডর ও পাইকারি স্টোর সিলেক্ট করে কালেকশন এক্সপ্লোর করুন
					</p>
				</div>

				<div className="relative w-full md:w-80">
					<Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						type="text"
						placeholder="স্টোর বা ক্যাটাগরি সার্চ করুন..."
						className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
					/>
				</div>
			</div>

			{/* Filter Pills */}
			{vendorTypes.length > 0 && (
				<div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
					<button
						onClick={() => setSelectedType("all")}
						className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
							selectedType === "all"
								? "bg-gray-900 text-white shadow-sm"
								: "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
						}`}
					>
						All Types ({allStores.length})
					</button>
					{vendorTypes.map((type) => {
						const count = allStores.filter((s) => s.vendortype === type).length;
						const active = selectedType.toLowerCase() === type.toLowerCase();
						return (
							<button
								key={type}
								onClick={() => setSelectedType(type)}
								className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 capitalize ${
									active
										? "bg-blue-600 text-white shadow-sm"
										: "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
								}`}
							>
								{type} ({count})
							</button>
						);
					})}
				</div>
			)}

			{/* Store Grid */}
			{filteredStores.length === 0 ? (
				<div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl bg-white shadow-sm">
					<Store className="w-14 h-14 text-gray-300 mx-auto mb-3" />
					<h3 className="text-base font-semibold text-gray-800">কোনো স্টোর পাওয়া যায়নি</h3>
					<p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
						{search
							? `"${search}" এর সাথে মিলে এমন কোনো অ্যাক্টিভ ভেন্ডর স্টোর নেই।`
							: "বর্তমানে কোনো স্টোরে একাধিক পণ্য যুক্ত নেই।"}
					</p>
					{(search || selectedType !== "all") && (
						<button
							onClick={() => {
								setSearch("");
								setSelectedType("all");
							}}
							className="mt-4 px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
						>
							ফিল্টার রিসেট করুন
						</button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
					{filteredStores.map((store) => {
						const badge = getVendorTypeBadge(store.vendortype);
						const storeDisplayCode = store.code || `s${store.id}`;
						const initials = getStoreInitials(storeDisplayCode);

						return (
							<div
								key={store.id}
								className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
							>
								<div>
									{/* Store Banner */}
									<div className="relative h-28 bg-gradient-to-r from-slate-800 via-indigo-900 to-blue-900 overflow-hidden">
										{store.banner ? (
											<img
												src={store.banner}
												alt={storeDisplayCode}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
												onError={(e) => {
													e.currentTarget.style.display = "none";
												}}
											/>
										) : (
											<div className="w-full h-full opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
										)}

										{/* Verified Pill */}
										<div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 shadow-sm">
											<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
											Verified Store
										</div>
									</div>

									{/* Store Avatar & Header */}
									<div className="px-5 pt-0 pb-2 relative">
										<div className="flex items-end justify-between -mt-10 mb-3">
											<div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md border border-gray-100 shrink-0 overflow-hidden">
												{store.logo ? (
													<img
														src={store.logo}
														alt={storeDisplayCode}
														className="w-full h-full object-cover rounded-xl"
														onError={(e) => {
															e.currentTarget.style.display = "none";
														}}
													/>
												) : (
													<div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
														{initials}
													</div>
												)}
											</div>

											{/* Vendor Type Badge */}
											<span
												className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-xs ${badge.style}`}
											>
												{badge.label}
											</span>
										</div>

										{/* Title & Store Code */}
										<div className="space-y-1">
											<h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition truncate">
												{storeDisplayCode}
											</h3>
											<div className="flex items-center gap-2 text-xs text-gray-500">
												<span className="font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold text-[11px]">
													Code: {storeDisplayCode}
												</span>
												{store.district && store.district !== "N/A" && (
													<span className="flex items-center gap-1 text-gray-500">
														<MapPin className="w-3.5 h-3.5 text-gray-400" />
														{store.district}
													</span>
												)}
											</div>
										</div>

										{/* Metrics Grid */}
										<div className="mt-4 grid grid-cols-2 gap-2 text-xs">
											<div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
												<div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
													<Package className="w-3.5 h-3.5 text-blue-500" />
													<span>Total Products</span>
												</div>
												<p className="text-gray-900 font-bold text-sm">
													{store.total_products}{" "}
													<span className="text-[11px] font-normal text-gray-500">টি পণ্য</span>
												</p>
											</div>

											<div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
												<div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
													<Clock className="w-3.5 h-3.5 text-indigo-500" />
													<span>Fulfilment</span>
												</div>
												<p className="text-gray-900 font-bold text-sm">
													{store.fulfilment_rate || "98%"}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Action Footer */}
								<div className="p-5 pt-3 border-t border-gray-100 bg-gray-50/50">
									<button
										onClick={() => navigate(`/app/store-products/${store.id}`)}
										className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.99] shadow-sm hover:shadow transition"
									>
										পণ্য দেখুন <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default AllStore;
