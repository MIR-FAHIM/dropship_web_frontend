import React from "react";
import { ClipboardList } from "lucide-react";

const VendorOrders = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">অর্ডার</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-16">
          <ClipboardList className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">এখনো কোনো অর্ডার পাওয়া যায়নি।</p>
          <p className="text-gray-400 text-xs mt-1">পণ্য তালিকাভুক্ত করলে অর্ডার আসতে শুরু করবে।</p>
        </div>
      </div>
    </div>
  );
};

export default VendorOrders;
