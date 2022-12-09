import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import "./ContactForm.css";

const ContactForm = (props: {serviceID: string}) => {
  const [delivered, setDelivered] = useState<boolean>(false);

  const onSubmit = async (e: any) => {
    console.log(e);
    e.preventDefault();
    setDelivered(true);
    const { contact_number, name, email, message } = e.target.elements;
    let conFom = {
      contact_number: contact_number.value = Math.random() * 100000 | 0,
      name: name.value,
      email: email.value,
      message: message.value,
      'reply-to': email.value,
    };
    //await sendEmailJS(conFom);
   setTimeout(() => setDelivered(false), 2000);
  };

  const sendEmailJS = async (conFom: {
    contact_number: number;
    name: string;
    email: string;
    message: string;
    'reply-to': string;
  }) => {
    const emailJsData: {
      publicKey: string;
      serviceKey: string;
      templateKey: string;
    } = {
      publicKey: 'oqqA08Z3m_Pzaxz8L',
      serviceKey: props.serviceID,
      templateKey: 'template_b4j4yyf',
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

  const formDisplay = () => {
    return (
      <form onSubmit={onSubmit} className="ContactForm">
        <div>
          <input className="form-control" type='hidden' id='contact_number' />
          <label className="form-label" htmlFor="name">
            Navn <span className="star">*</span>
          </label>
          <br></br>
          <input className="form-control" type="text" id="name" placeholder="Ola Normann" required />
        </div>
        <div>
          <label className="form-label" htmlFor="email">
            Epost <span className="star">*</span>
          </label>
          <br></br>
          <input className="form-control" type="email" id="email" placeholder="example@example.com" required />
        </div>
        <div>
          <label className="form-label" htmlFor="message">
            Melding <span className="star">*</span>
          </label>
          <br></br>
          <textarea className="form-control form-control-message" id="message" placeholder="din melding her" required />
        </div>
        <button className="btn btn-danger" type="submit">
          Send Mail
        </button>
      </form>
    )
  }

  return (
    <div>
      <h2>Ta kontakt med NKF her:</h2>
      {delivered ? <p>Epost er levert</p> : formDisplay()}
      
    </div>
  )
};

export default ContactForm;
