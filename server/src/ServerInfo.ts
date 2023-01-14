import path from "path";
import fs from "fs";

export interface Auth {
  user: string;
  pass: string;
}

export interface IServerInfo {
  smtp: {
    host: string;
    port: number;
    auth: Auth;
  },
  imap: {
    host: string;
    port: number;
    auth: Auth;
  },
}

export let serverInfo: IServerInfo;
const rawInfo: string = fs.readFileSync(path.join(__dirname, "../serverInfo.json"), 'utf8');
serverInfo = JSON.parse(rawInfo);
