import { KartverketAddressResponse } from "@/types/responses";
import { Address, AddressValidation } from "@/types";
import { query } from "@/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAddress(addressObj: any): Promise<AddressValidation> {
  const addressText = addressObj.address;
  const postCode = addressObj.postCode;
  const postArea = addressObj.postArea;
  if (!addressText || !postCode || !postArea) {
    return {
      success: false,
      error: "invalid_input",
    };
  }
  const res = await fetch(`https://ws.geonorge.no/adresser/v1/sok?adressetekst=${addressText}&postnummer=${postCode}&poststed=${postArea}&fuzzy=false&utkoordsys=4258&treffPerSide=10&side=0&asciiKompatibel=true`,
    {
      headers: {
        "Accept": "application/json",
      },
    }
  );
  if (!res.ok) {
    return {
      success: false,
      error: "api_failure",
    };
  }
  const json = await res.json() as KartverketAddressResponse;
  if (json.adresser.length === 0 || json.adresser.length > 1) {
    return {
      success: false,
      error: "inconclusive",
    };
  }
  const foundAddress = json.adresser[0];
  const address = {
    address: foundAddress.adressetekst,
    postCode: foundAddress.postnummer,
    postArea: foundAddress.poststed,
  };
  return {
    success: true,
    address,
  };
}

export async function updateAddress(userId: number, address: Address): Promise<boolean> {
  const res = await query(`
    UPDATE users
    SET address = $1, post_code = $2, post_area = $3
    WHERE id = $4
    `,
    [
      address.address,
      address.postCode,
      address.postArea,
      userId,
    ]
  )
  return res.rowCount !== null && res.rowCount > 0;
}
