import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Send,
  Copy,
  Check,
  RefreshCw,
  Code2,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Receipt,
  HelpCircle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  useTestCarrybeeWebhookMutation,
  useGetCarrybeeWebhookEventsQuery,
} from "../../../redux/features/delivery_company/carrybeeWebhookApi";

const PRESETS = {
  paid: {
    label: "order.paid (পেমেন্ট পরিশোধ / Disbursed)",
    event: "order.paid",
    desc: "CarryBee যখন অর্ডার ডেলিভারির টাকা ভেন্ডর বা প্ল্যাটফর্মকে পরিশোধ/ডিসবার্স করে।",
    payload: {
      event: "order.paid",
      store_id: "a1b2c3d4",
      consignment_id: "FX1212124433",
      merchant_order_id: "ORD-TEST-001",
      timestamptz: new Date().toISOString(),
      invoice_id: "IX212124433",
    },
  },
  delivered: {
    label: "order.delivered (সফল ডেলিভারি)",
    event: "order.delivered",
    desc: "কাস্টমার পার্সেল গ্রহণ করেছে এবং ক্যাশ কালেকশন সম্পন্ন হয়েছে।",
    payload: {
      event: "order.delivered",
      store_id: "a1b2c3d4",
      consignment_id: "FX1212124433",
      merchant_order_id: "ORD-TEST-001",
      delivery_fee: 105,
      cod_fee: 26.3,
      collectable_amount: 2630,
      timestamptz: new Date().toISOString(),
    },
  },
  returned: {
    label: "order.returned (পার্সেল রিটার্ন)",
    event: "order.returned",
    desc: "পার্সেল ডেলিভারি ব্যর্থ হয়ে মার্চেন্টের কাছে ফেরত এসেছে।",
    payload: {
      event: "order.returned",
      store_id: "a1b2c3d4",
      consignment_id: "FX1212124433",
      merchant_order_id: "ORD-TEST-001",
      reason: "Customer cancelled",
      timestamptz: new Date().toISOString(),
    },
  },
};

