import React, { useState } from "react";
import {
  HelpCircle,
  Copy,
  Check,
  Search,
  Code,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useGetProductAssistantQasByProductQuery } from "../../../redux/features/productAssistantQa";

const getPlainTextFromHtml = (html) => {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return (temp.textContent || temp.innerText || "").trim();
};

const ResellerProductQa = ({ productId }) => {
  const { data: apiResponse, isLoading } = useGetProductAssistantQasByProductQuery(
    productId,
    { skip: !productId }
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [expandedMap, setExpandedMap] = useState({});

  const rawData = apiResponse?.data || apiResponse;
  const allQas = Array.isArray(rawData?.qas)
    ? rawData.qas
    : Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData)
    ? rawData
    : [];

  // For resellers, only show active Q&As
  const activeQas = allQas.filter(
    (item) =>
      item.is_active === undefined ||
      item.is_active === null ||
      item.is_active === true ||
      item.is_active === 1 ||
      item.is_active === "1"
  );

  const filteredQas = activeQas.filter((item) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    const plainAnswer = getPlainTextFromHtml(item.answer).toLowerCase();
    return (
      (item.question && item.question.toLowerCase().includes(term)) ||
      plainAnswer.includes(term)
    );
  });

  const handleCopy = async (key, text, successMsg) => {
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

      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      toast.success(successMsg || "Copied successfully!");
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Failed to copy text");
    }
  };

  const toggleAccordion = (id) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const handleToggleAll = (expand) => {
    const updated = {};
    activeQas.forEach((qa) => {
      updated[qa.id] = expand;
    });
    setExpandedMap(updated);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium">Loading Product Q&A...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ marginTop: "16px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)",
          border: "1px solid #bfdbfe",
          borderRadius: "14px",
          padding: "18px 20px",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Product Assistant Q&A / গ্রাহক প্রশ্নোত্তর গাইড
              </h3>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "13px",
                  color: "#475569",
                  lineHeight: "1.45",
                }}
              >
                কাস্টমারদের বিভিন্ন প্রশ্নের দ্রুত উত্তর দিতে অথবা আপনার পেজ ও ল্যান্ডিং পেজে যুক্ত করতে নিচের রেডিমেড প্রশ্ন ও উত্তরগুলো ব্যবহার করুন।
              </p>
            </div>
          </div>

          {activeQas.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleAll(true)}
                style={{
                  fontSize: "12px",
                  padding: "6px 12px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  color: "#334155",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                সব উন্মুক্ত করুন
              </button>
              <button
                type="button"
                onClick={() => handleToggleAll(false)}
                style={{
                  fontSize: "12px",
                  padding: "6px 12px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  color: "#334155",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                সব গুটিয়ে নিন
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            style={{ pointerEvents: "none" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="প্রশ্ন বা উত্তর খুঁজুন (Search Q&A)..."
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              fontSize: "13px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              outline: "none",
              background: "#ffffff",
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "999px",
              background: "#e0f2fe",
              color: "#0369a1",
            }}
          >
            মোট প্রশ্নোত্তর: {activeQas.length}টি
          </span>
          {searchQuery && (
            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              (পাওয়া গেছে: {filteredQas.length}টি)
            </span>
          )}
        </div>
      </div>

      {/* Q&A Cards List */}
      {filteredQas.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            background: "#ffffff",
            border: "1px dashed #cbd5e1",
            borderRadius: "16px",
          }}
        >
          <HelpCircle
            className="w-12 h-12 text-gray-300 mx-auto"
            style={{ marginBottom: "12px" }}
          />
          <h4
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 700,
              color: "#334155",
            }}
          >
            {searchQuery
              ? `"${searchQuery}" দিয়ে কোনো প্রশ্নোত্তর পাওয়া যায়নি`
              : "এই প্রোডাক্টের জন্য এখনো কোনো প্রশ্নোত্তর যুক্ত করা হয়নি।"}
          </h4>
          <p
            style={{
              margin: "6px auto 0",
              fontSize: "13px",
              color: "#64748b",
              maxWidth: "400px",
            }}
          >
            {searchQuery
              ? "বানান পরীক্ষা করুন অথবা অন্য কোনো কী-ওয়ার্ড দিয়ে সার্চ করুন।"
              : "এডমিন কর্তৃক প্রশ্নোত্তর যুক্ত করা হলে তা এখানে প্রদর্শিত হবে।"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredQas.map((item, index) => {
            // Default to open unless explicitly collapsed
            const isExpanded = expandedMap[item.id] !== false;
            const plainAnswer = getPlainTextFromHtml(item.answer);

            return (
              <div
                key={item.id || index}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  overflow: "hidden",
                  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Question Row Header */}
                <div
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    cursor: "pointer",
                    background: isExpanded ? "#f8fafc" : "#ffffff",
                    borderBottom: isExpanded ? "1px solid #e2e8f0" : "none",
                  }}
                  onClick={() => toggleAccordion(item.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        fontWeight: 800,
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      Q{index + 1}
                    </span>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#0f172a",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.question}
                    </h4>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Rendered Answer & Actions Body */}
                {isExpanded && (
                  <div style={{ padding: "18px 20px" }}>
                    {/* Rendered HTML + Scoped CSS View */}
                    <div
                      className="reseller-qa-render-scope"
                      style={{
                        background: "#fafafa",
                        border: "1px solid #f1f5f9",
                        borderRadius: "10px",
                        padding: "16px",
                        marginBottom: "14px",
                      }}
                    >
                      {/* Inject CSS styles for this answer */}
                      <style>{item.css_styles || ""}</style>
                      <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                    </div>

                    {/* Reseller 1-Click Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        paddingTop: "10px",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {/* Copy Plain Text Answer */}
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              `text-${item.id}`,
                              plainAnswer,
                              "উত্তরটি মেসেজের জন্য কপি করা হয়েছে!"
                            )
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#1e293b",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {copiedKey === `text-${item.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span style={{ color: "#059669" }}>কপি হয়েছে!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-blue-600" />
                              <span>কপি টেক্সট (মেসেজের জন্য)</span>
                            </>
                          )}
                        </button>

                        {/* Copy Full HTML Answer */}
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              `html-${item.id}`,
                              item.answer,
                              "HTML কোড কপি করা হয়েছে!"
                            )
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#1e293b",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {copiedKey === `html-${item.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span style={{ color: "#059669" }}>HTML কপি হয়েছে!</span>
                            </>
                          ) : (
                            <>
                              <Code className="w-3.5 h-3.5 text-purple-600" />
                              <span>কপি HTML (ল্যান্ডিং পেজের জন্য)</span>
                            </>
                          )}
                        </button>

                        {/* Copy Question + Answer */}
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              `qa-${item.id}`,
                              `প্রশ্ন: ${item.question}\nউত্তর: ${plainAnswer}`,
                              "প্রশ্ন ও উত্তর একসাথে কপি করা হয়েছে!"
                            )
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#1e293b",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {copiedKey === `qa-${item.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span style={{ color: "#059669" }}>কপি হয়েছে!</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3.5 h-3.5 text-amber-600" />
                              <span>প্রশ্ন + উত্তর একসাথে</span>
                            </>
                          )}
                        </button>
                      </div>

                      <span
                        style={{
                          fontSize: "11px",
                          color: "#94a3b8",
                        }}
                      >
                        1-Click Copy
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResellerProductQa;
