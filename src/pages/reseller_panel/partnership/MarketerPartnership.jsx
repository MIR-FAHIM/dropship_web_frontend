import { useState } from "react";
import {
  useGetMarketerRelationshipQuery,
  usePreviewMarketerInvitationMutation,
  useAcceptMarketerInvitationMutation,
  useEndMarketerRelationshipMutation,
} from "../../../redux/features/marketer";
import { Handshake } from "lucide-react";
import { toast } from "sonner";

const MarketerPartnership = () => {
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [consent, setConsent] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const {
    data: relData,
    isLoading: relLoading,
    refetch: refetchRel,
  } = useGetMarketerRelationshipQuery();
  const [previewInv, { isLoading: isPreviewing }] = usePreviewMarketerInvitationMutation();
  const [acceptInv, { isLoading: isAccepting }] = useAcceptMarketerInvitationMutation();
  const [endRel, { isLoading: isEnding }] = useEndMarketerRelationshipMutation();

  const relationship = relData?.data;
  const hasRelationship = !!relationship;

  const handlePreview = async (e) => {
    e.preventDefault();
    setPreviewError("");
    setPreview(null);
    try {
      const res = await previewInv({ code: code.trim() }).unwrap();
      setPreview(res?.data);
    } catch (err) {
      const status = err?.status;
      if (status === 404) setPreviewError("কোডটি বৈধ নয় বা মেয়াদ শেষ হয়ে গেছে।");
      else if (status === 409) setPreviewError("আপনি ইতিমধ্যে একজন মার্কেটারের সাথে সংযুক্ত।");
      else setPreviewError(err?.data?.message || "কোড যাচাই করতে সমস্যা হয়েছে।");
    }
  };

  const handleAccept = async () => {
    if (!consent) {
      toast.error("সম্মতি চেকবক্সটি চেক করুন");
      return;
    }
    try {
      await acceptInv({
        code: code.trim(),
        consent: true,
        consent_version: preview?.consent_version || "pilot-v1",
      }).unwrap();
      toast.success("মার্কেটার পার্টনারশিপ সফলভাবে গ্রহণ করা হয়েছে");
      setPreview(null);
      setCode("");
      setConsent(false);
      refetchRel();
    } catch (err) {
      toast.error(err?.data?.message || "গ্রহণ করতে সমস্যা হয়েছে।");
    }
  };

  const handleEnd = async () => {
    try {
      await endRel({ id: relationship.id }).unwrap();
      toast.success("পার্টনারশিপ শেষ করা হয়েছে");
      setConfirmEnd(false);
      refetchRel();
    } catch (err) {
      toast.error(err?.data?.message || "সম্পর্ক শেষ করতে সমস্যা হয়েছে।");
      setConfirmEnd(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (relLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Handshake className="w-6 h-6 text-emerald-600" />
          মার্কেটার পার্টনারশিপ
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          মার্কেটারের সাথে সংযুক্ত হন বা বিদ্যমান সংযোগ দেখুন
        </p>
      </div>

      {hasRelationship ? (
        /* Active relationship view */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">বর্তমান মার্কেটার</p>
              <p className="text-lg font-bold text-gray-900">{relationship.marketer?.name || "—"}</p>
              {relationship.marketer?.business_name && (
                <p className="text-sm text-gray-600 mt-0.5">{relationship.marketer.business_name}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                সংযুক্তির তারিখ: {formatDate(relationship.accepted_at)}
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              সক্রিয়
            </span>
          </div>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <button
              onClick={() => setConfirmEnd(true)}
              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
            >
              পার্টনারশিপ শেষ করুন
            </button>
          </div>
        </div>
      ) : (
        /* No relationship — invitation code form */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <p className="text-sm text-gray-600">
            আপনার মার্কেটারের দেওয়া ইনভাইটেশন কোড দিয়ে সংযুক্ত হন।
          </p>

          <form onSubmit={handlePreview} className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ইনভাইটেশন কোড লিখুন"
              required
              className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isPreviewing}
              className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {isPreviewing ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
            </button>
          </form>

          {previewError && (
            <p className="text-red-500 text-sm">{previewError}</p>
          )}

          {preview && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-emerald-800">মার্কেটারের তথ্য</p>
              <p className="text-gray-900 font-bold">{preview.marketer_name || preview.marketer?.name || "—"}</p>
              {(preview.business_name || preview.marketer?.business_name) && (
                <p className="text-sm text-gray-600">{preview.business_name || preview.marketer?.business_name}</p>
              )}

              {preview.consent_text && (
                <div className="bg-white p-3 rounded border border-emerald-100 text-xs text-gray-600 leading-relaxed">
                  {preview.consent_text}
                </div>
              )}

              <label className="flex items-start gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-emerald-600"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  আমি সম্মত আছি যে এই মার্কেটার আমার অর্ডার কার্যক্রমের পারফরম্যান্স তথ্য দেখতে
                  পারবেন।
                </span>
              </label>

              <button
                onClick={handleAccept}
                disabled={isAccepting || !consent}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {isAccepting ? "গ্রহণ হচ্ছে..." : "পার্টনারশিপ গ্রহণ করুন"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirm end modal */}
      {confirmEnd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">পার্টনারশিপ শেষ করবেন?</h3>
            <p className="text-sm text-gray-600 mb-5">
              এই পদক্ষেপটি মার্কেটারের সাথে আপনার সংযোগ স্থায়ীভাবে শেষ করবে।
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEnd(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                না, রাখুন
              </button>
              <button
                onClick={handleEnd}
                disabled={isEnding}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isEnding ? "শেষ হচ্ছে..." : "হ্যাঁ, শেষ করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketerPartnership;
