import { MousePointerClick } from "lucide-react";

const formatWhen = (value) => {
  if (!value) return null;
  const d = new Date(String(value).replace(" ", "T") + (String(value).includes("T") || String(value).endsWith("Z") ? "" : "Z"));
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

/**
 * Dropshipper activity: product pages they opened (clicked icon + count).
 * Grey when 0; hover shows the last click time.
 */
const ProductClicksBadge = ({ count, lastClickAt, size = "sm" }) => {
  const n = Number(count || 0);
  const last = formatWhen(lastClickAt);
  const title = n > 0 ? `${n.toLocaleString("en-BD")} product clicks${last ? ` · last ${last}` : ""}` : "No product clicks yet";
  const sizes = size === "md" ? "px-2.5 py-1 text-sm gap-1.5" : "px-2 py-0.5 text-xs gap-1";
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <span
      title={title}
      aria-label={title}
      className={`inline-flex items-center whitespace-nowrap rounded-full border font-semibold tabular-nums ${sizes} ${
        n > 0 ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-gray-50 text-gray-400"
      }`}
    >
      <MousePointerClick className={icon} aria-hidden="true" />
      {n.toLocaleString("en-BD")}
    </span>
  );
};

export default ProductClicksBadge;