export default function CarrybeeWebhookTester() {
  const [activePresetKey, setActivePresetKey] = useState("paid");
  const [jsonPayloadText, setJsonPayloadText] = useState(
    JSON.stringify(PRESETS.paid.payload, null, 2)
  );
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [selectedEventPayload, setSelectedEventPayload] = useState(null);
  const [filterEvent, setFilterEvent] = useState("");

  const [testWebhook, { isLoading: isTesting }] = useTestCarrybeeWebhookMutation();
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    refetch: refetchEvents,
    isFetching: isFetchingEvents,
  } = useGetCarrybeeWebhookEventsQuery(
    filterEvent ? { event: filterEvent } : {}
  );

  const webhookUrl = "https://apidropship.resellerbrain.com/public/api/delivery-companies/carrybee/webhook";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    toast.success("Webhook URL কপি করা হয়েছে!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSelectPreset = (key) => {
    setActivePresetKey(key);
    const p = {
      ...PRESETS[key].payload,
      timestamptz: new Date().toISOString(),
    };
    setJsonPayloadText(JSON.stringify(p, null, 2));
    setSimulationResult(null);
  };

  const handleSendTestWebhook = async () => {
    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonPayloadText);
      } catch (parseErr) {
        toast.error("JSON ফরম্যাট সঠিক নয়! অনুগ্রহ করে JSON সিনট্যাক্স ঠিক করুন।");
        return;
      }

      setSimulationResult(null);
      const res = await testWebhook(parsed).unwrap();
      setSimulationResult({
        success: true,
        data: res,
      });
      toast.success(res?.message || "Webhook টেস্ট সফলভাবে প্রক্রিয়া হয়েছে!");
      refetchEvents();
    } catch (err) {
      setSimulationResult({
        success: false,
        error: err?.data || err,
      });
      toast.error(err?.data?.message || "Webhook টেস্ট ব্যর্থ হয়েছে!");
    }
  };

  const eventsList = eventsData?.data?.data || [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">CarryBee Webhook টেস্টিং বোর্ড</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Simulator
              </span>
            </div>
            <p className="mt-1 text-gray-300 text-xs sm:text-sm">
              CarryBee এর <span className="text-amber-300 font-mono">order.paid</span> সহ সকল ইভেন্ট টেস্ট করুন এবং লাইভ নোটিফিকেশন যাচাই করুন।
            </p>
          </div>
        </div>

        <Link
          to="/admin-panel"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur transition border border-white/10 self-start md:self-auto"
        >
          অ্যাডমিন ড্যাশবোর্ডে ফিরে যান <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Webhook Configuration & Instructions Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-gray-800">
              CarryBee অফিসিয়াল Webhook সেটআপ তথ্য
            </h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Webhook সক্রিয় ও প্রস্তুত
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="md:col-span-2 p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
            <span className="text-xs text-gray-500 font-medium">লাইভ Webhook রিসিভিং URL (Carrybee প্যানেলে দেওয়ার জন্য)</span>
            <div className="flex items-center justify-between mt-1.5 gap-2">
              <code className="text-xs font-mono text-gray-800 truncate bg-white px-2.5 py-1 rounded border border-gray-200 flex-1">
                {webhookUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? "কপি হয়েছে" : "কপি করুন"}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between text-xs">
            <span className="text-gray-500 font-medium">স্বীকৃত Signature Header</span>
            <span className="font-mono font-semibold text-gray-800 mt-1">
              X-Carrybee-Webhook-Signature
            </span>
            <span className="text-[11px] text-gray-400 mt-1">
              * টেস্ট বোর্ডের মাধ্যমে টেস্ট করার সময় অভ্যন্তরীণভাবে সিগনেচার হ্যান্ডেল হয়।
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Payload Builder */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-gray-800">Webhook পেলোড সিমুলেটর</h2>
            </div>
            <span className="text-xs text-gray-400">নিচের প্রিসেট সিলেক্ট করুন</span>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.entries(PRESETS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPreset(key)}
                className={`p-3 rounded-xl text-left border text-xs font-medium transition ${
                  activePresetKey === key
                    ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm ring-1 ring-indigo-400"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="font-bold text-gray-900 truncate">{item.label}</div>
                <div className="text-[11px] text-gray-500 mt-1 line-clamp-2">{item.desc}</div>
              </button>
            ))}
          </div>

          {/* JSON Payload Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <FileJson className="w-3.5 h-3.5 text-gray-500" />
                Webhook JSON Payload
              </span>
              <span className="text-gray-400">প্রয়োজনে এডিট করতে পারেন</span>
            </div>
            <textarea
              rows={12}
              value={jsonPayloadText}
              onChange={(e) => setJsonPayloadText(e.target.value)}
              className="w-full font-mono text-xs p-3.5 rounded-xl border border-gray-300 bg-gray-900 text-green-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Send Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              টেস্ট পাঠালে তা ডাটাবেজে রেকর্ড হবে এবং ড্যাশবোর্ড মডালে প্রদর্শিত হবে।
            </div>

            <button
              type="button"
              disabled={isTesting}
              onClick={handleSendTestWebhook}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isTesting ? "প্রসেস হচ্ছে..." : "টেস্ট Webhook পাঠান"}
            </button>
          </div>
        </div>

        {/* Right Panel: Simulation Live Output */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-full min-h-[300px]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-800">সিমুলেশন ফলাফল</h2>
              {simulationResult && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    simulationResult.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {simulationResult.success ? "HTTP 200 OK" : "Failed"}
                </span>
              )}
            </div>

            <div className="flex-1 py-4">
              {!simulationResult ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-6 space-y-2">
                  <Activity className="w-10 h-10 text-gray-300 animate-pulse" />
                  <p className="text-xs font-medium">
                    বাম পাশ থেকে পেলোড নির্বাচন করে <br />
                    <span className="text-indigo-600 font-semibold">"টেস্ট Webhook পাঠান"</span> বাটনে ক্লিক করুন।
                  </p>
                </div>
              ) : simulationResult.success ? (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-green-800">
                        {simulationResult.data?.message || "Webhook সফলভাবে রিসিভ ও সম্পন্ন হয়েছে!"}
                      </div>
                      <p className="text-green-700">
                        সিস্টেম অর্ডার স্ট্যাটাস এবং CarryBee ইনভয়েস রেকর্ড করেছে।
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Event ID:</span>
                      <span className="font-mono font-semibold">{simulationResult.data?.data?.event_id}</span>
                    </div>
                    {simulationResult.data?.data?.invoice_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">CarryBee Invoice ID:</span>
                        <span className="font-mono font-bold text-indigo-700">{simulationResult.data?.data?.invoice_id}</span>
                      </div>
                    )}
                    {simulationResult.data?.data?.disbursed_to && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">টাকা জমা হয়েছে:</span>
                        <span className={`font-semibold ${simulationResult.data?.data?.disbursed_to === 'vendor' ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {simulationResult.data?.data?.disbursed_to === 'vendor' ? 'ভেন্ডরের একাউন্টে' : 'প্ল্যাটফর্মের একাউন্টে'}
                        </span>
                      </div>
                    )}
                    {simulationResult.data?.data?.disbursed_amount !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">নিট জমাকৃত অর্থ:</span>
                        <span className="font-bold text-emerald-600">৳{simulationResult.data?.data?.disbursed_amount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">অর্ডার মিউটেশন:</span>
                      <span className="font-semibold text-gray-800">{simulationResult.data?.data?.status}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/admin-panel"
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold text-center block shadow transition"
                    >
                      🎉 ড্যাশবোর্ডে গিয়ে পপআপ মডাল দেখুন
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-xs animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-red-800">টেস্ট প্রক্রিয়াকরণ ব্যর্থ হয়েছে</div>
                    <p className="text-red-700">
                      {simulationResult.error?.message || JSON.stringify(simulationResult.error)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Webhook Events History Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">সাম্প্রতিক Webhook লগ (Carrybee Events Log)</h2>
            <p className="text-xs text-gray-500">
              CarryBee থেকে আসা অথবা টেস্ট সিমুলেশনের মাধ্যমে গৃহীত সর্বশেষ ইভেন্টসমূহ।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">সকল ইভেন্ট</option>
              <option value="order.paid">order.paid (পেমেন্ট পরিশোধ)</option>
              <option value="order.delivered">order.delivered (ডেলিভার্ড)</option>
              <option value="order.returned">order.returned (রিটার্ন)</option>
            </select>

            <button
              type="button"
              onClick={() => refetchEvents()}
              disabled={isFetchingEvents}
              className="p-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition text-gray-600"
              title="রিফ্রেশ"
            >
              <RefreshCw className={`w-4 h-4 ${isFetchingEvents ? "animate-spin text-indigo-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">ইভেন্ট</th>
                <th className="py-3 px-3">Consignment ID</th>
                <th className="py-3 px-3">CarryBee Invoice ID</th>
                <th className="py-3 px-3">অর্ডার #</th>
                <th className="py-3 px-3">টাকা জমা</th>
                <th className="py-3 px-3">স্ট্যাটাস</th>
                <th className="py-3 px-3">অ্যাডমিন স্বীকৃতি</th>
                <th className="py-3 px-3">সময়</th>
                <th className="py-3 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingEvents ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400">
                    লগ লোড হচ্ছে...
                  </td>
                </tr>
              ) : eventsList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400">
                    কোন Webhook ইভেন্ট পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                eventsList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-3 font-mono font-medium text-gray-500">#{item.id}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono font-semibold text-[11px] ${
                          item.event === "order.paid"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : item.event === "order.delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.event}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-700">{item.consignment_id || "N/A"}</td>
                    <td className="py-3 px-3">
                      {item.invoice_id ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700">
                          {item.invoice_id}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-900">
                      {item.order?.order_number ? (
                        <Link
                          to={`/admin-panel/orders/${item.order_id}`}
                          className="text-blue-600 hover:underline"
                        >
                          #{item.order.order_number}
                        </Link>
                      ) : (
                        item.merchant_order_id || "N/A"
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {item.disbursed_to ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            item.disbursed_to === "vendor"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.disbursed_to === "vendor" ? "ভেন্ডর একাউন্ট" : "প্ল্যাটফর্ম"}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.processing_status === "processed"
                            ? "bg-green-100 text-green-700"
                            : item.processing_status === "duplicate"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.processing_status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {item.event === "order.paid" ? (
                        item.admin_acknowledged ? (
                          <span className="inline-flex items-center gap-1 text-green-700 font-semibold text-[11px]">
                            <Check className="w-3 h-3" /> নিশ্চিত
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            ⏳ মুলতবি (Pending)
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                      {item.created_at ? new Date(item.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedEventPayload(item)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                      >
                        JSON দেখুন
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Viewer Modal */}
      {selectedEventPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-800">
                Webhook Event Payload #{selectedEventPayload.id} ({selectedEventPayload.event})
              </h3>
              <button
                type="button"
                onClick={() => setSelectedEventPayload(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <pre className="p-3 bg-gray-900 text-green-400 rounded-xl text-xs font-mono overflow-auto max-h-80">
              {JSON.stringify(selectedEventPayload.payload || selectedEventPayload, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEventPayload(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
