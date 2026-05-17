import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useListCategoriesWithChildrenQuery } from "../../redux/features/category";
import { useListProductsCategoryWiseQuery } from "../../redux/features/product";
import ProductCard from "./product_card_component";
import Pagination from "../../components/shared/Pagination";
import TabHeading from "../../components/shared/TabHeading";

const AllProductCategoryTab = () => {
	const navigate = useNavigate();
	const { data, isLoading, error } = useListCategoriesWithChildrenQuery();
	const categories = data?.data?.data ?? data?.data ?? [];
	const [selectedCategory, setSelectedCategory] = useState(null); // null = All
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");

	// Debounce search — fire query 400ms after user stops typing
	useEffect(() => {
		const timer = setTimeout(() => {
			setSearch(searchInput.trim());
			setPage(1);
		}, 400);
		return () => clearTimeout(timer);
	}, [searchInput]);

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
						onClick={() => setSearchInput("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
					>
						<X className="w-4 h-4" />
					</button>
				)}
			</div>

			<div className="flex flex-wrap gap-2 mb-8">
					<button
					onClick={() => { setSelectedCategory(null); setPage(1); setSearchInput(""); }}
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
							onClick={() => {
								setSelectedCategory(cat.id);
								setPage(1);
								setSearchInput("");
							}}
							className={`px-4 py-2 rounded-full border transition font-semibold text-sm ${
								selectedCategory === cat.id
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
								<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default AllProductCategoryTab;
