import React, { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  Eye,
  Smartphone,
  Monitor,
  X,
  Sparkles,
  FileText,
  Code,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useGetSocialMediaTextByProductQuery } from "../../../redux/features/socialMediaText";

const PLATFORM_FILTERS = [
  { value: "all", label: "All Platforms" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "general", label: "General" },
];

const PLATFORM_CONFIG = {
  general: {
    label: "General Template",
    badgeCls: "bg-indigo-100 text-indigo-700 border-indigo-200",
    dotCls: "bg-indigo-500",
  },
  facebook: {
    label: "Facebook",
    badgeCls: "bg-blue-100 text-blue-700 border-blue-200",
    dotCls: "bg-blue-600",
  },
  instagram: {
    label: "Instagram",
    badgeCls: "bg-pink-100 text-pink-700 border-pink-200",
    dotCls: "bg-pink-500",
  },
  tiktok: {
    label: "TikTok",
    badgeCls: "bg-slate-900 text-slate-100 border-slate-800",
    dotCls: "bg-teal-400",
  },
  whatsapp: {
    label: "WhatsApp",
    badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dotCls: "bg-emerald-600",
  },
};

const getPlainTextFromHtml = (html) => {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return (temp.textContent || temp.innerText || "").trim();
};

const ResellerSocialContent = ({ productId }) => {
  const { data: apiResponse, isLoading } = useGetSocialMediaTextByProductQuery(productId, {
    skip: !productId,
  });

  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [modalItem, setModalItem] = useState(null);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [copiedMap, setCopiedMap] = useState({});

  const rawData = apiResponse?.data || apiResponse;
  const allContents = Array.isArray(rawData?.text_contents)
    ? rawData.text_contents
    : Array.isArray(rawData)
    ? rawData
    : [];

  // Filter only active contents for resellers
  const activeContents = allContents.filter(
    (item) => item.is_active === true || item.is_active === 1 || item.is_active === "1"
  );

  const filteredContents = activeContents.filter((item) => {
    if (selectedPlatform === "all") return true;
    return String(item.platform || "general").toLowerCase() === selectedPlatform;
  });

  const handleCopy = async (key, text, label) => {
    const safeText = String(text || "").trim();
    if (!safeText) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(safeText);
      } else {
        const temp = document.createElement("textarea");
        temp.value = safeText;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }

      setCopiedMap((prev) => ({ ...prev, [key]: true }));
      toast.success(`${label} copied to clipboard!`);

      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch {
      toast.error("Failed to copy text.");
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading promotional content templates...</p>
      </div>
    );
  }

  if (activeContents.length === 0) {
    return (
      <div className="py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <Share2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-gray-800">No Promotional Templates Yet</h4>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Social promotional copy, ad banners, and WhatsApp templates for this product will appear here as soon as the admin uploads them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="text-lg font-bold text-white">Social Media Promotional Templates</h3>
          </div>
          <p className="text-xs sm:text-sm text-blue-100">
            Ready-made promotional captions, WhatsApp copies, and ad banner templates for your dropshipping marketing campaigns.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-white text-xs font-semibold self-start sm:self-auto border border-white/20">
          <span>{activeContents.length} Templates Available</span>
        </div>
      </div>

      {/* Platform Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {PLATFORM_FILTERS.map((f) => {
          const isSelected = selectedPlatform === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setSelectedPlatform(f.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredContents.map((item) => {
          const platformKey = String(item.platform || "general").toLowerCase();
          const pConfig = PLATFORM_CONFIG[platformKey] || PLATFORM_CONFIG.general;
          const plainText = getPlainTextFromHtml(item.content);
          const textCopyKey = `text-${item.id}`;
          const htmlCopyKey = `html-${item.id}`;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-3 bg-gray-50/50">
                <div className="space-y-1 min-w-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${pConfig.badgeCls}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dotCls}`} />
                    {pConfig.label}
                  </span>
                  <h4 className="text-sm font-bold text-gray-800 truncate" title={item.title}>
                    {item.title}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setModalItem(item)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Full View / Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Rendered Live Visual Preview Container */}
              <div className="p-4 flex-1 overflow-auto bg-slate-50/60 max-h-[280px]">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                  <style>{item.css_styles || ""}</style>
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Copy Caption (Plain Text) */}
                <button
                  type="button"
                  onClick={() => handleCopy(textCopyKey, plainText, "Caption text")}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs cursor-pointer"
                >
                  {copiedMap[textCopyKey] ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Caption Copied!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  {/* Copy HTML Code */}
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        htmlCopyKey,
                        `${item.css_styles ? `<style>${item.css_styles}</style>\n` : ""}${item.content}`,
                        "HTML code"
                      )
                    }
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                    title="Copy full HTML & CSS markup"
                  >
                    {copiedMap[htmlCopyKey] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Code Copied!</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-3.5 h-3.5 text-gray-500" />
                        <span>Copy HTML</span>
                      </>
                    )}
                  </button>

                  {/* View Details / Preview */}
                  <button
                    type="button"
                    onClick={() => setModalItem(item)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">{modalItem.title}</h3>
                  <span className="text-xs text-gray-500 capitalize font-medium">
                    {modalItem.platform} Marketing Copy
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Device simulator toggles */}
                <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
                      previewDevice === "desktop"
                        ? "bg-white text-gray-800 shadow-2xs font-bold"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
                      previewDevice === "mobile"
                        ? "bg-white text-gray-800 shadow-2xs font-bold"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                    title="Mobile Screen Simulator (375px)"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Live Rendered */}
            <div className="p-6 overflow-y-auto space-y-5 bg-slate-50/50 flex flex-col items-center">
              <div
                className={`w-full transition-all duration-300 ${
                  previewDevice === "mobile"
                    ? "max-w-[375px] bg-white rounded-3xl border-4 border-slate-800 shadow-2xl p-4"
                    : "bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                }`}
              >
                {previewDevice === "mobile" && (
                  <div className="text-[10px] text-center text-gray-400 font-mono py-1 border-b border-gray-100 mb-3">
                    Mobile Screen Simulator
                  </div>
                )}
                <style>{modalItem.css_styles || ""}</style>
                <div dangerouslySetInnerHTML={{ __html: modalItem.content }} />
              </div>

              {/* Raw Text Accordion */}
              <div className="w-full bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700">Plain Caption Text:</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(`modal-text-${modalItem.id}`, getPlainTextFromHtml(modalItem.content), "Caption")
                    }
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Text
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto font-sans">
                  {getPlainTextFromHtml(modalItem.content)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  handleCopy(`modal-caption-${modalItem.id}`, getPlainTextFromHtml(modalItem.content), "Caption")
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Copy Caption to Promote</span>
              </button>

              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResellerSocialContent;
