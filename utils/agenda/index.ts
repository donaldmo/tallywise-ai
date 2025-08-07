import { Agenda } from "agenda";
import sendEmail from "./jobs/send_email";
import sendInvitationEmail from "./jobs/send_invitation_email";

const mongoConnectionString = process.env.MONGODB_URI;

if (!mongoConnectionString) {
  throw new Error("MONGODB_URI is not defined");
}

export const initAgenda = async (): Promise<Agenda> => {
  const agenda = new Agenda({ db: { address: mongoConnectionString } });

  /**
   * Agenda Job Definitions
   */
  sendEmail(agenda);
  sendInvitationEmail(agenda); // Add the new invitation email job

  /**
   * Start Agenda if there are jobs
   */
  await agenda.start();
  console.log("✅ Agenda started");

  return agenda;
};