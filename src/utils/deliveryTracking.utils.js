export const normalizeConsignmentId = (value) => String(value ?? "").trim().replace(/^#/, "").toUpperCase();

export const isValidConsignmentId = (value) => /^[A-Z0-9_-]{1,100}$/i.test(value);

const text = (value) => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return value?.name || value?.label || "";
};

export const formatTrackingStatus = (value) => text(value).replace(/[_-]+/g, " ");

export const formatTrackingDate = (value, includeTime = true) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

export const getTrackingView = (response) => {
  const payload = response?.data;
  const shipment = payload?.data;
  if (!shipment?.consignment_id) return null;
  const local = payload.local_delivery_info || {};
  const status = formatTrackingStatus(shipment.transfer_status || shipment.current_status || shipment.status);
  const history = shipment.tracking_history || shipment.history || shipment.events;
  const events = Array.isArray(history) ? history.map((event, index) => ({
    id: event.id ?? index,
    title: formatTrackingStatus(event.status || event.title || event.name),
    description: text(event.description || event.message || event.note),
    location: text(event.location),
    date: event.created_at || event.timestamp || event.date,
  })).filter((event) => event.title) : [];

  // The tracking API currently supplies creation and latest-update timestamps, not a full history.
  if (!events.length) {
    const createdAt = shipment.created_at || local.created_at;
    if (createdAt) events.push({ id: "created", title: "Created", description: "Shipment registered with the courier.", date: createdAt });
    if (status) events.push({ id: "current", title: status, description: "Latest reported shipment status.", date: shipment.updated_at });
  }
  events.sort((a, b) => {
    const first = new Date(a.date).getTime();
    const second = new Date(b.date).getTime();
    return Number.isFinite(first) && Number.isFinite(second) ? first - second : 0;
  });

  return {
    consignmentId: shipment.consignment_id,
    orderNumber: local.order_number || shipment.merchant_order_id,
    status: status || "Status not available",
    estimatedDelivery: shipment.estimated_delivery || shipment.estimated_delivery_date || shipment.expected_delivery_date,
    destination: text(shipment.recipient_address || local.recipient_address),
    amount: shipment.collectable_amount ?? local.collectable_amount,
    senderName: text(shipment.sender_name || shipment.sender?.name),
    senderPhone: text(shipment.sender_phone || shipment.sender?.phone),
    storeId: shipment.store_id,
    receiverName: text(shipment.recipient_name || local.recipient_name),
    updatedAt: shipment.updated_at,
    events,
  };
};
