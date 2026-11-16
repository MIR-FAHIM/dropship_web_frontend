import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Upload,
  RefreshCw,
  Eye,
  X,
  ExternalLink,
  Loader2,
  ShieldAlert,
  FilePlus,
  Info,
  Sparkles,
  Check,
  AlertCircle,
  BadgeCheck,
  HelpCircle,
} from "lucide-react";
import { imgBaseUrl } from "../../../../config";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import {
  useGetKycDocumentsByUserQuery,
  useAddKycDocumentMutation,
  useUpdateKycDocumentMutation,
} from "../../../redux/features/vendor_api";
import { toast } from "sonner";

const REQUIRED_DOCUMENTS = [
  {
    type: "nid_front",
    name: "NID Front Side",
    label: "National ID Card (Front Side)",
    category: "identity",
    required: true,
    description: "Clear color photo or scan of the front side of your official NID.",
    recommendation: "Ensure national identity number, photo, and full name are sharp and clearly legible.",
  },
  {
    type: "nid_back",
    name: "NID Back Side",
    label: "National ID Card (Back Side)",
    category: "identity",
    required: true,
    description: "Clear color photo or scan of the back side of your official NID.",
    recommendation: "Ensure permanent address, blood group, and barcode are entirely visible.",
  },
  {
    type: "trade_license",
    name: "Trade License",
    label: "Trade License Certificate",
    category: "badge",
    required: false,
    badgeTrigger: true,
    description: "Valid up-to-date Trade License certificate for your registered enterprise.",
    recommendation: "Required to unlock the exclusive 'Verified Seller' badge across the dropshipper marketplace.",
  },
  {
    type: "irc",
    name: "Import Registration Certificate - IRC",
    label: "Import Registration Certificate (IRC)",
    category: "badge",
    required: false,
    badgeTrigger: true,
    description: "Government-issued Import Registration Certificate (IRC) for wholesale importers.",
    recommendation: "Accelerates marketplace trust and unlocks wholesale bulk distributor privileges.",
  },
];

const maxKycFileSize = 5 * 1024 * 1024; // 5MB
const allowedKycExtensions = ["jpg", "jpeg", "png", "webp", "pdf"];

const validateKycFile = (file) => {
  if (!file) return "Please select a document file.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!allowedKycExtensions.includes(extension)) {
    return "Unsupported format. Only JPG, PNG, WEBP, or PDF files are accepted.";
  }
  if (file.size > maxKycFileSize) {
    return "File size exceeds the 5MB limit. Please compress or select a smaller file.";
  }
  return "";
};

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

