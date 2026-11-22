import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ImagePlus, Loader2, Save, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { imgBaseUrl } from "../../../../../config";
import { useGetProductWinningQuery, useSaveProductWinningMutation, useUnmarkProductWinningMutation } from "../../../../redux/features/winningProducts";

/**
 * Admin product page → "Winning Product" tab (Partner Portal F6).
 * Marks the product as a winning product for marketers and holds its ad hook, creative angle,
 * a visual tip, and optional "local copy vs verified original" photos with captions.
 * Marketers see Reseller Brain price → suggested selling price (never the supplier price).
 */
const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const url = (p) => (!p ? "" : /^https?:\/\//i.test(p) ? p : `${imgBaseUrl}/${p}`);

const PhotoPicker = ({ side, title, tone, saved, file, onFile, removed, onRemove, caption, onCaption }) => {
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  const shown = preview || (!removed && url(saved));

  return (
    <div className={`rounded-xl border p-3 ${tone}`}>
      <p className="text-xs font-extrabold uppercase">{title}</p>
      <div className="mt-2 flex items-start gap-3">
        {shown ? (
          <div className="relative">
            <img src={shown} alt="" className="h-24 w-24 rounded-lg border border-gray-200 object-cover" />
            <button type="button" onClick={onRemove} aria-label={`Remove ${side} photo`} className="absolute -right-2 -top-2 rounded-full bg-white p-0.5 text-gray-600 shadow hover:text-red-600"><X size={14} /></button>
          </div>
        ) : (
          <span className="grid h-24 w-24 place-items-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-400"><ImagePlus size={22} /></span>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <label className="inline-block cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            {shown ? "Change photo" : "Upload photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 5 * 1024 * 1024) { toast.error("Photo must be 5 MB or smaller."); e.target.value = ""; return; }
                onFile(f || null);
              }} />
          </label>
          <input value={caption} onChange={(e) => onCaption(e.target.value)} maxLength={255} placeholder="Caption" className={inputCls} />
        </div>
      </div>
    </div>
  );
};
PhotoPicker.propTypes = {
  side: PropTypes.string, title: PropTypes.string, tone: PropTypes.string, saved: PropTypes.string, file: PropTypes.object,
  onFile: PropTypes.func, removed: PropTypes.bool, onRemove: PropTypes.func, caption: PropTypes.string, onCaption: PropTypes.func,
};

const WinningTab = ({ productId }) => {
  const { data, isLoading } = useGetProductWinningQuery(productId);
  const [save, { isLoading: saving }] = useSaveProductWinningMutation();
  const [unmark, { isLoading: unmarking }] = useUnmarkProductWinningMutation();
  const profile = data?.data;
  const [form, setForm] = useState({ hook: "", ad_angle: "", creative_tip: "", local_caption: "", original_caption: "", sort_order: 0 });
  const [files, setFiles] = useState({ local: null, original: null });
  const [removed, setRemoved] = useState({ local: false, original: false });

  useEffect(() => {
    if (!profile) return;
    setForm({
      hook: profile.hook || "", ad_angle: profile.ad_angle || "", creative_tip: profile.creative_tip || "",
      local_caption: profile.local_caption || "", original_caption: profile.original_caption || "", sort_order: profile.sort_order || 0,
    });
    setFiles({ local: null, original: null });
    setRemoved({ local: false, original: false });
  }, [profile]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
    fd.append("is_winning", "1");
    ["local", "original"].forEach((s) => {
      if (files[s]) fd.append(`${s}_image`, files[s]);
      else if (removed[s]) fd.append(`remove_${s}_image`, "1");
    });
    try {
      await save({ productId, formData: fd }).unwrap();
      toast.success("Saved. Marketers now see this product in Winning Products.");
    } catch (err) {
      toast.error(err?.data?.message || "Could not save.");
    }
  };
  const remove = async () => {
    if (!window.confirm("Remove this product from Winning Products? The text and photos are kept.")) return;
    try {
      await unmark(productId).unwrap();
      toast.success("Removed from Winning Products.");
    } catch (err) {
      toast.error(err?.data?.message || "Could not remove.");
    }
  };

  if (isLoading) return <p className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" /></p>;
  const isWinning = Boolean(profile?.is_winning);

  return (
    <div className="space-y-5">
      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${isWinning ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}>
        <div className="flex items-center gap-2">
          <Trophy className={`h-5 w-5 ${isWinning ? "text-emerald-600" : "text-gray-400"}`} />
          <div>
            <p className="text-sm font-bold text-gray-900">{isWinning ? "This is a winning product" : "Not a winning product"}</p>
            <p className="text-xs text-gray-600">Marketers see it in their Partner Portal with Reseller Brain price → suggested selling price (never the supplier price).</p>
          </div>
        </div>
        {isWinning && (
          <button type="button" onClick={remove} disabled={unmarking} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
            Remove from winning
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelCls}>🎯 Ad hook *</label>
          <input value={form.hook} onChange={set("hook")} maxLength={500} className={inputCls} placeholder="Beat load-shedding heat with instant mist cooling anywhere!" />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>🎬 Creative angle *</label>
          <textarea value={form.ad_angle} onChange={set("ad_angle")} maxLength={1000} rows={2} className={inputCls} placeholder="Compare hot room air vs instant cold mist in the first 3 seconds." />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>💡 Visual guide (shown when there are no comparison photos)</label>
          <textarea value={form.creative_tip} onChange={set("creative_tip")} maxLength={1000} rows={2} className={inputCls} placeholder="Show a broken plastic chopper vs this stainless steel one chopping meat in 5 seconds." />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-800">Local copy vs verified original (optional)</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <PhotoPicker side="local" title="❌ Local copy / low quality" tone="border-red-200 bg-red-50/50 text-red-700"
            saved={profile?.local_image} file={files.local} removed={removed.local}
            onFile={(f) => { setFiles((x) => ({ ...x, local: f })); setRemoved((x) => ({ ...x, local: false })); }}
            onRemove={() => { setFiles((x) => ({ ...x, local: null })); setRemoved((x) => ({ ...x, local: true })); }}
            caption={form.local_caption} onCaption={(v) => setForm((f) => ({ ...f, local_caption: v }))} />
          <PhotoPicker side="original" title="✅ Verified original / high quality" tone="border-emerald-200 bg-emerald-50/50 text-emerald-700"
            saved={profile?.original_image} file={files.original} removed={removed.original}
            onFile={(f) => { setFiles((x) => ({ ...x, original: f })); setRemoved((x) => ({ ...x, original: false })); }}
            onRemove={() => { setFiles((x) => ({ ...x, original: null })); setRemoved((x) => ({ ...x, original: true })); }}
            caption={form.original_caption} onCaption={(v) => setForm((f) => ({ ...f, original_caption: v }))} />
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-gray-100 pt-4">
        <label className="text-sm text-gray-700">Order on the marketer page
          <input type="number" value={form.sort_order} onChange={set("sort_order")} className="ml-2 w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm" />
          <span className="ml-2 text-xs text-gray-500">lower shows first</span>
        </label>
        <button type="button" onClick={submit} disabled={saving || !form.hook.trim() || !form.ad_angle.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-200 disabled:text-teal-900">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {isWinning ? "Save changes" : "Save & mark as winning"}
        </button>
      </div>
    </div>
  );
};

WinningTab.propTypes = { productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired };

export default WinningTab;
