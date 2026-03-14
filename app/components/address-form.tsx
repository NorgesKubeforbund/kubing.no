"use client";

import { MouseEvent, useEffect, useRef, useState } from "react"
import { KartverketAddressResponse } from "../utils/response-types";

export default function AddressForm({ setFieldsFilled }: { setFieldsFilled: (fieldsFilled: boolean) => void }) {
  const [addressSearch, setAddressSearch] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [postCode, setPostCode] = useState<string>("");
  const [postArea, setPostArea] = useState<string>("");
  const [addresses, setAddresses] = useState<KartverketAddressResponse | null>(null);
  const hasSelectedRef = useRef<boolean>(false);

  useEffect(() => {
    if (hasSelectedRef.current) {
      return;
    }
    if (addressSearch.trim() === "") {
      return;
    }
    const getAddresses = setTimeout(async () => {
      const res = await fetch(`https://ws.geonorge.no/adresser/v1/sok?sok=${addressSearch}*&fuzzy=false&utkoordsys=4258&treffPerSide=10&side=0&asciiKompatibel=true`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );
      if (!res.ok) {
        alert("Noe gikk galt...");
        return;
      }
      setAddresses(await res.json() as KartverketAddressResponse);
    }, 500);
    return () => clearTimeout(getAddresses)
  }, [addressSearch]);

  function selectAddress(e: MouseEvent<HTMLButtonElement>, index: number) {
    e.preventDefault();
    if (!addresses || index >= addresses.adresser.length) {
      return;
    }
    const selected = addresses.adresser[index];
    setAddressSearch("");
    setAddress(selected.adressetekst);
    setPostCode(selected.postnummer);
    setPostArea(selected.poststed);
    setAddresses(null);
    setFieldsFilled(true);
    hasSelectedRef.current = true;
  }

  return (
    <>
      <input className="w-full max-w-96 border border-gray-400 rounded-md px-3 py-2" type="text" value={addressSearch} placeholder="Adressesøk" onChange={(v) => { hasSelectedRef.current = false; setAddressSearch(v.target.value); setAddresses(null); }} />
      <input className="w-full max-w-96 border border-gray-400 rounded-md px-3 py-2 cursor-not-allowed" type="text" value={address} readOnly placeholder="Adresse" name="address" />
      <input className="w-full max-w-96 border border-gray-400 rounded-md px-3 py-2 cursor-not-allowed" type="text" value={postCode} readOnly placeholder="Postnummer" name="postCode" />
      <input className="w-full max-w-96 border border-gray-400 rounded-md px-3 py-2 cursor-not-allowed" type="text" value={postArea} readOnly placeholder="Poststed" name="postArea" />
      {
        addresses &&
        <div className="text-sm translate-y-12 absolute rounded-xl border-4 bg-background lg:border-2 border-black p-4 z-50 shadow-mdk">
          {addresses.adresser.length > 0 ?
            <div className="flex flex-col gap-2">
              {addresses.adresser.map((option, index) =>
                <button
                  className="bg-gray-100 hover:bg-gray-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:text-gray-400 border rounded-md px-2 py-1 w-fit"
                  onClick={(e) => selectAddress(e, index)}
                  key={`${option.adressetekst}-${option.postnummer}-${option.poststed}`}
                >
                  {option.adressetekst}, {option.postnummer} {option.poststed}
                </button>
              )}
            </div>
            :
            <div>
              Fant ingen adresser som passet søket...
            </div>}
        </div>
      }
    </>
  )
}
