import React, { useState } from "react";
import { useCheckoutOrderMutation } from "../../redux/features/order";
import { getFromLocalstorage } from "../../utils/localstorage.utils";

const CheckoutPage = () => {
	const [formState, setFormState] = useState({
		customer_name: "",
		customer_phone: "",
		shipping_address: "",
		zone: "",
		note: "",
	});

	const [checkoutOrder, { isLoading }] = useCheckoutOrderMutation();

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormState((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const userId = getFromLocalstorage("userId") || 1;
		const payload = {
			user_id: userId,
			...formState,
		};

		try {
			const res = await checkoutOrder(payload).unwrap();
			if (res?.status === "success") {
				alert("Checkout completed successfully.");
			} else {
				alert(res?.message || "Checkout completed.");
			}
		} catch (error) {
			alert(error?.data?.message || "Checkout failed.");
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-10">
			<div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
				<h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Customer Name
						</label>
						<input
							name="customer_name"
							value={formState.customer_name}
							onChange={handleChange}
							className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Customer Phone
						</label>
						<input
							name="customer_phone"
							value={formState.customer_phone}
							onChange={handleChange}
							className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Shipping Address
						</label>
						<textarea
							name="shipping_address"
							value={formState.shipping_address}
							onChange={handleChange}
							rows={3}
							className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">Zone</label>
						<input
							name="zone"
							value={formState.zone}
							onChange={handleChange}
							className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700">Note</label>
						<textarea
							name="note"
							value={formState.note}
							onChange={handleChange}
							rows={2}
							className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button
						type="submit"
						disabled={isLoading}
						className={`w-full py-2 rounded-md text-white font-semibold transition ${
							isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
						}`}
					>
						{isLoading ? "Submitting..." : "Place Order"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default CheckoutPage;
