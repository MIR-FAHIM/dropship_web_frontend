import React from "react";
import { Layers, Loader2, RotateCw } from "lucide-react";

const ProductAttributeList = ({ items = [], isLoading, error, onRetry }) => (
  <section className="border-t border-gray-200 pt-5">
    <div className="mb-3 flex items-center gap-2">
      <Layers aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500" />
      <h3 className="text-sm font-semibold text-gray-900">Attribute List</h3>
      {items.length > 0 && (
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs tabular-nums text-gray-600">
          {items.length}
        </span>
      )}
    </div>
    {isLoading ? (
      <p role="status" className="flex items-center gap-2 py-4 text-sm text-gray-500">
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        Loading attributes...
      </p>
    ) : error && error.status !== 404 && items.length === 0 ? (
      <div className="flex flex-wrap items-center gap-3 py-4 text-sm">
        <p role="alert" className="text-red-700">Could not load attributes.</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded border border-gray-200 px-2.5 py-1 text-gray-700 hover:bg-gray-50"
        >
          <RotateCw aria-hidden="true" className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    ) : items.length === 0 ? (
      <p className="py-4 text-sm text-gray-500">No attributes added yet.</p>
    ) : (
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table aria-label="Product attributes" className="w-full table-fixed text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-600">
            <tr>
              <th scope="col" className="px-2 py-2.5 text-left font-semibold sm:px-4">Attribute</th>
              <th scope="col" className="px-2 py-2.5 text-left font-semibold sm:px-4">Value</th>
              <th scope="col" className="w-20 px-2 py-2.5 text-right font-semibold sm:w-32 sm:px-4">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="break-words px-2 py-3 font-medium text-gray-900 sm:px-4">
                  {item.attribute?.name ?? "-"}
                </td>
                <td className="break-words px-2 py-3 text-gray-700 sm:px-4">
                  {item.value?.value ?? item.attribute_value?.value ?? "-"}
                </td>
                <td className="px-2 py-3 text-right sm:px-4">
                  <span className={`inline-block max-w-full break-all rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                    item.stock == null ? "text-gray-500" : Number(item.stock) === 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
                  }`}>
                    {item.stock ?? "-"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default ProductAttributeList;
