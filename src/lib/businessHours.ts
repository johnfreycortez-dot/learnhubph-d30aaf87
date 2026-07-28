// Live support availability window: Mon–Fri, 9:00am–9:00pm, Philippine time
// specifically — not the visitor's local browser timezone. We read the
// current weekday/hour in Asia/Manila via Intl.DateTimeFormat so this is
// correct regardless of where the visitor is physically browsing from.
export function isLiveSupportOpen(): boolean {
  const now = new Date();

  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "short",
  }).format(now);

  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      hour12: false,
    }).format(now),
  );

  const isWeekday = !["Sat", "Sun"].includes(weekday);
  // 9pm (21:00) is exclusive — closes at 21:00, not 21:59.
  const isWithinHours = hour >= 9 && hour < 21;

  return isWeekday && isWithinHours;
}
