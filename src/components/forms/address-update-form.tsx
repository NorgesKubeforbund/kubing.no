"use client";

import AddressForm from "@/components/forms/address-form";
import { SubmitEvent, useState } from "react";

export default function AddressUpdateForm() {
  const [fieldsFilled, setFieldsFilled] = useState<boolean>(false);
  async function updateAddress(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldsFilled(false);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const address = formData.get("address");
    const postCode = formData.get("postCode");
    const postArea = formData.get("postArea");
    const body = {
      address: {
        address: address,
        postCode: postCode,
        postArea: postArea,
      }
    };
    const res = await fetch("/api/user/address",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      alert("Noe gikk galt");
      return;
    }
    alert("Addresse endret");
    window.location.reload()
  }
  return (
    <form
      className="flex w-full max-w-xl flex-col gap-5 self-center rounded-lg border border-neutral-300 bg-white p-4 sm:p-5"
      onSubmit={updateAddress}
    >
      <AddressForm setFieldsFilled={setFieldsFilled} />
      <input
        disabled={!fieldsFilled}
        type="submit"
        value="Oppdater adresse"
        className="w-full cursor-pointer rounded-lg bg-link-text px-4 py-2.5 text-white transition-colors hover:bg-link-text/85 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 disabled:hover:bg-neutral-100"
      />
    </form>
  )
}
