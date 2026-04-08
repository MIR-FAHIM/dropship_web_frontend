import React from "react";
import { Users, Search, Plus, UserCog } from "lucide-react";

const AdminEmployees = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">কর্মচারী ব্যবস্থাপনা</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="কর্মচারী খুঁজুন..."
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition shrink-0">
            <Plus className="w-4 h-4" />
            কর্মচারী যোগ
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">০</p>
            <p className="text-xs text-gray-500 font-medium">মোট কর্মচারী</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">০</p>
            <p className="text-xs text-gray-500 font-medium">সক্রিয়</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center text-white">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">০</p>
            <p className="text-xs text-gray-500 font-medium">নিষ্ক্রিয়</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-16">
          <Users className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">এখনো কোনো কর্মচারী যোগ করা হয়নি।</p>
          <p className="text-gray-400 text-xs mt-1">উপরের বাটনে ক্লিক করে কর্মচারী যোগ করুন।</p>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployees;
