import path from "path";
import { config } from "dotenv";
import { DataFormat, DecodedParams, Web3, core } from "web3";
import { IpfsPlugin } from "../../src";
import { REGISTRY_CONTRACT_ABI, RPC_URL } from "../../src/utils/constants";

const CONTRACT_EVENT_ABI_INDEX = 0;
const OWNER_TOPIC_INDEX = 1;
const CID_STORED_INDEX = 2;
const DEFAULT_TIMEOUT = 300_000; // we set timeout to 5 minute to allow asynchronous call to smart contract go through

config();

describe("IpfsPlugin E2E Tests", () => {
  it("should register IpfsPlugin plugin on Web3Context instance", () => {
    const web3Context = new core.Web3Context(RPC_URL);
    const web3Provider = new Web3.providers.HttpProvider(RPC_URL);
    web3Context.registerPlugin(new IpfsPlugin(new Web3(web3Provider)));
    expect(web3Context.ipfs).toBeDefined();
  });

  describe("IpfsPlugin method tests", () => {
    let web3: Web3;

    beforeAll(() => {
      const web3Provider = new Web3.providers.HttpProvider(RPC_URL);
      web3 = new Web3(web3Provider);
      web3.registerPlugin(new IpfsPlugin(web3));
      const signer = `0x${process.env.P_KEY ?? ""}`;
      web3.eth.accounts.wallet.add(signer).get(0);
    });

    afterAll(() => jest.clearAllMocks());

    describe("uploadFile()", () => {
      const expectedStoredCIDAsHex =
        "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

      it(
        "should upload data to IPFS network, and generated CID stored to Registry contract on Sepolia Testnet",
        async () => {
          const receipt = await web3.ipfs.uploadFile(
            getFilePath(),
            getUploadFileIfCallingFromBrowser()
          );

          const log = receipt?.logs[0] as Log;
          const decodedLog = getDecodedLog(web3, log);

          expect(decodedLog?.cid).toEqual(expectedStoredCIDAsHex);
        },
        DEFAULT_TIMEOUT
      );
    });

    describe("listAllByAddress()", () => {
      const walletAddress = "0xa719ffb8538720010f3473746ad378e80c4c7bba";

      it("owner address property of every log should be the same as the provided wallet address", async () => {
        const result = await web3.ipfs.listAllByAddress(walletAddress);

        // we make sure the result from the call is properly type to later assert all event log owners are the expected address
        const eventLogs = result
          .map((log) => (typeof log !== "string" ? log : null))
          .filter((t) => t);

        expect(
          eventLogs.every(
            (eventLog) =>
              String(eventLog?.returnValues.owner).toLowerCase() ===
              walletAddress
          )
        );
      });
    });
  });
});

interface Log {
  readonly id?: string;
  readonly removed?: boolean;
  readonly logIndex?: import("web3-types").NumberTypes[DataFormat["number"]];
  readonly transactionIndex?: import("web3-types").NumberTypes[DataFormat["number"]];
  readonly transactionHash?: import("web3-types").ByteTypes[DataFormat["bytes"]];
  readonly blockHash?: import("web3-types").ByteTypes[DataFormat["bytes"]];
  readonly blockNumber?: import("web3-types").NumberTypes[DataFormat["number"]];
  readonly address?: string;
  readonly data?: import("web3-types").ByteTypes[DataFormat["bytes"]];
  readonly topics?: import("web3-types").ByteTypes[DataFormat["bytes"]][];
}

function getDecodedLog(web3: Web3, log: Log): DecodedParams {
  const abi = [...REGISTRY_CONTRACT_ABI[CONTRACT_EVENT_ABI_INDEX].inputs];

  return web3.eth.abi.decodeLog(abi, String(log.data), [
    String(log.topics?.[OWNER_TOPIC_INDEX]),
    String(log.topics?.[CID_STORED_INDEX]),
  ]);
}

function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined";
}

function getFilePath(): string {
  // path is only available in node environment, so we make sure to not call it on the web browser.
  // and the returned string is irrelevant in this case because web browser implementation for uploadFile uses the Iterable<Uint8Array>
  return isBrowserEnvironment()
    ? ""
    : `${path.resolve()}/test/e2e/uploadFile-e2e.txt`;
}

function getUploadFileIfCallingFromBrowser(): Iterable<Uint8Array> | undefined {
  const UPLOAD_FILE_AS_ITERABLE_UINT8_ARRAY = [
    Uint8Array.from([
      116, 104, 105, 115, 32, 109, 111, 99, 107, 32, 102, 105, 108, 101, 32,
      105, 115, 32, 109, 101, 97, 110, 116, 32, 116, 111, 32, 98, 101, 32, 117,
      115, 101, 100, 32, 98, 121, 32, 101, 50, 101, 32, 116, 101, 115, 116, 46,
    ]),
  ];

  return isBrowserEnvironment()
    ? UPLOAD_FILE_AS_ITERABLE_UINT8_ARRAY
    : undefined;
}
