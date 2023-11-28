# Web3.js IPFS Plugin

This is a plugin for Web3.js library, designed for uploading files to IPFS, storing CIDs in a smart contract, and listing all stored CIDs of given ethereum address.

## Using the library

1. Create a third web account and api key to use their IPFS network storage service [here](https://thirdweb.com/create-api-key)

2. Declare `thirdWebConfig` object for your plugin to use

```typescript
// this object should have your third web api secret key if you intend to use the plugin in a node server environment
const thirdWebConfig = { secretKey: "PLACE_YOUR_SECRET_KEY_HERE"}
```

```typescript
// or, if the plugin is to be used in a web browser environment, pass the client id instead
const thirdWebConfig = { clientId: "PLACE_YOUR_CLIENT_ID_HERE"}
```

3. Use your existing Web3.js instance and register the plugin

```typescript
import { Web3 } from "web3";
import { IpfsPlugin } from "web3-ipfs-plugin";

// make sure to use library code to sign your main authenticated wallet address, as it will be necessary
// to pass it as a configuration to later call the registry contact store method
const providerAddress = web3.eth.wallet?.get(0)?.address;
const web3Config = { context: web3.getContextObject(), providerAddress };

web3.registerPlugin(new IpfsPlugin(thirdWebConfig, web3Config));
```

4. Use uploadFile() to upload a file to IPFS network and store the generated CID in a Registry Smart Contract `0xA683BF985BC560c5dc99e8F33f3340d1e53736EB`

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

5. Use listAllByAddress() to list all encoded CIDs for given Ethereum address (or throws an error if something goes wrong)

```typescript
try {
  const cidStoredEvents = await web3.ipfs.listAllByAddress(
    "0xb9089c00f17B7c9Cf77f3Fb87164CbD0eC1F7d08"
  );
} catch (e) {
  // handle error
}
```

## Running Tests

1. To run unit tests, run the following command
   `yarn test`

2. To run end to end tests, run the following command
   `yarn test:e2e`

3. To run end to end tests on a web browser environment, run the following command
   `yarn test:browser`

NOTE: `/!\` Make sure to add a private key (without the `0x` prefix) to the `P_KEY` environment variable
as specified from the `.env.sample` file, before running e2e tests.
Do the same for your third web configurations, in the `THIRD_WEB_SECRET_KEY` and `THIRD_WEB_CLIENT_ID` environment variables
If e2e test fails due to insufficient funds in the address you chose to use, just mint some SepoliaETH
You can use this [faucet](https://sepolia-faucet.pk910.de/#/) `/!\`
