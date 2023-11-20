import Web3, { EventLog, TransactionReceipt, Web3PluginBase } from "web3";
import { Web3Client } from "./clients/web3";
import { IpfsClient } from "./clients/ipfs";
/**
 * A Web3.js Plugin for uploading a provided local file to IPFS, and storing the CID
 * in a smart contract, as well as listing all stored CIDs of given ethereum address
 */
export class IpfsPlugin extends Web3PluginBase {
  public pluginNamespace = "ipfs";
  private web3Client: Web3Client;
  private ipfsClient: IpfsClient;

  constructor(web3: Web3) {
    super();
    // this.wallet()
    this.web3Client = new Web3Client(web3);
    this.ipfsClient = new IpfsClient();
  }

  /**
   * Uploads local files to IPFS and stores the generated CID on Ethereum.
   * `NOTE: /!\ if calling from web browser, use File System Access API to fetch data, and pass it in 2nd optional param, as implementation via filePath uses "fs" which is only supported in a Node environment. /!\`
   * @param {string} filePath local path of the file to upload.
   * @param {Iterable<Uint8Array>} data file as byte array. `/!\ use this optional param when calling this method from a web browser /!\`
   * @returns {TransactionReceipt} transaction receipt of the transaction that stored CID on Ethereum. If something goes wrong, an error is thrown for client to handle.
   */
  public async uploadFile(
    filePath: string,
    data?: Iterable<Uint8Array>
  ): Promise<TransactionReceipt> {
    try {
      const cid = await this.ipfsClient.uploadFile(filePath, data);
      return await this.web3Client.storeCID(cid);
    } catch (e) {
      throw new Error(`something went wrong: ${(e as Error).message}`);
    }
  }

  /**
   * List all CIDs for given Ethereum address.
   * @param {string} address public Ethereum address from which to list existing CIDStored events.
   * @returns {(string | EventLog)[][]} CIDStored event logs from contract. If something goes wrong, an error is thrown.
   */
  public async listAllByAddress(
    address: string
  ): Promise<(string | EventLog)[]> {
    try {
      return await this.web3Client.listCIDsForAddress(address);
    } catch (e) {
      throw new Error(
        `failed to fetch CIDs for address ${address}: ${(e as Error).message}`
      );
    }
  }
}

// Module Augmentation
declare module "web3" {
  interface Web3Context {
    ipfs: IpfsPlugin;
  }
}
