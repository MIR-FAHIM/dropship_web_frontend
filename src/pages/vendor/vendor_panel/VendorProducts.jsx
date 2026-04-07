import React from "react";
import { Package, Plus } from "lucide-react";

const VendorProducts = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">পণ্য সমূহ</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          নতুন পণ্য যোগ করুন
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-16">
          <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">এখনো কোনো পণ্য যোগ করা হয়নি।</p>
          <p className="text-gray-400 text-xs mt-1">উপরের বাটনে ক্লিক করে আপনার প্রথম পণ্য যোগ করুন।</p>
        </div>
      </div>
    </div>
  );
};

export default VendorProducts;
