import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Trophy } from "lucide-react";
import { imgBaseUrl } from "../../../../config";
import { useGetAdminWinningProductsQuery } from "../../../redux/features/winningProducts";

/**
 * Admin → Marketers → Winning Products (Partner Portal F6): every product with marketing content.
 * To add one, open a product → "Winning Product" tab.
 */
const url = (p) => (!p ? "" : /^https?:\/\//i.test(p) ? p : `${imgBaseUrl}/${p}`);

const AdminWinningProducts = () => {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetAdminWinningProductsQuery({ status: status === "winning" ? "winning" : undefined, page });
  const rows = data?.data?.data || [];
  const last = data?.data?.last_page || 1;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Trophy className="h-5 w-5 text-amber-500" /> Winning products</h1>
          <p className="mt-1 text-xs text-gray-600">Products marketers see in their Partner Portal, with ad hook, angle and comparison photos. To add one, open the product and use the <b>Winning Product</b> tab.</p>
        </div>
        <div className="flex gap-2">
          {[["all", "All"], ["winning", "Shown to marketers"]].map(([v, l]) => (
            <button key={v} type="button" onClick={() => { setStatus(v); setPage(1); }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${status === v ? "border-teal-600 bg-teal-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>{l}</button>
          ))}
        </div>
      </div>

      {isLoading ? <p className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" /></p>
        : isError ? <p className="py-12 text-center text-sm text-red-600">Could not load winning products.</p>
        : rows.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
            No winning products yet. Open a product in <Link to="/admin-panel/products" className="font-semibold text-teal-700 hover:underline">All Products</Link> and use its Winning Product tab.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((w) => {
              const p = w.product || {};
              const img = p.primary_image?.external_link || p.primary_image?.file_name;
              return (
                <Link key={w.id} to={`/admin-panel/products/${w.product_id}`}
                  className={`flex gap-3 rounded-xl border p-3 transition-colors hover:border-teal-300 ${w.is_winning ? "border-gray-200 bg-white" : "border-dashed border-gray-300 bg-gray-50 opacity-75"}`}>
                  {img ? <img src={url(img)} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-gray-100">📦</span>}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-bold text-gray-900">{p.name || `#${w.product_id}`}</p>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${w.is_winning ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"}`}>{w.is_winning ? "Shown" : "Hidden"}</span>
                    </div>
                    <p className="line-clamp-2 text-xs text-gray-600">🎯 {w.hook}</p>
                    <p className="mt-1 text-[11px] text-gray-500">
                      RB ৳{Number(p.admin_price || 0).toLocaleString("en-BD")}
                      {p.max_resell_price ? ` → sell ৳${Number(p.max_resell_price).toLocaleString("en-BD")}` : ""}
                      {w.local_image && w.original_image ? " · 📸 comparison" : w.creative_tip ? " · 💡 tip" : ""}
                      {p.featured ? " · ⭐ featured" : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      {last > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border bg-white px-3 py-1.5 disabled:opacity-40">Previous</button>
          <span>Page {page} / {last}</span>
          <button type="button" disabled={page >= last} onClick={() => setPage(page + 1)} className="rounded-lg border bg-white px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminWinningProducts;
