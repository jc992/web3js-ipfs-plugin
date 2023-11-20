import Web3, { EventLog, TransactionReceipt } from "web3";
import { IpfsPlugin } from "../../src";
import { IpfsClient } from "../../src/clients/ipfs";
import { Web3Client } from "../../src/clients/web3";

describe("IpfsPlugin", () => {
  const mockIpfsUrl = "https://mock.ipfs.io/";
  const mockRpcUrl = "https://mock.rpc.io/";
  const mockPath = "path/to/file/";
  const mockWalletAddress = "0xe8e3c1a9b5f24e1894e905dc8e54de78";
  const mockKeccakCID = "0x807a076c42934c3bbc1fcd1ffea67d00";
  const mockTransactionReceipt = getMockTransactionReceipt();
  let instance: IpfsPlugin;

  beforeAll(() => {
    instance = new IpfsPlugin(mockIpfsUrl, new Web3(mockRpcUrl));
  });

  afterAll(() => jest.clearAllMocks());

  describe("uploadFile()", () => {
    describe("call to both clients successfully resolve", () => {
      const mockCid = "mock_cid";
      let ipfsClientSpyOn: jest.SpyInstance<
        Promise<string>,
        [filePath: string, data?: Iterable<Uint8Array> | undefined],
        any
      >;
      let web3ClientSpyOn: jest.SpyInstance<
        Promise<TransactionReceipt | null>,
        [cid: string],
        any
      >;

      let result: TransactionReceipt | null;

      beforeAll(async () => {
        ipfsClientSpyOn = jest
          .spyOn(IpfsClient.prototype, "uploadFile")
          .mockResolvedValue(mockCid);
        web3ClientSpyOn = jest
          .spyOn(Web3Client.prototype, "storeCID")
          .mockResolvedValue(mockTransactionReceipt);
        result = await instance.uploadFile(mockPath);
      });

      it("should call ipfsClient uploadFile method with mockPath", () => {
        expect(ipfsClientSpyOn).toHaveBeenCalledWith(mockPath, undefined);
      });

      it("should call web3Client storeCID method with mockCid", () => {
        expect(web3ClientSpyOn).toHaveBeenCalledWith(mockCid);
      });

      it("should return transaction receipt", () => {
        expect(result).toStrictEqual(
          expect.objectContaining(mockTransactionReceipt)
        );
      });
    });

    describe("call to ipfsClient rejects", () => {
      it("should throw an Error", async () => {
        jest
          .spyOn(IpfsClient.prototype, "uploadFile")
          .mockRejectedValue(new Error());
        await expect(instance.uploadFile(mockPath)).rejects.toThrow(Error);
      });
    });

    describe("call to web3Client rejects", () => {
      it("should throw an Error", async () => {
        jest.spyOn(IpfsClient.prototype, "uploadFile").mockResolvedValue("");
        jest
          .spyOn(Web3Client.prototype, "storeCID")
          .mockRejectedValue(new Error());
        await expect(instance.uploadFile(mockPath)).rejects.toThrow(Error);
      });
    });
  });

  describe("listAllByAddress()", () => {
    const mockLogs = geMockEventLogs(mockWalletAddress, mockKeccakCID);
    let result: (string | EventLog)[];
    let web3ClientSpyOn: jest.SpyInstance<
      Promise<(string | EventLog)[]>,
      [callerAddress: string],
      any
    >;
    describe("call to web3Client successfully resolves", () => {
      beforeAll(async () => {
        web3ClientSpyOn = jest
          .spyOn(Web3Client.prototype, "listCIDsForAddress")
          .mockResolvedValue(mockLogs);
        result = await instance.listAllByAddress(mockWalletAddress);
      });

      it("should call web3Client listCIDsForAddress method with mockWalletAddress", () => {
        expect(web3ClientSpyOn).toHaveBeenCalledWith(mockWalletAddress);
      });

      it("should return mock logs", () => {
        expect(result).toStrictEqual(expect.objectContaining(mockLogs));
      });
    });

    describe("call to web3Client fails, throws an Error in catch block", () => {
      beforeAll(() => {
        jest
          .spyOn(Web3Client.prototype, "listCIDsForAddress")
          .mockRejectedValue(new Error());
      });
      it("should throw an Error", async () => {
        await expect(
          instance.listAllByAddress(mockWalletAddress)
        ).rejects.toThrow(Error);
      });
    });
  });
});

function getMockTransactionReceipt(): TransactionReceipt {
  return {
    transactionHash:
      "0x28177952d2b2fa95dabc4191004bb29259d53c316b3776f8cdab9eb0c9e092a8",
    transactionIndex: 57n,
    blockHash:
      "0xdbb39f8852201f9a1548029e2bf533475a7f0c97cfc9b8266420084657ce9b8b",
    blockNumber: 4725987n,
    to: "0xa683bf985bc560c5dc99e8f33f3340d1e53736eb",
    from: "0xa0191481e26738b169e694c4de142e54cd893dc1",
    cumulativeGasUsed: 11168072n,
    gasUsed: 23630n,
    effectiveGasPrice: 1535952670n,
    contractAddress: "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB",
    logs: [],
    logsBloom:
      "0x00000000000000000000000000004000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000001000000480000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000008000000000000000000000000000000000200000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000001000000000000000000000000",
    root: "",
    status: 1n,
    type: 0n,
  } as unknown as TransactionReceipt;
}

function geMockEventLogs(owner: string, cid: string): (string | EventLog)[] {
  return [
    {
      address: "0xa683bf985bc560c5dc99e8f33f3340d1e53736eb",
      topics: [
        "0xd8a0edc6ade10e42d7ab691902b8c1a635fabe45ace3609fc4fbfad7e424e427",
        "0x000000000000000000000000a719ffb8538720010f3473746ad378e80c4c7bba",
        cid,
      ],
      data: "0x",
      blockNumber: 4705434n,
      transactionHash:
        "0x7d2655217ff5073595a86c7c1b3d23f1b1f063a285cc353abaf21738017e6bd1",
      transactionIndex: 32n,
      blockHash:
        "0x4473c116fb0bd8d348c9b8402333328562eb7c76423ecea03ce6ecf2b6a3e0be",
      logIndex: 102n,
      returnValues: {
        "0": owner,
        "1": cid,
        __length__: 2,
        owner,
        cid,
      },
      event: "CIDStored",
      signature:
        "0xd8a0edc6ade10e42d7ab691902b8c1a635fabe45ace3609fc4fbfad7e424e427",
      raw: {
        data: "0x",
        topics: [
          "0xd8a0edc6ade10e42d7ab691902b8c1a635fabe45ace3609fc4fbfad7e424e427",
          "0x000000000000000000000000a719ffb8538720010f3473746ad378e80c4c7bba",
          cid,
        ],
      },
    },
  ];
}
