import { useState } from "react";
import { Trophy } from "lucide-react";
import Pagination from "../../../components/shared/Pagination";
import { useGetDropshipperLeaderboardQuery } from "../../../redux/features/user";

const countFormatter = new Intl.NumberFormat("en-BD");
const profitFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "narrowSymbol",
});

export default function DropshipperLeaderboard() {
  const [page, setPage] = useState(1);
  const { currentData, isFetching, isError, error, refetch } = useGetDropshipperLeaderboardQuery(page, {
    refetchOnMountOrArgChange: true,
  });
  const leaderboard = currentData?.data;

  return (
    <section className="space-y-4 p-4 sm:p-6" aria-labelledby="dropshipper-leaderboard-title">
      <div>
        <h1 id="dropshipper-leaderboard-title" className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl">
          <Trophy className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          Dropshipper Leaderboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          মোট অর্ডারের ভিত্তিতে র‍্যাঙ্কিং। মোট লাভে সব অর্ডারে রেকর্ড করা লাভ যোগ করা হয়েছে।
        </p>
      </div>

      {isError ? (
        <div role="alert" className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
          {error?.status === 403 ? "এই লিডারবোর্ড দেখার অনুমতি নেই।" : (
            <>
              লিডারবোর্ড লোড করা যায়নি।{" "}
              <button type="button" onClick={refetch} className="font-semibold text-blue-700 underline">
                আবার চেষ্টা করুন
              </button>
            </>
          )}
        </div>
      ) : isFetching && !leaderboard ? (
        <p role="status" className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          লিডারবোর্ড লোড হচ্ছে…
        </p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto" aria-busy={isFetching}>
            <table className="w-full text-left text-sm text-gray-700" aria-labelledby="dropshipper-leaderboard-title">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                <tr>
                  <th scope="col" className="whitespace-nowrap px-3 py-3 sm:px-4">র‍্যাঙ্ক</th>
                  <th scope="col" className="px-3 py-3 sm:px-4">ড্রপশিপার</th>
                  <th scope="col" className="whitespace-nowrap px-3 py-3 text-right sm:px-4">মোট অর্ডার</th>
                  <th scope="col" className="whitespace-nowrap px-3 py-3 text-right sm:px-4">সম্পন্ন অর্ডার</th>
                  <th scope="col" className="whitespace-nowrap px-3 py-3 text-right sm:px-4">মোট লাভ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!leaderboard?.data.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">অর্ডার করেছেন এমন কোনো ড্রপশিপার পাওয়া যায়নি।</td>
                  </tr>
                )}
                {leaderboard?.data.map((dropshipper) => (
                  <tr key={dropshipper.id}>
                    <td className="px-3 py-3 font-semibold tabular-nums sm:px-4">{countFormatter.format(dropshipper.rank)}</td>
                    <th scope="row" className="px-3 py-3 font-medium text-gray-900 sm:px-4">
                      {dropshipper.name || `#${dropshipper.id}`}
                    </th>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums sm:px-4">
                      {countFormatter.format(dropshipper.total_order_count)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums sm:px-4">
                      {dropshipper.completed_order_count == null ? "—" : countFormatter.format(dropshipper.completed_order_count)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums sm:px-4">
                      {profitFormatter.format(dropshipper.total_profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaderboard?.last_page > 1 && (
            <div className="border-t border-gray-200 px-4 pb-4">
              <Pagination currentPage={page} totalPages={leaderboard.last_page} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
