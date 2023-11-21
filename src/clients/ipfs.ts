import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { isBrowserEnvironment } from "../utils/functions";

type ThirdWebConfigBase = {
  secretKey?: string;
  clientId?: string;
};

export type ThirdWebConfig = ThirdWebConfigBase &
  (
    | { secretKey: string; clientId?: never }
    | { clientId: string; secretKey?: never }
  );

/**
 * An abstraction for encapsulating helia IPFS operations.
 */
export class IpfsClient {
  private storage: ThirdwebStorage;

  constructor({ secretKey, clientId }: ThirdWebConfig) {
    this.storage = secretKey
      ? new ThirdwebStorage({ secretKey })
      : new ThirdwebStorage({ clientId });
  }

  /**
   * Uploads local files to IPFS.
   * `NOTE: /!\ if calling from web browser, use File System Access API to fetch data, and pass it in 2nd optional param, as implementation via filePath uses "fs" which is only supported in a Node environment. /!\`
   * @param {string} filePath local path of the file to upload.
   * @param {Iterable<Uint8Array>} data file as byte array. `/!\ use this optional param when calling this method from a web browser /!\`
   * @returns {string} generated CID from uploaded file. If an error is thrown, returns an empty string.
   */
  public async uploadFile(
    filePath: string,
    data?: Iterable<Uint8Array>
  ): Promise<string> {
    try {
      let fileBuffer: Buffer;
      if (!isBrowserEnvironment()) {
        // we dynamically import "fs" node lib if we are not in a browser environment, so implementation doesn't conflict with
        // a client calling this from a web browser.
        const { readFileSync } = await import("fs");
        fileBuffer = readFileSync(filePath);
        return await this.storage.upload(fileBuffer);
      }

      if (isBrowserEnvironment() && !data)
        throw new Error("please provide data to be uploaded.");

      return await this.storage.upload(data);
    } catch (e) {
      throw e as Error;
    }
  }
}
