import React, { useState } from "react";
import { Truck, Search, Users, UserCheck, UserX, Loader2, XCircle } from "lucide-react";
import { useGetDropshippersQuery } from "../../redux/features/user";

const AdminDropshippers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetDropshippersQuery(page);

  const pagination = data?.data || {};
  const dropshippers = pagination.data || [];
  const totalCount = pagination.total || 0;
  const lastPage = pagination.last_page || 1;
  const activeCount = dropshippers.filter((d) => !d.banned).length;
  const bannedCount = dropshippers.filter((d) => d.banned).length;

  const filtered = dropshippers.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      d.name?.toLowerCase().includes(term) ||
      d.email?.toLowerCase().includes(term) ||
      d.phone?.toLowerCase().includes(term) ||
      d.address?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">ড্রপশিপার ব্যবস্থাপনা</h1>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ড্রপশিপার খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
            <p className="text-xs text-gray-500 font-medium">মোট ড্রপশিপার</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
            <p className="text-xs text-gray-500 font-medium">সক্রিয়</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{bannedCount}</p>
            <p className="text-xs text-gray-500 font-medium">নিষ্ক্রিয়</p>
          </div>
        </div>
      </div>

      {/* Table */}
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
            <Truck className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              {searchTerm ? "কোনো ড্রপশিপার পাওয়া যায়নি।" : "এখনো কোনো ড্রপশিপার নেই।"}
            </p>
            <p className="text-gray-400 text-xs mt-1">ড্রপশিপার রেজিস্টার করলে এখানে দেখা যাবে।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">নাম</th>
                  <th className="pb-3 font-medium">ইমেইল</th>
                  <th className="pb-3 font-medium">ফোন</th>
                  <th className="pb-3 font-medium">ঠিকানা</th>
                  <th className="pb-3 font-medium">ব্যালেন্স</th>
                  <th className="pb-3 font-medium">স্ট্যাটাস</th>
                  <th className="pb-3 font-medium">তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 text-gray-600">{(page - 1) * 20 + i + 1}</td>
                    <td className="py-3 font-medium text-gray-800">{user.name}</td>
                    <td className="py-3 text-gray-600">{user.email}</td>
                    <td className="py-3 text-gray-600">{user.phone}</td>
                    <td className="py-3 text-gray-600">{user.address || "—"}</td>
                    <td className="py-3 text-gray-600">৳{user.balance}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.banned
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.banned ? "নিষিদ্ধ" : "সক্রিয়"}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString("bn-BD")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              পূর্ববর্তী
            </button>
            <span className="text-sm text-gray-600">
              পৃষ্ঠা {page} / {lastPage}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              পরবর্তী
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDropshippers;
