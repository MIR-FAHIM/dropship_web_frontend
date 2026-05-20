import React, { useState } from "react";
import { Store, Search, CheckCircle, XCircle, Clock, Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetVendorListQuery, useVendorIsActiveMutation, useLoginAsVendorMutation } from "../../../redux/features/vendor_api";
import { useDispatch } from "react-redux";
import { setToken } from "../../../redux/slices/authSlice";
import { saveToLocalstorage } from "../../../utils/localstorage.utils";
import { toast } from "react-toastify";

const AdminVendors = () => {
  const { data, isLoading, error } = useGetVendorListQuery();
  const [vendorIsActive, { isLoading: isActiveLoading }] = useVendorIsActiveMutation();
  const [activeVendorId, setActiveVendorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loginAsVendor, { isLoading: isLoginLoading }] = useLoginAsVendorMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const vendors = data?.data || [];
  const activeCount = vendors.filter((v) => v.is_active === 1).length;
  const inactiveCount = vendors.filter((v) => v.is_active === 0).length;

  const filtered = vendors.filter((v) => {
    const term = searchTerm.toLowerCase();
    return (
      v.shop_name?.toLowerCase().includes(term) ||
      v.owner_name?.toLowerCase().includes(term) ||
      v.user?.email?.toLowerCase().includes(term) ||
      v.user?.phone?.toLowerCase().includes(term) ||
      v.zone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">ভেন্ডর ব্যবস্থাপনা</h1>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ভেন্ডর খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
            <p className="text-xs text-gray-500 font-medium">সক্রিয়</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center text-white">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{vendors.length}</p>
            <p className="text-xs text-gray-500 font-medium">মোট ভেন্ডর</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{inactiveCount}</p>
            <p className="text-xs text-gray-500 font-medium">নিষ্ক্রিয়</p>
          </div>
        </div>
      </div>

      {/* Vendor Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <XCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-red-500 text-sm">ডেটা লোড করতে সমস্যা হয়েছে।</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Store className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              {searchTerm ? "কোনো ভেন্ডর পাওয়া যায়নি।" : "এখনো কোনো ভেন্ডর নেই।"}
            </p>
            <p className="text-gray-400 text-xs mt-1">ভেন্ডর রেজিস্টার করলে এখানে তালিকায় দেখা যাবে।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">দোকানের নাম</th>
                  <th className="pb-3 font-medium">মালিক</th>
                  <th className="pb-3 font-medium">ইমেইল</th>
                  <th className="pb-3 font-medium">ফোন</th>
                  {/* <th className="pb-3 font-medium">জোন</th> */}
                  <th className="pb-3 font-medium">লগইন</th>
                  <th className="pb-3 font-medium">ধরন</th>
                  <th className="pb-3 font-medium">স্ট্যাটাস</th>
                  <th className="pb-3 font-medium">তারিখ</th>
                  <th className="pb-3 font-medium">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vendor, i) => (
                  <tr key={vendor.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 text-gray-600">{vendor.id} user: {vendor.user_id}</td>
                    <td className="py-3 font-medium text-gray-800">{vendor.shop_name}</td>
                    <td className="py-3 text-gray-600">{vendor.owner_name}</td>
                    <td className="py-3 text-gray-600">{vendor.user?.email}</td>
                    <td className="py-3 text-gray-600">{vendor.user?.phone}</td>
                    {/* <td className="py-3 text-gray-600 capitalize">{vendor.zone}</td> */}
                    <td className="py-3">
                      <button
                        className="px-3 py-1.5 text-xs rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 font-medium"
                        disabled={isLoginLoading}
                        onClick={async () => {
                          try {
                            const res = await loginAsVendor({ email: vendor.user?.email }).unwrap();
                            dispatch(setToken({ token: res.data.token }));
                            saveToLocalstorage("token", res.data.token);
                            saveToLocalstorage("userId", res.data.user.id);
                            saveToLocalstorage("vendorUser", JSON.stringify(res.data.user));
                            toast.success(res?.message || "লগইন সফল হয়েছে!");
                            if (res.data.user.user_type === "vendor") {
                              navigate("/vendor-panel");
                            } else {
                              navigate("/");
                            }
                          } catch (err) {
                            toast.error(err?.data?.message || "লগইন ব্যর্থ হয়েছে!");
                          }
                        }}
                      >
                        {isLoginLoading ? "অপেক্ষা করুন..." : "লগইন করুন"}
                      </button>
                    </td>
                    <td className="py-3 text-gray-600 capitalize">{vendor.shop_type}</td>
                    <td className="py-3">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!!vendor.is_active}
                          disabled={isActiveLoading && activeVendorId === vendor.id}
                          onChange={async (e) => {
                            setActiveVendorId(vendor.id);
                            try {
                              await vendorIsActive({ id: vendor.id, data: { is_active: e.target.checked ? 1 : 0 } });
                            } finally {
                              setActiveVendorId(null);
                            }
                          }}
                        />
                        <div
                          className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200 relative`}
                        >
                          <div
                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${vendor.is_active ? 'translate-x-5' : ''}`}
                          ></div>
                        </div>
                        <span
                          className={`ml-2 text-xs font-medium ${
                            vendor.is_active ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {vendor.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </span>
                        {isActiveLoading && activeVendorId === vendor.id && (
                          <Loader2 className="w-4 h-4 ml-2 text-gray-400 animate-spin" />
                        )}
                      </label>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {new Date(vendor.created_at).toLocaleDateString("bn-BD")}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate(`/admin-panel/vendors/${vendor.id}`)}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVendors;
