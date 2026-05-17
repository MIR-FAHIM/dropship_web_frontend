import React, { useState } from "react";
import { useAddUserBankAccountMutation, useGetUserBankAccountQuery, useGetPaymentMethodsQuery } from "../../../../redux/features/accounting";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const VendorBankAccount = () => {
	// Get user id from redux or localstorage
	const userId = localStorage.getItem("userId");
	const { data: paymentMethodsData, isLoading: isPaymentMethodsLoading } = useGetPaymentMethodsQuery();
	const { data: bankAccountsData, refetch } = useGetUserBankAccountQuery(userId);
	const [addUserBankAccount, { isLoading: isAdding }] = useAddUserBankAccountMutation();

	const [form, setForm] = useState({
		bank_name: "",
		acc_name: "",
		type: "",
		account_no: "",
		branch: "",
		route: "",
		payment_method_id: ""
	});

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handlePaymentMethodChange = (e) => {
		const method = paymentMethodsData?.data?.find(m => m.id === Number(e.target.value));
		setForm({
			...form,
			payment_method_id: e.target.value,
			bank_name: method?.name || "",
			type: method?.type || ""
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await addUserBankAccount({
				user_id: userId,
				...form
			}).unwrap();
			toast.success("ব্যাংক অ্যাকাউন্ট যোগ হয়েছে!");
			setForm({ bank_name: "", type: "", account_no: "", acc_name: "", branch: "", route: "", payment_method_id: "" });
			refetch();
		} catch (err) {
			toast.error(err?.data?.message || "ব্যাংক অ্যাকাউন্ট যোগ ব্যর্থ হয়েছে!");
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h2 className="text-lg font-bold mb-4">ব্যাংক অ্যাকাউন্ট যোগ করুন</h2>
			<form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
				<div>
					<label className="block mb-1 text-sm">পেমেন্ট মেথড</label>
					<select
						name="payment_method_id"
						value={form.payment_method_id}
						onChange={handlePaymentMethodChange}
						className="w-full border rounded px-3 py-2"
						required
						disabled={isPaymentMethodsLoading}
					>
						<option value="">নির্বাচন করুন</option>
						{paymentMethodsData?.data?.map((method) => (
							<option key={method.id} value={method.id}>{method.name}</option>
						))}
					</select>
				</div>
				<div>
					<label className="block mb-1 text-sm">অ্যাকাউন্ট নম্বর</label>
					<input
						type="text"
						name="account_no"
						value={form.account_no}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2"
						required
					/>
				</div>
				<div>
					<label className="block mb-1 text-sm">অ্যাকাউন্টের নাম</label>
					<input
						type="text"
						name="acc_name"
						value={form.acc_name}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2"
						required
					/>
				</div>
				<div>
					<label className="block mb-1 text-sm">ব্রাঞ্চ</label>
					<input
						type="text"
						name="branch"
						value={form.branch}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2"
					/>
				</div>
				<div>
					<label className="block mb-1 text-sm">রাউট</label>
					<input
						type="text"
						name="route"
						value={form.route}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2"
					/>
				</div>
				<button
					type="submit"
					className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
					disabled={isAdding}
				>
					{isAdding ? "যোগ হচ্ছে..." : "যোগ করুন"}
				</button>
			</form>

			<h2 className="text-lg font-bold mt-8 mb-4">আপনার ব্যাংক অ্যাকাউন্টসমূহ</h2>
			<div className="bg-white p-4 rounded shadow">
				{bankAccountsData?.data?.length ? (
					<table className="w-full text-sm">
						<thead>
							<tr>
								<th className="text-left">#</th>
								<th className="text-left">পেমেন্ট মেথড</th>
								<th className="text-left">অ্যাকাউন্টের নাম</th>
								<th className="text-left">অ্যাকাউন্ট নম্বর</th>
								<th className="text-left">ব্রাঞ্চ</th>
								<th className="text-left">রাউট</th>
								<th className="text-left">স্ট্যাটাস</th>
							</tr>
						</thead>
						<tbody>
							{bankAccountsData.data.map((acc, i) => (
								<tr key={acc.id}>
									<td>{i + 1}</td>
									<td>{acc.payment_method?.name || acc.bank_name}</td>
									<td>{acc.acc_name}</td>
									<td>{acc.account_no}</td>
									<td>{acc.branch || "-"}</td>
									<td>{acc.route || "-"}</td>
									<td>{acc.is_active ? "Active" : "Inactive"}</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<div className="text-gray-500">কোনো ব্যাংক অ্যাকাউন্ট পাওয়া যায়নি।</div>
				)}
			</div>
		</div>
	);
};

export default VendorBankAccount;
