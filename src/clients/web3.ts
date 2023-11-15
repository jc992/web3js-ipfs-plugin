import Web3, { Contract, EventLog, TransactionReceipt } from "web3";
import { REGISTRY_CONTRACT_ABI } from "../utils/constants";
/**
 * An abstraction for encapsulating Web3.js calls.
 */
export class Web3Client {
  private readonly BLOCK_NUMBER_THRESHOLD = BigInt(49999);
  private readonly REGISTRY_ADDRESS =
    "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB";
  private web3: Web3;
  private registryContract: Contract<typeof REGISTRY_CONTRACT_ABI>;

  constructor(web3: Web3) {
    this.web3 = web3;
    this.registryContract = new web3.eth.Contract(
      REGISTRY_CONTRACT_ABI,
      this.REGISTRY_ADDRESS,
      web3.getContextObject()
    );
  }

  /**
   * Stores a CID on Ethereum.
   * @param {string} cid CID to be stored on Ethereum.
   * @returns {TransactionReceipt} transaction receipt of the transaction that stored CID on Ethereum. If something goes wrong, an error is thrown.
   */
  public async storeCID(cid: string): Promise<TransactionReceipt> {
    try {
      const account = this.web3.eth.wallet?.get(0);
      const from = account?.address;
      const contractCall = this.registryContract.methods.store(cid);

      const gas = String(await contractCall.estimateGas({ from }));
      const transactionReceipt = await contractCall.send({ gas, from });

      return transactionReceipt;
    } catch (e) {
      throw new Error((e as Error).message);
    }
  }

  /**
   * List all CIDs for given Ethereum address.
   * A limitation on Web3.js lib makes it so only data from the most recent 50000 blocks can be retrieved.
   * @param {string} callerAddress public Ethereum address from which to list existing CIDStored events.
   * @returns {(string | EventLog)[]} CIDStored event logs from contract. If an error is thrown, returns an empty array.
   */
  public async listCIDsForAddress(
    callerAddress: string
  ): Promise<(string | EventLog)[]> {
    try {
      const latestBlock = await this.web3.eth.getBlockNumber();
      const result = await this.registryContract.getPastEvents("CIDStored", {
        fromBlock: latestBlock - this.BLOCK_NUMBER_THRESHOLD,
        toBlock: latestBlock,
        filter: { owner: callerAddress },
      });

      console.log(result); // we print all CIDStored events from contract to the console as per the requirements
      return result;
    } catch (e) {
      throw new Error((e as Error).message);
    }
  }
}
