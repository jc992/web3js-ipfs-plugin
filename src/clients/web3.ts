import Web3, {
  Contract,
  EventLog,
  TransactionReceipt,
  Web3APISpec,
} from "web3";
import { RegisteredSubscription } from "web3/lib/commonjs/eth.exports";
import { Web3ContextObject } from "web3-core";
import {
  REGISTRY_CONTRACT_ABI,
  REGISTRY_CONTRACT_ADDRESS,
} from "../utils/constants";

export type Web3Config = {
  context: Web3ContextObject<Web3APISpec, RegisteredSubscription>;
  providerAddress?: string;
};

/**
 * An abstraction for encapsulating Web3.js calls.
 */
export class Web3Client {
  private readonly BLOCK_NUMBER_THRESHOLD = BigInt(50000);
  private readonly CONTRACT_INCEPTION_BLOCK = BigInt(4546394); // https://sepolia.etherscan.io/tx/0x5d1fca9aff91aad286d468d6556ae50b85bf7d34a8c63d68d294045d85a3da6c
  private web3: Web3;
  private registryContract: Contract<typeof REGISTRY_CONTRACT_ABI>;
  private providerAddress?: string;

  constructor({ context, providerAddress }: Web3Config) {
    this.web3 = new Web3(context);
    this.providerAddress = providerAddress;
    this.registryContract = new this.web3.eth.Contract(
      REGISTRY_CONTRACT_ABI,
      REGISTRY_CONTRACT_ADDRESS,
      context
    );
  }

  /**
   * Stores a CID on Ethereum.
   * @param {string} cid CID to be stored on Ethereum.
   * @returns {TransactionReceipt} transaction receipt of the transaction that stored CID on Ethereum. If something goes wrong, an error is thrown.
   */
  public async storeCID(cid: string): Promise<TransactionReceipt> {
    const from = this.providerAddress;
    const contractCall = this.registryContract.methods.store(cid);

    const gas = String(await contractCall.estimateGas({ from }));
    const transactionReceipt = await contractCall.send({ gas, from });

    return transactionReceipt;
  }

  /**
   * List all CIDs for given Ethereum address.
   * @param {string} callerAddress public Ethereum address from which to list existing CIDStored events.
   * @returns {(string | EventLog)[]} CIDStored event logs from contract. If something goes wrong, an error is thrown.
   */
  public async listCIDsForAddress(
    callerAddress: string
  ): Promise<(string | EventLog)[]> {
    const result: (string | EventLog)[] = [];
    const latestBlock = await this.web3.eth.getBlockNumber();
    let fromBlock = this.CONTRACT_INCEPTION_BLOCK;

    while (fromBlock <= latestBlock) {
      const upToBlock = fromBlock + this.BLOCK_NUMBER_THRESHOLD;
      const toBlock = upToBlock > latestBlock ? latestBlock : upToBlock;

      const pastEvents = await this.getPastEvents(
        callerAddress,
        fromBlock,
        toBlock
      );

      fromBlock += this.BLOCK_NUMBER_THRESHOLD;
      result.push(...pastEvents);
    }

    console.log(result); // we print all CIDStored events from contract to the console as per the requirements
    return result;
  }

  /**
   * List CIDs for given Ethereum address for a certain block range.
   * @param {string} owner Ethereum address from which to fetch past events.
   * @param {bigint} fromBlock starting block number for past events.
   * @param toBlock fromBlock last block number for past events.
   * @returns {(string | EventLog)[]} CIDStored event logs from contract. If something goes wrong, an error is thrown.
   */
  private async getPastEvents(
    owner: string,
    fromBlock: bigint,
    toBlock: bigint
  ): Promise<(string | EventLog)[]> {
    const result = await this.registryContract.getPastEvents("CIDStored", {
      fromBlock,
      toBlock,
      filter: { owner },
    });

    return result;
  }
}
