export const Badge = ({ active, trueLabel = "হ্যাঁ", falseLabel = "না" }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
    }`}
  >
    {active ? trueLabel : falseLabel}
  </span>
);

export const InfoRow = ({ label, value, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0 py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 sm:w-48 shrink-0 font-medium">{label}</span>
    <span className="text-sm text-gray-800">{children || value || "—"}</span>
  </div>
);
