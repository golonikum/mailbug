import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";
import { serverInfo } from "./ServerInfo";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./contacts";
import { IContact } from "./contacts";

const app: Express = express();
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "../../client/dist")));
app.use(function (request: Request, response: Response, next: NextFunction) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  next();
});

app.get("/mailboxes", async (req: Request, res: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
    res.json(mailboxes);
  } catch (err) {
    res.send(err);
  }
});

app.get("/mailboxes/:mailbox", async (req: Request, res: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    const messages: IMAP.IMessage[] = await imapWorker.listMessages({
      mailbox: req.params.mailbox,
    });
    res.json(messages);
  } catch (err) {
    res.send(err);
  }
});

app.get("/mailboxes/:mailbox/:id", async (req: Request, res: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    const messageBody: string | undefined = await imapWorker.getMessageBody({
      mailbox: req.params.mailbox,
      id: parseInt(req.params.id, 10),
    });
    res.json(messageBody);
  } catch (err) {
    res.send(err);
  }
});

app.delete("/mailboxes/:mailbox/:id", async (req: Request, res: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    await imapWorker.deleteMessage({
      mailbox: req.params.mailbox,
      id: parseInt(req.params.id, 10),
    });
    res.send("ok");
  } catch (err) {
    res.send(err);
  }
});

app.post("/messages", async (req: Request, res: Response) => {
  try {
    const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
    await smtpWorker.sendMessage(req.body);
    res.send("ok");
  } catch (err) {
    res.send(err);
  }
});

app.get("/contacts", async (req: Request, res: Response) => {
  try {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();
    const contacts: IContact[] = await contactsWorker.listContacts();
    res.json(contacts);
  } catch (err) {
    res.send(err);
  }
});

app.post("/contacts", async (req: Request, res: Response) => {
  try {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();
    const contact: IContact = await contactsWorker.addContact(req.body);
    res.json(contact);
  } catch (err) {
    res.send(err);
  }
});

app.delete("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();
    await contactsWorker.deleteContact(req.params.id);
    res.send("ok");
  } catch (err) {
    res.send(err);
  }
});
