import React from "react";
import { Wallet, DollarSign, TrendingUp, ArrowDownToLine } from "lucide-react";

const VendorAccounting = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">হিসাব-নিকাশ</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-500 font-medium">উইথড্র</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">৳০</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-500 font-medium">বর্তমান ব্যালেন্স</span>
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
          <p className="text-gray-400 text-xs mt-1">বিক্রয় শুরু হলে এখানে লেনদেনের বিবরণ দেখতে পাবেন।</p>
        </div>
      </div>
    </div>
  );
};

export default VendorAccounting;
