export const getOrderStatus = (statusCode) => {
  const statuses = {
    0: "Pending",
    1: "Contacted",
    2: "Pending_Payment",
    3: "Advance_Paid",
    4: "Place_Order",
  };

  return statuses[statusCode] || "Invalid code";
};
