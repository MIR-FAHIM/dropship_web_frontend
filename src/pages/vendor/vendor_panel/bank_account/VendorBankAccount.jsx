import React, { useState } from "react";
import { useAddUserBankAccountMutation, useGetUserBankAccountQuery } from "../../../../redux/features/accounting";
import { toast } from "react-toastify";

const MFS_PROVIDERS = ["Bkash", "Nagad"];

const INITIAL_FORM = {
	bank_name: "",
	acc_name: "",
	account_no: "",
	branch: "",
	route: "",
	type: "",
};

const VendorBankAccount = () => {
	const userId = localStorage.getItem("userId");
	const { data: bankAccountsData, refetch } = useGetUserBankAccountQuery(userId);
	const [addUserBankAccount, { isLoading: isAdding }] = useAddUserBankAccountMutation();

	const [paymentMethod, setPaymentMethod] = useState("MFS"); // "MFS" | "Bank"
	const [form, setForm] = useState(INITIAL_FORM);

	const handleTabChange = (tab) => {
		setPaymentMethod(tab);
		setForm(INITIAL_FORM);
	};

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const payload = {
			user_id: userId,
			payment_method: paymentMethod,
			bank_name: form.bank_name,
			acc_name: form.acc_name,
			account_no: form.account_no,
			type: paymentMethod,
			...(paymentMethod === "Bank" && {
				branch: form.branch,
				route: form.route,
			}),
		};
		try {
			await addUserBankAccount(payload).unwrap();
			toast.success("অ্যাকাউন্ট যোগ হয়েছে!");
			setForm(INITIAL_FORM);
			refetch();
		} catch (err) {
			toast.error(err?.data?.message || "অ্যাকাউন্ট যোগ ব্যর্থ হয়েছে!");
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h2 className="text-lg font-bold mb-4">পেমেন্ট অ্যাকাউন্ট যোগ করুন</h2>

			{/* Tabs */}
			<div className="flex border-b mb-5">
				{["MFS", "Bank"].map((tab) => (
					<button
						key={tab}
						type="button"
						onClick={() => handleTabChange(tab)}
						className={`px-6 py-2 font-semibold text-sm border-b-2 transition-colors ${
							paymentMethod === tab
								? "border-blue-600 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700"
						}`}
					>
						{tab === "MFS" ? "MFS (বিকাশ/নগদ)" : "Bank (ব্যাংক)"}
					</button>
				))}
			</div>

			<form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-lg shadow">
				{paymentMethod === "MFS" ? (
					<>
						{/* MFS Provider */}
						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								MFS প্রদানকারী <span className="text-red-500">*</span>
							</label>
							<select
								name="bank_name"
								value={form.bank_name}
								onChange={handleChange}
								className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								required
							>
								<option value="">নির্বাচন করুন</option>
								{MFS_PROVIDERS.map((p) => (
									<option key={p} value={p}>{p}</option>
								))}
							</select>
						</div>

						{/* Mobile Number */}
						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								মোবাইল নম্বর <span className="text-red-500">*</span>
							</label>
							<input
								type="tel"
								name="account_no"
								value={form.account_no}
								onChange={handleChange}
								placeholder="01XXXXXXXXX"
								className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								required
								pattern="^01[3-9]\d{8}$"
								title="বৈধ মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)"
							/>
						</div>

						{/* Account Name */}
						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								অ্যাকাউন্টের নাম <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="acc_name"
								value={form.acc_name}
								onChange={handleChange}
								placeholder="অ্যাকাউন্টধারীর নাম"
								className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								required
							/>
						</div>
					</>
				) : (
					<>
						{/* Bank Name */}
						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								ব্যাংকের নাম <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="bank_name"
								value={form.bank_name}
								onChange={handleChange}
								placeholder="ব্যাংকের নাম লিখুন"
								className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								required
							/>
						</div>

						{/* Account Name */}
						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								অ্যাকাউন্টের নাম <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="acc_name"
								value={form.acc_name}
								onChange={handleChange}
								placeholder="অ্যাকাউন্টধারীর নাম"
								className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								required
							/>
						</div>

						{/* Account Number */}
						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">
								অ্যাকাউন্ট নম্বর <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="account_no"
								value={form.account_no}
								onChange={handleChange}
								placeholder="অ্যাকাউন্ট নম্বর"
								className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								required
							/>
						</div>

						{/* Branch */}
						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">ব্রাঞ্চ</label>
							<input
								type="text"
								name="branch"
								value={form.branch}
								onChange={handleChange}
								placeholder="ব্রাঞ্চের নাম"
								className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							/>
						</div>

						{/* Route / Routing Number */}
						<div>
							<label className="block mb-1 text-sm font-medium text-gray-700">রাউটিং নম্বর</label>
							<input
								type="text"
								name="route"
								value={form.route}
								onChange={handleChange}
								placeholder="রাউটিং নম্বর"
								className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							/>
						</div>
					</>
				)}

				<button
					type="submit"
					className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-60"
					disabled={isAdding}
				>
					{isAdding ? "যোগ হচ্ছে..." : "যোগ করুন"}
				</button>
			</form>

			{/* Account List */}
			<h2 className="text-lg font-bold mt-8 mb-4">আপনার অ্যাকাউন্টসমূহ</h2>
			<div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
				{bankAccountsData?.data?.length ? (
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-gray-50 text-gray-600">
								<th className="text-left p-2">#</th>
								<th className="text-left p-2">ধরন</th>
								<th className="text-left p-2">ব্যাংক / MFS</th>
								<th className="text-left p-2">অ্যাকাউন্টের নাম</th>
								<th className="text-left p-2">নম্বর</th>
								<th className="text-left p-2">ব্রাঞ্চ</th>
								<th className="text-left p-2">রাউট</th>
								<th className="text-left p-2">স্ট্যাটাস</th>
							</tr>
						</thead>
						<tbody>
							{bankAccountsData.data.map((acc, i) => (
								<tr key={acc.id} className="border-t">
									<td className="p-2">{i + 1}</td>
									<td className="p-2">
										<span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
											(acc.payment_method?.type || acc.payment_method?.name || acc.payment_method || acc.type) === "MFS"
												? "bg-green-100 text-green-700"
												: "bg-blue-100 text-blue-700"
										}`}>
											{acc.payment_method?.type || acc.payment_method?.name || acc.payment_method || acc.type || "Bank"}
										</span>
									</td>
									<td className="p-2">{acc.bank_name}</td>
									<td className="p-2">{acc.acc_name}</td>
									<td className="p-2">{acc.account_no}</td>
									<td className="p-2">{acc.branch || "-"}</td>
									<td className="p-2">{acc.route || "-"}</td>
									<td className="p-2">
										<span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
											acc.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
										}`}>
											{acc.is_active ? "Active" : "Inactive"}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<div className="text-gray-500 text-center py-6">কোনো অ্যাকাউন্ট পাওয়া যায়নি।</div>
				)}
			</div>
		</div>
	);
};

export default VendorBankAccount;
