/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Copy, Edit3, ExternalLink, Eye, Loader2, Save, Search, Send, Store, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { imgBaseUrl } from "../../../../config";
import {
  useAddResellerStoreProfileMutation,
  useGetResellerStoreProfileByResellerQuery,
  useUpdateResellerStoreProfileMutation,
} from "../../../redux/features/resellerStoreProfile";
import {
  useListResellerProductPagesQuery,
  useRemoveResellerProductPageMutation,
  useUpdateResellerProductPageMutation,
} from "../../../redux/features/resellerProductPage";
import {
  useDeleteLandingPageOrderMutation,
  useGetLandingPageOrderDetailsQuery,
  useListLandingPageOrdersQuery,
  usePassLandingPageOrderToResellerBrainMutation,
  useUpdateLandingPageOrderMutation,
} from "../../../redux/features/landingPageOrder";
import ResellerProductPageModal from "../../../components/shared/ResellerProductPageModal";

const initialForm = {
  shop_name: "",
  logo: "",
  phone: "",
  whatsapp: "",
  address: "",
  details: "",
  facebook_url: "",
  website: "",
  theme: "default",
  status: "active",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";
const allowedLogoTypes = ["image/jpeg", "image/png", "image/webp"];

const getProfile = (response) => {
  const data = response?.data;
  if (!data) return null;
  if (Array.isArray(data)) return data[0] || null;
  if (Array.isArray(data?.data)) return data.data[0] || null;
  return data?.data || data;
};

const getErrorMessages = (error) => {
  const errors = error?.data?.errors;
  if (!errors) return [];
  if (Array.isArray(errors)) return errors;
  if (typeof errors === "object") return Object.values(errors).flat();
  return [String(errors)];
};

const getProductPages = (response) => {
  const data = response?.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
};

const getLandingPageOrders = (response) => {
  const data = response?.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.items?.data)) return data.items.data;
  return [];
};

const getLandingPageOrder = (response) => {
  const data = response?.data;
  if (!data) return null;
  return data?.data || data;
};

