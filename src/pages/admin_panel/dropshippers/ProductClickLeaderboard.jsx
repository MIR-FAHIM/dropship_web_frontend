import { useState } from "react";
import { MousePointerClick } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import Pagination from "../../../components/shared/Pagination";
import { useGetDropshipperProductClickLeaderboardQuery } from "../../../redux/features/report";

const pageSize = 20;
const countFormatter = new Intl.NumberFormat("en-BD");
const dateField = "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900";

export default function ProductClickLeaderboard() {
  const { canViewProductClickLeaderboard } = useOutletContext();
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const invalidRange = Boolean(startDate && endDate && endDate < startDate);
  const { currentData, isFetching, isError, error, refetch } = useGetDropshipperProductClickLeaderboardQuery(
    {
      page,
      per_page: pageSize,
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
    },
    {
      skip: !canViewProductClickLeaderboard || invalidRange,
      refetchOnMountOrArgChange: true,
    },
  );
  const leaderboard = currentData?.data;
  const rows = leaderboard?.data ?? [];
  const errorStatus = error?.originalStatus ?? error?.status;
  const accessDenied = !canViewProductClickLeaderboard || errorStatus === 403 || errorStatus === 401;

  return (
    <section className="space-y-4 p-4 sm:p-6" aria-labelledby="product-click-leaderboard-title">
      <div>
        <h1 id="product-click-leaderboard-title" className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl">
          <MousePointerClick className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          Product Click Leaderboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Dropshippers are ranked by total product clicks, including repeat views. Unique products count each product once per dropshipper.
        </p>
      </div>

      {accessDenied ? (
        <p role="alert" className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
          Only admins and superadmins can view this leaderboard.
        </p>
      ) : (
        <>
          <fieldset className="rounded-xl border border-gray-200 bg-white px-4 pb-4 sm:px-5">
            <legend className="px-1 text-sm font-semibold text-gray-900">Filter by click date</legend>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm font-medium text-gray-700">
                Start Date
                <input type="date" value={startDate} max={endDate || undefined} className={dateField}
                  onChange={(event) => { setStartDate(event.target.value); setPage(1); }} />
              </label>
              <label className="text-sm font-medium text-gray-700">
                End Date
                <input type="date" value={endDate} min={startDate || undefined} className={dateField}
                  aria-invalid={invalidRange} aria-describedby={invalidRange ? "click-leaderboard-date-error" : undefined}
                  onChange={(event) => { setEndDate(event.target.value); setPage(1); }} />
              </label>
              <button type="button" disabled={!startDate && !endDate}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => { setStartDate(""); setEndDate(""); setPage(1); }}>
                Clear dates
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-600">Dates are optional and inclusive.</p>
            {invalidRange && (
              <p id="click-leaderboard-date-error" role="alert" className="mt-2 text-sm text-red-700">
                End Date must be on or after Start Date.
              </p>
            )}
          </fieldset>

          {!invalidRange && (isError ? (
            <div role="alert" className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
              The product click leaderboard could not be loaded.{" "}
              <button type="button" onClick={refetch} className="font-semibold text-blue-700 underline">Try again</button>
            </div>
          ) : isFetching && !leaderboard ? (
            <p role="status" className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
              Loading product clicks…
            </p>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto" aria-busy={isFetching}>
                <table className="w-full text-left text-sm text-gray-700" aria-labelledby="product-click-leaderboard-title">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                    <tr>
                      <th scope="col" className="px-3 py-3 sm:px-4">Rank</th>
                      <th scope="col" className="px-3 py-3 sm:px-4">Dropshipper</th>
                      <th scope="col" className="px-3 py-3 text-right sm:px-4">Total Clicks</th>
                      <th scope="col" className="px-3 py-3 text-right sm:px-4">Unique Products Clicked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {!rows.length && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No dropshipper product clicks found{startDate || endDate ? " for the selected dates" : ""}.
                        </td>
                      </tr>
                    )}
                    {rows.map((dropshipper) => (
                      <tr key={dropshipper.id}>
                        <td className="px-3 py-3 font-semibold tabular-nums sm:px-4">{countFormatter.format(dropshipper.rank)}</td>
                        <th scope="row" className="px-3 py-3 font-medium text-gray-900 sm:px-4">
                          {dropshipper.name || `#${dropshipper.id}`}
                        </th>
                        <td className="px-3 py-3 text-right font-semibold tabular-nums sm:px-4">{countFormatter.format(dropshipper.total_clicks)}</td>
                        <td className="px-3 py-3 text-right tabular-nums sm:px-4">{countFormatter.format(dropshipper.unique_products_clicked)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {leaderboard?.last_page > 1 && (
                <div className="border-t border-gray-200 px-4 pb-4">
                  <Pagination currentPage={leaderboard.current_page} totalPages={leaderboard.last_page} onPageChange={setPage} />
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </section>
  );
}
