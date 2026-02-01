import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useListProductsQuery } from "../../redux/features/product";
import ProductCard from "../product/product_card_component";
import Pagination from "../../components/shared/Pagination";

const ProductsList = () => {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data: products, isLoading, isError, error } = useListProductsQuery({
    page,
  });
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
      <h2 className="text-center text-blue-600 font-bold text-lg mb-6">Product List</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {productList.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => navigate(`/productdetails/${product.id}`)}
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
