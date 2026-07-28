import { OrderCreated, User } from "@/types";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromDomain = process.env.RESEND_DOMAIN;

async function sendMail(email: string, subject: string, html: string) {
  // TODO: Handle errors
  await resend.emails.send({
    from: `Norges Kubeforbund <info@${fromDomain}>`,
    to: email,
    subject: subject,
    html: html,
  });
}

function htmlTemplate(content: string) {
  return `\
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f0f0f0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f0f0;">
        <tr>
            <td align="center" style="padding: 24px 12px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" class="content-table" style="width:600px; max-width:600px; background-color:#fcfcfc; font-family: Arial, Helvetica, sans-serif;">
                    <tr>
                        <td class="header" style="background-color:#282C34; padding: 16px;">
                            <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td width="120" valign="middle">
                                        <img src="https://kubing.no/android-chrome-384x384.png" alt="NKF Logo" width="120" height="120" style="display:block; width:120px; height:120px; border:0;" />
                                    </td>
                                    <td valign="middle" style="padding-left:16px;">
                                        <h1 style="margin:0; color:#ffffff; font-size: 24px; line-height:1.3;">Norges<br />Kubeforbund</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    ${content}
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

export async function sendMembershipConfirmation(user: User, order: OrderCreated) {
  const { name, email } = user;
  const { id: orderNumber, year } = order;
  const orderConfirmationHtml = `\
<tr>
  <td style="margin: 8px; padding: 16px; padding-bottom: 8px; color:#171717; font-size:14px; line-height:1.5;">
      <h2 style="margin-top:0;">Du er medlem i Norges Kubeforbund!</h2>
      <p>Kjære ${name},</p>
      <p>Dette er en bekreftelse på at du har betalt og er nå registrert som medlem
          i Norges Kubeforbund for året ${year}. Medlemskapet varer ut kalenderåret.
      </p>
      <p>Ditt referansenummer for betalingen er #${orderNumber}.</p>
      <p>Takk for at du bidrar til å støtte NFK!
      Vi ser frem til å ha deg som medlem og ønsker deg et hyggelig medlemskap hos NKF.</p>
      <p>Med vennlig hilsen,<br />Styret i Norges Kubeforbund</p>
      <br />
      <hr />
      <br />
      <h2>You are a member of Norges Kubeforbund!</h2>
      <p>Dear ${name},</p>
      <p>This is a confirmation of payment and you are now registered as a member
          of Norges Kubeforbund for the year ${year}. The membership lasts through the end of the calendar year.
      </p>
      <p>Your reference number for the payment is #${orderNumber}.</p>
      <p>Thank you for supporting NKF!
      We look forward to having you as a member and wish
      you a pleasant membership experience with NKF.</p>
      <p>Best regards,<br />Leadership of Norges Kubeforbund</p>
  </td>
</tr>`;
  const html = htmlTemplate(orderConfirmationHtml);
  await sendMail(email, `Bekreftelse på medlemskap hos Norges Kubeforbund ${year}`, html);
}
