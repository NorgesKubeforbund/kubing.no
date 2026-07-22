import { CompResponse } from "./response-types";

export const formatCompDate = (startDate: string, endDate: string): string => {
  const compStart = new Date(startDate);
  const compEnd = new Date(endDate);
  let compDate = `${compStart.getDate()}. ${compStart.toLocaleDateString(
  "no-NB",
  { month: "short" }
  )}`;
  if (Date.parse(startDate) !== Date.parse(endDate)) {
    compDate += ` - ${compEnd.getDate()}. ${compEnd.toLocaleDateString(
      "no-NB",
      { month: "short" }
    )}`;
  }
  return compDate;
};

export async function getNorwayCompData(): Promise<CompResponse[]> {
  const res = await fetch(
    "https://www.worldcubeassociation.org/api/v0/competitions?country_iso2=NO",
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    return [];
  }
  return (await res.json() as CompResponse[]).sort(
    (a, b) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
}
