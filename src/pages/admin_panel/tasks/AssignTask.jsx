import React from "react";

const AssignTask = ({ admins, selectedAdmin, setSelectedAdmin, adminListLoading }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      অ্যাডমিন নির্বাচন করুন
    </label>
    <div className="flex flex-wrap gap-2 mb-3">
      {adminListLoading ? (
        <span className="text-xs text-gray-400">লোড হচ্ছে...</span>
      ) : admins.length === 0 ? (
        <span className="text-xs text-gray-400">কোনো অ্যাডমিন নেই</span>
      ) : (
        admins.map((admin) => (
          <button
            type="button"
            key={admin.id}
            className={`px-3 py-1 rounded-full border text-xs font-medium transition ${selectedAdmin?.id === admin.id ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
            onClick={() => setSelectedAdmin(admin)}
          >
            {admin.name}
          </button>
        ))
      )}
    </div>
  </div>
);

export default AssignTask;
