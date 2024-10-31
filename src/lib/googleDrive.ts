import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2();

export class GoogleOAuth {
  client: OAuth2Client;
  constructor() {
    this.client = new google.auth.OAuth2();
  }

  get drizzle(): MySql2Database<typeof schema> {
    return this.db;
  }
}
