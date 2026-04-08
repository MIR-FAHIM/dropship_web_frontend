import React from "react";
import { Wallet, DollarSign, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Filter } from "lucide-react";

const AdminAccounting = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">হিসাব-নিকাশ</h1>
        <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
          <Filter className="w-4 h-4" />
          ফিল্টার
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-500 font-medium">মোট আয়</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">৳০</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-500 font-medium">মোট ব্যয়</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">৳০</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-500 font-medium">ভেন্ডর পেমেন্ট</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">৳০</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-500 font-medium">নিট মুনাফা</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">৳০</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">লেনদেনের ইতিহাস</h3>
        <div className="text-center py-16">
          <Wallet className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">এখনো কোনো লেনদেন হয়নি।</p>
          <p className="text-gray-400 text-xs mt-1">অর্ডার এবং পেমেন্ট হলে এখানে বিবরণ দেখা যাবে।</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAccounting;
