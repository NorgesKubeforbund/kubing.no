import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const ContactForm = (props: {serviceID: string}) => {
  const [formStatus, setFormStatus] = useState('Send');

  const onSubmit = async (e: any) => {
    console.log(e);
    e.preventDefault();
    setFormStatus('Submitting...');
    const { contact_number, name, email, message } = e.target.elements;
    let conFom = {
      contact_number: contact_number.value = Math.random() * 100000 | 0,
      name: name.value,
      email: email.value,
      message: message.value,
    };
    //await sendEmailJS(conFom);
    alert('Epost levert!');
    setFormStatus('Submit');
  };

  const sendEmailJS = async (conFom: {
    contact_number: number;
    name: string;
    email: string;
    message: string;
  }) => {
    const emailJsData: {
      publicKey: string;
      serviceKey: string;
      templateKey: string;
    } = {
      publicKey: '0fO7DEII45daLxaZy' ,
      serviceKey: props.serviceID,
      templateKey: 'template_wydr8ym'
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
    <div>
      <h2>Ta kontakt med NKF her:</h2>
      <form onSubmit={onSubmit}>
        <div>
          <input className="form-control" type='hidden' id='contact_number' />
          <label className="form-label" htmlFor="name">
            Navn
          </label>
          <input className="form-control" type="text" id="name" required />
        </div>
        <div>
          <label className="form-label" htmlFor="email">
            Epost
          </label>
          <input className="form-control" type="email" id="email" required />
        </div>
        <div>
          <label className="form-label" htmlFor="message">
            Melding
          </label>
          <textarea className="form-control" id="message" required />
        </div>
        <button className="btn btn-danger" type="submit">
          {formStatus}
        </button>
      </form>
    </div>
  )
};
export default ContactForm;