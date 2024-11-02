const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

export const googleSheetsURLs = {
  OFFICIAL_RECORDS: `https://sheets.googleapis.com/v4/spreadsheets/1Azvglk7gcyK0ql8_LRPHwmj0KQBzl5wrpiiYVEn3Frc/values/NorskeRekorder?key=${GOOGLE_API_KEY}`,
  UNOFFICIAL_RECORDS: `https://sheets.googleapis.com/v4/spreadsheets/1q9KIGan5FFJs67WMmtvj5rZWiBPPmdZp6s8zIodlqEw/values/EXPORT?key=${GOOGLE_API_KEY}`,
  NON_WCA_RECORDS: `https://sheets.googleapis.com/v4/spreadsheets/1q9KIGan5FFJs67WMmtvj5rZWiBPPmdZp6s8zIodlqEw/values/Export2?key=${GOOGLE_API_KEY}`,
};
export const wcaURLs = {
  NORWEGIAN_COMPETITIONS:
    "https://www.worldcubeassociation.org/api/v0/competitions?country_iso2=NO",
};
export const brregURLs = {
  STYREMEDLEM:
    "https://data.brreg.no/enhetsregisteret/api/enheter/994663666/roller?beskrivelse=Styremedlem",
};