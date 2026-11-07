import { ArrowDown, TrendingUp } from "lucide-react";
import PropTypes from "prop-types";
import { useGetHomeProductLeaderboardQuery } from "../../redux/features/report";
import HomeProductCard from "./HomeProductCard";

export default function HomeProductLeaderboard({ onOpen }) {
  const { data, isLoading, isError, refetch } = useGetHomeProductLeaderboardQuery();
  const products = (data?.data?.leaderboard ?? []).filter(({ product }) => product);

  return (
    <section aria-labelledby="top-products-heading" className="bg-white py-12 sm:py-16" lang="bn">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <TrendingUp className="h-4 w-4" aria-hidden="true" /> জনপ্রিয় পণ্য
            </span>
            <h2 id="top-products-heading" lang="en" className="mt-3 text-2xl font-black text-slate-900 sm:text-4xl">Trending Products This Week</h2>
            <p className="mt-2 text-sm text-slate-600">এই সপ্তাহে আমাদের সম্মানিত ড্রপশিপাররা এই পণ্যগুলো বিক্রি করে ভালো ফল পেয়েছেন।</p>
          </div>
          <a href="#product-catalog" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:underline">
            আরও পণ্য দেখুন <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {isLoading ? (
          <p role="status" className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">জনপ্রিয় পণ্য লোড হচ্ছে…</p>
        ) : isError ? (
          <p role="status" className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">
            জনপ্রিয় পণ্যের তালিকা লোড করা যায়নি।{" "}
            <button type="button" onClick={refetch} className="font-semibold text-blue-700 underline">আবার চেষ্টা করুন</button>
          </p>
        ) : products.length ? (
          <>
            {products.length > 2 && <p className="mb-2 text-xs text-slate-500 sm:hidden">আরও পণ্য দেখতে পাশে সোয়াইপ করুন।</p>}
            <ul className="grid auto-cols-[46%] grid-flow-col gap-3 overflow-x-auto pb-3 snap-x snap-proximity sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {products.map(({ product, rank, total_clicks: clicks }) => (
                <li key={product.id} className="min-w-0 snap-start">
                  <HomeProductCard product={product} rank={rank} clicks={clicks} onOpen={onOpen} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p role="status" className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">জনপ্রিয় পণ্যের তালিকা এখনো তৈরি হয়নি।</p>
        )}
      </div>
    </section>
  );
}

HomeProductLeaderboard.propTypes = { onOpen: PropTypes.func };
