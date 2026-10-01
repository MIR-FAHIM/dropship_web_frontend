const settingItems = [
  { name: "cash_on_delivery", label: "ক্যাশ অন ডেলিভারি" },
  { name: "refundable", label: "রিফান্ডযোগ্য" },
  { name: "published", label: "পাবলিশড" },
  { name: "featured", label: "ফিচার্ড" },
  { name: "seller_featured", label: "Hot Product" },
  { name: "todays_deal", label: "আজকের ডিল" },
  { name: "variant_product", label: "ভ্যারিয়েন্ট পণ্য" },
  { name: "stock_visibility_state", label: "স্টক দৃশ্যমান" },
];

const ShippingTab = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <div>
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-4">সেটিংস</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingItems.map((item) => (
          <label key={item.name} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              name={item.name}
              checked={formData[item.name] === 1}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

export default ShippingTab;
