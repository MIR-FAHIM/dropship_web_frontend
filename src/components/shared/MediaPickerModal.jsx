import React, { useState, useRef } from "react";
import { Image, Upload, Check, X } from "lucide-react";
import { useListUploadsQuery, useUploadImageMutation } from "../../redux/features/upload";
import { imgBaseUrl } from "../../../config";
import { toast } from "sonner";
import Pagination from "../shared/Pagination";
import { getFromLocalstorage } from "../../utils/localstorage.utils";

/**
 * Reusable Media Picker Modal.
 *
 * Usage:
 *   <MediaPickerModal
 *     open={true}
 *     onClose={() => setOpen(false)}
 *     onSelect={(file) => console.log(file)}   // single select
 *     multiple={false}                           // set true for multi-select
 *     onSelectMultiple={(files) => ...}          // used when multiple=true
 *   />
 *
 * `file` shape: { id, file_name, file_original_name, file_size, extension, ... }
 */
const MediaPickerModal = ({
  open,
  onClose,
  onSelect,
  multiple = false,
  onSelectMultiple,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data, isLoading, isFetching } = useListUploadsQuery(currentPage, {
    skip: !open,
  });
  const [uploadImage] = useUploadImageMutation();
  const userId = getFromLocalstorage("userId") || 0;

  const uploads = data?.data?.data || [];
  const totalPages = data?.data?.last_page || 1;

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_id", userId);
        await uploadImage(formData).unwrap();
      }
      toast.success("আপলোড সফল হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "আপলোড ব্যর্থ হয়েছে!");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleSelect = (file) => {
    if (!multiple) {
      onSelect?.(file);
      onClose();
      return;
    }
    setSelectedFiles((prev) => {
      const exists = prev.find((f) => f.id === file.id);
      if (exists) return prev.filter((f) => f.id !== file.id);
      return [...prev, file];
    });
  };

  const isSelected = (id) => selectedFiles.some((f) => f.id === id);

  const handleConfirm = () => {
    if (multiple) {
      onSelectMultiple?.(selectedFiles);
    }
    setSelectedFiles([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">মিডিয়া নির্বাচন করুন</h2>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {uploading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              আপলোড
            </button>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">লোড হচ্ছে...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-16">
              <Image className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">কোনো মিডিয়া পাওয়া যায়নি।</p>
              <p className="text-gray-400 text-xs mt-1">উপরে আপলোড বাটনে ক্লিক করুন।</p>
            </div>
          ) : (
            <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 ${isFetching ? "opacity-50" : ""}`}>
              {uploads.map((file) => (
                <div
                  key={file.id}
                  onClick={() => toggleSelect(file)}
                  className={`relative border-2 rounded-lg overflow-hidden aspect-square bg-gray-50 cursor-pointer transition-all ${
                    isSelected(file.id)
                      ? "border-red-600 ring-2 ring-red-200"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={`${imgBaseUrl}/${file.file_name}`}
                    alt={file.file_original_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isSelected(file.id) && (
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5">
                    <p className="text-white text-[10px] truncate">{file.file_original_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {multiple && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {selectedFiles.length} টি নির্বাচিত
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedFiles.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                নির্বাচন করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPickerModal;
