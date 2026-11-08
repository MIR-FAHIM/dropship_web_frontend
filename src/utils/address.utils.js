/**
 * Smartly appends selected Thana and District to an address string with comma separation.
 * - Prevents duplicate thana or district names.
 * - Gracefully strips previous thana/district if the user switched selections.
 * - Cleans up dangling commas and extra whitespace.
 *
 * @param {string} currentAddress - The user-typed address (e.g. "House 12, Road 4")
 * @param {string} thana - Selected Thana / Upazila name (e.g. "Mirpur" or "মিরপুর")
 * @param {string} district - Selected District name (e.g. "Dhaka" or "ঢাকা")
 * @param {string} [oldThana] - Previously selected Thana name (optional)
 * @param {string} [oldDistrict] - Previously selected District name (optional)
 * @returns {string} The formatted full address (e.g. "House 12, Road 4, Mirpur, Dhaka")
 */
export const appendLocationToAddress = (
  currentAddress,
  thana,
  district,
  oldThana = null,
  oldDistrict = null
) => {
  if (!currentAddress || typeof currentAddress !== "string") return "";
  let base = currentAddress.trim();
  if (!base) return "";

  const cleanThana = thana ? String(thana).trim() : "";
  const cleanDistrict = district ? String(district).trim() : "";

  // Desired suffix
  const parts = [cleanThana, cleanDistrict].filter(Boolean);
  if (parts.length === 0) return base;
  const suffix = parts.join(", ");

  // If already exactly ends with this suffix (case-insensitive), no changes needed
  if (base.toLowerCase().endsWith(suffix.toLowerCase())) {
    return base;
  }

  // Remove trailing commas/spaces from base
  base = base.replace(/[\s,]+$/, "");

  // Candidates to strip from the end of base before appending
  const candidatesToStrip = [
    oldDistrict,
    oldThana,
    cleanDistrict,
    cleanThana,
  ].filter(Boolean);

  for (const name of candidatesToStrip) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`[,\\s]+${escaped}\\s*$`, "i");
    if (regex.test(base)) {
      base = base.replace(regex, "").trim();
      base = base.replace(/[\s,]+$/, "").trim();
    }
  }

  return base ? `${base}, ${suffix}` : suffix;
};
