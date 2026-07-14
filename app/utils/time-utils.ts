export function getCurrentYear(): number {
  const now = new Date();
  const year = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    year: "numeric"
  }).format(now));
  return year;
}
