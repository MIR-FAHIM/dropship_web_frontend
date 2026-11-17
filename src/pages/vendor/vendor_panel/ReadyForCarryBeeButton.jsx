import { Loader2, Truck } from "lucide-react";
import { toast } from "react-toastify";
import { useCreateCarryBeeOrderMutation } from "../../../redux/features/delivery_company/carrybeeStoreApi";
import { useUpdateOrderStatusMutation } from "../../../redux/features/order";

/**
 * "Ready Product For CarryBee" for an order that has a saved CarryBee draft but no
 * consignment yet. Same steps as the order details page: submit the draft to
 * CarryBee, then set the order to Vendor Is Ready (3).
 */
const ReadyForCarryBeeButton = ({ order, onDone, compact = false }) => {
  const [createCarryBeeOrder, { isLoading: creating }] = useCreateCarryBeeOrderMutation();
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const busy = creating || updating;

  const handleClick = async (e) => {
    e.stopPropagation();
    if (!order?.carry_bee_draft) return;
    if (!window.confirm(`Mark order ${order.order_number} as ready for CarryBee?`)) return;
    try {
      // eslint-disable-next-line no-unused-vars
      const { id, created_at, updated_at, ...draftPayload } = order.carry_bee_draft;
      await createCarryBeeOrder({
        vendorId: String(order.vendor_id ?? ""),
        ...draftPayload,
        expected_product_id: order.items?.length === 1 ? order.items[0].product_id : undefined,
      }).unwrap();
      await updateStatus({ id: order.id, status_id: 3 });
      toast.success(`Order ${order.order_number} submitted to CarryBee`);
      onDone?.();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit order to CarryBee.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title="Submit the saved CarryBee draft and mark the order ready"
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-amber-400 bg-amber-50 font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60 ${
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-2 text-sm"
      }`}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Truck className="h-3.5 w-3.5" />}
      Product is ready for Carrybee
    </button>
  );
};

export default ReadyForCarryBeeButton;
