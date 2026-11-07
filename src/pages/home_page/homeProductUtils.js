import { imgBaseUrl } from "../../../config";

export const formatProductNumber = new Intl.NumberFormat("bn-BD").format;

export function productImageUrl(fileName) {
  if (typeof fileName !== "string") return null;
  const file = fileName.trim();
  if (!file || /^\d+$/.test(file)) return null;

  try {
    const path = file.startsWith("/storage/") ? file : file.replace(/^\/+/, "");
    const url = new URL(path, `${imgBaseUrl.replace(/\/+$/, "")}/`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.pathname = url.pathname
      .replace("/storage/app/uploads/", "/storage/app/public/uploads/")
      .replace("/storage/app/public/public/", "/storage/app/public/");
    return url.href;
  } catch {
    return null;
  }
}
