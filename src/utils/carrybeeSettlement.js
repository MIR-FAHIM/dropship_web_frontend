const isTrue = value => [true, 1, "1", "true"].includes(value);
const isPaid = source => isTrue(source?.is_carrybee_paid) || source?.carrybee_paid_status === "paid";
const isPending = source => [false, 0, "0", "false"].includes(source?.is_carrybee_paid)
  || source?.carrybee_paid_status === "pending";

export const isNonPayableCarrybeeOrder = order =>
  [7, 8, 11].includes(Number(order?.status?.id ?? order?.status ?? order?.order_status?.id));

export const getCarrybeeDetails = response => {
  const outer = response?.data;
  if (!outer || typeof outer !== "object") return null;
  return { ...outer, ...outer.data };
};

export function getCarrybeeSettlement(response, order, delivery) {
  const outer = response?.data;
  const inner = outer?.data;
  const savedSources = [order, delivery];
  const readFrom = (sources, key) => sources.map(source => source?.[key]).find(value => value != null && value !== "");
  // Order Details stores the payout record; the delivery lookup can still return pending.
  const confirmedOrder = isPaid(order) && Boolean(
    readFrom(savedSources, "carrybee_invoice_id") || readFrom(savedSources, "carrybee_paid_at")
  );
  const sources = confirmedOrder ? savedSources : [inner, outer, ...savedSources];
  const read = key => readFrom(sources, key);
  const invoice = read("carrybee_invoice_id");
  const paidAt = read("carrybee_paid_at");
  const webhook = [inner, outer].some(source => isTrue(source?.webhook_event_found))
    || (Array.isArray(order?.status_history)
      && order.status_history.some(entry => entry?.note === "CarryBee webhook: order.paid"));
  const livePaid = [inner, outer].some(isPaid);
  const livePending = [inner, outer].some(isPending);
  const savedPaid = [order, delivery].some(isPaid) || Boolean(invoice || paidAt);
  const excluded = isNonPayableCarrybeeOrder(order);

  let status = "pending";
  if (excluded) status = "ineligible";
  else if (confirmedOrder) status = "paid";
  else if (livePending && (livePaid || savedPaid || webhook || Number(order?.status?.id ?? order?.status) === 10)) status = "review";
  else if (livePaid || savedPaid) status = "paid";
  else if (webhook) status = "review";

  return {
    status, invoice, paidAt, webhook,
    recipient: read("carrybee_disbursed_to"),
    amount: confirmedOrder
      ? order?.courier_net_payout ?? read("carrybee_disbursed_amount")
      : read("carrybee_disbursed_amount") ?? order?.courier_net_payout,
  };
}

export const carrybeeSettlementLabels = {
  paid: "Paid",
  pending: "Settlement pending",
  review: "Settlement needs verification",
  ineligible: "Settlement not applicable",
};
