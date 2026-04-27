
import React from "react";
import { useParams } from "react-router-dom";
import { useGetTaskDetailsQuery } from "../../../redux/features/task";
import { Flag, Tag, Calendar, ListChecks } from "lucide-react";
import { imgBaseUrl } from "../../../../config";

// These can be imported from AdminTasks if you want to share code
const priorityColors = {
	Low: "bg-green-100 text-green-700",
	Medium: "bg-yellow-100 text-yellow-700",
	High: "bg-red-100 text-red-700",
};
const statusColors = {
	Pending: "bg-gray-100 text-gray-600 border-gray-200",
	"In Progress": "bg-blue-100 text-blue-700 border-blue-200",
	"In Review": "bg-purple-100 text-purple-700 border-purple-200",
	Completed: "bg-green-100 text-green-700 border-green-200",
	"On Hold": "bg-yellow-100 text-yellow-700 border-yellow-200",
	Cancelled: "bg-red-100 text-red-700 border-red-200",
};


const TaskShareDetail = () => {
	const { id } = useParams();
	const { data, error, isLoading } = useGetTaskDetailsQuery(id);
	const task = data?.data;

const formatDate = (dateStr) => {
	if (!dateStr) return "—";
	return new Date(dateStr).toLocaleDateString("bn-BD", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

	if (isLoading) {
		return <div className="p-8 text-center">Loading...</div>;
	}
	if (error || !task) {
		return <div className="p-8 text-center text-red-500">Could not load task details.</div>;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
					<ListChecks className="w-5 h-5 text-red-500" />
					<h2 className="text-base font-bold text-gray-800">টাস্কের বিবরণ</h2>
				</div>
				{/* Body */}
				<div className="p-6 space-y-5">
					{/* Assigned To */}
					<div>
						<p className="text-xs font-medium text-gray-500 mb-1">Assigned To</p>
						<div className="flex flex-wrap gap-2">
							{Array.isArray(task.assigned_to) && task.assigned_to.length > 0 ? (
								task.assigned_to.map((a) => (
									<div key={a.id} className="flex items-center gap-1">
										<div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600">
											{a.assign_to?.name?.charAt(0)?.toUpperCase() || "?"}
										</div>
										<span className="text-xs text-gray-700 line-clamp-1">
											{a.assign_to?.name || "—"}
										</span>
									</div>
								))
							) : (
								<span className="text-xs text-gray-400">—</span>
							)}
						</div>
					</div>
					{/* Task Images */}
					<div>
						<p className="text-xs font-medium text-gray-500 mb-1">Task Images</p>
						<div className="flex flex-wrap gap-2">
							{Array.isArray(task.task_images) && task.task_images.length > 0 ? (
								task.task_images.map((img) => (
									img.task_image?.file_name ? (
										<img
											key={img.id}
											src={img.task_image?.url || `${imgBaseUrl}/${img.task_image.file_name}`}
											alt={img.task_image.file_original_name || img.task_image.file_name || 'task-img'}
											className="w-12 h-12 rounded object-cover border border-gray-200"
										/>
									) : null
								))
							) : (
								<span className="text-xs text-gray-400">—</span>
							)}
						</div>
					</div>
					{/* Title */}
					<div>
						<h3 className="text-lg font-bold text-gray-800">{task.task_title}</h3>
					</div>
					{/* Details */}
					{task.task_details && (
						<div>
							<p className="text-xs font-medium text-gray-500 mb-1">বিস্তারিত</p>
							<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100">
								{task.task_details}
							</p>
						</div>
					)}
					{/* Info Grid */}
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
							<p className="text-[11px] text-gray-400 font-medium mb-1">স্ট্যাটাস</p>
							<span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[task.status?.name] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
								{task.status?.name || task.status_id || "—"}
							</span>
						</div>
						<div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
							<p className="text-[11px] text-gray-400 font-medium mb-1">প্রায়োরিটি</p>
							<span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${priorityColors[task.priority?.name] || "bg-gray-100 text-gray-600"}`}>
								<Flag className="w-3 h-3" />
								{task.priority?.name || "—"}
							</span>
						</div>
						<div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
							<p className="text-[11px] text-gray-400 font-medium mb-1">ধরন</p>
							<span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
								<Tag className="w-3 h-3" />
								{task.task_type?.name || "—"}
							</span>
						</div>
						<div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
							<p className="text-[11px] text-gray-400 font-medium mb-1">অগ্রগতি</p>
							{task.show_completion_percentage ? (
								<div className="flex items-center gap-2 mt-1">
									<div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
										<div
											className={`h-full rounded-full transition-all ${
												(task.completion_percentage || 0) >= 100
													? "bg-green-500"
													: (task.completion_percentage || 0) >= 50
													? "bg-blue-500"
													: "bg-yellow-500"
											}`}
											style={{
												width: `${Math.min(task.completion_percentage || 0, 100)}%`,
											}}
										/>
									</div>
									<span className="text-xs font-bold text-gray-700">
										{task.completion_percentage || 0}%
									</span>
								</div>
							) : (
								<span className="text-xs text-gray-400">—</span>
							)}
						</div>
					</div>
					{/* Dates */}
					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-2 text-xs text-gray-500">
							<Calendar className="w-3.5 h-3.5 text-gray-400" />
							<span>শুরু: {formatDate(task.start_date)}</span>
						</div>
						<div className="flex items-center gap-2 text-xs text-gray-500">
							<Calendar className="w-3.5 h-3.5 text-gray-400" />
							<span>শেষ: {formatDate(task.due_date)}</span>
						</div>
					</div>
					{/* Creator */}
					{task.creator && (
						<div className="flex items-center gap-3 pt-3 border-t border-gray-100">
							<div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600">
								{task.creator.name?.charAt(0)?.toUpperCase() || "?"}
							</div>
							<div>
								<p className="text-sm font-medium text-gray-700">{task.creator.name}</p>
								<p className="text-[11px] text-gray-400">{task.creator.email} &middot; {formatDate(task.created_at)}</p>
							</div>
						</div>
					)}
					{/* Flags */}
					<div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
						{task.is_remind && (
							<span className="text-[11px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">🔔 রিমাইন্ডার</span>
						)}
						{task.is_waiting && (
							<span className="text-[11px] bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-full font-medium">⏳ ওয়েটিং</span>
						)}
						{task.is_active && (
							<span className="text-[11px] bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-medium">✅ সক্রিয়</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TaskShareDetail;
