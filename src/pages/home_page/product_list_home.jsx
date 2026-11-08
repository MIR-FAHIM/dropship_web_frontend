import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";
import { Link, useLocation, useParams } from "react-router-dom";
import { useListCategoriesQuery } from "../../redux/features/category";
import { useListHomeProductsQuery } from "../../redux/features/product";
import { useButtonClickMutation } from "../../redux/features/user";
import HomeProductCard from "./HomeProductCard";
import { formatProductNumber } from "./homeProductUtils";

function ProductCatalog({ initialCategory }) {
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const heading = useRef(null);
  const section = useRef(null);
  const { hash } = useLocation();
  const [trackButtonClick] = useButtonClickMutation();
  const categoriesQuery = useListCategoriesQuery({ all: 1 });
  const categories = categoriesQuery.data?.data ?? [];
  const { currentData, isFetching, isError, refetch } = useListHomeProductsQuery({
    page,
    per_page: 8,
    category_id: category || undefined,
  });

  const result = currentData?.data;
  const products = result?.data ?? [];
  const lastPage = result?.last_page ?? 1;
  const filters = [{ id: "", name: "সব পণ্য" }, ...categories];

  useEffect(() => {
    if (hash === "#product-catalog") section.current?.scrollIntoView();
  }, [hash]);

  function changePage(nextPage) {
    setPage(nextPage);
    heading.current?.scrollIntoView({ block: "start" });
    heading.current?.focus({ preventScroll: true });
  }

  return (
    <section ref={section} id="product-catalog" aria-labelledby="product-catalog-heading" className="scroll-mt-16 bg-slate-50 py-12 sm:py-16" lang="bn">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <span className="text-xs font-bold text-blue-700">পণ্য সংগ্রহ</span>
        <h2 ref={heading} tabIndex={-1} id="product-catalog-heading" className="mt-2 scroll-mt-20 text-2xl font-black text-slate-900 sm:text-4xl">
          ক্যাটাগরি থেকে পণ্য খুঁজুন{" "}
          <span className="inline-block text-sm font-medium text-slate-600">(সকল পণ্য এখানে তালিকাভুক্ত নয়)</span>
        </h2>
        <p className="mt-2 text-sm text-slate-600">ক্যাটাগরি বেছে পণ্যের বিস্তারিত দেখুন। বিক্রি শুরু করতে লগইন করুন।</p>

        <div className="my-6 flex gap-2 overflow-x-auto p-1 pb-3" role="group" aria-label="পণ্যের ক্যাটাগরি">
          {filters.map(({ id, name }) => {
            const selected = category === String(id);
            return (
              <button
                type="button"
                key={id}
                aria-pressed={selected}
                onClick={() => { setCategory(String(id)); setPage(1); }}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${selected ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"}`}
              >
                {name}
              </button>
            );
          })}
        </div>
        {categoriesQuery.isError && (
          <p role="status" className="mb-4 text-sm text-slate-600">
            ক্যাটাগরি লোড করা যায়নি।{" "}
            <button type="button" className="font-semibold text-blue-700 underline" onClick={categoriesQuery.refetch}>আবার চেষ্টা করুন</button>
          </p>
        )}

        {isFetching && !result ? (
          <p role="status" className="rounded-2xl border bg-white p-6 text-sm text-slate-600">পণ্য লোড হচ্ছে…</p>
        ) : isError ? (
          <p role="status" className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
            পণ্য লোড করা যায়নি।{" "}
            <button type="button" className="font-semibold text-blue-700 underline" onClick={refetch}>আবার চেষ্টা করুন</button>
          </p>
        ) : products.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.id} className="min-w-0">
                <HomeProductCard product={product} onOpen={() => trackButtonClick("product clicked home")} />
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="rounded-2xl border bg-white p-6 text-sm text-slate-600">এই ক্যাটাগরিতে এখন কোনো পণ্য নেই।</p>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          {lastPage > 1 && (
            <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="পণ্যের তালিকার পৃষ্ঠা">
              <button type="button" disabled={page <= 1 || isFetching} onClick={() => changePage(page - 1)} className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 font-semibold disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" /> আগের
              </button>
              <span className="text-slate-600" aria-live="polite">{formatProductNumber(page)} / {formatProductNumber(lastPage)}</span>
              <button type="button" disabled={page >= lastPage || isFetching} onClick={() => changePage(page + 1)} className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 font-semibold disabled:opacity-40">
                পরের <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
          <Link to="/login" className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800">
            বিক্রি শুরু করতে লগইন করুন
          </Link>
        </div>
      </div>
    </section>
  );
}

ProductCatalog.propTypes = { initialCategory: PropTypes.string.isRequired };

export default function ProductsListHomePage() {
  const { id } = useParams();
  return <ProductCatalog key={id} initialCategory={id ?? ""} />;
}
