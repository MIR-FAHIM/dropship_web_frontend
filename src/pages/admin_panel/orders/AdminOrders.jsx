import React from "react";
import { ClipboardList, Search, Filter } from "lucide-react";

const statusTabs = [
  { label: "সকল", value: "all", count: 0 },
  { label: "পেন্ডিং", value: "pending", count: 0 },
  { label: "প্রসেসিং", value: "processing", count: 0 },
  { label: "শিপড", value: "shipped", count: 0 },
  { label: "সম্পন্ন", value: "completed", count: 0 },
  { label: "বাতিল", value: "cancelled", count: 0 },
];

const AdminOrders = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">অর্ডার</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="অর্ডার আইডি খুঁজুন..."
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition shrink-0">
            <Filter className="w-4 h-4" />
            ফিল্টার
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition"
          >
            {tab.label} <span className="text-gray-400 ml-1">({tab.count})</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-16">
          <ClipboardList className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">এখনো কোনো অর্ডার পাওয়া যায়নি।</p>
          <p className="text-gray-400 text-xs mt-1">অর্ডার আসলে এখানে তালিকায় দেখা যাবে।</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
