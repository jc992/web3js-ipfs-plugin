# Web3.js IPFS Plugin

This is a plugin for Web3.js library, designed for uploading files to IPFS, storing CIDs in a smart contract, and listing all stored CIDs of given ethereum address.

## Using the library

1. Instantiate a Web3 instance and register the plugin

```typescript
import { Web3 } from "web3";
import { IpfsPlugin } from "web3-ipfs-plugin";

web3 = new Web3("RPC_URL");
web3.registerPlugin(new IpfsPlugin(web3));
```

2. Use uploadFile() to upload a file to IPFS network and store the generated CID in a Registry Smart Contract `0xA683BF985BC560c5dc99e8F33f3340d1e53736EB`

```typescript
// Calling this method will upload the file to IPFS, store the CID to a smart contract, and return the transaction receipt (or throws an error if something goes wrong)
try {
    const receipt = await web3.ipfs.uploadFile("path/to/file/");
} catch (e) {
    // handle error
}
```

NOTE: If calling from a web browser, the file data should be passed as an Iterable<Uint8Array>, as the 2nd argument (since file path implementation uses `fs` underneath the hood which is only supported on a node environment)
We suggest using [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) to implement client-side code capable of fetching and manipulating this data accordingly

```typescript
try {
    const receipt = await web3.ipfs.uploadFile(
        "this/path/becomes/irrelevant",
        data
    );
} catch (e) {
    // handle error
}
```

3. Use listAllByAddress() to list all encoded CIDs for given Ethereum address (or throws an error if something goes wrong)

```typescript
try {
    const cidStoredEvents = await web3.ipfs.listAllByAddress("0xb9089c00f17B7c9Cf77f3Fb87164CbD0eC1F7d08");
} catch(e) {
    // handle error...
}
```

NOTE: A limitation on Web3.js lib makes it so only data from the most recent 50000 blocks can be retrieved

## Running Tests

1. To run unit tests, run the following command
   `yarn test`

2. To run end to end tests, run the following command
   `yarn test:e2e`

NOTE: `/!\` Make sure to add a private key (without the `0x` prefix) to the `P_KEY` environment variable
as specified from the `.env.sample` file, before running e2e tests.
If e2e test fails due to insufficient funds in the address you chose to use, just mint some SepoliaETH 
You can use this [faucet](https://sepolia-faucet.pk910.de/#/) `/!\`
