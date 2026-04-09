import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Loader2,
  ListChecks,
  Calendar,
  Flag,
  Tag,
  User,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  XCircle,
  BarChart3,
  Eye,
} from "lucide-react";
import {
  useGetTaskListQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useGetTaskStatusListQuery,
  useGetTaskTypeListQuery,
  useGetTaskPriorityListQuery,
} from "../../../redux/features/task";

const priorityColors = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-red-100 text-red-700",
};

const statusIcons = {
  Pending: <Clock className="w-3.5 h-3.5" />,
  "In Progress": <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  "In Review": <AlertCircle className="w-3.5 h-3.5" />,
  Completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  "On Hold": <PauseCircle className="w-3.5 h-3.5" />,
  Cancelled: <XCircle className="w-3.5 h-3.5" />,
};

const statusColors = {
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  "In Review": "bg-purple-100 text-purple-700 border-purple-200",
  Completed: "bg-green-100 text-green-700 border-green-200",
  "On Hold": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const AdminTasks = () => {
  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [detailTask, setDetailTask] = useState(null);

  const { data: taskData, isLoading: tasksLoading } = useGetTaskListQuery();
  const { data: statusData } = useGetTaskStatusListQuery();
  const { data: typeData } = useGetTaskTypeListQuery();
  const { data: priorityData } = useGetTaskPriorityListQuery();
  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const tasks = taskData?.data?.data || [];
  const statuses = statusData?.data?.data || [];
  const taskTypes = typeData?.data?.data || [];
  const priorities = priorityData?.data?.data || [];

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (activeStatusTab !== "all") {
      result = result.filter(
        (t) => String(t.status?.id) === String(activeStatusTab)
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.task_title?.toLowerCase().includes(q) ||
          t.task_details?.toLowerCase().includes(q) ||
          t.creator?.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tasks, activeStatusTab, searchQuery]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { all: tasks.length };
    statuses.forEach((s) => {
      counts[s.id] = tasks.filter((t) => t.status?.id === s.id).length;
    });
    return counts;
  }, [tasks, statuses]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      year: "numeric",    
      month: "short",
      day: "numeric",
    });
  };

  const handleStatusChange = async (taskId, newStatusId) => {
    try {
      await updateTaskStatus({ id: taskId, status_id: newStatusId }).unwrap();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // Create task form
  const [form, setForm] = useState({
    task_title: "",
    task_details: "",
    priority_id: "",
    task_type_id: "",
    status_id: "",
    due_date: "",
    start_date: "",
    completion_percentage: 0,
    is_active: 1,
    is_remind: 0,
    is_waiting: 0,
    show_completion_percentage: 1,
  });

  const resetForm = () => {
    setForm({
      task_title: "",
      task_details: "",
      priority_id: "",
      task_type_id: "",
      status_id: "",
      due_date: "",
      start_date: "",
      completion_percentage: 0,
      is_active: 1,
      is_remind: 0,
      is_waiting: 0,
      show_completion_percentage: 1,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        fd.append(key, value);
      }
    });
    try {
      await createTask(fd).unwrap();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error("Task create failed:", err);
    }
  };

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-red-500" />
          টাস্ক ম্যানেজমেন্ট
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          নতুন টাস্ক
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveStatusTab("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition border ${
            activeStatusTab === "all"
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          সকল ({statusCounts.all || 0})
        </button>
        {statuses.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStatusTab(s.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition border ${
              activeStatusTab === s.id
                ? "bg-gray-800 text-white border-gray-800"
                : `${statusColors[s.name] || "bg-white text-gray-600 border-gray-200"} hover:opacity-80`
            }`}
          >
            {statusIcons[s.name]}
            {s.name} ({statusCounts[s.id] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="টাস্ক খুঁজুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
        />
      </div>

      {/* Task Cards / Table */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
          <ListChecks className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">
            কোনো টাস্ক পাওয়া যায়নি।
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600">
                    <th className="text-left py-3 px-4 font-medium">টাস্ক</th>
                    <th className="text-left py-3 px-4 font-medium">ধরন</th>
                    <th className="text-center py-3 px-4 font-medium">
                      প্রায়োরিটি
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      স্ট্যাটাস
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      অগ্রগতি
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      তৈরি করেছেন
                    </th>
                    <th className="text-left py-3 px-4 font-medium">তারিখ</th>
                    <th className="text-center py-3 px-4 font-medium">
                      অ্যাকশন
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="font-semibold text-gray-800 line-clamp-1">
                          {task.task_title}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                          {task.task_details}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                          <Tag className="w-3 h-3" />
                          {task.task_type?.name || "—"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                            priorityColors[task.priority?.name] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Flag className="w-3 h-3" />
                          {task.priority?.name || "—"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={task.status?.id || ""}
                          onChange={(e) =>
                            handleStatusChange(task.id, e.target.value)
                          }
                          className={`text-xs font-medium px-2 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                            statusColors[task.status?.name] ||
                            "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {statuses.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        {task.show_completion_percentage ? (
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  task.completion_percentage >= 100
                                    ? "bg-green-500"
                                    : task.completion_percentage >= 50
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                                }`}
                                style={{
                                  width: `${Math.min(task.completion_percentage || 0, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 font-medium w-8">
                              {task.completion_percentage || 0}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                            {task.creator?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-xs text-gray-600 line-clamp-1">
                            {task.creator?.name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {formatDate(task.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setDetailTask(task)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-red-500"
                          title="বিস্তারিত দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
              >
                {/* Title & View */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-2">
                      {task.task_title}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                      {task.task_details}
                    </p>
                  </div>
                  <button
                    onClick={() => setDetailTask(task)}
                    className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-red-500"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      priorityColors[task.priority?.name] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Flag className="w-3 h-3" />
                    {task.priority?.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                    <Tag className="w-3 h-3" />
                    {task.task_type?.name}
                  </span>
                </div>

                {/* Status Dropdown */}
                <div>
                  <select
                    value={task.status?.id || ""}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value)
                    }
                    className={`w-full text-xs font-medium px-3 py-2 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                      statusColors[task.status?.name] ||
                      "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Progress Bar */}
                {task.show_completion_percentage && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          task.completion_percentage >= 100
                            ? "bg-green-500"
                            : task.completion_percentage >= 50
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                        }`}
                        style={{
                          width: `${Math.min(task.completion_percentage || 0, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {task.completion_percentage || 0}%
                    </span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                      {task.creator?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span className="text-[11px] text-gray-500">
                      {task.creator?.name || "—"}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {formatDate(task.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-500" />
                নতুন টাস্ক তৈরি করুন
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  টাস্কের শিরোনাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.task_title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, task_title: e.target.value }))
                  }
                  placeholder="টাস্কের শিরোনাম লিখুন"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  বিস্তারিত
                </label>
                <textarea
                  rows={3}
                  value={form.task_details}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, task_details: e.target.value }))
                  }
                  placeholder="টাস্কের বিস্তারিত লিখুন"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
                />
              </div>

              {/* Type & Priority Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    ধরন
                  </label>
                  <select
                    value={form.task_type_id}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, task_type_id: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-white"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {taskTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    প্রায়োরিটি
                  </label>
                  <select
                    value={form.priority_id}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, priority_id: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-white"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {priorities.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Completion Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    স্ট্যাটাস
                  </label>
                  <select
                    value={form.status_id}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status_id: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-white"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    অগ্রগতি (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.completion_percentage}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        completion_percentage: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  />
                </div>
              </div>

              {/* Date Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    শুরুর তারিখ
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, start_date: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    শেষ তারিখ
                  </label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, due_date: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.is_remind}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        is_remind: e.target.checked ? 1 : 0,
                      }))
                    }
                    className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-600">রিমাইন্ডার</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.is_waiting}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        is_waiting: e.target.checked ? 1 : 0,
                      }))
                    }
                    className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-600">ওয়েটিং</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.show_completion_percentage}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        show_completion_percentage: e.target.checked ? 1 : 0,
                      }))
                    }
                    className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-600">অগ্রগতি দেখাও</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition disabled:opacity-50"
                >
                  {creating && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {detailTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-red-500" />
                টাস্কের বিবরণ
              </h2>
              <button
                onClick={() => setDetailTask(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {detailTask.task_title}
                </h3>
              </div>

              {/* Details */}
              {detailTask.task_details && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    বিস্তারিত
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100">
                    {detailTask.task_details}
                  </p>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[11px] text-gray-400 font-medium mb-1">
                    স্ট্যাটাস
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${
                      statusColors[detailTask.status?.name] ||
                      "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {statusIcons[detailTask.status?.name]}
                    {detailTask.status?.name || "—"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[11px] text-gray-400 font-medium mb-1">
                    প্রায়োরিটি
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                      priorityColors[detailTask.priority?.name] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Flag className="w-3 h-3" />
                    {detailTask.priority?.name || "—"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[11px] text-gray-400 font-medium mb-1">
                    ধরন
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                    <Tag className="w-3 h-3" />
                    {detailTask.task_type?.name || "—"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[11px] text-gray-400 font-medium mb-1">
                    অগ্রগতি
                  </p>
                  {detailTask.show_completion_percentage ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            detailTask.completion_percentage >= 100
                              ? "bg-green-500"
                              : detailTask.completion_percentage >= 50
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                          style={{
                            width: `${Math.min(detailTask.completion_percentage || 0, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        {detailTask.completion_percentage || 0}%
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
                  <span>শুরু: {formatDate(detailTask.start_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>শেষ: {formatDate(detailTask.due_date)}</span>
                </div>
              </div>

              {/* Creator */}
              {detailTask.creator && (
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600">
                    {detailTask.creator.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {detailTask.creator.name}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {detailTask.creator.email} &middot;{" "}
                      {formatDate(detailTask.created_at)}
                    </p>
                  </div>
                </div>
              )}

              {/* Flags */}
              <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                {detailTask.is_remind && (
                  <span className="text-[11px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                    🔔 রিমাইন্ডার
                  </span>
                )}
                {detailTask.is_waiting && (
                  <span className="text-[11px] bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-full font-medium">
                    ⏳ ওয়েটিং
                  </span>
                )}
                {detailTask.is_active && (
                  <span className="text-[11px] bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-medium">
                    ✅ সক্রিয়
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setDetailTask(null)}
                className="px-5 py-2.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-200 transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
