import PropTypes from "prop-types";
import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function WeeklyProductRecommendation({ to }) {
  const Card = to ? Link : "aside";

  return (
    <Card
      {...(to ? { to } : {})}
      lang="bn"
      className={`relative isolate flex flex-wrap items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#084739] to-[#096451] px-4 py-4 text-white shadow-sm sm:gap-4 sm:px-5 ${to ? "transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" : ""}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-28 -z-10 h-56 w-56 rounded-full border border-white/20 ring-[20px] ring-white/5" />
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#CDEFE1] text-[#085041]">
        <TrendingUp size={22} aria-hidden="true" />
      </span>
      <div className="min-w-[min(100%,12rem)] flex-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-100">
          <Sparkles size={14} aria-hidden="true" /> সাপ্তাহিক পরামর্শ
        </p>
        <p className="mt-1 text-lg font-bold leading-snug">এই সপ্তাহের প্রস্তাবিত পণ্য</p>
        <p className="mt-1 text-sm leading-relaxed text-emerald-50">
          এই সপ্তাহে বাছাই করা পণ্যগুলো নিয়ে কাজ করলে ভালো ফল পাওয়ার সম্ভাবনা আছে।
        </p>
      </div>
      {to ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-950">
          পণ্যের তালিকা দেখুন <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      ) : (
        <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
          পণ্যের তালিকা শিগগিরই আসছে
        </span>
      )}
    </Card>
  );
}

WeeklyProductRecommendation.propTypes = {
  to: PropTypes.string,
};
