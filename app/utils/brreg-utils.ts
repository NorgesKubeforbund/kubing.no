import { BrregResponse } from "./response-types";

export async function getBrregData(): Promise<BrregResponse[]> {
  const res = await fetch(
    "https://data.brreg.no/enhetsregisteret/api/enheter/994663666/roller?beskrivelse=Styremedlem",
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    return [];
  }
  return (await res.json()).rollegrupper[0].roller as BrregResponse[];
}
