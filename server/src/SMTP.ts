import Mail from "nodemailer/lib/mailer";
import * as nodemailer from "nodemailer";
import { SendMailOptions, SentMessageInfo } from "nodemailer";
import { IServerInfo } from "./ServerInfo";

export class Worker {
  private static serverInfo: IServerInfo;

  constructor(serverInfo: IServerInfo) {
    Worker.serverInfo = serverInfo;
  }
  
  public sendMessage(options: SendMailOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const transport: Mail = nodemailer.createTransport(
        Worker.serverInfo.smtp
      );
      transport.sendMail(
        options,
        (error: Error | null, info: SentMessageInfo) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }
}
