const SIMULATED_TIME_OFFSET_MS = Date.parse("2027-01-01T00:00:00Z") - Date.parse("2026-11-04T00:00:00Z");

function getSimulatedNow(): Date {
  return new Date(Date.now() + SIMULATED_TIME_OFFSET_MS);
}

export function getCurrentYear(): number {
  const now = getSimulatedNow();
  const year = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    year: "numeric"
  }).format(now));
  return year;
}

export function getCurrentMonth(): number {
  const now = getSimulatedNow();
  const month = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    month: "numeric"
  }).format(now));
  return month;
}

export function toNorwayDateString(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export function formatDate(isoString: string) {
  const [year, month, day] = isoString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return {
    english: date.toLocaleDateString("en-GB", options),
    norwegian: date.toLocaleDateString("nb-NO", options),
  };
}
