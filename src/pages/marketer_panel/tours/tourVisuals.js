// Cover photos for the tour milestones (same photos as the Partner Portal demo).
// Keyed by the milestone ids in the API's config('marketer.tours') / config('marketer.global_tours').
const u = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const TOUR_COVERS = {
  "TOUR-1": u("1608958435020-e8a7109ba809"), // Sajek valley hills
  "TOUR-2": u("1507525428034-b723cf961d3e"), // Cox's Bazar beach
  "TOUR-3": u("1544735716-392fe2489ffa"),    // Darjeeling + Sikkim mountains
};

export const GLOBAL_COVERS = {
  kashmir: u("1595815771614-ade9d652a65d", 600),
  thailand: u("1552465011-b4e21bf6e79a", 600),
  indonesia: u("1537996194471-e657df975ab4", 600),
  turkey: u("1641128324972-af3212f0f6bd", 600),
  umrah: u("1591604129939-f1efa4d9f7fa", 600),
};

// Shown when a photo can't load.
export const FALLBACK_GRADIENTS = [
  "from-teal-500 to-emerald-600",
  "from-sky-500 to-indigo-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-fuchsia-600",
  "from-violet-500 to-purple-700",
];
