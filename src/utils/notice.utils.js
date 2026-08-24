export const noticePriorityClass = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  normal: "bg-blue-50 text-blue-700 border-blue-100",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

export const getNoticePayload = (response) => response?.data?.data || response?.data || response || {};

export const getNoticeList = (response) => {
  const payload = getNoticePayload(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.notices)) return payload.notices;
  if (Array.isArray(payload.data?.data)) return payload.data.data;
  return [];
};

export const formatNoticeDate = (value) => {
  if (!value) return "";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatNoticeLabel = (value) =>
  String(value || "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  const data = error?.data || error;
  if (data?.message) return data.message;

  const errors = data?.errors;
  if (errors && typeof errors === "object") {
    const firstError = Object.values(errors).flat().find(Boolean);
    if (firstError) return String(firstError);
  }

  return fallback;
};
