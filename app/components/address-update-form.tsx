"use client";
import AddressForm from "@/app/components/address-form";
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
    <form className="flex flex-col gap-4 items-center" onSubmit={updateAddress}>
      <AddressForm setFieldsFilled={setFieldsFilled} />
      <input disabled={!fieldsFilled} type="submit" value="Oppdater adresse" className="self-center bg-gray-100 hover:bg-gray-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:text-gray-400 border rounded-md px-2 py-1 w-fit" />
    </form>
  )
}
