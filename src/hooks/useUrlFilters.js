import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * List filters and page kept in the URL, so Back from a details page returns to the
 * same page with the same filters, and the view can be shared as a link.
 *
 *   const { get, update, clear, hasAny } = useUrlFilters();
 *   update({ status: "4" })            // sets it and goes back to page 1
 *   update({ page: 3 }, { resetPage: false })
 *   clear(["per_page"])                // clears everything except per_page
 */
const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const get = useCallback((key, fallback = "") => searchParams.get(key) ?? fallback, [searchParams]);

  const update = useCallback(
    (patch, { resetPage = true } = {}) =>
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([k, v]) => (v === undefined || v === null || v === "" || v === "all" ? next.delete(k) : next.set(k, String(v))));
        if (resetPage && !("page" in patch)) next.delete("page");
        return next;
      }, { replace: true }),
    [setSearchParams]
  );

  const clear = useCallback(
    (keep = []) =>
      setSearchParams((prev) => {
        const next = new URLSearchParams();
        keep.forEach((k) => prev.get(k) && next.set(k, prev.get(k)));
        return next;
      }, { replace: true }),
    [setSearchParams]
  );

  const hasAny = (ignore = ["page", "per_page"]) => [...searchParams.keys()].some((k) => !ignore.includes(k));

  return { get, update, clear, hasAny, searchParams };
};

export default useUrlFilters;
