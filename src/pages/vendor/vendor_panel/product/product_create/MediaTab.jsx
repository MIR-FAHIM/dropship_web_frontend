import { ImagePlus } from "lucide-react";
import { imgBaseUrl } from "../../../../../../config";

const MediaTab = ({ formData, setFormData, openMedia, handleChange, inputClass, labelClass }) => (
  <div className="space-y-6">
    <div>
      <label className={labelClass}>থাম্বনেইল ছবি</label>
      {formData.thumbnail_img ? (
        <div className="flex items-center gap-4">
          <img
            src={`${imgBaseUrl}/${formData.thumbnailPreview}`}
            alt="thumbnail"
            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
          />
          <div className="flex flex-col gap-1">
            <button type="button" onClick={() => openMedia("thumbnail")} className="text-xs text-blue-600 hover:underline">
              পরিবর্তন
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, thumbnail_img: null, thumbnailPreview: null }))}
              className="text-xs text-red-500 hover:underline"
            >
              মুছুন
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openMedia("thumbnail")}
          className="flex items-center gap-2 px-4 py-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition w-full justify-center text-sm"
        >
          <ImagePlus className="w-5 h-5" />
          থাম্বনেইল নির্বাচন করুন
        </button>
      )}
    </div>

    <div>
      <label className={labelClass}>প্রোডাক্ট ফটো</label>
      {formData.photos ? (
        <div className="flex items-center gap-4">
          <img
            src={`${imgBaseUrl}/${formData.photosPreview}`}
            alt="photos"
            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
          />
          <div className="flex flex-col gap-1">
            <button type="button" onClick={() => openMedia("photos")} className="text-xs text-blue-600 hover:underline">
              পরিবর্তন
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, photos: null, photosPreview: null }))}
              className="text-xs text-red-500 hover:underline"
            >
              মুছুন
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openMedia("photos")}
          className="flex items-center gap-2 px-4 py-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition w-full justify-center text-sm"
        >
          <ImagePlus className="w-5 h-5" />
          প্রোডাক্ট ফটো নির্বাচন করুন
        </button>
      )}
    </div>

    <div>
      <label className={labelClass}>ভিডিও লিংক</label>
      <input
        type="url"
        name="video_link"
        value={formData.video_link}
        onChange={handleChange}
        placeholder="https://youtube.com/..."
        className={inputClass}
      />
    </div>
  </div>
);

export default MediaTab;
