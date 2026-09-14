import React, { useState } from "react";
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
    label: "National ID Card (Front)",
    required: true,
    description: "Clear photo or scan of the front side of your National ID card.",
  },
  {
    type: "nid_back",
    name: "NID Back Side",
    label: "National ID Card (Back)",
    required: true,
    description: "Clear photo or scan of the back side of your National ID card.",
  },
  {
    type: "trade_license",
    name: "Trade License",
    label: "Trade License",
    required: false,
    badgeTrigger: true,
    description: "Valid Trade License certificate for your business. (Earns Verified Seller Badge)",
  },
  {
    type: "irc",
    name: "Import Registration Certificate - IRC",
    label: "Import Registration Certificate (IRC)",
    required: false,
    badgeTrigger: true,
    description: "Official Import Registration Certificate. (Earns Verified Seller Badge)",
  },
];

const maxKycFileSize = 5 * 1024 * 1024; // 5MB
const allowedKycExtensions = ["jpg", "jpeg", "png", "webp", "pdf"];

const validateKycFile = (file) => {
  if (!file) return "Please select a file.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!allowedKycExtensions.includes(extension)) {
    return "Only JPG, PNG, WEBP, or PDF files are allowed.";
  }
  if (file.size > maxKycFileSize) {
    return "File size must be 5MB or less.";
  }
  return "";
};

const getDocumentUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanBase = String(imgBaseUrl || "").replace(/\/+$/, "");
  const cleanPath = String(path).replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
};

