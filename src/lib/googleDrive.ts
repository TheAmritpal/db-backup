import { Auth, drive_v3, google } from "googleapis";

export class GoogleOAuth {
  #client: Auth.OAuth2Client;
  #drive: drive_v3.Drive;
  constructor(
    CLIENT_ID: string,
    CLIENT_SECRET: string,
    REDIRECT_URI: string,
    ACCESS_TOKEN: string
  ) {
    this.#client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    this.init(ACCESS_TOKEN);
  }

  async init(
    ACCESS_TOKEN: string
  ) {
    const { tokens } = await this.#client.getToken(ACCESS_TOKEN);
    this.#client.setCredentials({ refresh_token: tokens.refresh_token });
    this.#drive = google.drive({
      version: "v3",
      auth: this.#client,
    });
  }

  async uploadDatabase() {
    try {
      const checkFolder = await this.#drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder'",
        fields: "nextPageToken, files(id, name)",
        spaces: "drive",
      });
      console.log(checkFolder);
      // const response = await this.#drive.files.create
    } catch (err) {
      console.log(err);
    }
  }
}
