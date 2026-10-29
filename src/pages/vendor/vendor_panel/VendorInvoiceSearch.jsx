import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Receipt,
  X,
  Loader2,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useListVendorInvoicesQuery } from "../../../redux/features/orderSettlement";
import { useGetVendorIdQuery } from "../../../redux/features/vendor_api";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { formatBDT } from "../../../utils/orderBreakdown.utils";
import { InvoicePaymentModal, STATUS_CONFIG } from "./VendorInvoices";

export default function VendorInvoiceSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const user = getFromLocalstorage("user");
  const userId = getFromLocalstorage("userId") || user?.id;
  const { data: vendorIdData } = useGetVendorIdQuery(userId, { skip: !userId });
  const vendorId = vendorIdData?.data?.vendor_id || vendorIdData?.data?.id || user?.vendor_id;

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Query invoices when search is active
  const shouldSearch = debouncedSearch.length >= 2;
  const { data, isLoading, refetch } = useListVendorInvoicesQuery(
    {
      search: debouncedSearch,
      vendor_id: vendorId || undefined,
      per_page: 5,
    },
    { skip: !shouldSearch }
  );

  const searchResults = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsOpen(false);
    setIsMobileExpanded(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.length === 1) {
        handleSelectInvoice(searchResults[0]);
      } else if (searchResults.length > 1) {
        // Find exact match
        const exact = searchResults.find(
          (inv) => inv.invoice_number?.toLowerCase() === searchTerm.trim().toLowerCase()
        );
        if (exact) {
          handleSelectInvoice(exact);
        } else {
          setIsOpen(true);
        }
      } else if (searchTerm.trim()) {
        navigate(`/vendor-panel/invoices?search=${encodeURIComponent(searchTerm.trim())}`);
        setIsOpen(false);
        setIsMobileExpanded(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setIsMobileExpanded(false);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-md">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3 pointer-events-none text-indigo-500 flex items-center gap-1.5">
          <Receipt className="w-4 h-4 text-indigo-600" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (searchTerm.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="ইনভয়েস নম্বর (INV-...) দিয়ে খুঁজুন ও পে করুন"
          className="w-full pl-9 pr-9 py-2 text-xs rounded-full border border-gray-300 bg-gray-50/80 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition placeholder:text-gray-400 font-medium"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && shouldSearch && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 min-w-[300px]">
          {/* Dropdown Header */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              ইনভয়েস অনুসন্ধান ফলাফল
            </span>
            {isLoading && (
              <span className="flex items-center gap-1 text-indigo-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                খোঁজা হচ্ছে...
              </span>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {isLoading && searchResults.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-1.5" />
                ইনভয়েস অনুসন্ধান করা হচ্ছে...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-5 text-center space-y-1">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                <p className="text-xs font-semibold text-gray-800">
                  "{debouncedSearch}" নম্বরের কোনো ইনভয়েস পাওয়া যায়নি
                </p>
                <p className="text-[11px] text-gray-400">
                  ইনভয়েস নম্বরটি সঠিক কিনা পরীক্ষা করুন অথবা সকল ইনভয়েস তালিকায় দেখুন।
                </p>
              </div>
            ) : (
              searchResults.map((inv) => {
                const statusCfg = STATUS_CONFIG?.[inv.status] || {
                  label: inv.status,
                  color: "bg-gray-100 text-gray-700",
                };
                const isPending = inv.status === "pending" || inv.status === "rejected";

                return (
                  <div
                    key={inv.id}
                    onClick={() => handleSelectInvoice(inv)}
                    className="p-3.5 hover:bg-indigo-50/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-gray-900 group-hover:text-indigo-600 transition">
                          {inv.invoice_number}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                        <span>
                          {new Date(inv.created_at).toLocaleDateString("bn-BD", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>&middot;</span>
                        <span>{inv.orders_count || 1} টি অর্ডার</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-gray-400 block uppercase">
                        প্রদেয় অর্থ
                      </span>
                      <span className="text-sm font-black text-amber-900 font-mono block">
                        {formatBDT(inv.total_amount_owed)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded-full ${
                          isPending
                            ? "bg-amber-100 text-amber-800 border border-amber-300 group-hover:bg-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {isPending ? "পে করুন ➔" : "বিস্তারিত দেখুন ➔"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All Invoices Link */}
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => {
                navigate(`/vendor-panel/invoices?search=${encodeURIComponent(searchTerm.trim())}`);
                setIsOpen(false);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 transition"
            >
              সকল ইনভয়েস পেজে খুঁজুন <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Invoice Details & Payment Modal */}
      {selectedInvoice && (
        <InvoicePaymentModal
          invoice={selectedInvoice}
          onClose={() => {
            setSelectedInvoice(null);
            refetch();
          }}
          onSuccess={() => {
            setSelectedInvoice(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
