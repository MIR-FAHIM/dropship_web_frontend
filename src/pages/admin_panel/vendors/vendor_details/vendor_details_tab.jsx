import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Store, Package, Truck } from "lucide-react";
import VendorInfo from "./vendor_info";
import Products from "./products";
import CarryBeeInfo from "./carrybee_info";
import CarryBeeStore from "./carrybee_store";

const TABS = [
  { key: "info",     label: "Vendor Info",    icon: Store },
  { key: "products", label: "Products",        icon: Package },
  { key: "carrybee", label: "CarryBee Info",   icon: Truck },
  { key: "carrybee_store", label: "CarryBee Store",   icon: Truck },
];

const VendorDetailsTab = () => {
  const { id: vendorId } = useParams();
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === key
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "info"     && <VendorInfo     vendorId={vendorId} />}
      {activeTab === "products" && <Products       vendorId={vendorId} />}
      {activeTab === "carrybee" && <CarryBeeInfo   vendorId={vendorId} />}
      {activeTab === "carrybee_store" && <CarryBeeStore vendorId={vendorId} />}
    </div>
  );
};

export default VendorDetailsTab;
