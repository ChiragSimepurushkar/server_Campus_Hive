// sendgrid.js
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmailSG(to, subject, html, text='') {
  try {
    const msg = { to, from: process.env.EMAIL, subject, text, html };
    const res = await sgMail.send(msg);
    console.log('SendGrid response:', res[0].statusCode);
    return { success: true };
  } catch (err) {
    console.error('SendGrid error:', err);
    return { success: false, error: err };
  }
}
