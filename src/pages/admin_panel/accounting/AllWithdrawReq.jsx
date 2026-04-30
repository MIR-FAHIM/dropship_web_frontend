import React from "react";
import { useGetAllWithdrawsQuery, useChangeWithdrawStatusMutation } from "../../../redux/features/withdraw";


const AllWithdrawReq = () => {
	const { data, error, isLoading, refetch } = useGetAllWithdrawsQuery();
	const [changeStatus, { isLoading: statusLoading }] = useChangeWithdrawStatusMutation();

	const handleStatusChange = async (id, status) => {
		try {
			await changeStatus({ id, status }).unwrap();
			refetch();
		} catch (err) {
			alert("Failed to update status");
		}
	};

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">All Withdraw Requests</h1>
			{isLoading ? (
				<p>Loading...</p>
			) : error ? (
				<p className="text-red-500">Error loading withdraw requests</p>
			) : (
				<table className="table-auto w-full border-collapse bg-white shadow rounded">
					<thead>
						<tr className="bg-gray-100">
							<th className="border p-2">ID</th>
							<th className="border p-2">User Name</th>
							<th className="border p-2">User Email</th>
							<th className="border p-2">Amount</th>
							<th className="border p-2">Status</th>
							<th className="border p-2">Bank Name</th>
							<th className="border p-2">Account No</th>
							<th className="border p-2">Created At</th>
							<th className="border p-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{data?.data?.map((item) => (
							<tr key={item.id}>
								<td className="border p-2">{item.id}</td>
								<td className="border p-2">{item.user?.name}</td>
								<td className="border p-2">{item.user?.email}</td>
								<td className="border p-2">{item.amount}</td>
								<td className="border p-2">{item.status}</td>
								<td className="border p-2">{item.bank?.bank_name}</td>
								<td className="border p-2">{item.bank?.account_no}</td>
								<td className="border p-2">{new Date(item.created_at).toLocaleString()}</td>
								<td className="border p-2">
									{item.status === "pending" && (
										<>
											<button
												className="bg-green-500 text-white px-2 py-1 rounded mr-2"
												disabled={statusLoading}
												onClick={() => handleStatusChange(item.id, "approved")}
											>
												Approve
											</button>
											<button
												className="bg-red-500 text-white px-2 py-1 rounded"
												disabled={statusLoading}
												onClick={() => handleStatusChange(item.id, "rejected")}
											>
												Reject
											</button>
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
};

export default AllWithdrawReq;
