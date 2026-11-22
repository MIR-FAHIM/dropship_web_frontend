export const workspacePath = "/marketer-panel";
// Partner Portal look (demo HTML): rounded-2xl cards with soft shadow, slate-900 on slate-950 in dark mode.
export const panel = "rounded-2xl border border-slate-200/80 bg-white partner-soft-shadow dark:border-slate-800 dark:bg-slate-900 transition-colors";
export const field = "min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 transition-all";
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-[0.98]";
export const primary = `${button} bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 focus-visible:outline-teal-600`;
export const secondary = `${button} border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 px-3.5 py-2 focus-visible:outline-teal-600`;
export const mintAction = `${button} bg-white text-teal-800 hover:bg-teal-50 px-4 py-2.5 border border-teal-100 dark:border-teal-900/40 focus-visible:outline-white`;
export const invitationPageSize = 50;
export const periods = { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", all: "All time" };
export const periodsBn = { "7d": "গত ৭ দিন", "30d": "গত ৩০ দিন", "90d": "গত ৯০ দিন", all: "সর্বমোট" };
export const activityLabels = { active: "Active", moderate: "Moderate", inactive: "Inactive" };
export const activityLabelsBn = { active: "সক্রিয়", moderate: "মাঝারি", inactive: "নিষ্ক্রিয়" };
export const formatCount = (value, lang = "en") => value != null && Number.isFinite(Number(value)) ? Number(value).toLocaleString(lang === "bn" ? "bn-BD" : "en-BD") : "—";
export const clientName = (client) => client?.dropshipper?.business_name || client?.dropshipper?.name || "Client";
export const formatDate = (value, lang = "en") => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka",
  }).format(date) : "—";
};
export function invitationStatus(invitation, now = Date.now()) {
  if (invitation.accepted_at || invitation.marketer_client_id) return "accepted";
  if (invitation.revoked_at) return "revoked";
  if (invitation.expires_at && Date.parse(invitation.expires_at) <= now) return "expired";
  return "pending";
}

export function isInvitationExpiring(invitation, now) {
  const expiresAt = Date.parse(invitation.expires_at);
  return invitationStatus(invitation, now) === "pending" && expiresAt <= now + 7 * 24 * 60 * 60 * 1000;
}
