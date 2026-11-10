export const workspacePath = "/marketer-panel";
export const panel = "rounded-2xl border border-violet-100 bg-white shadow-sm shadow-violet-950/5";
export const field = "min-h-11 w-full min-w-0 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100";
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
export const primary = `${button} bg-violet-700 px-4 py-2.5 text-white hover:bg-violet-800 focus-visible:outline-violet-700`;
export const secondary = `${button} border border-violet-200 bg-white px-3 py-2 text-violet-900 hover:bg-violet-50 focus-visible:outline-violet-700`;
export const mintAction = `${button} bg-emerald-200 px-4 py-2.5 text-emerald-950 hover:bg-emerald-100 focus-visible:outline-white`;
export const invitationPageSize = 50;
export const periods = { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", all: "All time" };
export const activityLabels = { active: "Active", moderate: "Moderate", inactive: "Inactive" };
export const formatCount = (value) => value != null && Number.isFinite(Number(value)) ? Number(value).toLocaleString("en-BD") : "—";
export const clientName = (client) => client?.dropshipper?.business_name || client?.dropshipper?.name || "Client";
export const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("en-GB", {
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
