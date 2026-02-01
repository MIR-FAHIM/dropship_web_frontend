import React from "react";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGetCartQuery, useDeleteCartMutation, useUpdateCartMutation } from "../../redux/features/cart";
import { imgBaseUrl } from "../../../config";
import { getFromLocalstorage } from "../../utils/localstorage.utils";
const CartPage = () => {
  const navigate = useNavigate();
  const { data: cartList, error, isLoading, refetch } = useGetCartQuery(getFromLocalstorage("userId") || 1);
  const [deleteCart, { isLoading: isDeleting }] = useDeleteCartMutation();
  const [updateCart, { isLoading: isUpdating }] = useUpdateCartMutation();

  // Handle loading state for fetching cart data
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle error state for fetching cart data
  if (error) {
    return <div>Error fetching cart data: {error.message}</div>;
  }

  const cart = cartList?.data;
  const items = cart?.items || [];

  // Handle deleting an item from the cart
  const handleDelete = (itemId) => {
    deleteCart(itemId)
      .unwrap()
      .then(() => {
        refetch();
      })
      .catch(() => {
        alert("Error deleting item");
      });
  };

  const handleIncrease = (item) => {
    updateCart({ itemId: item.id, qty: item.qty + 1 })
      .unwrap()
      .then(() => refetch())
      .catch(() => alert("Error updating quantity"));
  };

  const handleDecrease = (item) => {
    if (item.qty <= 1) return;
    updateCart({ itemId: item.id, qty: item.qty - 1 })
      .unwrap()
      .then(() => refetch())
      .catch(() => alert("Error updating quantity"));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Reseller Cart</h2>

      <div className="border rounded-lg shadow-md p-4">
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => {
              const imageUrl = item?.product?.primary_image?.file_name
                ? `${imgBaseUrl}/${item.product.primary_image.file_name}`
                : "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex items-center gap-4 w-full">
                    <img
                      src={imageUrl}
                      alt={item?.product?.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {item?.product?.name}
                      </h3>
                      <p className="text-sm text-gray-500">৳ {item?.unit_price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDecrease(item)}
                      className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
                      disabled={item.qty <= 1 || isUpdating}
                    >
                      -
                    </button>
                    <div className="w-10 text-center font-semibold">{item.qty}</div>
                    <button
                      type="button"
                      onClick={() => handleIncrease(item)}
                      className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
                      disabled={isUpdating}
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-gray-700">
                      ৳ {item?.line_total}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={isDeleting}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-600">No items in the cart.</div>
        )}
      </div>

      <div className="mt-6 p-4 border rounded-lg shadow-md">
        <div className="text-lg font-bold mb-2">
          Total Items:
          <span className="font-semibold text-gray-700"> {cart?.total_items ?? 0}</span>
        </div>
        <div className="text-lg font-bold">
          Subtotal:
          <span className="font-semibold text-green-600"> ৳{cart?.subtotal ?? 0}</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/checkout")}
          disabled={(cart?.total_items ?? 0) === 0}
          className={`mt-4 w-full py-2 rounded-lg text-white font-semibold transition duration-300 ${
            (cart?.total_items ?? 0) === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Continue to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