const VendorKyc = () => {
  const userId = getFromLocalstorage("userId") || localStorage.getItem("userId");

  const {
    data: kycResponse,
    isLoading: isFetchingKyc,
    refetch,
  } = useGetKycDocumentsByUserQuery(userId, { skip: !userId });

  const [addKycDocument, { isLoading: isUploading }] = useAddKycDocumentMutation();
  const [updateKycDocument, { isLoading: isUpdating }] = useUpdateKycDocumentMutation();

  const [selectedFileMap, setSelectedFileMap] = useState({});
  const [fileErrorsMap, setFileErrorsMap] = useState({});
  const [activeUploadType, setActiveUploadType] = useState(null);
  const [previewModalDoc, setPreviewModalDoc] = useState(null);

  const kycDocumentsList = kycResponse?.data || kycResponse || [];
  const documentsArray = Array.isArray(kycDocumentsList) ? kycDocumentsList : [];

  // Map uploaded documents by document type
  const docMap = {};
  documentsArray.forEach((doc) => {
    if (doc?.type) {
      docMap[doc.type] = doc;
    }
  });

  // Calculate status statistics
  const totalRequired = REQUIRED_DOCUMENTS.length;
  const approvedDocs = REQUIRED_DOCUMENTS.filter(
    (doc) => docMap[doc.type]?.status?.toLowerCase() === "approved"
  );
  const pendingDocs = REQUIRED_DOCUMENTS.filter(
    (doc) =>
      docMap[doc.type]?.status?.toLowerCase() === "pending" ||
      docMap[doc.type]?.status?.toLowerCase() === "submitted"
  );
  const rejectedDocs = REQUIRED_DOCUMENTS.filter(
    (doc) =>
      docMap[doc.type]?.status?.toLowerCase() === "rejected" ||
      docMap[doc.type]?.status?.toLowerCase() === "refused"
  );

  const isVerifiedSeller =
    docMap["trade_license"]?.status?.toLowerCase() === "approved" &&
    docMap["irc"]?.status?.toLowerCase() === "approved";

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
        // Replace existing document
        await updateKycDocument({ id: existingDoc.id, formData }).unwrap();
        toast.success(`${docConfig.label} updated successfully!`);
      } else {
        // Upload new document
        await addKycDocument(formData).unwrap();
        toast.success(`${docConfig.label} uploaded successfully!`);
      }

      // Clear local selection state
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

  const renderStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
        </span>
      );
    }
    if (s === "pending" || s === "submitted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Review
        </span>
      );
    }
    if (s === "rejected" || s === "refused") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-300">
        <Upload className="w-3.5 h-3.5 text-gray-500" /> Not Uploaded
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto font-supplier-portal">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-7 h-7 text-blue-200" />
            <h1 className="text-2xl font-bold">KYC Verification & Document Panel</h1>
          </div>
          <p className="text-blue-100 text-sm">
            Manage your account compliance documents, monitor verification status, and earn your Verified Seller Badge.
          </p>
        </div>

        {isVerifiedSeller ? (
          <div className="inline-flex items-center gap-2 bg-emerald-600/90 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md whitespace-nowrap">
            <CheckCircle2 className="w-5 h-5 text-white" /> Verified Seller Active
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-amber-500/90 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md whitespace-nowrap">
            <Clock className="w-5 h-5 text-white" /> Verification In Progress
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Documents</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalRequired}</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{approvedDocs.length}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{pendingDocs.length}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-red-600 font-medium uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{rejectedDocs.length}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Verified Seller Incentive Note */}
      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Verified Seller Badge Status</p>
            <p className="text-xs text-emerald-800 mt-0.5">
              Upload approved <strong>Trade License</strong> and <strong>IRC (Import Registration Certificate)</strong> to automatically unlock the <strong>Verified Seller Badge</strong> on your profile.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4" /> Verified Seller
        </span>
      </div>

      {/* Rejection Alert Box */}
      {rejectedDocs.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h4 className="text-sm font-bold text-red-900">Action Required: Document Rejection</h4>
          </div>
          <p className="text-xs text-red-800">
            Some of your uploaded compliance documents were rejected. Please review notes and re-upload valid files below.
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isFetchingKyc ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Fetching KYC compliance documents...</p>
        </div>
      ) : (
        /* Documents Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REQUIRED_DOCUMENTS.map((docConfig) => {
            const uploadedDoc = docMap[docConfig.type];
            const hasFile = Boolean(uploadedDoc?.document_file_path);
            const status = uploadedDoc?.status || "not_uploaded";
            const docUrl = getDocumentUrl(uploadedDoc?.document_file_path);

            const isProcessingThis =
              (isUploading || isUpdating) && activeUploadType === docConfig.type;
            const selectedFile = selectedFileMap[docConfig.type];
            const fileError = fileErrorsMap[docConfig.type];

            return (
              <div
                key={docConfig.type}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Top Details */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-800">{docConfig.label}</h3>
                        {docConfig.required ? (
                          <span className="text-xs font-bold text-red-500">* Required</span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">(Optional)</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{docConfig.description}</p>
                    </div>

                    <div>{renderStatusBadge(status)}</div>
                  </div>

                  {/* Rejection Note */}
                  {uploadedDoc?.note && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                      <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 font-medium">
                        <strong>Rejection Reason:</strong> {uploadedDoc.note}
                      </p>
                    </div>
                  )}

                  {/* Existing Uploaded Document Box */}
                  {hasFile && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                        <span className="flex items-center gap-1.5 truncate">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{uploadedDoc.document_name || docConfig.name}</span>
                        </span>
                        {uploadedDoc.created_at && (
                          <span className="text-[11px] text-slate-400">
                            {new Date(uploadedDoc.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview Document <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Selected Local File Details */}
                  {selectedFile && (
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 truncate">
                        <FilePlus className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{selectedFile.name}</span>
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
                        className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                        title="Remove selection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {fileError && <p className="text-xs font-semibold text-red-600">{fileError}</p>}
                </div>

                {/* Upload Action Footer */}
                <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative">
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
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
                  </div>

                  <button
                    type="button"
                    disabled={!selectedFile || isProcessingThis}
                    onClick={() => handleUploadOrReplace(docConfig)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessingThis ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        {hasFile ? <RefreshCw className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>{hasFile ? "Update Document" : "Upload Document"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorKyc;
