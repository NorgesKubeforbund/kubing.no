"use client";

import { useEffect, useRef, useState } from "react"
import { InfoIcon, SearchIcon, XIcon } from "lucide-react";
import { KartverketAddressResponse } from "@/types/responses";

export default function AddressForm({
  setFieldsFilled,
  disabled = false,
}: {
  setFieldsFilled: (fieldsFilled: boolean) => void;
  disabled?: boolean;
}) {
  const [addressSearch, setAddressSearch] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [postCode, setPostCode] = useState<string>("");
  const [postArea, setPostArea] = useState<string>("");
  const [addresses, setAddresses] = useState<KartverketAddressResponse | null>(null);
  const [showSearchHint, setShowSearchHint] = useState<boolean>(false);
  const hasSelectedRef = useRef<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasSelectedRef.current) {
      return;
    }
    if (addressSearch.trim() === "") {
      return;
    }
    const controller = new AbortController();
    const getAddresses = setTimeout(async () => {
      try {
        const query = encodeURIComponent(`${addressSearch.trim()}*`);
        const res = await fetch(`https://ws.geonorge.no/adresser/v1/sok?sok=${query}&fuzzy=false&utkoordsys=4258&treffPerSide=10&side=0&asciiKompatibel=true`,
          {
            headers: {
              "Accept": "application/json",
            },
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          alert("Noe gikk galt...");
          return;
        }
        setAddresses(await res.json() as KartverketAddressResponse);
      } catch (e) {
        if (controller.signal.aborted) {
          return;
        }
        console.error(e);
        alert("Noe gikk galt...");
      }
    }, 500);
    return () => {
      clearTimeout(getAddresses);
      controller.abort();
    };
  }, [addressSearch]);

  function onSearchChange(value: string) {
    hasSelectedRef.current = false;
    setAddressSearch(value);
    setAddresses(null);
    if (address !== "") {
      setAddress("");
      setPostCode("");
      setPostArea("");
      setFieldsFilled(false);
    }
  }

  function selectAddress(index: number) {
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

  const readOnlyInputProps = {
    readOnly: true,
    tabIndex: -1,
    onFocus: () => setShowSearchHint(address === ""),
    onBlur: () => setShowSearchHint(false),
    className: "w-full rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2.5 text-neutral-700 cursor-not-allowed focus:outline-none",
  };

  return (
    <fieldset disabled={disabled} className="flex w-full min-w-0 max-w-xl flex-col gap-4 text-left transition-opacity disabled:opacity-50">
      <div className="relative">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-500">Søk etter adresse</span>
          <span className="relative block">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              ref={searchInputRef}
              className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-11 transition-colors hover:border-neutral-500 focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:hover:border-neutral-300"
              type="text"
              value={addressSearch}
              autoComplete="off"
              onChange={(v) => onSearchChange(v.target.value)}
            />
            {addressSearch !== "" &&
              <button
                type="button"
                aria-label="Tøm søk"
                onClick={() => {
                  onSearchChange("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:bg-neutral-100 focus-visible:text-neutral-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            }
          </span>
        </label>
        {addresses &&
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
            {addresses.adresser.length > 0 ?
              <div className="flex flex-col divide-y divide-neutral-100">
                {addresses.adresser.map((option, index) =>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer flex-col px-4 py-2.5 text-left transition-colors hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                    onClick={() => selectAddress(index)}
                    key={`${option.adressetekst}-${option.postnummer}-${option.poststed}`}
                  >
                    <span>{option.adressetekst}</span>
                    <span className="text-sm text-neutral-500">{option.postnummer} {option.poststed}</span>
                  </button>
                )}
              </div>
              :
              <div className="px-4 py-3 text-sm text-neutral-500">
                Fant ingen adresser som passet søket...
              </div>}
          </div>
        }
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-500">Adresse</span>
        <input type="text" value={address} {...readOnlyInputProps} name="address" />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_3fr] sm:gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-500">Postnummer</span>
          <input type="text" value={postCode} {...readOnlyInputProps} name="postCode" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-500">Poststed</span>
          <input type="text" value={postArea} {...readOnlyInputProps} name="postArea" />
        </label>
      </div>
      {showSearchHint &&
        <div role="status" className="flex gap-3 rounded-lg bg-neutral-100 p-3 text-sm text-neutral-800">
          <InfoIcon className="h-5 w-5 shrink-0" />
          <p>Disse feltene fylles ut automatisk. Søk etter adressen din i søkefeltet over og velg den fra listen.</p>
        </div>
      }
    </fieldset>
  )
}
