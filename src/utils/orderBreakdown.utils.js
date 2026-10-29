/**
 * Financial Stake Breakdown Calculator & Auto-Balancing Utility
 * Aligned with Google Doc specification & verified backend mathematical model.
 */

export const calculateOrderStakeBreakdown = (order, adjustments = null) => {
  if (!order) return null;

  const deliveryInfo =
    order.delivery_information ||
    order.deliveryInformation ||
    order.delivery_assigned_info ||
    order.deliveryAssignedInfo ||
    {};
  const items = Array.isArray(order.items) ? order.items : [];
  const vendor = order.vendor || items[0]?.shop || {};

  // Check if vendor has their own CarryBee delivery account
  const hasOwnDeliveryAccount = Boolean(
    vendor?.has_own_delivery_account ?? items[0]?.shop?.has_own_delivery_account ?? false
  );

  const consignmentId = deliveryInfo.consignment_id || order.consignment_id || null;

  // 1. Courier Delivery & COD Info (from CarryBee delivery_information or order remaining_cod)
  const baseCollectable =
    order.remaining_cod !== null && order.remaining_cod !== undefined
      ? Number(order.remaining_cod)
      : Number(deliveryInfo.collectable_amount ?? order.total ?? 0);

  // Courier Delivery Fee priority:
  // 1. CarryBee delivery_information.delivery_fee
  // 2. order.actual_courier_fee
  // 3. order.shipping_fee
  const baseCourierDeliveryFee = Number(
    deliveryInfo.delivery_fee !== undefined &&
      deliveryInfo.delivery_fee !== null &&
      Number(deliveryInfo.delivery_fee) > 0
      ? deliveryInfo.delivery_fee
      : (order.actual_courier_fee !== undefined &&
          order.actual_courier_fee !== null &&
          Number(order.actual_courier_fee) > 0
          ? order.actual_courier_fee
          : (order.shipping_fee ?? 0))
  );

  // Courier COD Fee priority:
  // 1. total_fee - delivery_fee from CarryBee delivery_information
  // 2. order.actual_cod_fee
  // 3. 1% of collectable amount if consignment exists
  let baseCourierCodFee = 0;
  if (baseCollectable <= 0) {
    baseCourierCodFee = 0;
  } else if (
    deliveryInfo.total_fee !== undefined &&
    deliveryInfo.total_fee !== null &&
    Number(deliveryInfo.total_fee) > baseCourierDeliveryFee
  ) {
    baseCourierCodFee = Math.max(
      0,
      Math.round((Number(deliveryInfo.total_fee) - baseCourierDeliveryFee) * 100) / 100
    );
  } else if (
    order.actual_cod_fee !== undefined &&
    order.actual_cod_fee !== null &&
    Number(order.actual_cod_fee) > 0
  ) {
    baseCourierCodFee = Number(order.actual_cod_fee);
  } else if (consignmentId && baseCollectable > 0) {
    // CarryBee standard 1% COD fee
    baseCourierCodFee = Math.round(baseCollectable * 0.01 * 100) / 100;
  }

  const baseCourierTotalFee = Math.round((baseCourierDeliveryFee + baseCourierCodFee) * 100) / 100;

  // Apply adjustments if provided
  const courierCollectable =
    adjustments?.collectable_amount !== undefined
      ? Number(adjustments.collectable_amount)
      : baseCollectable;

  const courierDeliveryFee =
    adjustments?.courier_delivery_fee !== undefined
      ? Number(adjustments.courier_delivery_fee)
      : baseCourierDeliveryFee;

  const courierCodFee =
    adjustments?.courier_cod_fee !== undefined
      ? Number(adjustments.courier_cod_fee)
      : (courierCollectable <= 0 ? 0 : baseCourierCodFee);

  // Courier Net received by supplier
  const courierNetToSupplier =
    Math.round((courierCollectable - courierDeliveryFee - courierCodFee) * 100) / 100;

  // 2. Product Prices
  const defaultSupplierPrice = items.reduce((sum, item) => {
    const qty = Number(item.qty || 1);
    const unitPrice = Number(item.unit_price ?? item.wholesale_price ?? 0);
    return sum + qty * unitPrice;
  }, 0);

  const defaultAdminBasePrice = items.reduce((sum, item) => {
    const qty = Number(item.qty || 1);
    const adminPrice = Number(item.admin_price ?? item.base_price ?? item.unit_price ?? 0);
    return sum + qty * adminPrice;
  }, 0);

  const defaultResellerPrice = items.reduce((sum, item) => {
    const qty = Number(item.qty || 1);
    const price = Number(item.reseller_price ?? item.selling_price ?? order.subtotal ?? 0);
    return sum + qty * price;
  }, 0);

  const supplierVendorPrice = adjustments?.supplier_vendor_price !== undefined
    ? Number(adjustments.supplier_vendor_price)
    : defaultSupplierPrice;

  const adminBasePrice = adjustments?.admin_base_price !== undefined
    ? Number(adjustments.admin_base_price)
    : (defaultAdminBasePrice > 0 ? defaultAdminBasePrice : defaultSupplierPrice);

  const resellerPrice = adjustments?.reseller_price !== undefined
    ? Number(adjustments.reseller_price)
    : (defaultResellerPrice > 0 ? defaultResellerPrice : Number(order.subtotal || 0));

  const customerShippingFee = adjustments?.customer_shipping_fee !== undefined
    ? Number(adjustments.customer_shipping_fee)
    : Number(order.shipping_fee || 0);

  // 3. Advance Payment Reconciliation
  const advanceAmount = Number(order.advance_amount || 0);
  const advanceStatus = order.advance_status || "none";
  const isAdvanceApproved = advanceStatus === "approved";

  // 4. Supplier Settlement (Supplier owes platform when has_own_delivery_account: true)
  let supplierOwesPlatform = 0;
  let platformOwesSupplier = 0;

  if (hasOwnDeliveryAccount) {
    if (courierCollectable <= 0 && supplierVendorPrice <= 0) {
      supplierOwesPlatform = 0;
      platformOwesSupplier = 0;
    } else {
      supplierOwesPlatform = Math.max(0, Math.round((courierNetToSupplier - supplierVendorPrice) * 100) / 100);
    }
  } else {
    platformOwesSupplier = Math.max(0, Math.round(supplierVendorPrice * 100) / 100);
  }

  // 5. Dropshipper Profit
  // Formula: Customer Collected - Admin Base Price - Customer Shipping Charge - Courier COD Fee
  let dropshipperProfit = 0;
  if (adjustments?.dropshipper_profit !== undefined) {
    dropshipperProfit = Number(adjustments.dropshipper_profit);
  } else if (courierCollectable <= 0 && (!isAdvanceApproved || advanceAmount <= 0)) {
    dropshipperProfit = 0;
  } else {
    dropshipperProfit = Math.max(
      0,
      Math.round((resellerPrice - adminBasePrice - courierCodFee) * 100) / 100
    );
  }

  // 6. Platform Net Profit
  // Platform Product Margin = Admin Base Price - Supplier Vendor Price
  // Platform Shipping Margin = Customer Shipping - Courier Delivery Fee
  const platformProductMargin = Math.round((adminBasePrice - supplierVendorPrice) * 100) / 100;
  const platformShippingMargin = Math.round((customerShippingFee - courierDeliveryFee) * 100) / 100;
  const platformNetProfit = Math.round((platformProductMargin + platformShippingMargin) * 100) / 100;

  // 7. Auto-balance verification
  const totalEntitled = Math.round((dropshipperProfit + platformNetProfit) * 100) / 100;
  const balanceDifference = courierCollectable <= 0
    ? 0
    : (hasOwnDeliveryAccount
        ? Math.round((supplierOwesPlatform - totalEntitled) * 100) / 100
        : 0);

  const isBalanced = courierCollectable <= 0 ? true : (Math.abs(balanceDifference) < 0.05);

  return {
    order_id: order.id,
    order_number: order.order_number,
    consignment_id: deliveryInfo.consignment_id || order.consignment_id || null,
    courier: {
      collectable_amount: courierCollectable,
      delivery_fee: courierDeliveryFee,
      cod_fee: courierCodFee,
      total_fee: Math.round((courierDeliveryFee + courierCodFee) * 100) / 100,
      fee_status: "settled_at_source",
      status_label: "CarryBee কর্তৃক পূর্বেই কর্তন ও নিষ্পত্তি সম্পন্ন (Pre-settled at source)",
      net_to_supplier: courierNetToSupplier,
      net_disbursed: courierNetToSupplier,
    },
    supplier: {
      vendor_id: vendor?.id || null,
      shop_name: vendor?.shop_name || "Unknown Shop",
      has_own_delivery_account: hasOwnDeliveryAccount,
      vendor_price: supplierVendorPrice,
      supplier_owes_platform: supplierOwesPlatform,
      platform_owes_supplier: platformOwesSupplier,
      is_settled: order.settlement_status?.vendor?.is_settled || false,
    },
    dropshipper: {
      user_id: order.user?.id || null,
      name: order.user?.name || "Dropshipper",
      phone: order.user?.phone || null,
      reseller_price: resellerPrice,
      admin_base_price: adminBasePrice,
      customer_shipping_fee: customerShippingFee,
      profit: dropshipperProfit,
      is_settled: order.settlement_status?.reseller?.is_settled || false,
    },
    advance: {
      amount: advanceAmount,
      status: advanceStatus,
      is_approved: isAdvanceApproved,
      trx_id: order.advance_trx_id || null,
      payment_method: order.advance_payment_method || null,
    },
    platform: {
      admin_base_price: adminBasePrice,
      supplier_vendor_price: supplierVendorPrice,
      product_margin: platformProductMargin,
      shipping_margin: platformShippingMargin,
      net_profit: platformNetProfit,
    },
    balance: {
      is_balanced: isBalanced,
      difference: balanceDifference,
      supplier_owes: supplierOwesPlatform,
      total_entitled: totalEntitled,
    },
  };
};

export const formatBDT = (amount) => {
  const num = Number(amount || 0);
  return `৳${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