const getImageUrl = (page) => {
  const fileName =
    page?.product?.primary_image?.file_name ||
    page?.product?.image?.file_name ||
    page?.primary_image?.file_name;
  if (!fileName) return null;
  if (/^https?:\/\//i.test(fileName)) return fileName;
  return `${String(imgBaseUrl).replace(/\/+$/, "")}/${String(fileName).replace(/^\/+/, "")}`;
};

const getLogoUrl = (logo) => {
  if (!logo || typeof logo !== "string") return null;
  if (/^https?:\/\//i.test(logo)) return logo;
  return `${String(imgBaseUrl).replace(/\/+$/, "")}/${logo.replace(/^\/+/, "")}`;
};

const buildStoreProfileFormData = ({ form, resellerId, selectedLogoFile }) => {
  const formData = new FormData();

  formData.append("reseller_id", resellerId);
  formData.append("shop_name", form.shop_name || "");
  formData.append("phone", form.phone || "");
  formData.append("whatsapp", form.whatsapp || "");
  formData.append("address", form.address || "");
  formData.append("details", form.details || "");
  formData.append("facebook_url", form.facebook_url || "");
  formData.append("website", form.website || "");
  formData.append("theme", form.theme || "");
  formData.append("status", form.status || "active");

  if (selectedLogoFile) {
    formData.append("logo", selectedLogoFile);
  }

  return formData;
};

const statusClass = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-700",
};

const orderStatusClass = {
  pending: "bg-blue-50 text-blue-700",
  passed_to_reseller_brain: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const formatMoney = (value) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getOrderProductName = (order) =>
  order?.product?.name ||
  order?.reseller_product_page?.product?.name ||
  order?.resellerProductPage?.product?.name ||
  order?.product_name ||
  "-";

const ProductPagesTab = ({ resellerId }) => {
  const [editingPage, setEditingPage] = useState(null);
  const { data, isLoading, isFetching } = useListResellerProductPagesQuery(
    { reseller_id: resellerId },
    { skip: !resellerId }
  );
  const [updatePage, { isLoading: updating }] = useUpdateResellerProductPageMutation();
  const [removePage, { isLoading: deleting }] = useRemoveResellerProductPageMutation();
  const pages = getProductPages(data);

  const publicLink = (slug) => `${window.location.origin}/store/product/${slug}`;

  const handleCopy = async (slug) => {
    if (!slug) return;
    await navigator.clipboard.writeText(publicLink(slug));
    toast.success("Public link copied");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product page?")) return;
    try {
      await removePage(id).unwrap();
      toast.success("Product page deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Product page delete failed");
    }
  };

  const handleUpdate = async (form) => {
    if (!editingPage?.id) return;
    try {
      await updatePage({
        id: editingPage.id,
        reseller_id: Number(resellerId),
        product_id: editingPage.product_id || editingPage.product?.id,
        ...form,
        selling_price: Number(form.selling_price),
        discount_price: form.discount_price === "" ? null : Number(form.discount_price),
        delivery_charge: Number(form.delivery_charge || 0),
        template_id: Number(form.template_id || 1),
      }).unwrap();
      toast.success("Product page updated");
      setEditingPage(null);
    } catch (err) {
      toast.error(err?.data?.message || "Product page update failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 py-20">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={isFetching ? "opacity-60" : ""}>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  No product pages created yet.
                </td>
              </tr>
            ) : (
              pages.map((page) => {
                const imageUrl = getImageUrl(page);
                return (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {imageUrl ? (
                        <img src={imageUrl} alt={page.custom_title} className="h-11 w-11 rounded-lg border border-gray-200 object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                          <Store className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 font-medium text-gray-800">{page.custom_title}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-gray-600">{page.product?.name || page.product_name || "-"}</td>
                    <td className="max-w-[160px] truncate px-4 py-3 font-mono text-xs text-blue-600">{page.slug || "-"}</td>
                    <td className="px-4 py-3">৳{page.selling_price || 0}</td>
                    <td className="px-4 py-3">৳{page.discount_price || 0}</td>
                    <td className="px-4 py-3">৳{page.delivery_charge || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass[page.published_status] || statusClass.draft}`}>
                        {page.published_status || "draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => window.open(`/store/product/${page.slug}`, "_blank")} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50" title="View">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setEditingPage(page)} className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50" title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleCopy(page.slug)} className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50" title="Copy link">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(page.id)} disabled={deleting} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ResellerProductPageModal
        open={Boolean(editingPage)}
        page={editingPage}
        product={editingPage?.product}
        loading={updating}
        title="Edit Product Page"
        onClose={() => setEditingPage(null)}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

const OrderDetailsModal = ({ order, loading, onClose }) => {
  if (!order && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Order Details</h3>
            <p className="text-sm text-gray-500">{order?.tracking_code || "Loading..."}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <h4 className="mb-3 text-sm font-bold uppercase text-gray-500">Customer Info</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">Name:</span> {order.customer_name || "-"}</p>
                <p><span className="font-semibold">Phone:</span> {order.customer_phone || "-"}</p>
                <p><span className="font-semibold">Address:</span> {order.customer_address || "-"}</p>
                <p><span className="font-semibold">Division:</span> {order.division?.name || order.division_name || order.division_id || "-"}</p>
                <p><span className="font-semibold">District:</span> {order.district?.name || order.district_name || order.district_id || "-"}</p>
                <p><span className="font-semibold">Upazila:</span> {order.upazila?.name || order.upozella?.name || order.upozella_id || "-"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <h4 className="mb-3 text-sm font-bold uppercase text-gray-500">Product Info</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">Product:</span> {getOrderProductName(order)}</p>
                <p><span className="font-semibold">Product ID:</span> {order.product_id || "-"}</p>
                <p><span className="font-semibold">Product Page:</span> {order.reseller_product_page?.custom_title || order.resellerProductPage?.custom_title || order.reseller_product_page_id || "-"}</p>
                <p><span className="font-semibold">Variant:</span> {order.variant_id || "-"}</p>
                <p><span className="font-semibold">Quantity:</span> {order.quantity || 1}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <h4 className="mb-3 text-sm font-bold uppercase text-gray-500">Pricing Summary</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">Selling Price:</span> {formatMoney(order.selling_price)}</p>
                <p><span className="font-semibold">Delivery Charge:</span> {formatMoney(order.delivery_charge)}</p>
                <p><span className="font-semibold">Total:</span> <span className="font-bold text-gray-900">{formatMoney(order.total_amount)}</span></p>
                <p><span className="font-semibold">Outside Dhaka:</span> {order.is_outside_dhaka ? "Yes" : "No"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <h4 className="mb-3 text-sm font-bold uppercase text-gray-500">Order Status</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">Tracking:</span> {order.tracking_code || "-"}</p>
                <p><span className="font-semibold">Status:</span> {order.status || "pending"}</p>
                <p><span className="font-semibold">Source:</span> {order.source || "-"}</p>
                <p><span className="font-semibold">Main Order ID:</span> {order.order_id || order.main_order_id || "-"}</p>
                <p><span className="font-semibold">Created:</span> {formatDate(order.created_at)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OrdersTab = ({ resellerId }) => {
  const [statusFilter, setStatusFilter] = useState("");
  const [trackingSearch, setTrackingSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data, isLoading, isFetching } = useListLandingPageOrdersQuery(
    { reseller_id: resellerId, status: statusFilter || undefined, tracking_code: trackingSearch || undefined },
    { skip: !resellerId }
  );
  const { data: detailsData, isFetching: detailsLoading } = useGetLandingPageOrderDetailsQuery(selectedOrderId, {
    skip: !selectedOrderId,
  });
  const [updateOrder, { isLoading: updatingOrder }] = useUpdateLandingPageOrderMutation();
  const [deleteOrder, { isLoading: deletingOrder }] = useDeleteLandingPageOrderMutation();
  const [passOrder, { isLoading: passingOrder }] = usePassLandingPageOrderToResellerBrainMutation();

  const orders = getLandingPageOrders(data).filter((order) => {
    const statusOk = !statusFilter || String(order.status || "pending") === statusFilter;
    const trackingOk = !trackingSearch || String(order.tracking_code || "").toLowerCase().includes(trackingSearch.toLowerCase());
    return statusOk && trackingOk;
  });
  const selectedOrder = getLandingPageOrder(detailsData);

  const openEdit = (order) => {
    setEditingOrder(order);
    setEditForm({
      customer_name: order.customer_name || "",
      customer_phone: order.customer_phone || "",
      customer_address: order.customer_address || "",
      quantity: order.quantity || 1,
      selling_price: order.selling_price || 0,
      delivery_charge: order.delivery_charge || 0,
      total_amount: order.total_amount || 0,
      status: order.status || "pending",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => {
      const next = { ...prev, [name]: value };
      if (["quantity", "selling_price", "delivery_charge"].includes(name)) {
        next.total_amount = Number(next.selling_price || 0) * Number(next.quantity || 1) + Number(next.delivery_charge || 0);
      }
      return next;
    });
  };

  const handleUpdateOrder = async (event) => {
    event.preventDefault();
    if (!editingOrder?.id) return;

    try {
      await updateOrder({
        id: editingOrder.id,
        ...editForm,
        quantity: Number(editForm.quantity || 1),
        selling_price: Number(editForm.selling_price || 0),
        delivery_charge: Number(editForm.delivery_charge || 0),
        total_amount: Number(editForm.total_amount || 0),
      }).unwrap();
      toast.success("Order updated successfully");
      setEditingOrder(null);
    } catch (err) {
      toast.error(err?.data?.message || "Order update failed");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Delete/cancel this landing page order?")) return;
    try {
      await deleteOrder(id).unwrap();
      toast.success("Order deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Order delete failed");
    }
  };

  const handlePassOrder = async (order) => {
    if (!window.confirm("This will create a main system order. Continue?")) return;
    try {
      const response = await passOrder(order.id).unwrap();
      const passedOrderId = response?.data?.order_id || response?.data?.data?.order_id || response?.order_id;
      toast.success(passedOrderId ? `Order passed to ResellerBrain successfully. Order #${passedOrderId}` : "Order passed to ResellerBrain successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Order pass failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 py-20">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={isFetching ? "opacity-60" : ""}>
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={trackingSearch}
            onChange={(event) => setTrackingSearch(event.target.value)}
            placeholder="Search tracking code"
            className="w-full text-sm outline-none"
          />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
          <option value="">All statuses</option>
          <option value="pending">pending</option>
          <option value="passed_to_reseller_brain">passed_to_reseller_brain</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Tracking</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  No landing page orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const passed = order.status === "passed_to_reseller_brain" || order.order_id || order.main_order_id;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{order.tracking_code || "-"}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{order.customer_name || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{order.customer_phone || "-"}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-gray-600">{order.customer_address || "-"}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-gray-600">{getOrderProductName(order)}</td>
                    <td className="px-4 py-3">{order.quantity || 1}</td>
                    <td className="px-4 py-3">{formatMoney(order.selling_price)}</td>
                    <td className="px-4 py-3">{formatMoney(order.delivery_charge)}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{formatMoney(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${orderStatusClass[order.status] || orderStatusClass.pending}`}>
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => setSelectedOrderId(order.id)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50" title="View details">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => openEdit(order)} className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50" title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDeleteOrder(order.id)} disabled={deletingOrder} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePassOrder(order)}
                          disabled={passed || passingOrder}
                          className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
                          title={passed ? "Already passed" : "Pass to ResellerBrain"}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedOrderId && (
        <OrderDetailsModal order={selectedOrder} loading={detailsLoading} onClose={() => setSelectedOrderId(null)} />
      )}

      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleUpdateOrder} className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Edit Landing Page Order</h3>
                <p className="text-sm text-gray-500">{editingOrder.tracking_code || `Order #${editingOrder.id}`}</p>
              </div>
              <button type="button" onClick={() => setEditingOrder(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Customer Name</label>
                <input name="customer_name" value={editForm.customer_name || ""} onChange={handleEditChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Customer Phone</label>
                <input name="customer_phone" value={editForm.customer_phone || ""} onChange={handleEditChange} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Customer Address</label>
                <textarea name="customer_address" value={editForm.customer_address || ""} onChange={handleEditChange} rows={3} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input type="number" min="1" name="quantity" value={editForm.quantity || 1} onChange={handleEditChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={editForm.status || "pending"} onChange={handleEditChange} className={inputClass}>
                  <option value="pending">pending</option>
                  <option value="passed_to_reseller_brain">passed_to_reseller_brain</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Selling Price</label>
                <input type="number" name="selling_price" value={editForm.selling_price || 0} onChange={handleEditChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Delivery Charge</label>
                <input type="number" name="delivery_charge" value={editForm.delivery_charge || 0} onChange={handleEditChange} className={inputClass} />
              </div>
              <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                <p className="text-sm font-semibold text-gray-500">Total Amount</p>
                <p className="text-2xl font-black text-gray-900">{formatMoney(editForm.total_amount)}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button type="button" onClick={() => setEditingOrder(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
                Cancel
              </button>
              <button type="submit" disabled={updatingOrder} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {updatingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const StoreProfile = () => {
  const resellerId = getFromLocalstorage("userId");
  const [activeTab, setActiveTab] = useState("information");
  const [form, setForm] = useState(initialForm);
  const [apiErrors, setApiErrors] = useState([]);
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [selectedLogoPreview, setSelectedLogoPreview] = useState("");

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetResellerStoreProfileByResellerQuery(resellerId, { skip: !resellerId });

  const profile = useMemo(() => getProfile(data), [data]);
  const isMissingProfile = isError && [404, 204].includes(error?.status);

  const [addProfile, { isLoading: creating }] = useAddResellerStoreProfileMutation();
  const [updateProfile, { isLoading: updating }] = useUpdateResellerStoreProfileMutation();
  const saving = creating || updating;
  const logoPreviewUrl = selectedLogoPreview || getLogoUrl(form.logo);

  useEffect(() => {
    if (!profile) {
      setForm(initialForm);
      setSelectedLogoFile(null);
      return;
    }

    setForm({
      shop_name: profile.shop_name || "",
      logo: profile.logo || "",
      phone: profile.phone || "",
      whatsapp: profile.whatsapp || "",
      address: profile.address || "",
      details: profile.details || "",
      facebook_url: profile.facebook_url || "",
      website: profile.website || "",
      theme: profile.theme || "default",
      status: profile.status || "active",
    });
    setSelectedLogoFile(null);
  }, [profile]);

  useEffect(() => {
    if (!selectedLogoFile) {
      setSelectedLogoPreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedLogoFile);
    setSelectedLogoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedLogoFile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedLogoFile(null);
      return;
    }

    if (!allowedLogoTypes.includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WebP image");
      event.target.value = "";
      setSelectedLogoFile(null);
      return;
    }

    setSelectedLogoFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiErrors([]);

    const payload = buildStoreProfileFormData({
      form,
      resellerId: Number(resellerId),
      selectedLogoFile,
    });

    try {
      if (profile?.id) {
        await updateProfile({ id: profile.id, body: payload }).unwrap();
      } else {
        await addProfile(payload).unwrap();
      }
      setSelectedLogoFile(null);
      toast.success("Store profile saved successfully");
    } catch (err) {
      setApiErrors(getErrorMessages(err));
      toast.error(err?.data?.message || "Store profile save failed");
    }
  };

  if (!resellerId) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
        Please login again. Reseller id was not found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Store className="h-5 w-5 text-blue-600" />
            Store Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up the shop information shown for your reseller business.
          </p>
        </div>
        {profile?.id && (
          <span className="inline-flex w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            Profile #{profile.id}
          </span>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-100">
        {[
          { key: "information", label: "Information" },
          { key: "product-pages", label: "Product Pages" },
          { key: "orders", label: "Orders" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "product-pages" ? (
        <ProductPagesTab resellerId={resellerId} />
      ) : activeTab === "orders" ? (
        <OrdersTab resellerId={resellerId} />
      ) : isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 py-20">
          <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
        </div>
      ) : isError && !isMissingProfile ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          {error?.data?.message || "Failed to load store profile."}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={isFetching ? "opacity-60" : ""}>
          {apiErrors.length > 0 && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {apiErrors.map((message, index) => (
                <p key={index}>{message}</p>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Shop Name</label>
                <input name="shop_name" value={form.shop_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Shop Logo</label>
                <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  {logoPreviewUrl ? (
                    <img
                      src={logoPreviewUrl}
                      alt="Store logo preview"
                      className="h-16 w-16 shrink-0 rounded-lg border border-gray-200 bg-white object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-gray-400">
                      <Store className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Accepted: JPG, PNG, WebP.</p>
                    {selectedLogoFile && (
                      <p className="mt-1 truncate text-xs font-semibold text-green-700">{selectedLogoFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp</label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Facebook URL</label>
                <input name="facebook_url" value={form.facebook_url} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input name="website" value={form.website} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Theme</label>
                <select name="theme" value={form.theme} onChange={handleChange} className={inputClass}>
                  <option value="default">default</option>
                  <option value="modern">modern</option>
                  <option value="classic">classic</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={3} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Details</label>
                <textarea name="details" value={form.details} onChange={handleChange} rows={4} className={inputClass} />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {profile?.id ? "Update Store Profile" : "Create Store Profile"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default StoreProfile;
