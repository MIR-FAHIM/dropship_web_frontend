import React, { useState } from "react";
import { Building2, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useListDeliveryCompaniesQuery } from "../../../../redux/features/delivery_company";

const AdminDeliveryCompanies = () => {
  const { data, isLoading, error } = useListDeliveryCompaniesQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const companies = Array.isArray(data?.data?.data) ? data.data.data : [];

  const filtered = companies.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.company_name?.toLowerCase().includes(term) ||
      c.support_number?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.contact_person_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">ডেলিভারি কোম্পানি</h1>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="কোম্পানি খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{companies.length}</p>
            <p className="text-xs text-gray-500 font-medium">মোট কোম্পানি</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500 text-sm">
            ডেটা লোড করতে সমস্যা হয়েছে।
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            কোনো কোম্পানি পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">কোম্পানির নাম</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">যোগাযোগ ব্যক্তি</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">সাপোর্ট নম্বর</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">ইমেইল</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((company, index) => (
                  <tr
                    key={company.id ?? index}
                    onClick={() => navigate(`/admin-panel/delivery/companies/${company.id}`)}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{company.company_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{company.contact_person_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{company.support_number ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{company.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        company.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {company.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
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

export default AdminDeliveryCompanies;
