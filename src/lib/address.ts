import { KartverketAddressResponse } from "@/types/responses";
import { Address } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAddress(addressObj: any): Promise<Address> {
  const address = addressObj.address;
  const postCode = addressObj.postCode;
  const postArea = addressObj.postArea;
  if (!address || !postCode || !postArea) {
    throw new Error("Not all address parameters where found in body.");
  }
  const res = await fetch(`https://ws.geonorge.no/adresser/v1/sok?adressetekst=${address}&postnummer=${postCode}&poststed=${postArea}&fuzzy=false&utkoordsys=4258&treffPerSide=10&side=0&asciiKompatibel=true`,
    {
      headers: {
        "Accept": "application/json",
      },
    }
  );
  if (!res.ok) {
    throw new Error("Address API failed.");
  }
  const json = await res.json() as KartverketAddressResponse;
  if (json.adresser.length === 0 || json.adresser.length > 1) {
    throw new Error("Either 0 or more than 1 address was found.");
  }
  const foundAddress = json.adresser[0];
  return { address: foundAddress.adressetekst, postCode: foundAddress.postnummer, postArea: foundAddress.poststed };
}
