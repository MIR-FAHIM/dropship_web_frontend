import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Loader2, RefreshCw, Trophy } from "lucide-react";
import { useGetProductClicksLeaderboardQuery } from "../../../redux/features/report";
import { getLeaderboardDateRange, validateLeaderboardDates } from "../../../utils/productLeaderboard.utils";

const periods = [
  { id: "today", label: "Today" },
  { id: "week", label: "Last 7 Days" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
  { id: "custom", label: "Custom" },
];

const rankStyles = {
  1: "bg-[#E1F5EE] text-[#085041]",
  2: "bg-blue-50 text-blue-800",
  3: "bg-orange-50 text-orange-800",
};

const ProductLeaderBoard = () => {
  const [period, setPeriod] = useState("week");
  const [limit, setLimit] = useState(10);
  const [dateRange, setDateRange] = useState(() => getLeaderboardDateRange("week"));
  const [customDates, setCustomDates] = useState(() => getLeaderboardDateRange("week"));
  const [validation, setValidation] = useState("");
  const { currentData, isFetching, isLoading, isError, error, refetch } = useGetProductClicksLeaderboardQuery(
    { limit, ...dateRange },
    { refetchOnMountOrArgChange: true }
  );
  const loading = isLoading || isFetching;
  const apiError = currentData && (currentData.status !== "success" || !Array.isArray(currentData.data?.leaderboard));
  const items = Array.isArray(currentData?.data?.leaderboard) ? currentData.data.leaderboard : [];
  const errorMessage = error?.data?.message || (apiError && currentData.status !== "success" ? currentData.message : "") || "Unable to load the product leaderboard. Please try again.";

  const changePeriod = (nextPeriod) => {
    setPeriod(nextPeriod);
    setValidation("");
    if (nextPeriod === "custom") {
      setCustomDates(dateRange.start_date ? dateRange : getLeaderboardDateRange("week"));
    } else {
      setDateRange(getLeaderboardDateRange(nextPeriod));
    }
  };

  const applyCustomDates = (event) => {
    event.preventDefault();
    const message = validateLeaderboardDates(customDates);
    setValidation(message);
    if (message) return;
    if (customDates.start_date === dateRange.start_date && customDates.end_date === dateRange.end_date) refetch();
    else setDateRange({ ...customDates });
  };

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Trophy className="h-5 w-5 shrink-0 text-[#085041]" aria-hidden="true" />Product Leaderboard</h1>
        <p className="mt-1.5 text-sm text-gray-500">Ranked by Total Sales.</p>
      </header>

      <div className="space-y-4 border-y border-gray-200 bg-gray-50/60 py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <fieldset className="min-w-0">
            <legend className="mb-2 text-xs font-semibold text-gray-600">Period</legend>
            <div className="flex flex-wrap gap-1.5">
              {periods.map((option) => (
                <button key={option.id} type="button" aria-pressed={period === option.id} onClick={() => changePeriod(option.id)} className={`min-h-9 rounded-md border px-3 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#158E72] ${period === option.id ? "border-[#085041] bg-[#085041] text-white" : "border-gray-200 bg-white text-gray-600 hover:border-[#9DDDC5] hover:text-[#085041]"}`}>
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600" htmlFor="leaderboard-limit">Results</label>
            <select id="leaderboard-limit" value={limit} onChange={(event) => setLimit(Number(event.target.value))} className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#158E72] focus:outline-none focus:ring-1 focus:ring-[#158E72]">
              {[10, 20, 50, 100].map((value) => <option key={value} value={value}>Top {value}</option>)}
            </select>
          </div>
        </div>

        {period === "custom" && (
          <form onSubmit={applyCustomDates} noValidate>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-0 flex-1 basis-36 sm:basis-auto sm:flex-none">
                <label htmlFor="leaderboard-start" className="mb-1.5 block text-xs font-semibold text-gray-600">Start date</label>
                <input id="leaderboard-start" type="date" value={customDates.start_date || ""} onChange={(event) => { setCustomDates((dates) => ({ ...dates, start_date: event.target.value })); setValidation(""); }} aria-invalid={Boolean(validation)} aria-describedby={validation ? "leaderboard-date-error" : undefined} className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-2 text-sm focus:border-[#158E72] focus:outline-none focus:ring-1 focus:ring-[#158E72] sm:w-40" />
              </div>
              <div className="min-w-0 flex-1 basis-36 sm:basis-auto sm:flex-none">
                <label htmlFor="leaderboard-end" className="mb-1.5 block text-xs font-semibold text-gray-600">End date</label>
                <input id="leaderboard-end" type="date" value={customDates.end_date || ""} min={customDates.start_date || undefined} onChange={(event) => { setCustomDates((dates) => ({ ...dates, end_date: event.target.value })); setValidation(""); }} aria-invalid={Boolean(validation)} aria-describedby={validation ? "leaderboard-date-error" : undefined} className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-2 text-sm focus:border-[#158E72] focus:outline-none focus:ring-1 focus:ring-[#158E72] sm:w-40" />
              </div>
              <button type="submit" className="h-10 w-full rounded-md bg-[#085041] px-4 text-sm font-semibold text-white hover:bg-[#0B6B54] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#158E72] sm:w-auto">Apply</button>
            </div>
            {validation && <p id="leaderboard-date-error" className="mt-2 text-sm text-red-700" role="alert">{validation}</p>}
          </form>
        )}
      </div>

      <p className="my-4 text-xs text-gray-500">{dateRange.start_date ? `${dateRange.start_date} - ${dateRange.end_date} (Bangladesh time)` : "All Time"}</p>

      <div aria-busy={loading} aria-live="polite">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-gray-500" role="status"><Loader2 className="h-5 w-5 animate-spin text-[#085041]" aria-hidden="true" />Loading leaderboard...</div>
        ) : isError || apiError ? (
          <div className="border-y border-red-100 bg-red-50 px-4 py-8 text-center" role="alert">
            <AlertCircle className="mx-auto h-6 w-6 text-red-600" aria-hidden="true" />
            <p className="mt-2 break-words text-sm text-red-700">{errorMessage}</p>
            <button type="button" onClick={refetch} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div className="border-y border-gray-100 py-12 text-center"><Trophy className="mx-auto h-7 w-7 text-gray-300" aria-hidden="true" /><p className="mt-3 text-sm font-medium text-gray-600">No product clicks found for this period.</p></div>
        ) : (
          <table className="w-full table-fixed text-sm">
            <caption className="sr-only">Product ranking by Total Sales</caption>
            <thead className="border-y border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-500">
              <tr><th scope="col" className="w-12 px-1 py-3 sm:w-16 sm:px-3">Rank</th><th scope="col" className="px-2 py-3 sm:px-3">Product Name</th><th scope="col" className="hidden w-36 px-3 py-3 sm:table-cell">SKU</th><th scope="col" className="w-20 px-1 py-3 text-right sm:w-28 sm:px-3">Total Sales</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => {
                const rank = item.rank ?? index + 1;
                const productId = item.product_id ?? item.product?.id;
                return (
                  <tr key={`${productId}-${rank}`} className="hover:bg-gray-50/70">
                    <td className="px-1 py-3 sm:px-3"><span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold tabular-nums ${rankStyles[rank] || "text-gray-500"}`}>{rank}</span></td>
                    <td className="px-2 py-3 sm:px-3">
                      {item.product && productId != null ? <Link to={`/app/productdetails/${productId}`} className="break-words font-semibold text-gray-800 hover:text-[#08745C] hover:underline focus-visible:outline-[#158E72]">{item.product.name || `Product #${productId}`}</Link> : <div><p className="font-medium text-gray-500">Unavailable product</p><p className="mt-1 text-xs text-gray-400">ID: {productId ?? "-"}</p></div>}
                      <p className="mt-1 break-all text-xs text-gray-500 sm:hidden">SKU: {item.product?.sku || "-"}</p>
                    </td>
                    <td className="hidden break-all px-3 py-3 text-xs text-gray-500 sm:table-cell">{item.product?.sku || "-"}</td>
                    <td className="break-words px-1 py-3 text-right font-semibold tabular-nums text-gray-800 sm:px-3">{Number(item.total_clicks ?? 0).toLocaleString("en-BD")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductLeaderBoard;
