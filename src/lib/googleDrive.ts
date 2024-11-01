import { Auth, drive_v3, google } from "googleapis";

export class GoogleOAuth {
  #client: Auth.OAuth2Client;
  #drive!: drive_v3.Drive;
  #refresh_token!: string;
  constructor(
    CLIENT_ID: string,
    CLIENT_SECRET: string,
    REDIRECT_URI: string,
    REFRESH_TOKEN?: string
  ) {
    this.#client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    if (REFRESH_TOKEN) this.#refresh_token = REFRESH_TOKEN;
  }

  async init(access_token: string): Promise<Auth.Credentials> {
    try {
      const { tokens }: { tokens: Auth.Credentials } = await this.#client.getToken(
        access_token
      );
      return tokens;
    } catch (error) {
      throw error;
    }
  }

  async initDrive() {
    this.#client.setCredentials({ refresh_token: this.#refresh_token });
    this.#drive = google.drive({
      version: "v3",
      auth: this.#client,
    });
  }

  async uploadDatabase() {
    try {
      if (!this.#drive) await this.initDrive();
      const checkFolder = await this.#drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder'",
        fields: "nextPageToken, files(id, name)",
        spaces: "drive",
      });
      console.log("console.log(checkFolder);", checkFolder);
      // const response = await this.#drive.files.create;
    } catch (err) {
      console.log(err);
    }
  }
}
