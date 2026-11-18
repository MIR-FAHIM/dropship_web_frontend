import { useState } from "react";
import PropTypes from "prop-types";
import { saveAs } from "file-saver";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useLazyListAllOrdersQuery } from "../../../redux/features/order";

/**
 * "Download sheet" for the admin orders list: every order that matches the current
 * filters (all pages, not just the one on screen), as a CSV that Excel opens.
 *
 * Columns: Date & Time, অর্ডার নম্বর, কাস্টমার name, phone, Items name, collectable amount, status
 */
const PAGE_SIZE = 100; // the API's maximum per page
const MAX_PAGES = 200; // safety stop: 20,000 orders

const HEADERS = ["Date & Time", "অর্ডার নম্বর", "কাস্টমার name", "phone", "Items name", "collectable amount", "status"];

const formatDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Same order the order details / money columns use for the COD the courier collects.
const collectable = (order) =>
  Number(order?.delivery_information?.collectable_amount ?? order?.remaining_cod ?? order?.grand_total ?? order?.total ?? 0);

const itemsText = (order) =>
  (order?.items || [])
    .map((item) => `${item.product_name || "Item"}${Number(item.qty) > 1 ? ` x${item.qty}` : ""}`)
    .join("; ");

const toRow = (order) => [
  formatDateTime(order.created_at),
  order.order_number || `#${order.id}`,
  order.customer_name || "",
  // ="017…" makes Excel keep it as text, so the leading 0 isn't dropped.
  order.customer_phone ? `="${String(order.customer_phone).replace(/"/g, "")}"` : "",
  itemsText(order),
  collectable(order).toFixed(2),
  order.status?.name || "",
];

const csvCell = (value) => {
  const text = String(value ?? "");
  if (text.startsWith('="')) return text; // Excel text formula (phone) as is
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * File name: orders-c{count}-d{dropshipper id}-s{supplier/vendor id}-{date}
 * e.g. orders-c245-d556-s12-2026-11-18. The d / s parts are left out when that
 * filter isn't set (orders-c245-2026-11-18). Date = the day it was downloaded.
 */
const sheetName = (params, count) => {
  const pad = (n) => String(n).padStart(2, "0");
  const now = new Date();
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return [
    "orders",
    `c${count}`,
    params?.dropshipper_id ? `d${params.dropshipper_id}` : null,
    params?.vendor_id ? `s${params.vendor_id}` : null,
    date,
  ].filter(Boolean).join("-");
};

const DownloadOrdersSheetButton = ({ params, total }) => {
  const [fetchPage] = useLazyListAllOrdersQuery();
  const [progress, setProgress] = useState(null); // null = idle, else "x / y"

  const handleDownload = async () => {
    setProgress("…");
    try {
      const rows = [];
      let page = 1;
      let lastPage = 1;
      do {
        const res = await fetchPage({ ...params, page, per_page: PAGE_SIZE }).unwrap();
        const pageData = res?.data || {};
        (pageData.data || []).forEach((order) => rows.push(toRow(order)));
        lastPage = Number(pageData.last_page || 1);
        setProgress(`${Math.min(rows.length, pageData.total ?? rows.length)} / ${pageData.total ?? rows.length}`);
        page += 1;
      } while (page <= lastPage && page <= MAX_PAGES);

      if (rows.length === 0) {
        toast.info("No orders match these filters.");
        return;
      }

      const csv = [HEADERS, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
      // BOM so Excel reads the Bangla headers and names as UTF-8.
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `${sheetName(params, rows.length)}.csv`);
      toast.success(`Downloaded ${rows.length} orders.`);
    } catch (err) {
      toast.error(err?.data?.message || "Could not download the orders sheet.");
    } finally {
      setProgress(null);
    }
  };

  const busy = progress !== null;
  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={busy || total === 0}
      title="Download every order that matches the current filters (all pages)"
      className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />}
      {busy ? `Preparing ${progress}` : `Download sheet${total ? ` (${total})` : ""}`}
    </button>
  );
};

DownloadOrdersSheetButton.propTypes = {
  params: PropTypes.object.isRequired,
  total: PropTypes.number,
};

export default DownloadOrdersSheetButton;
