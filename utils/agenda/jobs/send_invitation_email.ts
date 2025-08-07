import { Agenda } from 'agenda';
import nodemailer from 'nodemailer';

interface SendInvitationEmailJob {
  to: string;
  subject: string;
  html: string;
}

const sendInvitationEmail = (agenda: Agenda) => {
  agenda.define('send invitation email', async (job) => {
    const { to, subject, html } = job.attrs.data as SendInvitationEmailJob;

    // Nodemailer configuration - Make sure these are set in your environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '465', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED === 'false', // Disables certificate verification
      },
    });

    try {
      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending invitation email:', error);
      // You might want to re-throw or handle the error appropriately
      throw new Error('Failed to send invitation email');
    }
  });
};

export default sendInvitationEmail;