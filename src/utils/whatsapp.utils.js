export const formatWhatsAppUrl = (phone) => {
  if (!phone) return null;
  let cleanNumber = String(phone).replace(/[^0-9]/g, "");
  if (!cleanNumber) return null;
  if (cleanNumber.length === 11 && cleanNumber.startsWith("01")) {
    cleanNumber = "88" + cleanNumber;
  } else if (cleanNumber.length === 10 && cleanNumber.startsWith("1")) {
    cleanNumber = "880" + cleanNumber;
  }
  return `https://wa.me/${cleanNumber}`;
};
