import React, { useState, useRef } from "react";
import {
  HelpCircle,
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
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetProductAssistantQasByProductQuery,
  useAddProductAssistantQaMutation,
  useUpdateProductAssistantQaMutation,
  useDeleteProductAssistantQaMutation,
} from "../../../../redux/features/productAssistantQa";

const SAMPLE_TEMPLATES = [
  {
    name: "Step-by-Step Guide",
    question: "How to pair these earbuds with iPhone / Android?",
    answer: `<div class='qa-card'>
  <h4>Follow these steps:</h4>
  <ol>
    <li>Open Bluetooth settings on your mobile device</li>
    <li>Take both earbuds out of the charging case</li>
    <li>Select Earbuds from the available devices list</li>
    <li>Tap Pair and wait for the connected confirmation</li>
  </ol>
</div>`,
    css_styles: `.qa-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-left: 4px solid #16a34a;
  padding: 14px 18px;
  border-radius: 8px;
  color: #14532d;
  font-family: system-ui, -apple-system, sans-serif;
}
.qa-card h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 700;
  color: #166534;
}
.qa-card ol {
  margin: 0;
  padding-left: 20px;
  line-height: 1.6;
  font-size: 13px;
}`,
  },
  {
    name: "Specs & Battery Card",
    question: "What is the battery life and charging time?",
    answer: `<div class='qa-spec-box'>
  <div class='spec-header'>⚡ Battery & Charging Specifications</div>
  <div class='spec-grid'>
    <div class='spec-item'><strong>Single Charge:</strong> Up to 6 hours</div>
    <div class='spec-item'><strong>With Case:</strong> Up to 24 hours</div>
    <div class='spec-item'><strong>Fast Charge:</strong> 10 mins gives 2 hrs</div>
    <div class='spec-item'><strong>Port:</strong> Type-C Fast Charging</div>
  </div>
</div>`,
    css_styles: `.qa-spec-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  color: #1e293b;
  font-family: system-ui, -apple-system, sans-serif;
}
.qa-spec-box .spec-header {
  font-size: 14px;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 12px;
}
.qa-spec-box .spec-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  font-size: 13px;
}
.qa-spec-box .spec-item {
  background: #ffffff;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
}`,
  },
  {
    name: "Troubleshooting Alert",
    question: "What should I do if one earbud is not connecting?",
    answer: `<div class='qa-alert'>
  <div class='alert-title'>⚠️ Reset & Reconnect Guide</div>
  <p>If audio only plays from one earbud, follow this quick reset procedure:</p>
  <ul>
    <li>Put both earbuds back inside the charging case for 10 seconds.</li>
    <li>Forget or unpair the device from your smartphone Bluetooth list.</li>
    <li>Take both earbuds out simultaneously and reconnect.</li>
  </ul>
  <p class='support-note'>Still having trouble? Contact customer support for warranty exchange.</p>
</div>`,
    css_styles: `.qa-alert {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  color: #92400e;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
}
.qa-alert .alert-title {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 6px;
  color: #b45309;
}
.qa-alert ul {
  margin: 8px 0;
  padding-left: 20px;
  line-height: 1.5;
}
.qa-alert .support-note {
  margin-top: 10px;
  font-weight: 600;
  color: #78350f;
  font-size: 12px;
}`,
  },
];

