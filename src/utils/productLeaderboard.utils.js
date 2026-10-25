export const getLeaderboardDateRange = (period, now = new Date()) => {
  if (period === "all") return {};

  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  let start = today;

  if (period === "week") {
    // Use calendar-day arithmetic after resolving the business-local date.
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 6);
    start = date.toISOString().slice(0, 10);
  } else if (period === "month") {
    start = `${parts.year}-${parts.month}-01`;
  }

  return { start_date: start, end_date: today };
};

export const validateLeaderboardDates = ({ start_date, end_date }) => {
  if (!start_date || !end_date) return "Select both a start date and an end date.";
  const validDates = [start_date, end_date].every((value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  });
  if (!validDates) return "Enter valid dates in YYYY-MM-DD format.";
  if (end_date < start_date) return "End date must be on or after the start date.";
  return "";
};
