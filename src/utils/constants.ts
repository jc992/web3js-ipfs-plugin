export const REGISTRY_CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      { indexed: true, internalType: "string", name: "cid", type: "string" },
    ],
    name: "CIDStored",
    type: "event",
  },
  {
    name: "store",
    inputs: [{ internalType: "string", name: "cid", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const RPC_URL: string = "https://ethereum-sepolia.publicnode.com/";
