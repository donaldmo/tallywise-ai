import { Agenda } from "agenda";


enum EmailType {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
}

export default function sendEmail(agenda: Agenda) {
  agenda.define("send_email", async (job, done) => {
    // const {  email } = job.attrs.data;

    console.log("::job: send_email started");
    try {
      // TODO: 
      // Here you would typically send an email using a service like SendGrid, Nodemailer, etc.

    } catch (err) {
      console.log("::job: send_email failed", err);
    } finally {
      done();
    }
  });
}