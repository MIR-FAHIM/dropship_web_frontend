import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Store, Loader2, ArrowRight } from "lucide-react";
import { useGetVendorListQuery } from "../../../redux/features/vendor_api";

const getVendors = (data) => data?.data?.data || data?.data || [];

const getVendorId = (vendor) => vendor.id ;

const getVendorFirstName = (vendor) => {
	const fullName =
		vendor.owner_name ||
		vendor.contact_person ||
		vendor.first_name ||
		vendor.user?.first_name ||
		vendor.name ||
		vendor.user?.name ||
		"";
	return fullName.trim().split(" ")[0] || "Vendor";
};

const getShopType = (vendor) => vendor.shop_type || vendor.store_type || "Store";

const getDistrict = (vendor) => vendor.district?.name || vendor.district_name || vendor.user?.city || "N/A";

const getFulfilmentRate = (vendor) => {
	const value = vendor.fulfilment_rate ?? vendor.fulfillment_rate ?? vendor.fullfilment_rate;
	if (value === undefined || value === null || value === "") return "N/A";
	return String(value).includes("%") ? String(value) : `${value}%`;
};

const getAvgDispatchTime = (vendor) =>
	vendor.avg_dispatch_time || vendor.average_dispatch_time || vendor.dispatch_time_avg || "N/A";

const AllStore = () => {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const { data, isLoading, isError, refetch } = useGetVendorListQuery();

	const vendors = useMemo(() => {
		const list = getVendors(data);
		const q = search.trim().toLowerCase();
		if (!q) return list;

		return list.filter((vendor) => {
			const values = [
				getVendorFirstName(vendor),
				getShopType(vendor),
				vendor.owner_name,
				vendor.contact_person,
				vendor.user?.name,
				vendor.user?.email,
				getDistrict(vendor),
				vendor.whatsapp,
				vendor.emergency_contact,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			return values.includes(q);
		});
	}, [data, search]);

	if (isLoading) {
		return (
			<div className="flex justify-center py-16">
				<Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="text-center py-16 space-y-3">
				<Store className="w-12 h-12 text-red-300 mx-auto" />
				<p className="text-sm text-red-500">স্টোর লিস্ট লোড করা যায়নি।</p>
				<button onClick={refetch} className="text-sm text-red-600 underline">
					আবার চেষ্টা করুন
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h1 className="text-xl font-bold text-gray-800">All Stores</h1>
					<p className="text-sm text-gray-500">আপনার পছন্দের স্টোর সিলেক্ট করে পণ্য দেখুন</p>
				</div>
				<div className="relative w-full sm:w-72">
					<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						type="text"
						placeholder="স্টোর খুঁজুন..."
						className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			{vendors.length === 0 ? (
				<div className="text-center py-16 border border-gray-200 rounded-xl bg-white">
					<Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
					<p className="text-sm text-gray-500">
						{search ? "কোনো স্টোর পাওয়া যায়নি।" : "এখনো কোনো স্টোর যুক্ত হয়নি।"}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{vendors.map((vendor) => {
						const id = getVendorId(vendor);
						const firstName = getVendorFirstName(vendor);
						const shopType = getShopType(vendor);
						const district = getDistrict(vendor);
						const fulfilmentRate = getFulfilmentRate(vendor);
						const avgDispatchTime = getAvgDispatchTime(vendor);
						const totalProducts = vendor.total_products ?? "N/A";
						return (
							<div
								key={id}
								className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<h3 className="text-base font-semibold text-gray-800 truncate">{`${firstName} ${shopType}`}</h3>
										<p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
											<span>Code:</span>
											<span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
													{`s${id || "N/A"}`}
											</span>
										</p>
									</div>
									<Store className="w-5 h-5 text-blue-500 shrink-0" />
								</div>

								<div className="mt-3 grid grid-cols-2 gap-2 text-xs">
									<div className="rounded-lg bg-gray-50 px-2.5 py-2">
										<p className="text-gray-500">Total Products</p>
										<p className="text-gray-800 font-semibold">{totalProducts}</p>
									</div>
									<div className="rounded-lg bg-gray-50 px-2.5 py-2">
										<p className="text-gray-500">District</p>
										<p className="text-gray-800 font-semibold truncate">{district}</p>
									</div>
									<div className="rounded-lg bg-gray-50 px-2.5 py-2">
										<p className="text-gray-500">Fulfilment Rate</p>
										<p className="text-gray-800 font-semibold">{fulfilmentRate}</p>
									</div>
									<div className="rounded-lg bg-gray-50 px-2.5 py-2">
										<p className="text-gray-500">Avg Dispatch Time</p>
										<p className="text-gray-800 font-semibold">{avgDispatchTime}</p>
									</div>
								</div>

								<button
									onClick={() => navigate(`/app/store-products/${id}`)}
									disabled={!id}
									className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									পণ্য দেখুন <ArrowRight className="w-4 h-4" />
								</button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default AllStore;
