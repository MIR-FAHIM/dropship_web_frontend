import React, { useState , useEffect} from "react";
import { useGetCartQuery, useDeleteCartMutation, useUpdateCartMutation } from "../../redux/features/cart";
import { useCreateOrderMutation } from "../../redux/features/order";
import { useNavigate } from 'react-router-dom'; 
import { element } from "prop-types";
const CartPage = () => {
  const [customer, setCustomer] = useState({ phone: "", address: "" , name:""});
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };
   // Dependency array that listens for changes in cartList
  // Fetch cart data using the hook
  const { data: cartList, error, isLoading, refetch } = useGetCartQuery(1);
  useEffect(() => {
    if (cartList) {
      refetch();  // Refetch cart data when the cartList changes
    }
  }, [cartList]); 
  // Hooks for deleting a cart item and updating cart
  const [deleteCart, { isLoading: isDeleting }] = useDeleteCartMutation();
  const [updateCart] = useUpdateCartMutation();

  // Hook for creating an order
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  // Handle loading state for fetching cart data
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle error state for fetching cart data
  if (error) {
    return <div>Error fetching cart data: {error.message}</div>;
  }

  // Calculate total seller price and total profit
  const totalSellerPrice = cartList?.cart_items?.reduce(
    (total, item) => total + parseFloat(item.seller_total_price),
    0
  ).toFixed(2);

  const totalProfit = cartList?.cart_items?.reduce(
    (total, item) => total + parseFloat(item.profit),
    0
  ).toFixed(2);

  // Handle deleting an item from the cart
  const handleDelete = (id) => {
    deleteCart(id)
      .unwrap()
      .then(() => {
        refetch();
        alert("Item deleted successfully");
      })
      .catch(() => {
        alert("Error deleting item");
      });
  };

  // Handle placing the order
  const handlePlaceOrder = () => {
    const orderData = {
      customer_name: customer.name,
      customer_address: customer.address,
      customer_phone: customer.phone,
      customer_email: null,
      isDhaka: 1,  // Assuming this is always '1' for now, you can change this as per your requirement
      total_cart: cartList?.cart_items?.length,
      payment_recievable_from_cus: totalSellerPrice,// Just as an example
      profit_for_seller: totalProfit,// Just as an example
      add_balance_to_seller: totalProfit, // Example, adjust this if necessary
      order_status: 0, // Pending status
      note: "Customer note",  // Example, you can take this as input
      isDelivered: 0, // Default to not delivered
      seller_id: 1, // Example seller ID
      order_assign_to: null, // Example, can be null or assigned
    };

    // Create the order using the mutation hook
    createOrder(orderData)
      .unwrap()
      .then((response) => {
        // On success, update the cart status for all items to '1' (or any other status as per your logic)
        cartList.cart_items.forEach(item => {
          updateCart({ id: item.id, is_ordered: 1, order_id : response.order.id }).unwrap();
         
        });
        alert("Order Placed successfully");
        refetch();
        navigate('/order-success',{state: {order:response.order}} );
       
        
     
        // Refetch the cart data to get the updated status
      })
      .catch((error) => {
        alert("Failed to place order: " + error.message);
      })
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Reseller Cart</h2>

      <div className="border rounded-lg shadow-md p-4">
        <div className="p-4">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Cart ID</th>
                <th className="border p-2">Product ID</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Seller Price</th>
                <th className="border p-2">Seller Total Price</th>
                <th className="border p-2">Product Base Price</th>
                <th className="border p-2">Profit</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartList?.cart_items?.length > 0 ? (
                cartList.cart_items.map((item) => (
                  <tr key={item.id} className="text-center">
                    <td className="border p-2">{item.id}</td>
                    <td className="border p-2">{item.product_id}</td>
                    <td className="border p-2">{item.quantity}</td>
                    <td className="border p-2">৳{item.seller_price}</td>
                    <td className="border p-2">৳{item.seller_total_price}</td>
                    <td className="border p-2">৳{item.product_base_price_total}</td>
                    <td className="border p-2">৳{item.profit}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => alert("Show details for cart item " + item.id)}
                        className="bg-blue-500 text-white py-1 px-2 rounded mr-2"
                      >
                        Show Detail
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white py-1 px-2 rounded"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="border p-2 text-center">
                    No items in the cart.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 p-4 border rounded-lg shadow-md">
        <div className="text-lg font-bold mb-2">
          Total payable to Bebsha360:
          <span className="font-semibold text-green-600"> ৳{totalSellerPrice}</span>
        </div>
        <div className="text-lg font-bold">
          Total profit from this order:
          <span className="font-semibold text-green-600"> ৳{totalProfit}</span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold">Customer Details</h3>
        <input
          className="mt-2 border p-2 w-full rounded"
          name="name"
          placeholder="Customer Name"
          value={customer.name}
          onChange={handleInputChange}
        />
        <input
          className="mt-2 border p-2 w-full rounded"
          name="phone"
          placeholder="Customer Phone Number"
          value={customer.phone}
          onChange={handleInputChange}
        />
        <input
          className="mt-2 border p-2 w-full rounded"
          name="address"
          placeholder="Customer Address"
          value={customer.address}
          onChange={handleInputChange}
        />
        <button
          onClick={handlePlaceOrder}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded"
          disabled={isCreatingOrder}
        >
          {isCreatingOrder ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
