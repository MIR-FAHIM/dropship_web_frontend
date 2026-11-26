/* eslint-disable react/prop-types */
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { panel } from "../partnerWorkspaceData";
import { usePartnerPrefs } from "../partnerPrefs";

/**
 * Pitch page → "Why Reseller Brain" shutter: the comparison a marketer walks a client through
 * (source: the "Other Platforms vs Reseller Brain" doc). Collapsed by default; slides open.
 * Marketers and clients are outside Reseller Brain, so it speaks to the client about Reseller Brain.
 */
const ROWS = [
  { topic: ["Monthly fee", "মাসিক ফি"], other: ["Monthly subscription fee", "মাসিক সাবস্ক্রিপশন ফি"], rb: ["No monthly fee", "কোনো মাসিক ফি নেই"] },
  { topic: ["Commission", "কমিশন"], other: ["Takes a dropshipper commission", "ড্রপশিপার কমিশন কাটে"], rb: ["No commission", "কোনো কমিশন নেই"] },
  { topic: ["Payment", "পেমেন্ট"], other: ["Delayed payment", "দেরিতে পেমেন্ট"], rb: ["Same-day auto payment as soon as the courier invoice is generated", "কুরিয়ার ইনভয়েস তৈরি হলেই একই দিনে অটো পেমেন্ট"] },
  { topic: ["Product source", "পণ্যের উৎস"], other: ["Ordinary suppliers", "সাধারণ সাপ্লায়ার"], rb: ["Direct importers and certified production factories", "সরাসরি ইমপোর্টার ও সার্টিফায়েড প্রোডাকশন ফ্যাক্টরি"] },
  { topic: ["Order processing", "অর্ডার প্রসেস"], other: ["Manual processing", "হাতে (ম্যানুয়াল) প্রসেস"], rb: ["Auto sync with API and webhook", "API ও Webhook দিয়ে অটো সিঙ্ক"] },
  { topic: ["Order tracking", "অর্ডার ট্র্যাকিং"], other: ["Limited tracking", "সীমিত ট্র্যাকিং"], rb: ["Real-time tracking", "রিয়েল-টাইম ট্র্যাকিং"] },
  { topic: ["Delivery tracking", "ডেলিভারি ট্র্যাকিং"], other: ["Basic courier tracking", "সাধারণ কুরিয়ার ট্র্যাকিং"], rb: ["Dedicated tracking — you and the delivery person can call each other", "ডেডিকেটেড ট্র্যাকিং — আপনি ও ডেলিভারি ম্যান সরাসরি কল করতে পারবেন"] },
  { topic: ["Delivery charge", "ডেলিভারি চার্জ"], other: ["High delivery charges", "বেশি ডেলিভারি চার্জ"], rb: ["৳70 / ৳130 including packing", "প্যাকিংসহ ৳৭০ / ৳১৩০"] },
  { topic: ["Customer check", "কাস্টমার যাচাই"], other: ["Basic verification", "সাধারণ যাচাই"], rb: ["Checks the customer's courier success rate", "কাস্টমারের কুরিয়ার সাকসেস রেট চেক"] },
  { topic: ["Return policy", "রিটার্ন নীতি"], other: ["Unclear return policy", "অস্পষ্ট রিটার্ন নীতি"], rb: ["Return responsibility clearly defined", "রিটার্নের দায় পরিষ্কারভাবে নির্দিষ্ট"] },
  { topic: ["Return charge", "রিটার্ন চার্জ"], other: ["Extra charge on returns", "রিটার্নে অতিরিক্ত চার্জ"], rb: ["If the return is Reseller Brain's fault, Reseller Brain pays the charge", "Reseller Brain-এর ভুলে রিটার্ন হলে চার্জ Reseller Brain বহন করবে"] },
];

export default function WhyResellerBrain({ defaultOpen = false, big = false }) {
  const { t } = usePartnerPrefs();
  const [open, setOpen] = useState(defaultOpen);
  const tx = ([en, bn]) => t(en, bn);

  return (
    <section className={`${panel} overflow-hidden`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 sm:px-5">
        <span className="min-w-0">
          <span className={`block font-extrabold text-slate-900 dark:text-white ${big ? "text-base sm:text-lg" : "text-sm"}`}>
            ⭐ {t("Why work with Reseller Brain", "কেন Reseller Brain-এর সাথে কাজ করবেন")}
          </span>
          <span className="block text-[11px] text-slate-500 dark:text-slate-400">
            {t("Other platforms vs Reseller Brain — 11 points", "অন্য প্ল্যাটফর্ম বনাম Reseller Brain — ১১টি পয়েন্ট")}
          </span>
        </span>
        <ChevronDown size={18} aria-hidden="true" className={`shrink-0 text-teal-600 transition-transform duration-300 dark:text-teal-400 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Shutter: grid-rows 0fr → 1fr slides the content open and closed. */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-3 pb-4 pt-3 dark:border-slate-800 sm:px-5">
            {/* Desktop: comparison table */}
            <div className="hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 md:block">
              <table className={`w-full ${big ? "text-sm" : "text-xs"}`}>
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <th className="px-3 py-2 font-bold">{t("Topic", "বিষয়")}</th>
                    <th className="px-3 py-2 font-bold">{t("Other platforms", "অন্য প্ল্যাটফর্ম")}</th>
                    <th className="bg-teal-50 px-3 py-2 font-bold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">Reseller Brain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ROWS.map((r) => (
                    <tr key={r.topic[0]} className="align-top">
                      <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-200">{tx(r.topic)}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                        {tx(r.other)}
                      </td>
                      <td className="bg-teal-50/40 px-3 py-2 font-semibold text-slate-900 dark:bg-teal-950/30 dark:text-white">
                        <span className="inline-flex items-start gap-1.5"><Check size={14} className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />{tx(r.rb)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phone: one card per point */}
            <ul className="space-y-2 md:hidden">
              {ROWS.map((r, i) => (
                <li key={r.topic[0]} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{i + 1}. {tx(r.topic)}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">{t("Other platforms:", "অন্য প্ল্যাটফর্ম:")}</span> {tx(r.other)}
                  </p>
                  <p className="mt-1 flex items-start gap-1.5 text-sm font-semibold text-slate-900 dark:text-white"><Check size={14} className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />{tx(r.rb)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
