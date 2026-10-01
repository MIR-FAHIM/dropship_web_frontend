import React, { useState, useRef } from "react";
import {
  Share2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Code,
  Smartphone,
  Monitor,
  Copy,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetSocialMediaTextByProductQuery,
  useAddSocialMediaTextMutation,
  useUpdateSocialMediaTextMutation,
  useToggleActiveSocialMediaTextMutation,
  useDeleteSocialMediaTextMutation,
} from "../../../../redux/features/socialMediaText";

const PLATFORMS = [
  { value: "general", label: "General Template" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
];

const PLATFORM_CONFIG = {
  general: {
    label: "General",
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

const SAMPLE_TEMPLATES = [
  {
    name: "Special Deal Promo",
    platform: "facebook",
    title: "Special Promo Announcement",
    content: `<div class="promo-box">
  <span class="badge">LIMITED TIME OFFER</span>
  <h2 class="title">Mega Discount On This Product!</h2>
  <p class="desc">Order now and enjoy special wholesale dropship pricing with express delivery nationwide.</p>
  <div class="cta-row">
    <span class="price-highlight">Stock is Limited!</span>
    <button class="promo-btn">Shop Now</button>
  </div>
</div>`,
    css_styles: `.promo-box {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 20px;
  color: #1e3a8a;
  font-family: system-ui, -apple-system, sans-serif;
}
.promo-box .badge {
  display: inline-block;
  background: #2563eb;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 9999px;
  letter-spacing: 0.5px;
}
.promo-box .title {
  margin: 10px 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e40af;
}
.promo-box .desc {
  font-size: 13px;
  line-height: 1.5;
  color: #3b82f6;
  margin: 0 0 14px 0;
}
.promo-box .cta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.promo-box .price-highlight {
  font-size: 13px;
  font-weight: 600;
  color: #dc2626;
}
.promo-box .promo-btn {
  background: #1e40af;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}`,
  },
  {
    name: "Instagram Aesthetic Card",
    platform: "instagram",
    title: "Instagram Aesthetic Feature Card",
    content: `<div class="insta-card">
  <div class="insta-header">✨ TRENDING NOW ✨</div>
  <h3 class="insta-title">Upgrade Your Daily Lifestyle</h3>
  <p class="insta-text">Hand-picked premium quality designed for ultimate satisfaction. Tap link in bio to get yours today!</p>
  <div class="tags">#Trending #MustHave #BestDeals #DropShipBD</div>
</div>`,
    css_styles: `.insta-card {
  background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%);
  border: 1px solid #fecdd3;
  border-radius: 16px;
  padding: 22px;
  color: #881337;
  font-family: system-ui, -apple-system, sans-serif;
  text-align: center;
}
.insta-card .insta-header {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #e11d48;
  margin-bottom: 6px;
}
.insta-card .insta-title {
  font-size: 17px;
  font-weight: 800;
  color: #9f1239;
  margin: 0 0 8px 0;
}
.insta-card .insta-text {
  font-size: 13px;
  line-height: 1.5;
  color: #4c0519;
  margin: 0 0 12px 0;
}
.insta-card .tags {
  font-size: 12px;
  color: #e11d48;
  font-weight: 600;
}`,
  },
  {
    name: "WhatsApp Quick Message",
    platform: "whatsapp",
    title: "WhatsApp Order Direct Message",
    content: `<div class="wa-bubble">
  <div class="wa-badge">🟢 WhatsApp Exclusive</div>
  <p><strong>আসসালামু আলাইকুম!</strong></p>
  <p>আমাদের এই প্রিমিয়াম প্রোডাক্টটি এখন বিশেষ ডিসকাউন্টে সরাসরি ডেলিভারি দেওয়া হচ্ছে।</p>
  <ul>
    <li>✅ ১০০% অথেনটিক কোয়ালিটি</li>
    <li>⚡ দ্রুত ক্যাশ অন ডেলিভারি</li>
    <li>🛡️ সহজ রিটার্ন পলিসি</li>
  </ul>
  <p class="wa-footer">অর্ডার করতে আপনার নাম, ঠিকানা ও মোবাইল নম্বর মেসেজ করুন।</p>
</div>`,
    css_styles: `.wa-bubble {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-left: 4px solid #16a34a;
  border-radius: 8px;
  padding: 16px;
  color: #14532d;
  font-size: 13px;
  line-height: 1.6;
}
.wa-bubble .wa-badge {
  font-size: 11px;
  font-weight: 700;
  color: #15803d;
  margin-bottom: 8px;
}
.wa-bubble ul {
  padding-left: 18px;
  margin: 8px 0;
}
.wa-bubble .wa-footer {
  margin-top: 10px;
  font-weight: 600;
  color: #166534;
}`,
  },
];

const SocialContentTab = ({ productId }) => {
  const formRef = useRef(null);

  // RTK Query Hooks
  const {
    data: apiResponse,
    isLoading: fetchingContents,
    refetch,
  } = useGetSocialMediaTextByProductQuery(productId);

  const [addContent, { isLoading: creating }] = useAddSocialMediaTextMutation();
  const [updateContent, { isLoading: updating }] = useUpdateSocialMediaTextMutation();
  const [toggleActive, { isLoading: toggling }] = useToggleActiveSocialMediaTextMutation();
  const [deleteContent, { isLoading: deleting }] = useDeleteSocialMediaTextMutation();

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    platform: "facebook",
    content: "",
    css_styles: "",
    is_active: true,
  });

  // UI state for Live Preview Box
  const [previewDevice, setPreviewDevice] = useState("desktop"); // 'desktop' or 'mobile'
  const [activeTabSubView, setActiveTabSubView] = useState("preview"); // 'preview' or 'code'
  const [modalItem, setModalItem] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Normalize API contents
  const rawData = apiResponse?.data || apiResponse;
  const contentsList = Array.isArray(rawData?.text_contents)
    ? rawData.text_contents
    : Array.isArray(rawData)
    ? rawData
    : [];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      platform: "facebook",
      content: "",
      css_styles: "",
      is_active: true,
    });
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || "",
      platform: item.platform || "general",
      content: item.content || "",
      css_styles: item.css_styles || "",
      is_active: item.is_active === true || item.is_active === 1 || item.is_active === "1",
    });

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title for the social content template.");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Please provide HTML / text content.");
      return;
    }

    try {
      if (editingId) {
        // Update existing content
        await updateContent({
          id: editingId,
          productId,
          title: formData.title,
          platform: formData.platform,
          content: formData.content,
          css_styles: formData.css_styles,
          is_active: formData.is_active,
        }).unwrap();

        toast.success("Social content updated successfully!");
      } else {
        // Create new content
        await addContent({
          product_id: Number(productId),
          title: formData.title,
          platform: formData.platform,
          content: formData.content,
          css_styles: formData.css_styles,
          is_active: formData.is_active,
        }).unwrap();

        toast.success("New social content created successfully!");
      }

      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to save social content template.");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await toggleActive({ id: item.id, productId }).unwrap();
      toast.success(`Status updated for "${item.title}"`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to toggle active status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteContent({ id: deleteCandidate.id, productId }).unwrap();
      toast.success("Social content deleted successfully.");
      if (editingId === deleteCandidate.id) {
        resetForm();
      }
      setDeleteCandidate(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to delete social content.");
    }
  };

  const handleApplyTemplate = (tmpl) => {
    setFormData((prev) => ({
      ...prev,
      title: tmpl.title,
      platform: tmpl.platform,
      content: tmpl.content,
      css_styles: tmpl.css_styles,
    }));
    toast.info(`Loaded template: "${tmpl.name}"`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      {/* Top Section / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Social Content Templates</h2>
              <p className="text-xs text-gray-500">
                Create, customize and manage HTML/CSS promotional text templates for this product.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Sample Template Loader */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 hidden md:inline">Quick Templates:</span>
          {SAMPLE_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition flex items-center gap-1"
              title={`Load sample ${tmpl.name}`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Creator & Edit Form (Section B & C) */}
      <div
        ref={formRef}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {editingId ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300">
                <Pencil className="w-3.5 h-3.5" /> Editing Template #{editingId}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                <Plus className="w-3.5 h-3.5" /> Create New Template
              </span>
            )}
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Title Input */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Template Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Facebook Campaign Copy, Instagram Story Promo..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>

            {/* Platform Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Platform <span className="text-red-500">*</span>
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition cursor-pointer"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* HTML and CSS Editors + Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column: Code Editors */}
            <div className="space-y-4">
              {/* HTML Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-blue-600" /> HTML / Text Content{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400">Raw HTML markup</span>
                </div>
                <textarea
                  name="content"
                  required
                  rows={8}
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="<div class='promo'><h3>Promo Title</h3><p>Promo details...</p></div>"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-xs font-mono text-gray-800 bg-slate-900/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  spellCheck={false}
                />
              </div>

              {/* CSS Styles Code Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-purple-600" /> CSS Styles
                  </label>
                  <span className="text-[11px] text-gray-400">Custom CSS rules</span>
                </div>
                <textarea
                  name="css_styles"
                  rows={6}
                  value={formData.css_styles}
                  onChange={handleInputChange}
                  placeholder=".promo { background: #eff6ff; padding: 16px; border-radius: 8px; color: #1e3a8a; }"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-xs font-mono text-gray-800 bg-slate-900/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  spellCheck={false}
                />
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center gap-3 pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-3 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    {formData.is_active ? "Status: Active" : "Status: Inactive"}
                  </span>
                </label>
              </div>
            </div>

            {/* Right Column: Live Visual Preview Box (Section C) */}
            <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
              <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-gray-700 ml-1.5">Live Rendered Preview</span>
                </div>

                {/* Device and Code toggles */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md text-xs font-medium transition ${
                      previewDevice === "desktop"
                        ? "bg-gray-200 text-gray-800"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    title="Desktop Preview View"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-md text-xs font-medium transition ${
                      previewDevice === "mobile"
                        ? "bg-gray-200 text-gray-800"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    title="Mobile Screen View (375px)"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Preview Body */}
              <div className="p-4 flex-1 flex justify-center items-start overflow-auto min-h-[300px]">
                <div
                  className={`w-full transition-all duration-300 ${
                    previewDevice === "mobile" ? "max-w-[375px] shadow-lg rounded-2xl bg-white border border-gray-300 p-2" : ""
                  }`}
                >
                  {previewDevice === "mobile" && (
                    <div className="text-[10px] text-center text-gray-400 font-mono py-1 border-b border-gray-100 mb-2">
                      Mobile Screen Simulator
                    </div>
                  )}

                  <div className="social-live-preview-box">
                    {/* Real-time Dynamic CSS Injection */}
                    <style>{formData.css_styles || ""}</style>

                    {/* Real-time Visual HTML Injection */}
                    {formData.content?.trim() ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                        <Code className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-xs font-medium">No HTML markup entered yet</p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Type HTML on the left or select a Quick Template above.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              Clear / Reset
            </button>

            <button
              type="submit"
              disabled={creating || updating}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {creating || updating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Content...</span>
                </>
              ) : (
                <>
                  {editingId ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{editingId ? "Update Social Content" : "Save Content"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Contents List Table / Cards (Section D) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-800">Saved Social Content Templates</h3>
            <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2.5 py-0.5 rounded-full">
              {contentsList.length}
            </span>
          </div>
        </div>

        {fetchingContents ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading social content templates...</p>
          </div>
        ) : contentsList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-gray-700">No Social Content Templates Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Use the form above to add your first promotional copy and styling for Facebook, Instagram, TikTok, or WhatsApp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentsList.map((item) => {
              const platformKey = String(item.platform || "general").toLowerCase();
              const pConfig = PLATFORM_CONFIG[platformKey] || PLATFORM_CONFIG.general;
              const isActive =
                item.is_active === true || item.is_active === 1 || item.is_active === "1";

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border transition shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
                    editingId === item.id ? "border-amber-400 ring-2 ring-amber-100" : "border-gray-200"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Platform Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${pConfig.badgeCls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dotCls}`} />
                          {pConfig.label}
                        </span>

                        {/* Status Badge */}
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                            <XCircle className="w-3 h-3 text-gray-400" /> Inactive
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-gray-800 truncate" title={item.title}>
                        {item.title}
                      </h4>
                    </div>

                    {/* Date */}
                    {item.created_at && (
                      <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Card Mini Preview Snippet */}
                  <div className="p-4 bg-gray-50/60 flex-1 overflow-hidden">
                    <div className="text-[11px] font-mono text-gray-600 line-clamp-3 bg-white p-2.5 rounded-lg border border-gray-200">
                      {item.content}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => setModalItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        title="Visual Preview"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Preview</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleEditClick(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        title="Edit Template"
                      >
                        <Pencil className="w-3.5 h-3.5 text-amber-600" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Toggle Active Button */}
                      <button
                        type="button"
                        disabled={toggling}
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition border ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                        title="Toggle Active Status"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isActive ? "Deactivate" : "Activate"}</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(item)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Visual Preview Modal (Section D - Preview Modal) */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-gray-800">{modalItem.title}</h3>
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    {modalItem.platform} Template
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Live Render */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                <style>{modalItem.css_styles || ""}</style>
                <div dangerouslySetInnerHTML={{ __html: modalItem.content }} />
              </div>

              {/* Source View Accordion / Details */}
              <div className="pt-2 border-t border-gray-100">
                <details className="text-xs text-gray-600">
                  <summary className="font-semibold cursor-pointer text-gray-700 hover:text-blue-600 select-none">
                    View Raw HTML &amp; CSS Source
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-gray-500">HTML Content</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(modalItem.content)}
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copy HTML
                        </button>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-[11px] font-mono">
                        {modalItem.content}
                      </pre>
                    </div>

                    {modalItem.css_styles && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-gray-500">CSS Styles</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(modalItem.css_styles)}
                            className="text-[11px] text-purple-600 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copy CSS
                          </button>
                        </div>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-[11px] font-mono">
                          {modalItem.css_styles}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleEditClick(modalItem);
                  setModalItem(null);
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit this template
              </button>

              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-semibold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Delete Template?</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-gray-800">&quot;{deleteCandidate.title}&quot;</strong>? This
              action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialContentTab;
