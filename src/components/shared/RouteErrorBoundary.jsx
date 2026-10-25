import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error("Route error caught by RouteErrorBoundary:", error);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">কিছু একটা সমস্যা হয়েছে</h2>
        <p className="text-sm text-gray-500 mb-4">
          পৃষ্ঠাটি লোড করার সময় একটি সমস্যা দেখা দিয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
        </p>
        {(error?.message || error?.statusText) && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-xs text-left rounded-lg overflow-x-auto font-mono max-h-32">
            {error?.message || error?.statusText}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>রিলোড করুন</span>
          </button>
          <button
            onClick={() => navigate("/app")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            <Home className="w-4 h-4" />
            <span>হোমে যান</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
