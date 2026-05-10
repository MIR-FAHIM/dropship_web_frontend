import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  useAddProductImageMutation,
  useUpdateProductMutation,
} from "../../../../redux/features/product";
import MediaPickerModal from "../../../../components/shared/MediaPickerModal";
import { imgBaseUrl } from "../../../../../config";

const MediaTab = ({ product, productId }) => {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [thumbOpen, setThumbOpen] = useState(false);
  const [updatingThumb, setUpdatingThumb] = useState(false);

  const [addProductImage] = useAddProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();

  const handleThumbnailSelect = async (file) => {
    if (!file?.id) return;
    setUpdatingThumb(true);
    try {
      await updateProduct({ id: productId, thumbnail_img: file.id }).unwrap();
      toast.success("থাম্বনেইল আপডেট হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "থাম্বনেইল আপডেট ব্যর্থ হয়েছে!");
    } finally {
      setUpdatingThumb(false);
      setThumbOpen(false);
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
      {/* Primary Image */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-700">থাম্বনেইল</h3>
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline border px-2 py-1 rounded disabled:opacity-50"
            onClick={() => setThumbOpen(true)}
            disabled={updatingThumb}
          >
            {updatingThumb ? "আপডেট হচ্ছে..." : "পরিবর্তন করুন"}
          </button>
        </div>
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
        <MediaPickerModal
          open={thumbOpen}
          onClose={() => setThumbOpen(false)}
          onSelect={handleThumbnailSelect}
        />
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
        <h3 className="text-sm font-semibold text-gray-700 mb-3">ভিডিও লিংক</h3>
        {product.video_link ? (
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
