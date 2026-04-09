import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  UserCog,
  Loader2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useGetAdminListQuery } from "../../../redux/features/user";

const AdminEmployees = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useGetAdminListQuery();

  const admins = data?.data?.data || [];
  const total = data?.data?.total || 0;

  const activeCount = useMemo(
    () => admins.filter((a) => !a.banned).length,
    [admins]
  );
  const bannedCount = useMemo(
    () => admins.filter((a) => a.banned).length,
    [admins]
  );

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return admins;
    const q = searchQuery.toLowerCase();
    return admins.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.toLowerCase().includes(q)
    );
  }, [admins, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">
          কর্মচারী ব্যবস্থাপনা
        </h1>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">
              {total}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
              মোট অ্যাডমিন
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-500 flex items-center justify-center text-white flex-shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">
              {activeCount}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
              সক্রিয়
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-500 flex items-center justify-center text-white flex-shrink-0">
            <ShieldOff className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">
              {bannedCount}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
              নিষিদ্ধ
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
          <Users className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">
            কোনো অ্যাডমিন পাওয়া যায়নি।
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600">
                    <th className="text-left py-3 px-4 font-medium">নাম</th>
                    <th className="text-left py-3 px-4 font-medium">ইমেইল</th>
                    <th className="text-left py-3 px-4 font-medium">ফোন</th>
                    <th className="text-left py-3 px-4 font-medium">ঠিকানা</th>
                    <th className="text-center py-3 px-4 font-medium">
                      ধরন
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      স্ট্যাটাস
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      যোগদান
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((admin) => (
                    <tr
                      key={admin.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 flex-shrink-0">
                            {admin.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-gray-800 line-clamp-1">
                            {admin.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {admin.email || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {admin.phone || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 text-xs line-clamp-1">
                        {admin.address || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full font-medium capitalize">
                          <UserCog className="w-3 h-3" />
                          {admin.user_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {admin.banned ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium">
                            <ShieldOff className="w-3 h-3" />
                            নিষিদ্ধ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-600 px-2.5 py-1 rounded-full font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            সক্রিয়
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {formatDate(admin.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((admin) => (
              <div
                key={admin.id}
                className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 flex-shrink-0">
                      {admin.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {admin.name}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium capitalize mt-0.5">
                        <UserCog className="w-3 h-3" />
                        {admin.user_type}
                      </span>
                    </div>
                  </div>
                  {admin.banned ? (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                      নিষিদ্ধ
                    </span>
                  ) : (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                      সক্রিয়
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-gray-500">
                  {admin.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {admin.email}
                    </div>
                  )}
                  {admin.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {admin.phone}
                    </div>
                  )}
                  {admin.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {admin.address}
                    </div>
                  )}
                </div>

                <div className="pt-1 border-t border-gray-100 text-[11px] text-gray-400">
                  যোগদান: {formatDate(admin.created_at)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminEmployees;
