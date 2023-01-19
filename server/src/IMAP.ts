import ImapClient from "emailjs-imap-client";
import { ParsedMail, simpleParser } from "mailparser";
import { IServerInfo } from "./ServerInfo";

export interface ICallOptions {
  mailbox: string;
  id?: number;
}

export interface IMessage {
  id: string;
  date: string;
  from: string;
  subject: string;
  body?: string;
}

export interface IMailbox {
  name: string;
  path: string;
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export class Worker {
  private static serverInfo: IServerInfo;

  constructor(serverInfo: IServerInfo) {
    Worker.serverInfo = serverInfo;
  }

  private async connectToServer(): Promise<any> {
    const { host, port, auth } = Worker.serverInfo.imap;
    const client: any = new ImapClient.default(host, port, { auth });
    client.logLevel = client.LOG_LEVEL_NONE;
    client.onerror = (error: Error) => {
      console.log("IMAP.Worker.connectToServer(): Connection error", error);
    };
    await client.connect();
    return client;
  }

  public async listMailboxes(): Promise<IMailbox[]> {
    const client: any = await this.connectToServer();
    const mailboxes: any = await client.listMailboxes();
    await client.close();
    const finalMailboxes: IMailbox[] = [];
    const iterateChildren = (children: any[]): void => {
      children.forEach((mailbox: any) => {
        finalMailboxes.push({
          name: mailbox.name,
          path: mailbox.path,
        });
        iterateChildren(mailbox.children);
      });
    };
    iterateChildren(mailboxes.children);
    return finalMailboxes;
  }

  public async listMessages(callOptions: ICallOptions): Promise<IMessage[]> {
    const client: any = await this.connectToServer();
    const mailbox: any = await client.selectMailbox(callOptions.mailbox);
    if (mailbox.exists === 0) {
      await client.close();
      return [];
    }
    const messages: any[] = await client.listMessages(
      callOptions.mailbox,
      "1:*",
      ["uid", "envelope"]
    );
    await client.close();
    const finalMessages: IMessage[] = [];
    messages.forEach((message: any) => {
      finalMessages.push({
        id: message.uid,
        date: message.envelope.date,
        from: message.envelope.from[0].address,
        subject: message.envelope.subject,
      });
    });
    return finalMessages;
  }

  public async getMessageBody(callOptions: ICallOptions): Promise<string | undefined> {
    const client: any = await this.connectToServer();
    const messages: any[] = await client.listMessages(
      callOptions.mailbox,
      callOptions.id,
      ["body[]"],
      { byUid: true }
    );
    const parsed: ParsedMail = await simpleParser(messages[0]["body[]"]);
    await client.close();
    return parsed.text;
  }

  public async deleteMessage(callOptions: ICallOptions): Promise<void> {
    const client: any = await this.connectToServer();
    await client.deleteMessage(callOptions.mailbox, callOptions.id, { byUid: true });
    await client.close();
  }
}
