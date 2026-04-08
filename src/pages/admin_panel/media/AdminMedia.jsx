import React, { useState, useRef } from "react";
import { Image, Upload, Trash2, Check, Search, X } from "lucide-react";
import { useListUploadsQuery, useUploadImageMutation, useDeleteUploadMutation } from "../../../redux/features/upload";
import { imgBaseUrl } from "../../../../config";
import { toast } from "sonner";
import Pagination from "../../../components/shared/Pagination";

const AdminMedia = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data, isLoading, isFetching } = useListUploadsQuery(currentPage);
  const [uploadImage] = useUploadImageMutation();
  const [deleteUpload] = useDeleteUploadMutation();

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

  const handleDelete = async (id) => {
    if (!window.confirm("এই ফাইল মুছে ফেলতে চান?")) return;
    try {
      await deleteUpload(id).unwrap();
      toast.success("ফাইল মুছে ফেলা হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "মুছে ফেলা ব্যর্থ হয়েছে!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">মিডিয়া লাইব্রেরি</h1>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="media-upload"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition shrink-0 disabled:opacity-50"
          >
            {uploading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            ছবি আপলোড
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">লোড হচ্ছে...</p>
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center py-16">
            <Image className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">কোনো মিডিয়া পাওয়া যায়নি।</p>
            <p className="text-gray-400 text-xs mt-1">উপরের বাটনে ক্লিক করে ছবি আপলোড করুন।</p>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${isFetching ? "opacity-50" : ""}`}>
              {uploads.map((file) => (
                <div
                  key={file.id}
                  className="group relative border border-gray-200 rounded-lg overflow-hidden aspect-square bg-gray-50"
                >
                  <img
                    src={`${imgBaseUrl}/${file.file_name}`}
                    alt={file.file_original_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* File info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{file.file_original_name}</p>
                    <p className="text-gray-300 text-[10px]">{(file.file_size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMedia;
