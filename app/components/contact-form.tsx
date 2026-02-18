"use client"

import { SubmitEvent, useState } from "react";
import emailjs from "@emailjs/browser";

function ContactForm({ serviceId }: { serviceId: string }) {
  const [delivered, setDelivered] = useState<boolean>(false);

  const onSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDelivered(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const conFom = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
      "reply-to": formData.get("email") as string,
    };

    await sendEmailJS(conFom);
    setTimeout(() => setDelivered(false), 2000);
  };

  const sendEmailJS = async (conFom: {
    name: string;
    email: string;
    message: string;
    "reply-to": string;
  }) => {
    const emailJsData: {
      publicKey: string;
      serviceKey: string;
      templateKey: string;
    } = {
      publicKey: "oqqA08Z3m_Pzaxz8L",
      serviceKey: serviceId,
      templateKey: "template_b4j4yyf",
    };
    emailjs.send(
      emailJsData.serviceKey,
      emailJsData.templateKey,
      conFom,
      emailJsData.publicKey
    ).then((result) => {
      console.log(result.text);
    }, (error) => {
      console.log(error.text);
      alert(error.text);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-3xl font-semibold">Ta kontakt med NKF her:</div>
      {delivered
        ? <p>Epost er levert</p>
        : <div className="flex flex-row justify-center w-full">
          <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2">
              <label htmlFor="name">
                Navn <span className="text-accent-text">*</span>
              </label>
              <div className="flex flex-row justify-center">
                <input
                  className="w-full max-w-96 border border-gray-400 rounded-md px-3 py-2"
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Ditt navn..."
                  autoComplete="name"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email">
                Epost <span className="text-accent-text">*</span>
              </label>
              <div className="flex flex-row justify-center">
                <input
                  className="w-full max-w-96 border border-gray-400 rounded-md px-3 py-2"
                  name="email"
                  type="email"
                  id="email"
                  placeholder="Din e-post..."
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="message">
                Melding <span className="text-accent-text">*</span>
              </label>
              <textarea className="w-full bg-transparen border border-gray-400 rounded-md px-3 py-2" name="message" id="message" placeholder="Melding..." rows={6} required />
            </div>
            <div className="flex flex-row justify-center">
              <button className="bg-gray-100 hover:bg-gray-400 cursor-pointer border rounded-md px-2 py-1 w-fit" type="submit">
                Send epost
              </button>
            </div>
          </form>
        </div>}
    </div>
  )
};

export default ContactForm;