const VendorKyc = () => {
  const userId = getFromLocalstorage("userId") || localStorage.getItem("userId");

  const {
    data: kycResponse,
    isLoading: isFetchingKyc,
    isFetching,
    refetch,
    isError,
  } = useGetKycDocumentsByUserQuery(userId, { skip: !userId });

  const [addKycDocument, { isLoading: isUploading }] = useAddKycDocumentMutation();
  const [updateKycDocument, { isLoading: isUpdating }] = useUpdateKycDocumentMutation();

  const [selectedFileMap, setSelectedFileMap] = useState({});
  const [fileErrorsMap, setFileErrorsMap] = useState({});
  const [activeUploadType, setActiveUploadType] = useState(null);
  const [isDraggingOverMap, setIsDraggingOverMap] = useState({});
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'required' | 'badge' | 'needs_attention'
  const [previewModalDoc, setPreviewModalDoc] = useState(null);

  // Close modal with ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && previewModalDoc) {
        setPreviewModalDoc(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewModalDoc]);

  const kycDocumentsList = kycResponse?.data || kycResponse || [];
  const documentsArray = Array.isArray(kycDocumentsList) ? kycDocumentsList : [];

  // Map uploaded documents by document type
  const docMap = useMemo(() => {
    const map = {};
    documentsArray.forEach((doc) => {
      if (doc?.type) {
        map[doc.type] = doc;
      }
    });
    return map;
  }, [documentsArray]);

  // Statistics & Verification Analysis
  const stats = useMemo(() => {
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let notUploaded = 0;

    let requiredApproved = 0;
    let badgeApproved = 0;

    REQUIRED_DOCUMENTS.forEach((doc) => {
      const uploaded = docMap[doc.type];
      const status = uploaded?.status?.toLowerCase();

      if (status === "approved") {
        approved++;
        if (doc.required) requiredApproved++;
        if (doc.badgeTrigger) badgeApproved++;
      } else if (status === "pending" || status === "submitted") {
        pending++;
      } else if (status === "rejected" || status === "refused") {
        rejected++;
      } else {
        notUploaded++;
      }
    });

    const isIdentityVerified = requiredApproved === 2;
    const isVerifiedSeller = badgeApproved === 2;
    const completionPercent = Math.round((approved / REQUIRED_DOCUMENTS.length) * 100);

    return {
      total: REQUIRED_DOCUMENTS.length,
      approved,
      pending,
      rejected,
      notUploaded,
      requiredApproved,
      badgeApproved,
      isIdentityVerified,
      isVerifiedSeller,
      completionPercent,
    };
  }, [docMap]);

  // Handle local file selection
  const handleFileSelect = (type, file) => {
    if (!file) return;
    const error = validateKycFile(file);
    setFileErrorsMap((prev) => ({ ...prev, [type]: error }));
    if (error) {
      setSelectedFileMap((prev) => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
      return;
    }
    setSelectedFileMap((prev) => ({ ...prev, [type]: file }));
  };

  // Drag & drop handlers
  const handleDragOver = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverMap((prev) => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverMap((prev) => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverMap((prev) => ({ ...prev, [type]: false }));
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(type, file);
    }
  };

  // Upload or replace action
  const handleUploadOrReplace = async (docConfig) => {
    const file = selectedFileMap[docConfig.type];
    if (!file) {
      setFileErrorsMap((prev) => ({
        ...prev,
        [docConfig.type]: "Please choose a document file first.",
      }));
      return;
    }

    if (!userId) {
      toast.error("User session ID not found. Please log in again.");
      return;
    }

    setActiveUploadType(docConfig.type);

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("type", docConfig.type);
    formData.append("document_name", docConfig.name);
    formData.append("document_file", file);

    const existingDoc = docMap[docConfig.type];

    try {
      if (existingDoc && existingDoc.id) {
        await updateKycDocument({ id: existingDoc.id, formData }).unwrap();
        toast.success(`${docConfig.label} updated successfully!`);
      } else {
        await addKycDocument(formData).unwrap();
        toast.success(`${docConfig.label} submitted successfully!`);
      }

      // Clear local states
      setSelectedFileMap((prev) => {
        const next = { ...prev };
        delete next[docConfig.type];
        return next;
      });
      setFileErrorsMap((prev) => {
        const next = { ...prev };
        delete next[docConfig.type];
        return next;
      });

      refetch();
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to upload document.";
      toast.error(msg);
      setFileErrorsMap((prev) => ({ ...prev, [docConfig.type]: msg }));
    } finally {
      setActiveUploadType(null);
    }
  };

  // Filtered documents list based on active tab
  const filteredDocuments = useMemo(() => {
    return REQUIRED_DOCUMENTS.filter((doc) => {
      const status = docMap[doc.type]?.status?.toLowerCase();
      if (activeTab === "required") return doc.required;
      if (activeTab === "badge") return doc.badgeTrigger;
      if (activeTab === "needs_attention") {
        return status === "rejected" || status === "refused" || !docMap[doc.type]?.document_file_path;
      }
      return true;
    });
  }, [activeTab, docMap]);

  // Render Status Badge with High-Contrast Text & Borders (Never White)
  const renderStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border-2 border-emerald-400 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Approved
        </span>
      );
    }
    if (s === "pending" || s === "submitted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-amber-700" /> Pending Review
        </span>
      );
    }
    if (s === "rejected" || s === "refused") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border-2 border-rose-400 shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-700" /> Action Required
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border-2 border-slate-300 shadow-xs">
        <Upload className="w-3.5 h-3.5 text-slate-600" /> Not Uploaded
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-supplier-portal text-slate-900">
      {/* 1. Header Card - Solid High-Contrast Styling (Designed specifically for White Backgrounds) */}
      <div className="rounded-3xl bg-slate-50 p-6 sm:p-8 border-2 border-slate-300 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Vendor Compliance & Trust Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              KYC Verification & Seller Badge
            </h1>
            <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
              Complete your verification to secure your supplier account, prevent payout delays, and unlock the{" "}
              <strong className="text-emerald-800 font-bold underline">Verified Seller Badge</strong> to gain premium placement across dropshipper stores.
            </p>
          </div>

          {/* Right Header Status Chip & Refresh Action */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 active:scale-95 transition-all disabled:bg-slate-300 disabled:text-slate-600 cursor-pointer"
              title="Refresh KYC Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "Refreshing..." : "Refresh Status"}</span>
            </button>

            {stats.isVerifiedSeller ? (
              <div className="inline-flex items-center gap-2 bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md border-2 border-emerald-500">
                <BadgeCheck className="w-5 h-5 text-white" />
                <span>Verified Seller Active</span>
              </div>
            ) : stats.isIdentityVerified ? (
              <div className="inline-flex items-center gap-2 bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md border-2 border-blue-500">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Identity Verified</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md border-2 border-amber-400">
                <Clock className="w-5 h-5 text-white" />
                <span>Verification Incomplete</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar & Roadmap Overview */}
        <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Progress Percent Card */}
          <div className="bg-white rounded-2xl p-4 border-2 border-slate-300 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-800">Overall Progress</span>
              <span className="text-emerald-700 font-extrabold text-sm">{stats.completionPercent}% Complete</span>
            </div>
            {/* Semantic Native Progress Bar */}
            <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex border border-slate-300">
              <div
                style={{ width: `${stats.completionPercent}%` }}
                className="h-full bg-blue-600 transition-all duration-500"
              />
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-2">
              {stats.approved} of {stats.total} documents approved
            </p>
          </div>

          {/* Step 1: Identity Tier */}
          <div className="bg-white rounded-2xl p-4 border-2 border-slate-300 shadow-xs flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                stats.isIdentityVerified ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-blue-100 text-blue-800 border border-blue-300"
              }`}
            >
              {stats.isIdentityVerified ? <Check className="w-5 h-5 font-bold" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Tier 1: Identity Proof</span>
                {stats.isIdentityVerified && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                NID Front & Back ({stats.requiredApproved}/2 approved)
              </p>
            </div>
          </div>

          {/* Step 2: Verified Seller Tier */}
          <div className="bg-white rounded-2xl p-4 border-2 border-slate-300 shadow-xs flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                stats.isVerifiedSeller ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {stats.isVerifiedSeller ? <Sparkles className="w-5 h-5" /> : <BadgeCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Tier 2: Verified Seller Badge</span>
                {stats.isVerifiedSeller && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Unlocked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Trade License & IRC ({stats.badgeApproved}/2 approved)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics & Status Bar (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Approved */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border-2 border-slate-300 shadow-xs hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Approved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.approved}</p>
          <p className="text-xs text-emerald-800 font-bold mt-1">Verified documents</p>
        </div>

        {/* Pending Review */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border-2 border-slate-300 shadow-xs hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Under Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.pending}</p>
          <p className="text-xs text-amber-800 font-bold mt-1">Pending admin check</p>
        </div>

        {/* Action Required / Rejected */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border-2 border-slate-300 shadow-xs hover:border-rose-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Action Needed</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5 text-rose-700" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.rejected}</p>
          <p className="text-xs text-rose-800 font-bold mt-1">Rejected / re-upload</p>
        </div>

        {/* Not Uploaded */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border-2 border-slate-300 shadow-xs hover:border-blue-500 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Remaining</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.notUploaded}</p>
          <p className="text-xs text-blue-800 font-bold mt-1">Files yet to upload</p>
        </div>
      </div>

      {/* 3. Rejection Alert Notification (When applicable) */}
      {stats.rejected > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                Action Required: {stats.rejected} Document {stats.rejected === 1 ? "was" : "were"} Rejected
              </h3>
              <p className="text-xs text-rose-900 font-medium mt-1 leading-relaxed">
                Our verification team found issues with your uploaded files. Please review the admin notes below and submit corrected documents to prevent account limitations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("needs_attention")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-700/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <AlertCircle className="w-4 h-4 text-white" />
            <span>View Rejected Documents</span>
          </button>
        </div>
      )}

      {/* 4. Filter Tabs & Guidelines Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Filter Navigation Tabs with Solid Non-White Button Colors */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border-2 border-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300"
            }`}
          >
            All Documents ({REQUIRED_DOCUMENTS.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("required")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "required"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300"
            }`}
          >
            Required Identity (2)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("badge")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "badge"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300"
            }`}
          >
            Verified Seller Badge (2)
          </button>

          {stats.rejected > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("needs_attention")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "needs_attention"
                  ? "bg-rose-700 text-white shadow-md"
                  : "bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300"
              }`}
            >
              Needs Attention ({stats.rejected})
            </button>
          )}
        </div>

        {/* Accepted File formats badge */}
        <div className="flex items-center gap-2 text-xs text-slate-700 font-bold px-3.5 py-2 bg-slate-100 rounded-xl border-2 border-slate-300 shadow-xs self-start sm:self-auto">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Accepted: JPG, PNG, WEBP, PDF (Max 5MB)</span>
        </div>
      </div>

      {/* 5. Document Cards Grid */}
      {isFetchingKyc ? (
        <div className="bg-slate-50 p-12 rounded-3xl border-2 border-slate-300 flex flex-col items-center justify-center gap-3 shadow-xs">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-800 font-bold">Loading KYC compliance documents...</p>
        </div>
      ) : isError ? (
        <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-300 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <p className="text-sm font-bold text-slate-900">Failed to load KYC documents from the server.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-slate-50 p-10 rounded-3xl border-2 border-slate-300 text-center space-y-2">
          <FileText className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No documents found</h3>
          <p className="text-xs text-slate-600 font-semibold">No documents match the selected filter category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocuments.map((docConfig) => {
            const uploadedDoc = docMap[docConfig.type];
            const hasFile = Boolean(uploadedDoc?.document_file_path);
            const status = uploadedDoc?.status || "not_uploaded";
            const docUrl = getDocumentUrl(uploadedDoc?.document_file_path);

            const isProcessingThis = (isUploading || isUpdating) && activeUploadType === docConfig.type;
            const selectedFile = selectedFileMap[docConfig.type];
            const fileError = fileErrorsMap[docConfig.type];
            const isDragging = isDraggingOverMap[docConfig.type];

            return (
              <div
                key={docConfig.type}
                onDragOver={(e) => handleDragOver(e, docConfig.type)}
                onDragLeave={(e) => handleDragLeave(e, docConfig.type)}
                onDrop={(e) => handleDrop(e, docConfig.type)}
                className={`bg-white rounded-3xl border-2 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm ${
                  isDragging
                    ? "border-blue-600 ring-4 ring-blue-100 bg-blue-50/50"
                    : status === "rejected" || status === "refused"
                    ? "border-rose-400 ring-1 ring-rose-200"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              >
                {/* Top Section */}
                <div className="p-6 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">{docConfig.label}</h2>
                        {docConfig.required ? (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded-full border border-rose-300">
                            * Required
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-700" />
                            Verified Seller Accelerator
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{docConfig.description}</p>
                    </div>

                    <div className="shrink-0">{renderStatusBadge(status)}</div>
                  </div>

                  {/* Recommendation Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-950 font-medium">
                    <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <span>{docConfig.recommendation}</span>
                  </div>

                  {/* Rejection Note Alert Banner */}
                  {uploadedDoc?.note && (status === "rejected" || status === "refused") && (
                    <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3.5 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-rose-950">Admin Rejection Feedback:</p>
                        <p className="text-rose-900 mt-0.5 leading-relaxed font-medium">{uploadedDoc.note}</p>
                      </div>
                    </div>
                  )}

                  {/* Existing Uploaded Document Info Card */}
                  {hasFile && (
                    <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-blue-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {uploadedDoc.document_name || docConfig.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-semibold mt-0.5">
                            <span>Uploaded file on record</span>
                            {uploadedDoc.created_at && (
                              <>
                                <span>•</span>
                                <span>{new Date(uploadedDoc.created_at).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPreviewModalDoc({
                            title: docConfig.label,
                            url: docUrl,
                            status: uploadedDoc.status,
                            type: docConfig.type,
                            date: uploadedDoc.created_at,
                            note: uploadedDoc.note,
                            fileName: uploadedDoc.document_name || docConfig.name,
                          })
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 text-white" />
                        <span>Preview Document</span>
                      </button>
                    </div>
                  )}

                  {/* Staged / Selected File Details Box */}
                  {selectedFile ? (
                    <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center shrink-0">
                          <FilePlus className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-emerald-950 truncate">{selectedFile.name}</p>
                          <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                            Ready to upload • {formatBytes(selectedFile.size)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFileMap((prev) => {
                            const next = { ...prev };
                            delete next[docConfig.type];
                            return next;
                          });
                          setFileErrorsMap((prev) => {
                            const next = { ...prev };
                            delete next[docConfig.type];
                            return next;
                          });
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                        title="Remove selected file"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  ) : (
                    /* Interactive Drag & Drop Area */
                    <label className="border-2 border-dashed border-slate-300 hover:border-blue-600 hover:bg-blue-50/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group bg-slate-50">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 text-blue-800 flex items-center justify-center transition-colors mb-2 border border-blue-300">
                        <Upload className="w-5 h-5 text-blue-700" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                        Drag and drop file here, or{" "}
                        <span className="text-blue-700 underline font-extrabold">Browse from computer</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-1 font-medium">Supports JPG, PNG, WEBP or PDF up to 5MB</p>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          handleFileSelect(docConfig.type, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}

                  {/* File Error Notice */}
                  {fileError && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 bg-rose-100 p-3 rounded-xl border border-rose-300">
                      <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                      <span>{fileError}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer with Vibrant Non-White Buttons */}
                <div className="bg-slate-100 p-4 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Select / Replace File Button (Solid Blue) */}
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md shadow-blue-500/20 active:scale-95 text-center">
                    <Upload className="w-3.5 h-3.5 text-white" />
                    <span>{hasFile ? "Choose Replacement File" : "Choose File"}</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        handleFileSelect(docConfig.type, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  {/* Confirm Upload Button with Green Text */}
                  {selectedFile ? (
                    <button
                      type="button"
                      disabled={isProcessingThis}
                      onClick={() => handleUploadOrReplace(docConfig)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-800 border-2 border-emerald-500 text-xs font-black rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      {isProcessingThis ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                          <span className="text-emerald-800 font-black">Uploading File...</span>
                        </>
                      ) : (
                        <>
                          {hasFile ? (
                            <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          )}
                          <span className="text-emerald-800 font-black">{hasFile ? "Confirm & Update" : "Confirm & Upload"}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50/60 text-emerald-800 border-2 border-emerald-300/80 text-xs font-bold rounded-xl cursor-not-allowed shadow-none"
                      title="Select a file first to upload"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-emerald-800 font-bold">{hasFile ? "Confirm & Update" : "Confirm & Upload"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. In-App Document Preview Modal */}
      {previewModalDoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-doc-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewModalDoc(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border-2 border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-slate-200 flex items-center justify-between gap-3 bg-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h2 id="modal-doc-title" className="text-base font-bold text-slate-900 leading-tight">
                    {previewModalDoc.title}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{previewModalDoc.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {renderStatusBadge(previewModalDoc.status)}

                <button
                  type="button"
                  onClick={() => setPreviewModalDoc(null)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-all cursor-pointer shadow-sm"
                  title="Close Preview (Esc)"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-200 min-h-[360px]">
              {previewModalDoc.url?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={previewModalDoc.url}
                  title={previewModalDoc.title}
                  className="w-full h-[65vh] rounded-2xl border-2 border-slate-400 bg-white shadow-sm"
                />
              ) : (
                <div className="relative group max-h-[65vh] flex items-center justify-center overflow-hidden rounded-2xl bg-white p-2 border-2 border-slate-300 shadow-md">
                  <img
                    src={previewModalDoc.url}
                    alt={previewModalDoc.title}
                    className="max-h-[60vh] w-auto object-contain rounded-xl"
                  />
                </div>
              )}

              {/* Admin Note in Modal */}
              {previewModalDoc.note && (
                <div className="w-full mt-4 bg-rose-50 border-2 border-rose-300 rounded-xl p-3 text-xs text-rose-950 font-medium">
                  <strong className="font-bold text-rose-950">Rejection Note:</strong> {previewModalDoc.note}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-2 border-slate-200 bg-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-700 font-bold">
                {previewModalDoc.date && `Uploaded: ${new Date(previewModalDoc.date).toLocaleString()}`}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={previewModalDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                  <span>Open Full Size</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewModalDoc(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorKyc;
