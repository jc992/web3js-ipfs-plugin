import { createReadStream } from "fs";
import { UnixFS } from "@helia/unixfs";
/**
 * An abstraction for encapsulating helia IPFS operations.
 */
export class IpfsClient {
  private unixFsInstance?: UnixFS;
  private url: string;

  constructor(ipfsNetworkUrl: string) {
    this.url = ipfsNetworkUrl;
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
      if (!this.unixFsInstance) {
        await this.initUnixFSInstance();
      }

      const cid = await this.unixFsInstance?.addByteStream(
        data ?? createReadStream(filePath)
      );
      return cid?.toString() ?? "";
    } catch (e) {
      const err = e as Error;
      const msg = `error while uploading file: ${err.message}`;
      console.error(msg, err.stack);
      throw new Error(msg);
    }
  }

  /**
   * Spawns a UnixFS instance to be used for uploading files to IPFS. Since this is asynchronous behavior, we cannot do it in the class constructor.
   */
  private async initUnixFSInstance(): Promise<void> {
    try {
      /**
       * we do dynamic import in order for e2e tests to run properly, because of an issue with how the library is exposed.
       * issue: https://github.com/ipfs/helia/issues/149
       */
      const [
        { createHelia },
        { createLibp2p },
        { tcp },
        { noise },
        { yamux },
        { MemoryBlockstore },
        { MemoryDatastore },
        { unixfs },
      ] = await Promise.all([
        import("helia"),
        import("libp2p"),
        import("@libp2p/tcp"),
        import("@chainsafe/libp2p-noise"),
        import("@chainsafe/libp2p-yamux"),
        import("blockstore-core"),
        import("datastore-core"),
        import("@helia/unixfs"),
      ]);

      const datastore = new MemoryDatastore();
      const libp2p = await createLibp2p({
        addresses: {
          listen: [this.url],
        },
        transports: [tcp()],
        connectionEncryption: [noise()],
        streamMuxers: [yamux()],
        datastore,
      });

      const helia = await createHelia({
        libp2p,
        blockstore: new MemoryBlockstore(),
        datastore,
      });

      this.unixFsInstance = unixfs(helia);
    } catch (e) {
      console.error("error while initiating ipfs client: ", e);
    }
  }
}
