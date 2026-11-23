/* eslint-disable react/prop-types */
import { useState } from "react";
import { CheckCircle2, Lock, Plane, Trophy, Users } from "lucide-react";
import { useGetMarketerToursQuery } from "../../../redux/features/marketerTours";
import { PageHeading, StateMessage } from "../partnerWorkspace";
import { panel } from "../partnerWorkspaceData";
import { useNumber, usePartnerPrefs } from "../partnerPrefs";
import { FALLBACK_GRADIENTS, GLOBAL_COVERS, TOUR_COVERS } from "./tourVisuals";

/**
 * Partner Portal F7 — Tour Milestones (the demo's tab, with real data).
 * Progress = every delivered order of the marketer's clients. Motivation only for now:
 * nothing is claimed or paid from here (agreed 2026-11-22).
 */

function Cover({ src, alt, idx, className }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return <div className={`grid place-items-center bg-gradient-to-br ${FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length]} ${className}`}><Plane className="h-8 w-8 text-white/80" /></div>;
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} className={`object-cover ${className}`} />;
}

function TourCard({ tour, idx, isCurrent, delivered }) {
  const { t } = usePartnerPrefs();
  const num = useNumber();
  const state = tour.reached ? "reached" : isCurrent ? "current" : "locked";
  return (
    <article className={`${panel} flex flex-col overflow-hidden ${isCurrent ? "ring-2 ring-teal-500" : ""}`}>
      <div className="relative h-44 bg-slate-200 dark:bg-slate-800">
        <Cover src={TOUR_COVERS[tour.id]} alt={tour.en} idx={idx} className="h-full w-full" />
        <span className="absolute left-3 top-3 rounded-lg bg-slate-950/80 px-2.5 py-1 text-xs font-extrabold text-white">
          {num(tour.target)} {t("Orders", "অর্ডার")}
        </span>
        {state === "reached" && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-extrabold text-white">
            <CheckCircle2 className="h-3.5 w-3.5" /> {t("Reached", "অর্জিত")}
          </span>
        )}
        {state === "locked" && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-slate-950/70 px-2.5 py-1 text-xs font-bold text-white">
            <Lock className="h-3.5 w-3.5" /> {t("Locked", "লক")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{t(tour.en, tour.bn)}</h4>
          {(tour.detail_en || tour.detail_bn) && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(tour.detail_en, tour.detail_bn)}</p>}
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <span>{num(Math.min(delivered, tour.target))} / {num(tour.target)}</span>
            <span>{num(tour.percent)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={tour.percent} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full rounded-full ${tour.reached ? "bg-emerald-500" : "bg-gradient-to-r from-teal-500 to-emerald-500"}`} style={{ width: `${tour.percent}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {tour.reached
              ? t("Milestone reached — great work! 🎉", "মাইলস্টোন অর্জিত — অভিনন্দন! 🎉")
              : t(`${num(tour.remaining)} more delivered orders to go`, `আর ${num(tour.remaining)}টি ডেলিভারড অর্ডার বাকি`)}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function MarketerTours() {
  const { t } = usePartnerPrefs();
  const num = useNumber();
  const { data, isLoading, isError, refetch } = useGetMarketerToursQuery();
  const d = data?.data;

  if (isLoading) return <StateMessage loading title={t("Loading tour milestones…", "ট্যুর মাইলস্টোন লোড হচ্ছে…")} />;
  if (isError || !d) return <StateMessage title={t("Could not load tour milestones.", "ট্যুর মাইলস্টোন লোড করা যায়নি।")} retry={refetch} />;

  const cur = d.current;
  const reached = d.milestones.filter((m) => m.reached);

  return (
    <div className="space-y-7">
      <PageHeading
        icon={Plane}
        title={t("Tour Milestones", "ট্যুর মাইলস্টোন")}
        description={t(
          "Every delivered order of your clients brings you closer to a tour. Keep your clients selling!",
          "আপনার ক্লায়েন্টদের প্রতিটি ডেলিভারড অর্ডার আপনাকে ট্যুরের আরও কাছে নিয়ে যায়। ক্লায়েন্টদের বিক্রি বাড়াতে থাকুন!"
        )}
      />

      {/* Active milestone banner (demo layout) */}
      <section className={`${panel} p-5 sm:p-6`}>
        <div className="mb-3 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {d.all_reached ? t("All milestones reached", "সব মাইলস্টোন অর্জিত") : t("Active Milestone", "চলতি মাইলস্টোন")}
            </span>
            <h3 className="mt-1.5 text-lg font-extrabold text-slate-900 dark:text-white">
              {cur ? `${num(cur.target)} ${t("Orders", "অর্ডার")} — ${t(cur.en, cur.bn)}` : t("You have reached every tour milestone! 🎉", "আপনি সব ট্যুর মাইলস্টোন অর্জন করেছেন! 🎉")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                "Counts every delivered order of your clients, all time. Tours are a motivation goal for now — claiming will open later.",
                "আপনার ক্লায়েন্টদের সব সময়ের প্রতিটি ডেলিভারড অর্ডার গণনা হয়। ট্যুর এখন অনুপ্রেরণার লক্ষ্য — ক্লেইম পরে চালু হবে।"
              )}
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-xl font-extrabold text-teal-600 dark:text-teal-400">
              {num(d.delivered_orders)}{cur ? ` / ${num(cur.target)}` : ""}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {cur ? t(`${num(cur.remaining)} orders remaining`, `আর ${num(cur.remaining)}টি অর্ডার বাকি`) : t("delivered orders", "ডেলিভারড অর্ডার")}
            </span>
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={cur ? cur.percent : 100} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500" style={{ width: `${cur ? cur.percent : 100}%` }} />
        </div>
        {reached.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("Reached:", "অর্জিত:")}</span>
            {reached.map((m) => (
              <span key={m.id} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Trophy className="h-3 w-3" /> {t(m.en, m.bn)}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Core tours */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {d.milestones.map((m, i) => (
          <TourCard key={m.id} tour={m} idx={i} isCurrent={cur?.id === m.id} delivered={d.delivered_orders} />
        ))}
      </div>

      {/* Global roadmap */}
      {d.global_tours.length > 0 && (
        <section>
          <h3 className="mb-3 text-base font-extrabold text-slate-900 dark:text-white">{t("Global Milestone Roadmap", "গ্লোবাল মাইলস্টোন রোডম্যাপ")}</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {d.global_tours.map((g, i) => (
              <article key={g.id} className={`${panel} overflow-hidden`}>
                <div className="relative h-28 bg-slate-200 dark:bg-slate-800">
                  <Cover src={GLOBAL_COVERS[g.id]} alt={g.en} idx={i + 3} className="h-full w-full" />
                  <span className="absolute right-2 top-2 rounded bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">{g.tag}</span>
                </div>
                <div className="p-3 text-center"><span className="text-xs font-bold text-slate-900 dark:text-white">{t(g.en, g.bn)}</span></div>
              </article>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{t("Bigger goals after the core tours — targets will be announced.", "মূল ট্যুরগুলোর পরের বড় লক্ষ্য — টার্গেট পরে জানানো হবে।")}</p>
        </section>
      )}

      {/* Which clients moved the counter */}
      <section className={`${panel} p-5`}>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
          <Users className="h-4 w-4 text-teal-600" /> {t("Delivered orders by client", "ক্লায়েন্ট অনুযায়ী ডেলিভারড অর্ডার")}
        </h3>
        {d.clients.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("No clients yet — invite dropshippers to start counting.", "এখনো কোনো ক্লায়েন্ট নেই — গণনা শুরু করতে ড্রপশিপার আমন্ত্রণ করুন।")}</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {d.clients.map((c, i) => (
              <li key={`${c.name}-${i}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="truncate text-slate-800 dark:text-slate-200">
                  {c.name}
                  {!c.active && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{t("ended", "শেষ")}</span>}
                </span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">{num(c.delivered)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
