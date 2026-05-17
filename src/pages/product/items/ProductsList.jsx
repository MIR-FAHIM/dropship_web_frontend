import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useListProductsCategoryWiseQuery } from "../../../redux/features/product";
import ProductCard from "../product_card_component";
import Pagination from "../../../components/shared/Pagination";

const ProductsList = () => {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Debounce: fire query 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo(() => {
    const p = { page, category_id: id };
    if (search) p.search = search;
    return p;
  }, [page, id, search]);

  const { data: products, isLoading, isError, error } = useListProductsCategoryWiseQuery(queryParams);

  const productList = useMemo(() => {
    const list = products?.data?.data || [];
    if (!id) return list;
    return list;
  }, [products, id]);
  useEffect(() => {
    console.log("Category ID from URL:", id);
  }, [id]);  // Log the category ID whenever it changes (i.e., on navigation)
  useEffect(() => {
    setPage(1);
    setSearchInput("");
  }, [id]);
  const handleDownloadImage = (image) => {
    const link = document.createElement('a');
    link.href = image;
    link.download = 'product-image';
    link.click();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  const currentPage = products?.data?.current_page ?? page;
  const totalPages = products?.data?.last_page ?? 1;

  return (
    <div className="p-6">
      <h2 className="text-center text-blue-600 font-bold text-lg mb-4">Product List</h2>

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {productList.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => navigate(`/app/productdetails/${product.id}`)}
            onDownload={handleDownloadImage}
          />
        ))}
      </div>
      {totalPages > 1 ? (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ProductsList;
