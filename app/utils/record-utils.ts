import { GoogleSheetsRecords, WCAEvent, WCARecord, WCAResponse } from "./response-types";

function padRecords(records: string[][]) {
  for (const row of records) {
    const toAdd = 5 - row.length;
    for (let i = 0; i < toAdd; i++) {
      row.push("");
    }
  }
}

export async function getUnofficialWCARecords(): Promise<string[][]> {
  const res = await fetch(
    String(process.env.REACT_APP_NORSKEREKORDERWCA_KEY),
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    return [];
  }
  const records = (await res.json() as GoogleSheetsRecords).values.slice(1);
  padRecords(records);
  return records;
}

export async function getUnofficialNonWCARecords(): Promise<string[][]> {
  const res = await fetch(
    String(process.env.REACT_APP_NORSKEREKORDERNONWCA_KEY),
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    return [];
  }
  const records = (await res.json() as GoogleSheetsRecords).values.slice(1);
  padRecords(records);
  return records;
}

async function getName(wcaId: string): Promise<string> {
  const res = await fetch(
    `https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/persons/${wcaId}.json`,
    { next: { revalidate: 3600 * 24 } }
  );
  if (!res.ok) {
    return "";
  }
  return (await res.json() as { name: string }).name;
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 6000);
  const seconds = Math.floor((time % 6000) / 100);
  const hundredths = time % 100;


  if (seconds < 1) {
    return `0.${String(hundredths).padStart(2, '0')}`
  }
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`
  }
  return `${seconds}.${String(hundredths).padStart(2, '0')}`
}

function formatMulti(best: number): string {
  const str = String(best).padStart(9, "0");
  const missed = parseInt(str.slice(-2), 10);
  const timeSeconds = parseInt(str.slice(-7, -2), 10);
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const dd = parseInt(str.slice(0, 2), 10);
  const difference = 99 - dd;
  const solved = difference + missed;
  const attempted = solved + missed;
  return `${solved}/${attempted} ${minutes}:${seconds}`;
}

function formatRecord(event: string, best: number, category: "single" | "average"): string {
  const bestStr = String(best);
  switch (event) {
    case "time":
      return formatTime(best);
    case "number":
      if (category === "single") {
        return bestStr;
      }
      return `${bestStr.substring(0, bestStr.length - 2)}.${bestStr.substring(bestStr.length - 2)}`
    case "multi":
      return formatMulti(best);
    default:
      return bestStr;
  }
}

async function getCategoryRecord(event: WCAEvent, category: "single" | "average"): Promise<string[]> {
  const res = await fetch(
    `https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/rank/NO/${category}/${event.id}.json`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    return ["", ""];
  }
  const record = (await res.json() as WCAResponse<WCARecord>).items[0];
  if (!record) {
    return ["", ""]
  }
  return [formatRecord(event.format, record.best, category), await getName(record.personId)]
}

async function getEventRecords(event: WCAEvent): Promise<string[]> {
  const singleRecord = await getCategoryRecord(event, "single");
  const averageRecord = await getCategoryRecord(event, "average");
  return [event.name, ...singleRecord, ...averageRecord];
}

export async function getWCARecords(): Promise<string[][]> {
  const res = await fetch(
    "https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/events.json",
    { next: { revalidate: 3600 * 24 } }
  );
  if (!res.ok) {
    return [];
  }

  const events = await res.json() as WCAResponse<WCAEvent>;
  const records = [];
  for (const event of events.items) {
    const eventRecords = await getEventRecords(event);
    if (eventRecords[1] === "" && eventRecords[3] === "") {
      continue
    }
    records.push(eventRecords);
  }
  return records;
}
