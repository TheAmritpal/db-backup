import { Auth, drive_v3, google } from "googleapis";
import { Readable } from "stream";

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

  async checkFolderByName(
    name: string,
    parentId?: string
  ): Promise<string | null | undefined> {
    if (!this.#drive) await this.initDrive();

    let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'me' in owners`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const folders = await this.#drive.files.list({
      q: query,
      fields: "files(id, name, owners)",
    });

    if (folders.status !== 200 || !folders.data.files) return null;
    return folders.data.files.length > 0 ? folders.data.files[0].id : null;
  }

  async checkFolderById(folderId: string): Promise<boolean | string | null | undefined> {
    if (!this.#drive) await this.initDrive();
    try {
      const folder = await this.#drive.files.get({
        fileId: folderId,
        fields: "id, owners",
      });
      if (folder.data.owners === undefined) return false;
      const isOwnedByMe = folder.data.owners.some((owner: any) => owner.me) as boolean;
      if (!isOwnedByMe) return false;
      return folder.data.id;
    } catch (error) {
      if ((error as any).code === 404) return false;
      throw error;
    }
  }

  async createFolder(folderName: string, parentId?: string): Promise<string> {
    try {
      if (!this.#drive) await this.initDrive();
      const file = await this.#drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: parentId ? [parentId] : undefined,
        },
        fields: "id",
      });
      if (!file.data.id) throw new Error("Folder not created");
      return file.data.id;
    } catch (error) {
      throw new Error("Unable to create folder");
    }
  }

  async listFilesInFolder(folderId: string): Promise<drive_v3.Schema$File[]> {
    if (!this.#drive) await this.initDrive();
    const res = await this.#drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      orderBy: "createdTime",
      fields: "files(id, name, createdTime)",
    });
    return res.data.files || [];
  }

  async deleteOldestFile(folderId: string, length: number) {
    const files = await this.listFilesInFolder(folderId);
    if (files.length > length) {
      const oldestFile = files[0];
      await this.#drive.files.delete({ fileId: oldestFile.id! });
      console.log(`Deleted old file: ${oldestFile.name}`);
    }
  }

  async uploadFile(folderId: string, fileName: string, stream: ReadableStream) {
    if (!this.#drive) await this.initDrive();

    const nodeStream = Readable.fromWeb(stream as any);

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: "application/sql",
      body: nodeStream,
    };

    const uploadedFile = await this.#drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name",
    });

    console.log(`Uploaded file: ${uploadedFile.data.name}`);
  }
}
