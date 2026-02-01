import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useListProductsQuery } from "../../redux/features/product";
import { useButtonClickMutation } from "../../redux/features/user";
import ProductCard from "../product/product_card_component";


const ProductsListHomePage = () => {
  const { id } = useParams();  // Assuming categoryId is passed in the route
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const [trackButtonClick, { isButtonLoading: createLoading, error: createError }] = useButtonClickMutation();
  const handleButtonClick = (buttonName) => {
       
    trackButtonClick(buttonName)  // Call the mutation and pass the button name
        .unwrap() // Unwrap the response or error
        .then((response) => {
            console.log("Button click tracked:", response);
        })
        .catch((error) => {
            console.error("Error tracking button click:", error);
        });
};

const handleProduct = (id) => {
  navigate(`/products-detail-home/${id}`);
  handleButtonClick("product clicked home");
};
  const { data: products, isLoading, isError, error } = useListProductsQuery();
  const productList = useMemo(() => {
    const list = products?.data?.data || [];
    if (!id) return list;
    return list;
  }, [products, id]);
  useEffect(() => {
    console.log("Category ID from URL:", id);
    // Now you can fetch products using this id
  }, [id]);  // Log the category ID whenever it changes (i.e., on navigation)
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

  return (
    <div className="p-6">
      <h2 className="text-center text-blue-600 font-bold text-lg mb-6">Product List</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {productList.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => handleProduct(product.id)}
            onDownload={handleDownloadImage}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsListHomePage;
