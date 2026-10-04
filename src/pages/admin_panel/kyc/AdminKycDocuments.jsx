import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Eye,
  Search,
  RotateCw,
  FileText,
  ExternalLink,
  Loader2,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  X,
  Check,
  FileCheck,
  ZoomIn,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  useGetKycDocumentsListQuery,
  useUpdateKycDocumentMutation,
} from "../../../redux/features/vendor_api";
import { toast } from "react-toastify";
import { imgBaseUrl } from "../../../../config";

// Document type labels and styling
const DOCUMENT_TYPES = {
  nid_front: { label: "NID (Front Side)", bn: "এনআইডি (সামনের অংশ)", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  nid_back: { label: "NID (Back Side)", bn: "এনআইডি (পেছনের অংশ)", color: "bg-purple-50 text-purple-700 border-purple-200" },
  trade_license: { label: "Trade License", bn: "ট্রেড লাইসেন্স", color: "bg-teal-50 text-teal-700 border-teal-200" },
  irc: { label: "Import Reg. Certificate (IRC)", bn: "আইআরসি সার্টিফিকেট", color: "bg-blue-50 text-blue-700 border-blue-200" },
};

const getDocTypeConfig = (type) =>
  DOCUMENT_TYPES[type] || { label: type || "Unknown", bn: type, color: "bg-gray-50 text-gray-700 border-gray-200" };

// Status configuration
const STATUS_CONFIG = {
  submitted: {
    label: "Submitted",
    bn: "জমা দেওয়া হয়েছে",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    badgeBg: "bg-blue-500",
    icon: Send,
  },
  pending: {
    label: "Pending",
    bn: "পেন্ডিং",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    badgeBg: "bg-amber-500",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    bn: "অনুমোদিত",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    badgeBg: "bg-emerald-500",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    bn: "প্রত্যাখ্যাত",
    color: "bg-red-100 text-red-800 border-red-300",
    badgeBg: "bg-red-500",
    icon: XCircle,
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status?.toLowerCase()] || {
    label: status || "Unknown",
    bn: status,
    color: "bg-gray-100 text-gray-700 border-gray-300",
    badgeBg: "bg-gray-500",
    icon: AlertCircle,
  };

const getDocumentUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanBase = String(imgBaseUrl || "https://apidropship.resellerbrain.com/storage/app/public").replace(/\/+$/, "");
  let cleanPath = String(path).replace(/^\/+/, "");
  if (cleanPath.startsWith("storage/app/public/")) {
    cleanPath = cleanPath.replace(/^storage\/app\/public\//, "");
  } else if (cleanPath.startsWith("app/public/")) {
    cleanPath = cleanPath.replace(/^app\/public\//, "");
  }
  return `${cleanBase}/${cleanPath}`;
};

const isPdfFile = (path) => {
  if (!path) return false;
  return String(path).toLowerCase().split("?")[0].endsWith(".pdf");
};

const formatDate = (isoString) => {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};

const AdminKycDocuments = () => {
  // Filters & State
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Modals state
  const [previewDoc, setPreviewDoc] = useState(null);
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [approvingDoc, setApprovingDoc] = useState(null);
  const [approvalNote, setApprovalNote] = useState("");

  // RTK Query: Summary Counts (Fetch all for global totals)
  const { data: allDocsData, refetch: refetchSummary } = useGetKycDocumentsListQuery({ all: 1 });
  const allDocs = useMemo(() => {
    const raw = allDocsData?.data?.data || allDocsData?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [allDocsData]);

  const summaryCounts = useMemo(() => {
    const counts = { total: 0, submitted: 0, pending: 0, approved: 0, rejected: 0 };
    counts.total = allDocs.length;
    allDocs.forEach((doc) => {
      const s = doc?.status?.toLowerCase();
      if (counts[s] !== undefined) counts[s] += 1;
    });
    return counts;
  }, [allDocs]);

  // RTK Query: Paginated & Filtered Query
  const queryParams = useMemo(() => {
    const p = { page, per_page: perPage };
    if (statusFilter !== "all") p.status = statusFilter;
    if (typeFilter !== "all") p.type = typeFilter;
    return p;
  }, [statusFilter, typeFilter, page]);

  const {
    data: listResponse,
    isLoading,
    isFetching,
    refetch: refetchList,
  } = useGetKycDocumentsListQuery(queryParams);

  const [updateKycDocument, { isLoading: isUpdating }] = useUpdateKycDocumentMutation();

  const paginationData = listResponse?.data;
  const documents = useMemo(() => {
    const raw = paginationData?.data || (Array.isArray(paginationData) ? paginationData : []);
    return Array.isArray(raw) ? raw : [];
  }, [paginationData]);

  const totalPages = paginationData?.last_page || 1;
  const totalItems = paginationData?.total ?? documents.length;

  // Client-side search filtering across User Name, Email, Phone
  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) return documents;
    const term = searchTerm.toLowerCase();
    return documents.filter((doc) => {
      const user = doc?.user || {};
      const name = String(user?.name || "").toLowerCase();
      const email = String(user?.email || "").toLowerCase();
      const phone = String(user?.phone || "").toLowerCase();
      const docName = String(doc?.document_name || "").toLowerCase();
      const docType = String(doc?.type || "").toLowerCase();
      return (
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        docName.includes(term) ||
        docType.includes(term)
      );
    });
  }, [documents, searchTerm]);

  // Refresh handler
  const handleRefresh = () => {
    refetchList();
    refetchSummary();
    toast.info("KYC তথ্য রিফ্রেশ করা হয়েছে");
  };

  // Status Update Handler (Approve)
  const handleApproveConfirm = async () => {
    if (!approvingDoc) return;
    try {
      await updateKycDocument({
        id: approvingDoc.id,
        status: "approved",
        note: approvalNote.trim() || undefined,
      }).unwrap();
      toast.success("ডকুমেন্ট সফলভাবে অনুমোদিত হয়েছে (Document Approved Successfully)!");
      setApprovingDoc(null);
      setApprovalNote("");
      if (previewDoc?.id === approvingDoc.id) {
        setPreviewDoc(null);
      }
      refetchList();
      refetchSummary();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।");
    }
  };

  // Status Update Handler (Reject)
  const handleRejectConfirm = async () => {
    if (!rejectingDoc) return;
    if (!rejectionNote.trim()) {
      toast.error("প্রত্যাখ্যানের কারণ (Rejection Reason) উল্লেখ করুন।");
      return;
    }
    try {
      await updateKycDocument({
        id: rejectingDoc.id,
        status: "rejected",
        note: rejectionNote.trim(),
      }).unwrap();
      toast.success("ডকুমেন্ট প্রত্যাখ্যাত হয়েছে (Document Rejected)!");
      setRejectingDoc(null);
      setRejectionNote("");
      if (previewDoc?.id === rejectingDoc.id) {
        setPreviewDoc(null);
      }
      refetchList();
      refetchSummary();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">KYC Document Verification</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                ভেন্ডর ও ব্যবহারকারীদের জমাকৃত KYC ডকুমেন্ট যাচাই ও অনুমোদন
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          রিফ্রেশ
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {/* Total */}
        <button
          onClick={() => { setStatusFilter("all"); setPage(1); }}
          className={`p-4 rounded-xl border text-left transition cursor-pointer bg-white ${
            statusFilter === "all"
              ? "border-indigo-500 ring-2 ring-indigo-100 shadow-sm"
              : "border-gray-200 hover:border-gray-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">মোট ডকুমেন্ট</span>
            <FileCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">{summaryCounts.total}</p>
        </button>

        {/* Submitted */}
        <button
          onClick={() => { setStatusFilter("submitted"); setPage(1); }}
          className={`p-4 rounded-xl border text-left transition cursor-pointer bg-white ${
            statusFilter === "submitted"
              ? "border-blue-500 ring-2 ring-blue-100 shadow-sm"
              : "border-gray-200 hover:border-blue-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600">Submitted</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{summaryCounts.submitted}</p>
        </button>

        {/* Pending */}
        <button
          onClick={() => { setStatusFilter("pending"); setPage(1); }}
          className={`p-4 rounded-xl border text-left transition cursor-pointer bg-white ${
            statusFilter === "pending"
              ? "border-amber-500 ring-2 ring-amber-100 shadow-sm"
              : "border-gray-200 hover:border-amber-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600">Pending</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{summaryCounts.pending}</p>
        </button>

        {/* Approved */}
        <button
          onClick={() => { setStatusFilter("approved"); setPage(1); }}
          className={`p-4 rounded-xl border text-left transition cursor-pointer bg-white ${
            statusFilter === "approved"
              ? "border-emerald-500 ring-2 ring-emerald-100 shadow-sm"
              : "border-gray-200 hover:border-emerald-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">Approved</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{summaryCounts.approved}</p>
        </button>

        {/* Rejected */}
        <button
          onClick={() => { setStatusFilter("rejected"); setPage(1); }}
          className={`p-4 rounded-xl border text-left transition cursor-pointer bg-white col-span-2 sm:col-span-1 ${
            statusFilter === "rejected"
              ? "border-red-500 ring-2 ring-red-100 shadow-sm"
              : "border-gray-200 hover:border-red-200 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600">Rejected</span>
            <span className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">{summaryCounts.rejected}</p>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ইউজারের নাম, ইমেইল অথবা ফোন দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 whitespace-nowrap font-medium">স্ট্যাটাস:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">সকল স্ট্যাটাস (All)</option>
              <option value="submitted">Submitted (জমা দেওয়া)</option>
              <option value="pending">Pending (পেন্ডিং)</option>
              <option value="approved">Approved (অনুমোদিত)</option>
              <option value="rejected">Rejected (প্রত্যাখ্যাত)</option>
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 whitespace-nowrap font-medium">ডকুমেন্ট টাইপ:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">সকল টাইপ (All Types)</option>
              <option value="nid_front">NID Front Side</option>
              <option value="nid_back">NID Back Side</option>
              <option value="trade_license">Trade License</option>
              <option value="irc">Import Reg. Certificate (IRC)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-gray-500 font-medium">KYC ডকুমেন্ট লোড হচ্ছে...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-20 px-4">
            <ShieldCheck className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-sm font-semibold">কোনো KYC ডকুমেন্ট পাওয়া যায়নি</p>
            <p className="text-gray-400 text-xs mt-1">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "ফিল্টার অথবা সার্চ টার্ম পরিবর্তন করে আবার চেষ্টা করুন।"
                : "ব্যবহারকারী বা ভেন্ডর এখনও কোনো KYC ডকুমেন্ট জমা দেয়নি।"}
            </p>
            {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setPage(1);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                ফিল্টার রিসেট করুন
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                      ব্যবহারকারী / ভেন্ডর
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                      ডকুমেন্ট ও টাইপ
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">
                      ফাইল প্রিভিউ
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center">
                      স্ট্যাটাস
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                      জমা দেওয়ার তারিখ
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                      মন্তব্য / নোট
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right">
                      অ্যাকশন
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocuments.map((doc) => {
                    const statusCfg = getStatusConfig(doc.status);
                    const typeCfg = getDocTypeConfig(doc.type);
                    const fileUrl = getDocumentUrl(doc.document_file_path);
                    const isPdf = isPdfFile(doc.document_file_path);
                    const user = doc.user || {};

                    return (
                      <tr
                        key={doc.id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        {/* User / Vendor Info */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1">
                                {user.name || "Unknown User"}
                              </p>
                              {user.email && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                  <span className="truncate max-w-[170px]">{user.email}</span>
                                </p>
                              )}
                              {user.phone && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                  <span>{user.phone}</span>
                                </p>
                              )}
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 uppercase tracking-wide">
                                {user.user_type || user.role || "Vendor"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Document Name & Type */}
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="font-semibold text-gray-800 text-xs sm:text-sm">
                              {doc.document_name || typeCfg.label}
                            </p>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${typeCfg.color}`}
                            >
                              {typeCfg.label}
                            </span>
                          </div>
                        </td>

                        {/* File Preview Thumbnail */}
                        <td className="px-4 py-3.5 text-center">
                          {doc.document_file_path ? (
                            <div className="inline-flex flex-col items-center">
                              {isPdf ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="w-14 h-14 rounded-lg border border-red-200 bg-red-50 flex flex-col items-center justify-center gap-1 text-red-600 hover:bg-red-100 transition cursor-pointer shadow-2xs group"
                                  title="View PDF Document"
                                >
                                  <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">PDF</span>
                                </button>
                              ) : (
                                <div
                                  onClick={() => setPreviewDoc(doc)}
                                  className="relative w-14 h-14 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 cursor-pointer shadow-2xs group shrink-0"
                                  title="Click to zoom image"
                                >
                                  <img
                                    src={fileUrl}
                                    alt={doc.document_name || "KYC"}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://placehold.co/100x100?text=No+Preview";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ZoomIn className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(doc)}
                                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold mt-1 inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> বড় করে দেখুন
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">ফাইল নেই</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.color}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.badgeBg}`} />
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Submitted Date */}
                        <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{formatDate(doc.created_at)}</span>
                          </div>
                        </td>

                        {/* Note */}
                        <td className="px-4 py-3.5 text-xs max-w-[200px]">
                          {doc.note ? (
                            <div className="p-2 rounded bg-gray-50 border border-gray-100 text-gray-700 text-xs line-clamp-2">
                              {doc.note}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* View / Preview */}
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer shadow-xs"
                              title="বিস্তারিত ও প্রিভিউ"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>দেখুন</span>
                            </button>

                            {/* Quick Approve (if not already approved) */}
                            {doc.status !== "approved" && (
                              <button
                                onClick={() => setApprovingDoc(doc)}
                                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 bg-emerald-50/50 transition cursor-pointer"
                                title="অনুমোদন করুন (Approve)"
                              >
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                              </button>
                            )}

                            {/* Quick Reject (if not already rejected) */}
                            {doc.status !== "rejected" && (
                              <button
                                onClick={() => {
                                  setRejectingDoc(doc);
                                  setRejectionNote(doc.note || "");
                                }}
                                className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 bg-red-50/50 transition cursor-pointer"
                                title="বাতিল / প্রত্যাখ্যান (Reject)"
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200 bg-gray-50/70">
                <p className="text-xs text-gray-500">
                  মোট <span className="font-semibold text-gray-700">{totalItems}</span> টির মধ্যে{" "}
                  পেজ <span className="font-semibold text-gray-700">{page}</span> / {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> আগের পেজ
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isFetching}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    পরের পেজ <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. Document Detail & Verification Preview Modal
      ───────────────────────────────────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">
                    {previewDoc.document_name || getDocTypeConfig(previewDoc.type).label}
                  </h2>
                  <p className="text-xs text-gray-500">
                    ইউজার: {previewDoc.user?.name || "N/A"} ({previewDoc.user?.phone || previewDoc.user?.email || "ID: " + previewDoc.user_id})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    getStatusConfig(previewDoc.status).color
                  }`}
                >
                  {getStatusConfig(previewDoc.status).label}
                </span>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: File Preview */}
              <div className="lg:col-span-2 space-y-3 flex flex-col justify-center">
                <div className="relative rounded-xl border border-gray-200 bg-slate-900/5 p-2 flex items-center justify-center min-h-[320px] max-h-[500px] overflow-hidden">
                  {isPdfFile(previewDoc.document_file_path) ? (
                    <div className="w-full h-[450px] flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6 text-center">
                      <FileText className="w-16 h-16 text-red-500 mb-3" />
                      <p className="font-semibold text-gray-800 text-sm">PDF Document Uploaded</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">
                        ব্রাউজারের ফুল ভিউ অথবা ডাউনলোড করতে নিচের বাটনে চাপ দিন।
                      </p>
                      <a
                        href={getDocumentUrl(previewDoc.document_file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Full PDF in New Tab
                      </a>
                    </div>
                  ) : (
                    <img
                      src={getDocumentUrl(previewDoc.document_file_path)}
                      alt={previewDoc.document_name || "KYC preview"}
                      className="max-h-[460px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/600x400?text=Preview+Unavailable";
                      }}
                    />
                  )}
                </div>

                {previewDoc.document_file_path && (
                  <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                    <span className="truncate max-w-[70%] font-mono text-[11px]">
                      {previewDoc.document_file_path}
                    </span>
                    <a
                      href={getDocumentUrl(previewDoc.document_file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> ওপেন হাই-রেস ইমেজ
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column: User Details & Actions */}
              <div className="space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* User Information Card */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2.5">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-600" /> ব্যবহারকারী তথ্য
                    </h3>
                    <div className="space-y-1.5 text-xs text-gray-700">
                      <div>
                        <span className="text-gray-400 block text-[10px]">নাম:</span>
                        <span className="font-semibold text-gray-900">{previewDoc.user?.name || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">ইমেইল:</span>
                        <span className="font-medium text-gray-700">{previewDoc.user?.email || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">ফোন নম্বর:</span>
                        <span className="font-medium text-gray-700">{previewDoc.user?.phone || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">রোল / ইউজার টাইপ:</span>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                          {previewDoc.user?.user_type || previewDoc.user?.role || "Vendor"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document Meta Card */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-indigo-600" /> ডকুমেন্ট বিস্তারিত
                    </h3>
                    <div className="flex justify-between py-1 border-b border-gray-200/60">
                      <span className="text-gray-400">ডকুমেন্ট টাইপ:</span>
                      <span className="font-semibold text-gray-800">{getDocTypeConfig(previewDoc.type).label}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/60">
                      <span className="text-gray-400">ডকুমেন্ট আইডি:</span>
                      <span className="font-mono text-gray-800">#{previewDoc.id}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400">জমা দেওয়া হয়েছে:</span>
                      <span className="font-medium text-gray-700">{formatDate(previewDoc.created_at)}</span>
                    </div>
                  </div>

                  {/* Existing Rejection / Approval Note */}
                  {previewDoc.note && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> সংরক্ষিত নোট / কারণ:
                      </span>
                      <p className="text-xs text-amber-800 leading-relaxed">{previewDoc.note}</p>
                    </div>
                  )}
                </div>

                {/* Direct Actions Footer */}
                <div className="pt-4 border-t border-gray-200 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setApprovingDoc(previewDoc)}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> অনুমোদন (Approve)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingDoc(previewDoc);
                        setRejectionNote(previewDoc.note || "");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      <X className="w-4 h-4" /> বাতিল (Reject)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. Reject Confirmation & Note Modal
      ───────────────────────────────────────────────────────────── */}
      {rejectingDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-red-50/60">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-sm">ডকুমেন্ট প্রত্যাখ্যান করুন (Reject KYC)</h3>
              </div>
              <button
                onClick={() => setRejectingDoc(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1 text-gray-600 border border-gray-200">
                <p>
                  <span className="text-gray-400">ডকুমেন্ট:</span>{" "}
                  <strong>{rejectingDoc.document_name || getDocTypeConfig(rejectingDoc.type).label}</strong>
                </p>
                <p>
                  <span className="text-gray-400">ইউজার:</span> <strong>{rejectingDoc.user?.name || "N/A"}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  প্রত্যাখ্যানের কারণ লিখুন (Rejection Reason) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="যেমন: এনআইডি কার্ডের ছবি অস্পষ্ট, পুনরায় স্পষ্ট কপি আপলোড করুন..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  এই কারণটি ব্যবহারকারী তার প্যানেলে দেখতে পাবেন যাতে তিনি সঠিক ফাইল জমা দিতে পারেন।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingDoc(null)}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                >
                  ফিরে যান
                </button>
                <button
                  type="button"
                  onClick={handleRejectConfirm}
                  disabled={isUpdating || !rejectionNote.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  কনফার্ম রিজেক্ট
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. Approve Confirmation Modal
      ───────────────────────────────────────────────────────────── */}
      {approvingDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/60">
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm">ডকুমেন্ট অনুমোদন করুন (Approve KYC)</h3>
              </div>
              <button
                onClick={() => setApprovingDoc(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1 text-gray-600 border border-gray-200">
                <p>
                  <span className="text-gray-400">ডকুমেন্ট:</span>{" "}
                  <strong>{approvingDoc.document_name || getDocTypeConfig(approvingDoc.type).label}</strong>
                </p>
                <p>
                  <span className="text-gray-400">ইউজার:</span> <strong>{approvingDoc.user?.name || "N/A"}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  অনুমোদন সংক্রান্ত নোট (ঐচ্ছিক / Optional Note)
                </label>
                <input
                  type="text"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="যেমন: Document verified and validated."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovingDoc(null)}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                >
                  ফিরে যান
                </button>
                <button
                  type="button"
                  onClick={handleApproveConfirm}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  কনফার্ম অনুমোদন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKycDocuments;
