import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAddProductImageMutation, useUpdateProductMutation } from "../../../../../redux/features/product";
import MediaPickerModal from "../../../../../components/shared/MediaPickerModal";
import { imgBaseUrl } from "../../../../../../config";

const MediaTab = ({ product, productId }) => {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [editingVideo, setEditingVideo] = useState(false);
  const [videoLink, setVideoLink] = useState(product?.video_link || "");
  const [updatingVideo, setUpdatingVideo] = useState(false);

  const [addProductImage] = useAddProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();

  const handleVideoLinkSave = async () => {
    setUpdatingVideo(true);
    try {
      await updateProduct({ id: productId, video_link: videoLink }).unwrap();
      toast.success("ভিডিও লিংক আপডেট হয়েছে!");
      setEditingVideo(false);
    } catch (err) {
      toast.error(err?.data?.message || "ভিডিও লিংক আপডেট ব্যর্থ হয়েছে!");
    } finally {
      setUpdatingVideo(false);
    }
  };

  const handleGalleryImageSelect = async (file) => {
    if (!file?.id) return;
    setAssigning(true);
    try {
      await addProductImage({ id: productId, image: file.id }).unwrap();
      toast.success("Image assigned to gallery!");
    } catch (err) {
      toast.error("Image assignment failed");
    } finally {
      setAssigning(false);
      setMediaOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Thumbnail */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">থাম্বনেইল</h3>
        {product.primary_image?.file_name ? (
          <img
            src={`${imgBaseUrl}/${product.primary_image.file_name}`}
            alt="thumbnail"
            className="w-40 h-40 rounded-xl object-cover border border-gray-200"
          />
        ) : (
          <div className="w-40 h-40 rounded-xl bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Gallery */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-700">গ্যালারি ছবি</h3>
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline border px-2 py-1 rounded disabled:opacity-50"
            onClick={() => setMediaOpen(true)}
            disabled={assigning}
          >
            {assigning ? "Assigning..." : "ছবি যোগ করুন"}
          </button>
        </div>
        <MediaPickerModal
          open={mediaOpen}
          onClose={() => setMediaOpen(false)}
          onSelect={handleGalleryImageSelect}
        />
        {product.images && product.images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {product.images.map((img, i) => (
              <img
                key={img.image.id || i}
                src={`${imgBaseUrl}/${img.image.file_name}`}
                alt={`photo-${i}`}
                className="w-full aspect-square rounded-lg object-cover border border-gray-200"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">কোনো গ্যালারি ছবি নেই।</p>
        )}
      </div>

      {/* Video */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-700">ভিডিও লিংক</h3>
          {!editingVideo && (
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline border px-2 py-1 rounded"
              onClick={() => {
                setVideoLink(product?.video_link || "");
                setEditingVideo(true);
              }}
            >
              {product?.video_link ? "পরিবর্তন করুন" : "যোগ করুন"}
            </button>
          )}
        </div>
        {editingVideo ? (
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleVideoLinkSave}
              disabled={updatingVideo}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {updatingVideo ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
            </button>
            <button
              type="button"
              onClick={() => setEditingVideo(false)}
              disabled={updatingVideo}
              className="text-xs border px-3 py-1.5 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              বাতিল
            </button>
          </div>
        ) : product?.video_link ? (
          <a
            href={product.video_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {product.video_link}
          </a>
        ) : (
          <p className="text-sm text-gray-400">কোনো ভিডিও লিংক নেই।</p>
        )}
      </div>
    </div>
  );
};

export default MediaTab;