const ProductQaTab = ({ productId }) => {
  const formRef = useRef(null);

  // RTK Query Hooks
  const {
    data: apiResponse,
    isLoading: fetchingQas,
    refetch,
  } = useGetProductAssistantQasByProductQuery(productId);

  const [addQa, { isLoading: creating }] = useAddProductAssistantQaMutation();
  const [updateQa, { isLoading: updating }] = useUpdateProductAssistantQaMutation();
  const [deleteQa, { isLoading: deleting }] = useDeleteProductAssistantQaMutation();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    css_styles: "",
    is_active: true,
  });

  // UI state for Live Preview Box & Modals
  const [previewDevice, setPreviewDevice] = useState("desktop"); // 'desktop' or 'mobile'
  const [modalItem, setModalItem] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [expandedQaIds, setExpandedQaIds] = useState({});
  const [searchFilter, setSearchFilter] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Normalize API data
  const rawData = apiResponse?.data || apiResponse;
  const qasList = Array.isArray(rawData?.qas)
    ? rawData.qas
    : Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData)
    ? rawData
    : [];

  const filteredQas = qasList.filter((qa) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      qa.question?.toLowerCase().includes(term) ||
      qa.answer?.toLowerCase().includes(term)
    );
  });

  const activeCount = qasList.filter((qa) => Boolean(qa.is_active)).length;
  const inactiveCount = qasList.length - activeCount;

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
      question: "",
      answer: "",
      css_styles: "",
      is_active: true,
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({
      question: item.question || "",
      answer: item.answer || "",
      css_styles: item.css_styles || "",
      is_active: item.is_active === true || item.is_active === 1 || item.is_active === "1",
    });
    setIsFormOpen(true);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleApplyTemplate = (tmpl) => {
    setFormData((prev) => ({
      ...prev,
      question: tmpl.question,
      answer: tmpl.answer,
      css_styles: tmpl.css_styles,
    }));
    setIsFormOpen(true);
    toast.info(`Loaded sample: "${tmpl.name}"`);
  };

  const handleInsertTag = (openTag, closeTag = "") => {
    const textarea = document.getElementById("qa-answer-editor");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = formData.answer.substring(start, end);
    const replacement = `${openTag}${selected}${closeTag}`;

    const newAnswer =
      formData.answer.substring(0, start) +
      replacement +
      formData.answer.substring(end);

    setFormData((prev) => ({ ...prev, answer: newAnswer }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + openTag.length,
        start + openTag.length + selected.length
      );
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      toast.error("Please enter a question.");
      return;
    }

    if (!formData.answer.trim()) {
      toast.error("Please enter an answer (HTML or plain text).");
      return;
    }

    const payload = {
      product_id: Number(productId),
      question: formData.question.trim(),
      answer: formData.answer,
      css_styles: formData.css_styles || "",
      is_active: Boolean(formData.is_active),
    };

    try {
      if (editingId) {
        await updateQa({
          id: editingId,
          productId: Number(productId),
          ...payload,
        }).unwrap();
        toast.success("Product Q&A updated successfully!");
      } else {
        await addQa(payload).unwrap();
        toast.success("New Product Q&A created successfully!");
      }
      resetForm();
      setIsFormOpen(false);
      refetch();
    } catch (err) {
      console.error("Save Q&A failed:", err);
      const errMsg =
        err?.data?.message || err?.error || "Failed to save Product Q&A.";
      toast.error(errMsg);
    }
  };

  const handleToggleActive = async (item) => {
    const currentActive =
      item.is_active === true || item.is_active === 1 || item.is_active === "1";
    const newActive = !currentActive;

    try {
      await updateQa({
        id: item.id,
        productId: Number(productId),
        product_id: Number(productId),
        question: item.question,
        answer: item.answer,
        css_styles: item.css_styles || "",
        is_active: newActive,
      }).unwrap();
      toast.success(newActive ? "Q&A activated!" : "Q&A set to inactive.");
      refetch();
    } catch (err) {
      console.error("Toggle active failed:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;

    try {
      await deleteQa({
        id: deleteCandidate.id,
        productId: Number(productId),
        product_id: Number(productId),
      }).unwrap();
      toast.success("Product Q&A deleted successfully!");
      setDeleteCandidate(null);
      if (editingId === deleteCandidate.id) {
        resetForm();
        setIsFormOpen(false);
      }
      refetch();
    } catch (err) {
      console.error("Delete Q&A failed:", err);
      toast.error(err?.data?.message || "Failed to delete Q&A.");
    }
  };

  const toggleAccordion = (id) => {
    setExpandedQaIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("HTML copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      {/* Top Section / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Product Assistant Q&A</h2>
              <p className="text-xs text-gray-500">
                Create structured Question & Answer pairs with custom HTML and CSS styling for this product.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Sample Template Loader & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
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
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Q&A</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Q&As</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{qasList.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Active Q&As</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{activeCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Inactive Q&As</p>
            <p className="text-xl font-bold text-gray-400 mt-0.5">{inactiveCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Form Drawer / Section */}
      {isFormOpen && (
        <div
          ref={formRef}
          className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm relative transition-all"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  {editingId ? "Edit Product Q&A" : "Create New Product Q&A"}
                </h3>
                <p className="text-xs text-gray-400">
                  Write the question and customize the answer using rich HTML formatting and CSS styles.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(false);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              title="Close Form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                placeholder="e.g. How to pair these earbuds with iPhone?"
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Split Screen: Editor & Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Code Editors */}
              <div className="space-y-4">
                {/* HTML Answer Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-600" />
                      Answer HTML Markup <span className="text-red-500">*</span>
                    </label>

                    {/* Quick Formatting Tags Helper */}
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => handleInsertTag("<b>", "</b>")}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                        title="Insert <b>"
                      >
                        Bold
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertTag("<p>", "</p>")}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                        title="Insert <p>"
                      >
                        P
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertTag("<h4>", "</h4>")}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                        title="Insert <h4>"
                      >
                        H4
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertTag("<ol><li>", "</li></ol>")}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                        title="Insert <ol>"
                      >
                        List
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertTag("<div class='qa-card'>", "</div>")}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                        title="Wrap in qa-card"
                      >
                        Card
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="qa-answer-editor"
                    name="answer"
                    rows={8}
                    value={formData.answer}
                    onChange={handleInputChange}
                    placeholder="<div class='qa-card'>\n  <h4>Follow these steps:</h4>\n  <ol>\n    <li>Step 1...</li>\n  </ol>\n</div>"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border border-gray-300 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition leading-relaxed"
                    required
                  />
                </div>

                {/* CSS Styles Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      CSS Styles (Optional)
                    </label>
                    <span className="text-[11px] text-gray-400">Scoped to answer elements</span>
                  </div>

                  <textarea
                    name="css_styles"
                    rows={6}
                    value={formData.css_styles}
                    onChange={handleInputChange}
                    placeholder=".qa-card { background: #f0fdf4; padding: 12px; border-radius: 6px; }\n.qa-card h4 { color: #166534; }"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border border-gray-300 bg-slate-900 text-teal-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition leading-relaxed"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/70">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Publish / Active Status</p>
                    <p className="text-[11px] text-gray-500">
                      When enabled, this Q&A will be visible to resellers and customers.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
              </div>

              {/* Right Column: Live Rendered Preview */}
              <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-gray-700 ml-1.5">Live Rendered Preview</span>
                  </div>

                  {/* Device simulator toggles */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-1.5 rounded-md text-xs font-medium transition ${
                        previewDevice === "desktop"
                          ? "bg-gray-200 text-gray-800"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                      title="Desktop View"
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
                      title="Mobile View (375px)"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Preview Body */}
                <div className="p-4 flex-1 flex justify-center items-start overflow-auto min-h-[320px]">
                  <div
                    className={`w-full transition-all duration-300 ${
                      previewDevice === "mobile"
                        ? "max-w-[375px] shadow-lg rounded-2xl bg-white border border-gray-300 p-3"
                        : ""
                    }`}
                  >
                    {previewDevice === "mobile" && (
                      <div className="text-[10px] text-center text-gray-400 font-mono py-1 border-b border-gray-100 mb-3">
                        Mobile Screen Simulator
                      </div>
                    )}

                    <div className="qa-live-preview-box">
                      {/* Dynamic CSS Injection */}
                      <style>{formData.css_styles || ""}</style>

                      {/* Question Preview Heading */}
                      <div className="mb-3 pb-2 border-b border-gray-100">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mb-1">
                          Question
                        </span>
                        <h4 className="text-sm font-bold text-gray-800">
                          {formData.question || "Your question will appear here..."}
                        </h4>
                      </div>

                      {/* Visual HTML Answer Injection */}
                      {formData.answer?.trim() ? (
                        <div dangerouslySetInnerHTML={{ __html: formData.answer }} />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                          <Code className="w-8 h-8 text-gray-300 mb-2" />
                          <p className="text-xs font-medium">No HTML answer entered yet</p>
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

            {/* Form Footer Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsFormOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || updating}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition"
              >
                {(creating || updating) ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingId ? "Update Q&A" : "Save Q&A"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Q&A List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-800">All Product Q&As</h3>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {qasList.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search Q&As..."
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-60"
            />
            <button
              type="button"
              onClick={() => refetch()}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              title="Refresh list"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {fetchingQas ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <p className="text-xs">Loading Product Q&As...</p>
          </div>
        ) : filteredQas.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl p-8">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-gray-700">No Product Q&A Found</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              {searchFilter
                ? `No questions match "${searchFilter}". Try clearing your search.`
                : "Help resellers and customers by adding common questions and answers with rich HTML & CSS styling."}
            </p>
            {!searchFilter && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Q&A</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQas.map((item, index) => {
              const isExpanded = Boolean(expandedQaIds[item.id]);
              const isActive =
                item.is_active === true || item.is_active === 1 || item.is_active === "1";

              return (
                <div
                  key={item.id || index}
                  className={`bg-white border rounded-xl overflow-hidden transition-all shadow-xs ${
                    isActive ? "border-gray-200 hover:border-blue-300" : "border-gray-200 opacity-75"
                  }`}
                >
                  {/* Card Header Row */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-gray-100 text-gray-500 border-gray-200"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                          {item.id && (
                            <span className="text-[10px] text-gray-400 font-mono">
                              ID: #{item.id}
                            </span>
                          )}
                          {item.created_at && (
                            <span className="text-[10px] text-gray-400">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-gray-800 truncate">
                          {item.question}
                        </h4>
                      </div>
                    </div>

                    {/* Action buttons on card */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Active toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`p-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1 ${
                          isActive
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                        title={isActive ? "Deactivate Q&A" : "Activate Q&A"}
                      >
                        {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{isActive ? "Active" : "Off"}</span>
                      </button>

                      {/* Live modal preview */}
                      <button
                        type="button"
                        onClick={() => setModalItem(item)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        title="Live Rendered Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Copy HTML */}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.answer, item.id)}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        title="Copy Answer HTML"
                      >
                        {copiedId === item.id ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleEditClick(item)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        title="Edit Q&A"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(item)}
                        className="p-1.5 text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:bg-red-50 transition"
                        title="Delete Q&A"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Accordion expand toggle */}
                      <button
                        type="button"
                        onClick={() => toggleAccordion(item.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                        title={isExpanded ? "Collapse Answer" : "Expand Answer"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Body: Answer Preview */}
                  {isExpanded && (
                    <div className="p-4 border-t border-gray-100 bg-white">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Rendered Output
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <style>{item.css_styles || ""}</style>
                        <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                      </div>

                      {item.css_styles && (
                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Attached CSS:
                          </span>
                          <pre className="mt-1 text-[11px] font-mono bg-slate-900 text-teal-300 p-2.5 rounded-lg overflow-x-auto">
                            {item.css_styles}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Preview Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-gray-800">Q&A Live Preview</h4>
              </div>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Question
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {modalItem.question}
                </h3>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Answer (HTML + CSS Rendered)
                </span>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <style>{modalItem.css_styles || ""}</style>
                  <div dangerouslySetInnerHTML={{ __html: modalItem.answer }} />
                </div>
              </div>

              {modalItem.css_styles && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    CSS Code
                  </span>
                  <pre className="text-xs font-mono bg-slate-900 text-teal-300 p-3 rounded-lg overflow-x-auto">
                    {modalItem.css_styles}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <button
                type="button"
                onClick={() => copyToClipboard(modalItem.answer, modalItem.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw HTML</span>
              </button>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-gray-800 text-center mb-1">
              Delete Product Q&A?
            </h4>
            <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
              Are you sure you want to delete this question?
              <br />
              <strong className="text-gray-700 mt-1 inline-block">
                "{deleteCandidate.question}"
              </strong>
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition flex-1"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
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

export default ProductQaTab;
