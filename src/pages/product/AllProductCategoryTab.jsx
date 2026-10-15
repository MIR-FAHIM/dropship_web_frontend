import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useListCategoriesWithChildrenQuery } from "../../redux/features/category";
import { useListProductsCategoryWiseQuery } from "../../redux/features/product";
import ProductCard from "./product_card_component";
import Pagination from "../../components/shared/Pagination";
import TabHeading from "../../components/shared/TabHeading";

const AllProductCategoryTab = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const pageParam = parseInt(searchParams.get("page"), 10);
	const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;

	const selectedCategory = searchParams.get("category_id") || null; // null = All
	const search = searchParams.get("search") || "";

	const { data, isLoading, error } = useListCategoriesWithChildrenQuery();
	const categories = data?.data?.data ?? data?.data ?? [];

	const [searchInput, setSearchInput] = useState(search);

	// Synchronize searchInput with URL query params when external navigation occurs (e.g. Back/Forward)
	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	// Debounce search — update URL query params 400ms after user stops typing
	useEffect(() => {
		if (searchInput.trim() === search) return;

		const timer = setTimeout(() => {
			setSearchParams((prev) => {
				const next = new URLSearchParams(prev);
				const trimmed = searchInput.trim();
				if (trimmed) {
					next.set("search", trimmed);
				} else {
					next.delete("search");
				}
				// When search text changes, reset to page 1
				next.delete("page");
				return next;
			}, { replace: true });
		}, 400);
		return () => clearTimeout(timer);
	}, [searchInput, search, setSearchParams]);

	const queryParams = useMemo(() => {
		const p = { page };
		if (selectedCategory) p.category_id = selectedCategory;
		if (search) p.search = search;
		return p;
	}, [page, selectedCategory, search]);

	const {
		data: products,
		isLoading: isProductsLoading,
		isError: isProductsError,
		error: productsError,
	} = useListProductsCategoryWiseQuery(queryParams);

	const handleDownloadImage = (image) => {
		const link = document.createElement('a');
		link.href = image;
		link.download = 'product-image';
		link.click();
	};

	const handlePageChange = (newPage) => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (newPage > 1) {
				next.set("page", String(newPage));
			} else {
				next.delete("page");
			}
			return next;
		});
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleCategorySelect = (categoryId) => {
		setSearchInput("");
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (categoryId) {
				next.set("category_id", String(categoryId));
			} else {
				next.delete("category_id");
			}
			next.delete("search");
			next.delete("page");
			return next;
		});
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.delete("search");
			next.delete("page");
			return next;
		}, { replace: true });
	};

	const productList = products?.data?.data || [];
	const currentPage = products?.data?.current_page ?? page;
	const totalPages = products?.data?.last_page ?? 1;

	if (isLoading) return <div>Loading categories...</div>;
	if (error) return <div>Error loading categories.</div>;

	return (
		<div className="min-h-screen bg-gray-50 px-4 py-8">
			<div className="max-w-7xl mx-auto">
			
				{/* Search box */}
			<div className="relative max-w-md mx-auto mb-6">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
				<input
					type="text"
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					placeholder="Search by name or SKU…"
					className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition-all"
				/>
				{searchInput && (
					<button
						onClick={handleClearSearch}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
					>
						<X className="w-4 h-4" />
					</button>
				)}
			</div>

			<div className="flex flex-wrap gap-2 mb-8">
					<button
					onClick={() => handleCategorySelect(null)}
						className={`px-4 py-2 rounded-full border transition font-semibold text-sm ${
							selectedCategory === null
								? "bg-blue-600 text-white border-blue-600"
								: "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"
						}`}
					>
						All Products
					</button>
					{categories.map((cat) => (
						<button
							key={cat.id}
							onClick={() => handleCategorySelect(cat.id)}
							className={`px-4 py-2 rounded-full border transition font-semibold text-sm ${
								String(selectedCategory) === String(cat.id)
									? "bg-blue-600 text-white border-blue-600"
									: "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"
							}`}
						>
							{cat.name}
						</button>
					))}
				</div>

				{isProductsLoading ? (
					<div>Loading products...</div>
				) : isProductsError ? (
					<div>Error: {productsError?.message || "Failed to load products."}</div>
				) : (
					<>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
							{productList.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									onClick={(p) => navigate(`/app/productdetails/${p.id}`)}
									onDownload={handleDownloadImage}
								/>
							))}
						</div>
						{totalPages > 1 && (
							<div className="flex justify-center mt-6">
								<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default AllProductCategoryTab;
